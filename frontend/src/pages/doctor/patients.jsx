import React, { useEffect, useMemo, useState } from 'react';
import DoctorLayout from '../../components/DoctorLayout';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { deleteDoctorPatientAppointments, fetchAppointments } from '../../api/appointments';
import { DOCTORS } from '../../data/bookingData';
import { subscribeToRealtimeEvents } from '../../utils/realtime';
import {
  Calendar,
  Clock,
  FileText,
  Search,
  Stethoscope,
  Trash2,
  UserRound,
  Users
} from 'lucide-react';

function resolveBookingDoctorId(user) {
  const name = (user?.name || '').trim().toLowerCase();

  const matchedDoctor = Object.values(DOCTORS)
    .flat()
    .find((doctor) => doctor.name.toLowerCase().includes(name) || name.includes(doctor.name.toLowerCase()));

  if (matchedDoctor) {
    return Number(matchedDoctor.id) || 0;
  }

  return Number(user?.id) || 0;
}

function mergeAppointmentById(currentAppointments, incomingAppointment) {
  if (!incomingAppointment?.id) {
    return currentAppointments;
  }

  const existingIndex = currentAppointments.findIndex(
    (appointment) => appointment.id === incomingAppointment.id
  );

  if (existingIndex === -1) {
    return [...currentAppointments, incomingAppointment];
  }

  return currentAppointments.map((appointment) =>
    appointment.id === incomingAppointment.id ? incomingAppointment : appointment
  );
}

function removeAppointmentById(currentAppointments, appointmentId) {
  return currentAppointments.filter((appointment) => appointment.id !== appointmentId);
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return { day: 'Unknown date', time: 'Unknown time' };
  }

  return {
    day: date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }),
    time: date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    })
  };
}

function getDisplayStatus(status, appointmentDate) {
  const normalizedStatus = (status || '').toString().toUpperCase() || 'SCHEDULED';
  const appointmentMs = new Date(appointmentDate).getTime();

  if (
    normalizedStatus === 'SCHEDULED' &&
    !Number.isNaN(appointmentMs) &&
    appointmentMs < Date.now()
  ) {
    return 'PENDING REVIEW';
  }

  return normalizedStatus;
}

function buildPatientsFromAppointments(appointments) {
  const patientMap = new Map();

  appointments.forEach((appointment) => {
    const patientName = (appointment?.patientName || '').trim() || 'Patient';
    const existing = patientMap.get(patientName) || {
      patientName,
      totalVisits: 0,
      upcomingVisits: 0,
      latestReason: '',
      latestAppointmentDate: '',
      latestStatus: ''
    };

    existing.totalVisits += 1;

    const status = (appointment?.status || '').toString().toUpperCase();
    if (status === 'SCHEDULED') {
      existing.upcomingVisits += 1;
    }

    const appointmentMs = new Date(appointment?.appointmentDate).getTime();
    const existingMs = new Date(existing.latestAppointmentDate).getTime();
    if (!Number.isNaN(appointmentMs) && (Number.isNaN(existingMs) || appointmentMs > existingMs)) {
      existing.latestAppointmentDate = appointment.appointmentDate;
      existing.latestReason = appointment.reason || 'Consultation';
      existing.latestStatus = getDisplayStatus(status, appointment.appointmentDate);
    }

    patientMap.set(patientName, existing);
  });

  return Array.from(patientMap.values()).sort((a, b) =>
    a.patientName.localeCompare(b.patientName)
  );
}

export default function PatientsList() {
  const { user, isAuthReady } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [deletingPatientName, setDeletingPatientName] = useState('');

  const doctorId = useMemo(() => resolveBookingDoctorId(user), [user]);
  const displayName = (user?.name || 'Doctor').trim() || 'Doctor';

  useEffect(() => {
    if (!isAuthReady || !doctorId) {
      return;
    }

    let cancelled = false;

    const loadPatients = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await fetchAppointments({ doctorId });
        if (!cancelled) {
          setAppointments(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.response?.data?.message || 'Failed to load your patients.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadPatients();

    return () => {
      cancelled = true;
    };
  }, [doctorId, isAuthReady]);

  useEffect(() => {
    if (!doctorId) {
      return undefined;
    }

    return subscribeToRealtimeEvents((event) => {
      const type = (event?.type || '').toString();
      if (!type.startsWith('appointment.')) {
        return;
      }

      if (type === 'appointment.cleared') {
        setAppointments([]);
        return;
      }

      const payload = event?.payload;
      if (Number(payload?.doctorId) !== Number(doctorId)) {
        return;
      }

      if (type === 'appointment.deleted') {
        setAppointments((current) => removeAppointmentById(current, payload?.id));
        return;
      }

      setAppointments((current) => mergeAppointmentById(current, payload));
    });
  }, [doctorId]);

  const patients = useMemo(() => buildPatientsFromAppointments(appointments), [appointments]);

  const filteredPatients = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return patients;
    }

    return patients.filter((patient) =>
      patient.patientName.toLowerCase().includes(normalizedQuery)
      || patient.latestReason.toLowerCase().includes(normalizedQuery)
    );
  }, [patients, query]);

  const handleDeletePatient = async (patientName) => {
    if (!doctorId || !patientName || deletingPatientName) {
      return;
    }

    const confirmed = typeof window === 'undefined'
      ? true
      : window.confirm(`Delete all appointment records for ${patientName} from your portal?`);

    if (!confirmed) {
      return;
    }

    const previousAppointments = appointments;
    const normalizedName = patientName.trim().toLowerCase();

    setDeletingPatientName(patientName);
    setError('');
    setAppointments((current) =>
      current.filter((appointment) => (appointment?.patientName || '').trim().toLowerCase() !== normalizedName)
    );

    try {
      await deleteDoctorPatientAppointments(doctorId, patientName);
    } catch (err) {
      setAppointments(previousAppointments);
      setError(err?.response?.data?.message || 'Could not delete this patient right now.');
    } finally {
      setDeletingPatientName('');
    }
  };

  return (
    <DoctorLayout title="Patients" activePage="patients">
      <main className="flex-1 px-8 py-10 flex flex-col min-h-0 overflow-hidden">
        <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-stone-900">{displayName}'s Patients</h1>
            <p className="mt-2 text-stone-500 font-medium">
              View the patients who have booked or completed sessions with your account.
            </p>
          </div>

          <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white px-4 py-3 shadow-sm">
            <div className="flex items-center gap-3">
              <Search size={18} className="text-stone-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search patient or consultation reason"
                className="w-full bg-transparent text-sm font-medium text-stone-700 outline-none placeholder:text-stone-400"
              />
            </div>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <section className="rounded-[1.75rem] border border-stone-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <p className="text-sm font-bold text-stone-400">Unique Patients</p>
            <p className="mt-3 text-4xl font-extrabold text-stone-900">{patients.length}</p>
          </section>
          <section className="rounded-[1.75rem] border border-stone-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <p className="text-sm font-bold text-stone-400">Total Sessions</p>
            <p className="mt-3 text-4xl font-extrabold text-stone-900">{appointments.length}</p>
          </section>
          <section className="rounded-[1.75rem] border border-stone-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <p className="text-sm font-bold text-stone-400">Upcoming Sessions</p>
            <p className="mt-3 text-4xl font-extrabold text-stone-900">
              {appointments.filter((appointment) => (appointment?.status || '').toString().toUpperCase() === 'SCHEDULED').length}
            </p>
          </section>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {loading ? (
            <div className="rounded-[1.75rem] border border-stone-200 bg-white p-8 text-stone-600 font-semibold">
              Loading patient list...
            </div>
          ) : error ? (
            <div className="rounded-[1.75rem] border border-rose-200 bg-rose-50 p-8 text-rose-700 font-semibold">
              {error}
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="rounded-[1.75rem] border border-stone-200 bg-white p-10 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
                <Users size={30} />
              </div>
              <h2 className="text-2xl font-extrabold text-stone-900">
                {patients.length === 0 ? 'No patients yet' : 'No patients match this search'}
              </h2>
              <p className="mt-3 text-stone-500 font-medium">
                {patients.length === 0
                  ? 'Once patients book appointments with you, they will appear here automatically.'
                  : 'Try a different patient name or consultation reason.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPatients.map((patient) => {
                const { day, time } = formatDateTime(patient.latestAppointmentDate);

                return (
                  <section
                    key={patient.patientName}
                    className="rounded-[1.75rem] border border-stone-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                            <UserRound size={22} />
                          </div>
                          <div className="min-w-0">
                            <h2 className="truncate text-xl font-extrabold text-stone-900">{patient.patientName}</h2>
                            <p className="mt-1 text-sm font-medium text-stone-500">
                              {patient.totalVisits} total visit{patient.totalVisits === 1 ? '' : 's'}
                              {' '}• {patient.upcomingVisits} upcoming
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-3 text-sm text-stone-600">
                          <span className="inline-flex items-center gap-2 rounded-full bg-stone-50 px-3 py-1.5 font-semibold">
                            <Stethoscope size={14} className="text-stone-400" />
                            {patient.latestReason || 'Consultation'}
                          </span>
                          <span className="inline-flex items-center gap-2 rounded-full bg-stone-50 px-3 py-1.5 font-semibold">
                            <Calendar size={14} className="text-stone-400" />
                            {day}
                          </span>
                          <span className="inline-flex items-center gap-2 rounded-full bg-stone-50 px-3 py-1.5 font-semibold">
                            <Clock size={14} className="text-stone-400" />
                            {time}
                          </span>
                          <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1.5 text-teal-700 font-bold">
                            <FileText size={14} />
                            {patient.latestStatus || 'SCHEDULED'}
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-start">
                        <button
                          type="button"
                          onClick={() => void handleDeletePatient(patient.patientName)}
                          disabled={deletingPatientName === patient.patientName}
                          className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-4 py-2 text-sm font-bold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Trash2 size={16} />
                          {deletingPatientName === patient.patientName ? 'Deleting...' : 'Delete Patient'}
                        </button>
                      </div>
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </DoctorLayout>
  );
}
