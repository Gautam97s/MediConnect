import React, { useEffect, useMemo, useState } from 'react';
import DoctorLayout from '../../components/DoctorLayout';
import { Calendar, Clock, Stethoscope, User } from 'lucide-react';
import { fetchAppointments } from '../../api/appointments';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { DOCTORS } from '../../data/bookingData';
import { subscribeToRealtimeEvents } from '../../utils/realtime';

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

export default function Schedule() {
  const { user, isAuthReady } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const displayName = (user?.name || 'Doctor').trim() || 'Doctor';
  const doctorId = useMemo(() => resolveBookingDoctorId(user), [user]);

  const loadSchedule = async (id) => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchAppointments({ doctorId: id });
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load doctor schedule.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthReady || !doctorId) {
      return;
    }

    loadSchedule(doctorId);
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

  const sorted = useMemo(
    () => [...appointments].sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate)),
    [appointments]
  );

  return (
    <DoctorLayout title="Schedule" activePage="schedule">
      <main className="flex-1 px-8 py-10 flex flex-col h-full overflow-hidden">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-stone-900 mb-2">{displayName}'s Schedule</h2>
            <p className="text-stone-500 font-medium text-lg">Live appointments for the signed-in doctor account.</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
          {loading && (
            <div className="rounded-xl border border-stone-200 bg-white p-6 text-stone-600 font-semibold">
              Loading schedule...
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-700 font-semibold">
              {error}
            </div>
          )}

          {!loading && !error && sorted.length === 0 && (
            <div className="rounded-xl border border-stone-200 bg-white p-8 text-stone-500 text-center">
              No appointments found for {displayName}.
            </div>
          )}

          {!loading && !error && sorted.length > 0 &&
            sorted.map((appointment) => {
              const { day, time } = formatDateTime(appointment.appointmentDate);
              return (
                <div
                  key={appointment.id}
                  className="bg-white rounded-[1.5rem] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                        <User size={18} /> {appointment.patientName}
                      </h3>
                      <p className="text-sm text-stone-500 mt-2 flex items-center gap-2">
                        <Stethoscope size={14} /> {appointment.reason || 'Consultation'}
                      </p>
                    </div>
                    <div className="text-sm font-semibold text-stone-700">
                      <div className="flex items-center gap-2"><Calendar size={14} /> {day}</div>
                      <div className="flex items-center gap-2 mt-1"><Clock size={14} /> {time}</div>
                      <div className="mt-2 text-xs uppercase tracking-wide text-teal-700 font-bold">
                        {getDisplayStatus(appointment.status, appointment.appointmentDate)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </main>
    </DoctorLayout>
  );
}
