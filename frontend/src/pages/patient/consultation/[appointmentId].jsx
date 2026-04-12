import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import PatientLayout from '../../../components/PatientLayout';
import ConsultationCallPanel from '../../../components/ConsultationCallPanel';
import { fetchAppointmentById } from '../../../api/appointments';
import { buildConsultationParticipant, buildConsultationRoomName } from '../../../utils/consultationRoom';
import {
  ArrowLeft,
  Calendar,
  Clock3,
  MessageSquareText,
  ShieldCheck,
  Stethoscope,
  UserRound,
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

export default function PatientConsultationPage() {
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
          setError('Could not load this consultation room.');
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
        role: 'patient',
        appointmentId,
        doctorId: appointment?.doctorId,
        doctorName: appointment?.doctorName,
        patientName: appointment?.patientName
      }),
    [appointment?.doctorId, appointment?.doctorName, appointment?.patientName, appointmentId]
  );

  return (
    <PatientLayout title="Consultation" activePage="appointments" hideSidebar={true}>
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8 flex flex-col overflow-y-auto">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push('/patient/dashboard')}
              className="rounded-full border border-stone-200 bg-white p-1.5 text-stone-600 hover:bg-stone-50"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-stone-900">Consultation Room</h1>
              <p className="mt-0.5 text-xs font-medium text-stone-500">Secure appointment session</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-teal-700">
            <ShieldCheck size={12} />
            Private Call
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
              role="patient"
              appointmentId={appointmentId}
              appointment={appointment}
              roomName={roomName}
              participant={participant}
              onLeave={() => router.push('/patient/dashboard')}
            />

            <aside className="space-y-4">
              <section className="rounded-3xl border border-stone-100 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <h3 className="text-base font-extrabold text-stone-900">Session Details</h3>
                <div className="mt-4 space-y-3 text-[13px]">
                  <div className="flex items-center gap-2.5 text-stone-700">
                    <Calendar size={14} className="text-stone-400" />
                    <span>{sessionSummary.day}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-stone-700">
                    <Clock3 size={14} className="text-stone-400" />
                    <span>{sessionSummary.time}</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-stone-700">
                    <Stethoscope size={14} className="mt-0.5 text-stone-400" />
                    <span className="leading-snug">{appointment?.reason || 'General consultation'}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-stone-700">
                    <UserRound size={14} className="text-stone-400" />
                    <span className="truncate">{roomName}</span>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-stone-100 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <h3 className="text-base font-extrabold text-stone-900">Preparation Checklist</h3>
                <div className="mt-3 space-y-2.5 text-[13px] text-stone-600">
                  <div className="flex items-start gap-2.5">
                    <MessageSquareText size={14} className="mt-0.5 text-teal-600" />
                    <span className="leading-snug">Keep your symptoms, medications, and questions ready.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck size={14} className="mt-0.5 text-teal-600" />
                    <span className="leading-snug">Use a quiet space with stable internet for the clearest call.</span>
                  </div>
                </div>
              </section>
            </aside>
          </div>
        )}
      </main>
    </PatientLayout>
  );
}
