import React, { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import PatientLayout from '../../components/PatientLayout';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { fetchAppointments } from '../../api/appointments';
import { DOCTORS } from '../../data/bookingData';
import { subscribeToRealtimeEvents } from '../../utils/realtime';
import { 
  HeartPulse, 
  Calendar, 
  FileText, 
  ShoppingBag, 
  Settings,
  Phone,
  Video,
  Clock,
  ArrowRight,
  User
} from 'lucide-react';

function normalizeName(value) {
  return (value || '')
    .toString()
    .toLowerCase()
    .replace(/\b(dr|mr|mrs|ms)\.?\s+/g, '')
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function namesLikelyMatch(a, b) {
  const left = normalizeName(a);
  const right = normalizeName(b);

  if (!left || !right) {
    return false;
  }

  return left === right || left.includes(right) || right.includes(left);
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

export default function PatientDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const displayName = user?.name?.trim() || 'Patient';
  const [appointments, setAppointments] = useState([]);
  const [loadingUpcoming, setLoadingUpcoming] = useState(true);
  const [nowEpochMs, setNowEpochMs] = useState(Date.now());

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNowEpochMs(Date.now());
    }, 30000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadAppointments = async () => {
      if (!displayName) {
        setLoadingUpcoming(false);
        return;
      }

      setLoadingUpcoming(true);
      try {
        const data = await fetchAppointments({ patientName: displayName });
        let nextAppointments = Array.isArray(data) ? data : [];

        // Fallback for cases like "Dr. Gautam Sharma" vs "Gautam Sharma".
        if (nextAppointments.length === 0) {
          const all = await fetchAppointments();
          const allAppointments = Array.isArray(all) ? all : [];
          nextAppointments = allAppointments.filter((appointment) =>
            namesLikelyMatch(appointment?.patientName, displayName)
          );
        }

        if (!cancelled) {
          setAppointments(nextAppointments);
        }
      } catch {
        if (!cancelled) {
          setAppointments([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingUpcoming(false);
        }
      }
    };

    loadAppointments();

    return () => {
      cancelled = true;
    };
  }, [displayName]);

  useEffect(() => {
    if (!displayName) {
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
      if (!namesLikelyMatch(payload?.patientName, displayName)) {
        return;
      }

      setAppointments((current) => mergeAppointmentById(current, payload));
    });
  }, [displayName]);

  const doctorsById = useMemo(() => {
    return Object.values(DOCTORS)
      .flat()
      .reduce((acc, doctor) => {
        acc[Number(doctor.id)] = doctor.name;
        return acc;
      }, {});
  }, []);

  const upcomingConsultation = useMemo(() => {
    return appointments
      .filter((appointment) => {
        const status = (appointment?.status || 'SCHEDULED').toString().toUpperCase();
        const dateValue = new Date(appointment?.appointmentDate).getTime();
        return dateValue > nowEpochMs && status !== 'CANCELLED' && status !== 'COMPLETED' && status !== 'NO_SHOW';
      })
      .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))[0] || null;
  }, [appointments, nowEpochMs]);

  const upcomingDoctorName = useMemo(() => {
    if (!upcomingConsultation) {
      return 'No consultation scheduled';
    }
    return doctorsById[Number(upcomingConsultation.doctorId)] || `Doctor #${upcomingConsultation.doctorId}`;
  }, [doctorsById, upcomingConsultation]);

  const upcomingTimeLabel = useMemo(() => {
    if (!upcomingConsultation?.appointmentDate) {
      return 'Book your next appointment to continue care.';
    }

    const date = new Date(upcomingConsultation.appointmentDate);
    if (Number.isNaN(date.getTime())) {
      return 'Upcoming consultation time unavailable';
    }

    const today = new Date();
    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    const timePart = date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    });

    if (isToday) {
      return `Today at ${timePart}`;
    }

    const dayPart = date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric'
    });
    return `${dayPart} at ${timePart}`;
  }, [upcomingConsultation]);

  const canJoinUpcomingConsultation = useMemo(() => {
    if (!upcomingConsultation?.appointmentDate) {
      return false;
    }

    const appointmentMs = new Date(upcomingConsultation.appointmentDate).getTime();
    if (Number.isNaN(appointmentMs)) {
      return false;
    }

    const openJoinAtMs = appointmentMs - 5 * 60 * 1000;
    return nowEpochMs >= openJoinAtMs;
  }, [upcomingConsultation, nowEpochMs]);

  const joinAvailabilityLabel = useMemo(() => {
    if (!upcomingConsultation?.appointmentDate) {
      return '';
    }

    const appointmentMs = new Date(upcomingConsultation.appointmentDate).getTime();
    if (Number.isNaN(appointmentMs) || canJoinUpcomingConsultation) {
      return '';
    }

    const openJoinAtMs = appointmentMs - 5 * 60 * 1000;
    const remainingMs = openJoinAtMs - nowEpochMs;
    if (remainingMs <= 0) {
      return '';
    }

    const remainingMinutes = Math.ceil(remainingMs / 60000);
    return `Join available in ${remainingMinutes} min`;
  }, [upcomingConsultation, canJoinUpcomingConsultation, nowEpochMs]);

  return (
    <PatientLayout title="My Hub" activePage="dashboard">
        <main className="flex-1 px-8 py-10 flex flex-col h-full overflow-hidden">
          
          <div className="mb-8">
             <h1 className="text-3xl font-bold text-stone-900">Good Morning, {displayName}</h1>
             <p className="text-stone-500 mt-1 font-medium">Your healthcare journey at a glance.</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 mb-8">
             {/* Upcoming Video Call Hero Card */}
             <div className="flex-1 bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-48 h-48 bg-teal-100 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4"></div>
               <h3 className="text-sm font-bold text-teal-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                 <Video size={16} /> Upcoming Consultation
               </h3>
               <div className="flex items-end justify-between relative z-10">
                 <div>
                    <h2 className="text-3xl font-extrabold text-stone-900 mb-2">
                      {loadingUpcoming ? 'Loading...' : upcomingDoctorName}
                    </h2>
                    <p className="text-stone-500 font-medium flex items-center gap-2">
                      <Clock size={16}/>
                      {loadingUpcoming ? 'Checking upcoming slot...' : upcomingTimeLabel}
                    </p>
                    {!loadingUpcoming && joinAvailabilityLabel ? (
                      <p className="mt-1 text-xs font-semibold text-stone-400">{joinAvailabilityLabel}</p>
                    ) : null}
                 </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (upcomingConsultation?.id) {
                        void router.push(`/patient/consultation/${upcomingConsultation.id}`);
                      }
                    }}
                    className="px-6 py-3 bg-black hover:bg-stone-800 text-white rounded-xl font-bold text-sm shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!upcomingConsultation || loadingUpcoming || !canJoinUpcomingConsultation}
                  >
                   Join Room
                 </button>
               </div>
             </div>

             {/* Vitals Summary Card */}
             <div className="w-full lg:w-72 bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-center">
               <h3 className="text-sm font-bold text-stone-400 mb-4">Latest Vitals (Oct 12)</h3>
               <div className="flex justify-between items-end mb-4 border-b border-stone-100 pb-4">
                 <span className="text-stone-600 font-medium">Blood Pressure</span>
                 <span className="text-xl font-bold text-stone-900">118/76 <span className="text-xs text-stone-400 font-normal">mmHg</span></span>
               </div>
               <div className="flex justify-between items-end">
                 <span className="text-stone-600 font-medium">Heart Rate</span>
                 <span className="text-xl font-bold text-stone-900">72 <span className="text-xs text-stone-400 font-normal">bpm</span></span>
               </div>
             </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
             {/* Active Prescriptions Table Container */}
             <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex-1 overflow-hidden flex flex-col">
               <h3 className="text-lg font-bold text-stone-900 mb-6 flex items-center justify-between">
                 Active Medications
                 <Link href="/patient/pharmacy"><span className="text-sm text-teal-600 cursor-pointer font-semibold uppercase tracking-wider hover:underline">Refill Options</span></Link>
               </h3>

               {/* List */}
               <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-5">
                  {[
                    { image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100", name: "Levothyroxine", dose: "50mcg • 1x Daily" },
                    { image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=100", name: "Vitamin D3", dose: "5000 IU • Weekly" },
                  ].map((med, i) => (
                    <div key={i} className="flex items-center gap-4 border border-stone-100 p-4 rounded-2xl hover:border-teal-200 transition-colors cursor-pointer group">
                       <div className="w-14 h-14 bg-stone-50 rounded-xl overflow-hidden p-1 flex items-center justify-center shrink-0">
                          <img src={med.image} className="w-full h-full object-contain mix-blend-multiply" />
                       </div>
                       <div className="flex-1">
                         <h4 className="font-bold text-stone-900">{med.name}</h4>
                         <p className="text-stone-500 text-sm mt-0.5">{med.dose}</p>
                       </div>
                       <button className="w-10 h-10 rounded-full bg-stone-50 text-stone-400 group-hover:bg-black group-hover:text-white flex items-center justify-center transition-colors">
                          <ArrowRight size={18} />
                       </button>
                    </div>
                  ))}
               </div>
             </div>
             
             {/* Doctor Note card */}
             <div className="w-full lg:w-96 bg-gradient-to-br from-teal-600 to-teal-800 rounded-[2rem] p-8 shadow-lg text-white flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-400 rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                <div>
                   <h3 className="text-teal-100 font-bold tracking-wider text-sm mb-6 uppercase">Care Team Note</h3>
                   <p className="text-lg font-medium leading-relaxed">
                     "Your vitals are looking excellent this week {displayName}. Keep up the exact same routine until our next check-up."
                   </p>
                </div>
                <div className="flex items-center gap-4 mt-8">
                   <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100" className="w-12 h-12 rounded-full border-2 border-teal-400" />
                   <div>
                     <p className="font-bold">Dr. Sarah Jenkins</p>
                     <p className="text-teal-200 text-xs font-semibold">Primary Care</p>
                   </div>
                </div>
             </div>
          </div>
        </main>
    </PatientLayout>
  );
}
