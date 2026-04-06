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
  Video
} from 'lucide-react';

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
    <DoctorLayout title="Consultation" activePage="dashboard">
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8 flex flex-col min-h-0 overflow-y-auto">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push('/doctor/dashboard')}
              className="rounded-full border border-stone-200 bg-white p-2 text-stone-600 hover:bg-stone-50"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-stone-900">Consultation Room</h1>
              <p className="mt-1 text-sm font-medium text-stone-500">Doctor session workspace</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-teal-700">
            <ShieldCheck size={14} />
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
          <div className="grid grid-cols-1 2xl:grid-cols-[minmax(0,1.85fr)_320px] gap-6">
            <ConsultationCallPanel
              role="doctor"
              appointmentId={appointmentId}
              appointment={appointment}
              roomName={roomName}
              participant={participant}
              onLeave={() => router.push('/doctor/dashboard')}
            />

            <aside className="space-y-6">
              <section className="rounded-[2rem] border border-stone-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <h3 className="text-lg font-extrabold text-stone-900">Session Snapshot</h3>
                <div className="mt-5 space-y-4 text-sm">
                  <div className="flex items-center gap-3 text-stone-700">
                    <User size={16} className="text-stone-400" />
                    <span>{appointment?.patientName || 'Patient'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-stone-700">
                    <Clock3 size={16} className="text-stone-400" />
                    <span>{sessionSummary.day} at {sessionSummary.time}</span>
                  </div>
                  <div className="flex items-start gap-3 text-stone-700">
                    <Stethoscope size={16} className="mt-0.5 text-stone-400" />
                    <span>{appointment?.reason || 'General consultation'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-stone-700">
                    <Video size={16} className="text-stone-400" />
                    <span>{roomName}</span>
                  </div>
                </div>
              </section>

              <section className="rounded-[2rem] border border-stone-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <h3 className="text-lg font-extrabold text-stone-900">Doctor Notes</h3>
                <textarea
                  rows={8}
                  placeholder="Capture observations, next steps, and treatment decisions during the call."
                  className="mt-4 w-full resize-none rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-medium text-stone-700 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-100"
                />
              </section>
            </aside>
          </div>
        )}
      </main>
    </DoctorLayout>
  );
}
