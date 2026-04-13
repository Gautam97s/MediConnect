import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import DoctorLayout from '../../../components/DoctorLayout';
import ConsultationCallPanel from '../../../components/ConsultationCallPanel';
import { fetchAppointmentById } from '../../../api/appointments';
import { buildConsultationParticipant, buildConsultationRoomName } from '../../../utils/consultationRoom';
import {
  ArrowLeft,
  Clock3,
  ShieldCheck,
  Stethoscope,
  User,
  Video,
  Pill,
  Plus,
  Search,
  CheckCircle2,
  Syringe
} from 'lucide-react';

const MOCK_PHARMACY = [
  { id: 1, name: 'Amoxicillin', dose: '500mg', type: 'Antibiotic' },
  { id: 2, name: 'Ibuprofen', dose: '400mg', type: 'NSAID' },
  { id: 3, name: 'Lisinopril', dose: '10mg', type: 'ACE Inhibitor' },
  { id: 4, name: 'Metformin', dose: '500mg', type: 'Biguanide' },
  { id: 5, name: 'Atorvastatin', dose: '20mg', type: 'Statin' },
  { id: 6, name: 'Albuterol Inhaler', dose: '90mcg', type: 'Bronchodilator' }
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

export default function DoctorConsultationPage() {
  const router = useRouter();
  const { appointmentId } = router.query;
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pharmacySearch, setPharmacySearch] = useState('');
  const [prescribedItems, setPrescribedItems] = useState([]);

  const filteredPharmacy = useMemo(() => {
    if (!pharmacySearch.trim()) return MOCK_PHARMACY;
    return MOCK_PHARMACY.filter(m => m.name.toLowerCase().includes(pharmacySearch.toLowerCase()));
  }, [pharmacySearch]);

  const togglePrescription = (med) => {
    setPrescribedItems(prev => {
      const exists = prev.find(p => p.id === med.id);
      if (exists) return prev.filter(p => p.id !== med.id);
      return [...prev, { ...med, customDose: med.dose, frequency: '' }];
    });
  };

  const updatePrescriptionDose = (id, newDose) => {
    setPrescribedItems(prev => prev.map(p => p.id === id ? { ...p, customDose: newDose } : p));
  };

  const updatePrescriptionFrequency = (id, newFreq) => {
    setPrescribedItems(prev => prev.map(p => p.id === id ? { ...p, frequency: newFreq } : p));
  };

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
          <div className="grid grid-cols-1 2xl:grid-cols-[minmax(0,1.85fr)_300px] gap-5">
            <ConsultationCallPanel
              role="doctor"
              appointmentId={appointmentId}
              appointment={appointment}
              roomName={roomName}
              participant={participant}
              onLeave={() => router.push('/doctor/dashboard')}
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
                <h3 className="text-base font-extrabold text-stone-900">Doctor Notes</h3>
                <textarea
                  rows={4}
                  placeholder="Capture observations and decisions..."
                  className="mt-3 w-full resize-none rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-[13px] font-medium text-stone-700 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-100"
                />
              </section>

              <section className="rounded-3xl border border-stone-100 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col max-h-[300px]">
                <div className="flex items-center justify-between mb-3 shrink-0">
                  <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
                    <Pill size={16} className="text-teal-500" />
                    Quick Pharmacy
                  </h3>
                  {prescribedItems.length > 0 && (
                     <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-700 border border-teal-100">
                        {prescribedItems.length} Added
                     </span>
                  )}
                </div>

                <div className="relative mb-3 shrink-0">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Search medication..."
                    value={pharmacySearch}
                    onChange={(e) => setPharmacySearch(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2 pl-9 pr-3 text-[12px] font-medium text-stone-700 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100"
                  />
                </div>

                <div className="flex-1 overflow-y-auto min-h-0 space-y-2 pr-1 overflow-x-hidden">
                  {filteredPharmacy.map(med => {
                    const isAdded = prescribedItems.some(p => p.id === med.id);
                    const addedItem = prescribedItems.find(p => p.id === med.id);
                    return (
                      <div key={med.id} className={`flex items-start justify-between gap-2 p-2.5 rounded-xl border transition-colors group ${isAdded ? 'border-teal-100 bg-teal-50/30' : 'border-stone-100 bg-stone-50/60 hover:bg-stone-50'}`}>
                        <div className="min-w-0 flex-1">
                          <p className={`text-xs font-bold transition-colors ${isAdded ? 'text-teal-800' : 'text-stone-900'} truncate`}>{med.name}</p>
                          {isAdded ? (
                            <div className="mt-1.5 flex flex-col gap-1.5">
                              <div className="flex items-center gap-1.5 text-teal-600 bg-white rounded-md border border-teal-100 px-2 py-1 shadow-sm">
                                <Syringe size={12} className="shrink-0" />
                                <input
                                  autoFocus
                                  type="text"
                                  value={addedItem?.customDose || ''}
                                  onChange={(e) => updatePrescriptionDose(med.id, e.target.value)}
                                  placeholder="Dosage info..."
                                  className="w-full text-[10px] font-semibold text-teal-900 outline-none bg-transparent placeholder:text-teal-300"
                                />
                              </div>
                              <div className="flex items-center gap-1.5 text-teal-600 bg-white rounded-md border border-teal-100 px-2 py-1 shadow-sm">
                                <Clock3 size={12} className="shrink-0" />
                                <input
                                  type="text"
                                  value={addedItem?.frequency || ''}
                                  onChange={(e) => updatePrescriptionFrequency(med.id, e.target.value)}
                                  placeholder="How many times a day?"
                                  className="w-full text-[10px] font-semibold text-teal-900 outline-none bg-transparent placeholder:text-teal-300"
                                />
                              </div>
                            </div>
                          ) : (
                            <p className="text-[10px] font-medium text-stone-500 truncate tracking-wide mt-0.5">{med.dose} • {med.type}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => togglePrescription(med)}
                          className={`shrink-0 flex items-center justify-center w-7 h-7 rounded-[0.55rem] transition-all duration-200 ${isAdded ? 'bg-emerald-100 text-emerald-600 shadow-inner' : 'bg-white border border-stone-200 text-stone-400 hover:text-teal-600 hover:border-teal-200 shadow-sm hover:shadow'}`}
                        >
                          {isAdded ? <CheckCircle2 size={14} strokeWidth={3} /> : <Plus size={14} strokeWidth={2.5} />}
                        </button>
                      </div>
                    );
                  })}
                  {filteredPharmacy.length === 0 && (
                     <div className="text-center text-xs text-stone-400 py-4">No medications found.</div>
                  )}
                </div>
              </section>
            </aside>
          </div>
        )}
      </main>
    </DoctorLayout>
  );
}
