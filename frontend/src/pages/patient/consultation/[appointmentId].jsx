import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import PatientLayout from '../../../components/PatientLayout';
import ConsultationCallPanel from '../../../components/ConsultationCallPanel';
import { fetchAppointmentById } from '../../../api/appointments';
import { downloadPrescriptionPdf, fetchPrescriptions, triggerPdfDownload } from '../../../api/prescriptions';
import { buildConsultationParticipant, buildConsultationRoomName } from '../../../utils/consultationRoom';
import { subscribeToRealtimeEvents } from '../../../utils/realtime';
import {
  ArrowLeft,
  Calendar,
  Clock3,
  Download,
  FileText,
  MessageSquareText,
  ShieldCheck,
  Stethoscope,
  UserRound
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
  const [prescription, setPrescription] = useState(null);
  const [prescriptionNotice, setPrescriptionNotice] = useState('');
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    if (!appointmentId) {
      return;
    }

    let cancelled = false;

    const loadData = async () => {
      setLoading(true);
      setError('');

      try {
        const [appointmentData, prescriptions] = await Promise.all([
          fetchAppointmentById(appointmentId),
          fetchPrescriptions({ appointmentId })
        ]);

        if (!cancelled) {
          setAppointment(appointmentData);
          setPrescription(Array.isArray(prescriptions) ? prescriptions[0] || null : null);
          if (Array.isArray(prescriptions) && prescriptions[0]) {
            setPrescriptionNotice('Your prescription PDF is ready to download.');
          }
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

    void loadData();

    return () => {
      cancelled = true;
    };
  }, [appointmentId]);

  useEffect(() => {
    if (!appointmentId) {
      return undefined;
    }

    return subscribeToRealtimeEvents((event) => {
      const type = (event?.type || '').toString();

      if (type === 'prescription.ready' && Number(event?.payload?.appointmentId) === Number(appointmentId)) {
        setPrescription(event.payload);
        setPrescriptionNotice('Your doctor has completed the consultation and generated your prescription PDF.');
      }

      if (type === 'appointment.updated' && Number(event?.payload?.id) === Number(appointmentId)) {
        setAppointment(event.payload);
      }
    });
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

  const handleDownloadPrescription = async () => {
    if (!prescription?.id) {
      return;
    }

    setDownloadingPdf(true);
    setPrescriptionNotice('');

    try {
      const { blob, fileName } = await downloadPrescriptionPdf(prescription.id);
      triggerPdfDownload(blob, fileName);
      setPrescriptionNotice('Prescription PDF downloaded successfully.');
    } catch (downloadError) {
      setPrescriptionNotice(
        downloadError?.response?.data?.message || 'Could not download the prescription PDF right now.'
      );
    } finally {
      setDownloadingPdf(false);
    }
  };

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
          <div className="grid grid-cols-1 2xl:grid-cols-[minmax(0,1.85fr)_320px] gap-5">
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

              <section className="rounded-3xl border border-stone-100 bg-gradient-to-br from-teal-50 via-white to-sky-50 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-teal-700">Prescription</p>
                    <h3 className="mt-1 text-lg font-extrabold tracking-tight text-stone-900">
                      {prescription ? 'PDF Ready' : 'Waiting for Doctor'}
                    </h3>
                  </div>
                  <FileText size={18} className="text-teal-600" />
                </div>

                <p className="mt-3 text-sm leading-6 text-stone-600">
                  {prescription
                    ? 'Your doctor has finished the consultation. You can download the generated prescription PDF now.'
                    : 'Once your doctor ends the consultation and finalizes the prescription, it will appear here automatically.'}
                </p>

                {prescription?.items?.length ? (
                  <div className="mt-4 space-y-2">
                    {prescription.items.map((item, index) => (
                      <div key={`item-${index}`} className="rounded-2xl border border-teal-100 bg-white px-3 py-2.5">
                        <p className="text-sm font-bold text-stone-900">{item.medicationName}</p>
                        <p className="mt-1 text-xs text-stone-500">
                          {item.dosage} • {item.frequency}
                          {item.duration ? ` • ${item.duration}` : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : null}

                {prescriptionNotice ? (
                  <div className="mt-4 rounded-2xl border border-teal-100 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-700">
                    {prescriptionNotice}
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={() => void handleDownloadPrescription()}
                  disabled={!prescription?.id || downloadingPdf}
                  className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
                    prescription?.id
                      ? 'bg-stone-900 text-white hover:bg-black'
                      : 'cursor-not-allowed border border-stone-200 bg-stone-100 text-stone-400'
                  }`}
                >
                  <Download size={14} />
                  {downloadingPdf ? 'Downloading...' : 'Download Prescription PDF'}
                </button>
              </section>
            </aside>
          </div>
        )}
      </main>
    </PatientLayout>
  );
}
