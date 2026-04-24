import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import DoctorLayout from '../../../components/DoctorLayout';
import ConsultationCallPanel from '../../../components/ConsultationCallPanel';
import { fetchAppointmentById } from '../../../api/appointments';
import { finalizeConsultationPrescription } from '../../../api/prescriptions';
import { buildConsultationParticipant, buildConsultationRoomName } from '../../../utils/consultationRoom';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FileText,
  Pill,
  Plus,
  Search,
  ShieldCheck,
  Stethoscope,
  Syringe,
  User,
  Video,
  X
} from 'lucide-react';

const MOCK_PHARMACY = [
  { id: 1, name: 'Amoxicillin', dose: '500mg', type: 'Antibiotic', duration: '5 days' },
  { id: 2, name: 'Ibuprofen', dose: '400mg', type: 'NSAID', duration: '3 days' },
  { id: 3, name: 'Lisinopril', dose: '10mg', type: 'ACE Inhibitor', duration: '14 days' },
  { id: 4, name: 'Metformin', dose: '500mg', type: 'Biguanide', duration: '30 days' },
  { id: 5, name: 'Atorvastatin', dose: '20mg', type: 'Statin', duration: '30 days' },
  { id: 6, name: 'Albuterol Inhaler', dose: '90mcg', type: 'Bronchodilator', duration: 'As needed' }
];

function formatSessionDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return { day: 'Unknown date', time: 'Unknown time' };
  }

  return {
    day: date.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    }),
    time: date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    })
  };
}

function buildDefaultPrescriptionItem(medication) {
  return {
    id: medication.id,
    medicationName: medication.name,
    dosage: medication.dose,
    frequency: '1 time a day',
    duration: medication.duration || '',
    instructions: ''
  };
}

export default function DoctorConsultationPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { appointmentId } = router.query;
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pharmacySearch, setPharmacySearch] = useState('');
  const [prescribedItems, setPrescribedItems] = useState([]);
  const [doctorNotes, setDoctorNotes] = useState('');
  const [isFinalizeOpen, setIsFinalizeOpen] = useState(false);
  const [isSavingPrescription, setIsSavingPrescription] = useState(false);
  const [saveNotice, setSaveNotice] = useState('');

  useEffect(() => {
    if (!appointmentId) {
      return;
    }

    let cancelled = false;

    const loadAppointment = async () => {
      setLoading(true);
      setError('');

      try {
        const appointmentData = await fetchAppointmentById(appointmentId);
        if (!cancelled) {
          setAppointment(appointmentData);
        }
      } catch {
        if (!cancelled) {
          setError('Could not load this consultation session.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadAppointment();

    return () => {
      cancelled = true;
    };
  }, [appointmentId]);

  const filteredPharmacy = useMemo(() => {
    if (!pharmacySearch.trim()) {
      return MOCK_PHARMACY;
    }

    return MOCK_PHARMACY.filter((medication) =>
      medication.name.toLowerCase().includes(pharmacySearch.trim().toLowerCase())
    );
  }, [pharmacySearch]);

  const sessionSummary = useMemo(
    () => formatSessionDateTime(appointment?.appointmentDate),
    [appointment?.appointmentDate]
  );

  const roomName = useMemo(
    () =>
      buildConsultationRoomName({
        appointmentId,
        doctorId: appointment?.doctorId,
        patientName: appointment?.patientName,
        appointmentDate: appointment?.appointmentDate
      }),
    [appointment?.appointmentDate, appointment?.doctorId, appointment?.patientName, appointmentId]
  );

  const participant = useMemo(
    () =>
      buildConsultationParticipant({
        role: 'doctor',
        appointmentId,
        doctorId: appointment?.doctorId,
        doctorName: appointment?.doctorName,
        patientName: appointment?.patientName
      }),
    [appointment?.doctorId, appointment?.doctorName, appointment?.patientName, appointmentId]
  );

  const canFinalize = prescribedItems.length > 0;

  const togglePrescription = (medication) => {
    setPrescribedItems((current) => {
      const exists = current.some((item) => item.id === medication.id);
      if (exists) {
        return current.filter((item) => item.id !== medication.id);
      }

      return [...current, buildDefaultPrescriptionItem(medication)];
    });
    setSaveNotice('');
  };

  const updatePrescriptionField = (id, field, value) => {
    setPrescribedItems((current) =>
      current.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
    setSaveNotice('');
  };

  const handleFinalize = async () => {
    if (!appointment?.id || !appointment?.doctorId) {
      setSaveNotice('Appointment context is missing. Please refresh and try again.');
      return;
    }

    if (!canFinalize) {
      setSaveNotice('Add at least one medicine before generating a prescription.');
      return;
    }

    setIsSavingPrescription(true);
    setSaveNotice('');

    try {
      await finalizeConsultationPrescription({
        appointmentId: appointment.id,
        doctorId: appointment.doctorId,
        doctorName: user?.name || participant.userName || 'Doctor',
        consultationNotes: doctorNotes,
        items: prescribedItems.map((item) => ({
          medicationName: item.medicationName,
          dosage: item.dosage,
          frequency: item.frequency,
          duration: item.duration,
          instructions: item.instructions
        }))
      });

      await router.push('/doctor/dashboard');
    } catch (requestError) {
      setSaveNotice(
        requestError?.response?.data?.message || 'Could not generate the prescription PDF right now.'
      );
    } finally {
      setIsSavingPrescription(false);
    }
  };

  return (
    <DoctorLayout title="Consultation" activePage="dashboard" showSidebar={false}>
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8 flex flex-col min-h-0 overflow-y-auto">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push('/doctor/dashboard')}
              className="rounded-full border border-stone-200 bg-white p-1.5 text-stone-600 hover:bg-stone-50"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-stone-900">Consultation Room</h1>
              <p className="mt-0.5 text-xs font-medium text-stone-500">Doctor session workspace</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-teal-700">
            <ShieldCheck size={12} />
            Encrypted Session
          </span>
        </div>

        {loading ? (
          <div className="rounded-[2rem] border border-stone-200 bg-white p-8 text-stone-500 font-semibold">
            Loading consultation room...
          </div>
        ) : error ? (
          <div className="rounded-[2rem] border border-rose-200 bg-rose-50 p-8 text-rose-700 font-semibold">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 2xl:grid-cols-[minmax(0,1.85fr)_320px] gap-5">
            <ConsultationCallPanel
              role="doctor"
              appointmentId={appointmentId}
              appointment={appointment}
              roomName={roomName}
              participant={participant}
              onLeave={() => setIsFinalizeOpen(true)}
            />

            <aside className="space-y-4">
              <section className="rounded-3xl border border-stone-100 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <h3 className="text-base font-extrabold text-stone-900">Session Snapshot</h3>
                <div className="mt-4 space-y-3 text-[13px]">
                  <div className="flex items-center gap-2.5 text-stone-700">
                    <User size={14} className="text-stone-400" />
                    <span>{appointment?.patientName || 'Patient'}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-stone-700">
                    <Clock3 size={14} className="text-stone-400" />
                    <span>{sessionSummary.day} at {sessionSummary.time}</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-stone-700">
                    <Stethoscope size={14} className="mt-0.5 text-stone-400" />
                    <span className="leading-snug">{appointment?.reason || 'General consultation'}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-stone-700">
                    <Video size={14} className="text-stone-400" />
                    <span className="truncate">{roomName}</span>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-stone-100 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-base font-extrabold text-stone-900">Doctor Notes</h3>
                  <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-500">
                    PDF summary
                  </span>
                </div>
                <textarea
                  rows={5}
                  value={doctorNotes}
                  onChange={(event) => {
                    setDoctorNotes(event.target.value);
                    setSaveNotice('');
                  }}
                  placeholder="Capture observations, advice, and follow-up instructions..."
                  className="mt-3 w-full resize-none rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-[13px] font-medium text-stone-700 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-100"
                />
              </section>

              <section className="rounded-3xl border border-stone-100 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col max-h-[360px]">
                <div className="flex items-center justify-between mb-3 shrink-0">
                  <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
                    <Pill size={16} className="text-teal-500" />
                    Quick Pharmacy
                  </h3>
                  {prescribedItems.length > 0 ? (
                    <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-700 border border-teal-100">
                      {prescribedItems.length} Added
                    </span>
                  ) : null}
                </div>

                <div className="relative mb-3 shrink-0">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Search medication..."
                    value={pharmacySearch}
                    onChange={(event) => setPharmacySearch(event.target.value)}
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2 pl-9 pr-3 text-[12px] font-medium text-stone-700 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100"
                  />
                </div>

                <div className="flex-1 overflow-y-auto min-h-0 space-y-2 pr-1 overflow-x-hidden">
                  {filteredPharmacy.map((medication) => {
                    const isAdded = prescribedItems.some((item) => item.id === medication.id);
                    const addedItem = prescribedItems.find((item) => item.id === medication.id);

                    return (
                      <div
                        key={medication.id}
                        className={`rounded-xl border p-2.5 transition-colors ${
                          isAdded ? 'border-teal-100 bg-teal-50/40' : 'border-stone-100 bg-stone-50/60 hover:bg-stone-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className={`text-xs font-bold truncate ${isAdded ? 'text-teal-800' : 'text-stone-900'}`}>
                              {medication.name}
                            </p>
                            <p className="mt-0.5 text-[10px] font-medium text-stone-500 truncate tracking-wide">
                              {medication.dose} • {medication.type}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => togglePrescription(medication)}
                            className={`shrink-0 flex items-center justify-center w-7 h-7 rounded-[0.55rem] transition-all duration-200 ${
                              isAdded
                                ? 'bg-emerald-100 text-emerald-600 shadow-inner'
                                : 'bg-white border border-stone-200 text-stone-400 hover:text-teal-600 hover:border-teal-200 shadow-sm hover:shadow'
                            }`}
                          >
                            {isAdded ? <CheckCircle2 size={14} strokeWidth={3} /> : <Plus size={14} strokeWidth={2.5} />}
                          </button>
                        </div>

                        {isAdded ? (
                          <div className="mt-2.5 space-y-2">
                            <div className="flex items-center gap-1.5 text-teal-600 bg-white rounded-md border border-teal-100 px-2 py-1 shadow-sm">
                              <Syringe size={12} className="shrink-0" />
                              <input
                                type="text"
                                value={addedItem?.dosage || ''}
                                onChange={(event) => updatePrescriptionField(medication.id, 'dosage', event.target.value)}
                                placeholder="Dosage"
                                className="w-full text-[10px] font-semibold text-teal-900 outline-none bg-transparent placeholder:text-teal-300"
                              />
                            </div>
                            <div className="flex items-center gap-1.5 text-teal-600 bg-white rounded-md border border-teal-100 px-2 py-1 shadow-sm">
                              <Clock3 size={12} className="shrink-0" />
                              <input
                                type="text"
                                value={addedItem?.frequency || ''}
                                onChange={(event) => updatePrescriptionField(medication.id, 'frequency', event.target.value)}
                                placeholder="Frequency"
                                className="w-full text-[10px] font-semibold text-teal-900 outline-none bg-transparent placeholder:text-teal-300"
                              />
                            </div>
                            <input
                              type="text"
                              value={addedItem?.duration || ''}
                              onChange={(event) => updatePrescriptionField(medication.id, 'duration', event.target.value)}
                              placeholder="Duration"
                              className="w-full rounded-md border border-teal-100 bg-white px-2 py-1.5 text-[10px] font-semibold text-teal-900 outline-none placeholder:text-teal-300"
                            />
                            <input
                              type="text"
                              value={addedItem?.instructions || ''}
                              onChange={(event) => updatePrescriptionField(medication.id, 'instructions', event.target.value)}
                              placeholder="Special instructions"
                              className="w-full rounded-md border border-teal-100 bg-white px-2 py-1.5 text-[10px] font-semibold text-teal-900 outline-none placeholder:text-teal-300"
                            />
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                  {filteredPharmacy.length === 0 ? (
                    <div className="text-center text-xs text-stone-400 py-4">No medications found.</div>
                  ) : null}
                </div>
              </section>

              <section className="rounded-3xl border border-stone-100 bg-gradient-to-br from-stone-900 via-stone-950 to-black p-5 text-white shadow-[0_18px_40px_rgba(15,23,42,0.18)]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-teal-300">Finish Session</p>
                    <h3 className="mt-1 text-lg font-extrabold">Generate PDF Prescription</h3>
                  </div>
                  <FileText size={18} className="text-teal-300" />
                </div>
                <p className="mt-3 text-sm leading-6 text-stone-300">
                  When you end the call, we will mark the appointment completed and make the prescription PDF available to the patient.
                </p>
                {saveNotice ? (
                  <div className="mt-3 rounded-2xl border border-rose-400/20 bg-rose-500/15 px-3 py-2 text-xs font-semibold text-rose-100">
                    {saveNotice}
                  </div>
                ) : null}
                <button
                  type="button"
                  onClick={() => setIsFinalizeOpen(true)}
                  className="mt-4 w-full rounded-2xl bg-white px-4 py-3 text-xs font-bold uppercase tracking-wider text-stone-900 hover:bg-stone-100"
                >
                  Complete Consultation
                </button>
              </section>
            </aside>
          </div>
        )}

        {isFinalizeOpen ? (
          <div className="fixed inset-0 z-50 bg-stone-950/55 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-2xl rounded-[2rem] border border-white/50 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.28)] overflow-hidden">
              <div className="border-b border-stone-100 bg-[linear-gradient(180deg,#f7fffe_0%,#ffffff_100%)] px-6 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl border border-teal-200 bg-teal-50 text-teal-700">
                      <FileText size={22} />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-teal-700">Consultation Complete</p>
                      <h3 className="mt-1 text-2xl font-extrabold tracking-tight text-stone-900">
                        Generate Prescription PDF
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-stone-500">
                        This will end the doctor session, mark the appointment completed, and make the prescription available to the patient.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsFinalizeOpen(false)}
                    className="rounded-full border border-stone-200 bg-white p-2 text-stone-500 hover:bg-stone-50"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div className="px-6 py-5 space-y-5">
                <div className="rounded-2xl border border-stone-200 bg-stone-50/80 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">Patient</p>
                    <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-stone-500 ring-1 ring-stone-200">
                      {prescribedItems.length} medicines
                    </span>
                  </div>
                  <p className="mt-2 text-lg font-extrabold text-stone-900">{appointment?.patientName || 'Patient'}</p>
                  <p className="mt-1 text-sm text-stone-500">{appointment?.reason || 'General consultation'}</p>
                </div>

                <div className="rounded-2xl border border-stone-200 bg-white p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">Prescription Summary</p>
                  <div className="mt-3 space-y-3">
                    {prescribedItems.length > 0 ? (
                      prescribedItems.map((item) => (
                        <div key={`summary-${item.id}`} className="rounded-2xl border border-stone-100 bg-stone-50 px-4 py-3">
                          <p className="text-sm font-extrabold text-stone-900">{item.medicationName}</p>
                          <p className="mt-1 text-xs font-medium text-stone-500">
                            {item.dosage} • {item.frequency}
                            {item.duration ? ` • ${item.duration}` : ''}
                          </p>
                          {item.instructions ? (
                            <p className="mt-1 text-xs text-stone-500">{item.instructions}</p>
                          ) : null}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm font-semibold text-rose-600">
                        Add at least one medicine before completing the consultation.
                      </p>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-stone-200 bg-white p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">Doctor Notes</p>
                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    {doctorNotes.trim() || 'No additional notes added yet. You can still go back and write a short summary.'}
                  </p>
                </div>

                {saveNotice ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                    {saveNotice}
                  </div>
                ) : null}
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-stone-100 px-6 py-4 bg-stone-50/70">
                <button
                  type="button"
                  onClick={() => setIsFinalizeOpen(false)}
                  className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-stone-600 hover:bg-stone-50"
                >
                  Keep Editing
                </button>
                <button
                  type="button"
                  onClick={() => void handleFinalize()}
                  disabled={isSavingPrescription || !canFinalize}
                  className="rounded-xl bg-stone-900 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-[0_10px_24px_rgba(15,23,42,0.18)] hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSavingPrescription ? 'Generating...' : 'Generate PDF & End'}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </DoctorLayout>
  );
}
