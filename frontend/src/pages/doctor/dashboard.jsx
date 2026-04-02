import React from 'react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import DoctorLayout from '../../components/DoctorLayout';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { fetchAppointments } from '../../api/appointments';
import { 
  MoreHorizontal,
  PlusSquare,
  Clock,
  User
} from 'lucide-react';

function formatTimeLabel(value) {
   const date = new Date(value);
   if (Number.isNaN(date.getTime())) {
      return 'Unknown time';
   }

   return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
   });
}

function getTodayStart() {
   const start = new Date();
   start.setHours(0, 0, 0, 0);
   return start;
}

export default function DoctorDashboard() {
   const { user, isAuthReady } = useAuth();
   const [appointments, setAppointments] = useState([]);
   const [loading, setLoading] = useState(true);

   const doctorId = user?.id ? Number(user.id) : 0;
   const displayName = (user?.name || 'Doctor').trim() || 'Doctor';

   useEffect(() => {
      let cancelled = false;

      const loadDashboard = async () => {
         if (!isAuthReady || !doctorId) {
            return;
         }

         setLoading(true);

         try {
            const data = await fetchAppointments({ doctorId });
            if (!cancelled) {
               setAppointments(Array.isArray(data) ? data : []);
            }
         } catch {
            if (!cancelled) {
               setAppointments([]);
            }
         } finally {
            if (!cancelled) {
               setLoading(false);
            }
         }
      };

      loadDashboard();

      return () => {
         cancelled = true;
      };
   }, [doctorId, isAuthReady]);

   const queue = useMemo(() => {
      return [...appointments]
         .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
         .slice(0, 4)
         .map((appointment, index) => {
            const isWaiting = index === 0;
            return {
               time: formatTimeLabel(appointment.appointmentDate),
               name: appointment.patientName || 'Patient',
               type: appointment.reason || 'Consultation',
               status: appointment.status || (isWaiting ? 'Waiting' : 'Upcoming'),
               color: isWaiting ? 'bg-teal-50 text-teal-700' : 'bg-stone-100 text-stone-600'
            };
         });
   }, [appointments]);

   const upcomingCount = useMemo(() => {
      return appointments.filter((appointment) => {
         const appointmentDate = new Date(appointment.appointmentDate);
         return !Number.isNaN(appointmentDate.getTime()) && appointmentDate >= new Date();
      }).length;
   }, [appointments]);

   const todayCount = useMemo(() => {
      const todayStart = getTodayStart();
      const todayEnd = new Date(todayStart);
      todayEnd.setDate(todayEnd.getDate() + 1);

      return appointments.filter((appointment) => {
         const appointmentDate = new Date(appointment.appointmentDate);
         return !Number.isNaN(appointmentDate.getTime()) && appointmentDate >= todayStart && appointmentDate < todayEnd;
      }).length;
   }, [appointments]);

   const nextBreakText = useMemo(() => {
      const upcomingAppointment = [...appointments]
         .map((appointment) => new Date(appointment.appointmentDate))
         .filter((date) => !Number.isNaN(date.getTime()))
         .sort((a, b) => a - b)[0];

      if (!upcomingAppointment) {
         return 'No visits';
      }

      const diffMinutes = Math.max(0, Math.round((upcomingAppointment.getTime() - Date.now()) / 60000));
      if (diffMinutes < 60) {
         return `${diffMinutes}m`;
      }

      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      return `${hours}h ${minutes}m`;
   }, [appointments]);

  return (
    <DoctorLayout title="Dashboard" activePage="dashboard">
        {/* Main Content Area */}
        <main className="flex-1 px-8 py-10 flex flex-col h-full overflow-hidden">
          
          <div className="flex justify-between items-center mb-8">
             <div>
                      <h1 className="text-3xl font-bold text-stone-900">{displayName}</h1>
                      <p className="text-stone-500 mt-1 font-medium">Here is your schedule for today.</p>
             </div>
             <div className="px-5 py-2.5 bg-white border border-stone-200 rounded-full shadow-sm text-sm font-bold flex items-center gap-2">
                 <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse"></span> Accepting Consultations
             </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full">
             <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                         <h3 className="text-sm font-bold text-stone-400 mb-2">Today's Visits</h3>
                         <div className="text-4xl font-extrabold text-stone-900">{loading ? '...' : todayCount}</div>
             </div>
             <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                         <h3 className="text-sm font-bold text-stone-400 mb-2">Upcoming Appointments</h3>
                         <div className="text-4xl font-extrabold text-stone-900">{loading ? '...' : upcomingCount}</div>
             </div>
             <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-gradient-to-br from-black to-stone-800 text-white">
                 <h3 className="text-sm font-bold text-stone-400 mb-2">Next Break In</h3>
                         <div className="text-4xl font-extrabold text-white">{loading ? '...' : nextBreakText}</div>
             </div>
          </div>

          {/* Patient Queue */}
          <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col flex-1 min-h-0 w-full relative">
             <button className="absolute right-8 top-8 text-stone-800 hover:scale-110 transition-transform">
                <PlusSquare size={24} />
             </button>

             <h2 className="text-xl font-bold text-stone-900 mb-6">Patient Queue</h2>

             <div className="grid grid-cols-12 gap-4 pb-4 border-b border-stone-100 mb-4 text-xs font-bold text-stone-400">
               <div className="col-span-2">Time</div>
               <div className="col-span-4">Patient Name</div>
               <div className="col-span-3">Reason</div>
               <div className="col-span-3">Status</div>
             </div>

             <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-4">
                {!loading && queue.length === 0 ? (
                  <div className="rounded-2xl border border-stone-200 bg-stone-50 p-6 text-center text-stone-500 font-medium">
                    No appointments available yet.
                  </div>
                ) : null}

                {queue.map((item, i) => (
                   <div key={i} className="grid grid-cols-12 gap-4 items-center bg-transparent border-b border-stone-50 pb-4 hover:bg-stone-50 rounded-xl px-2 -mx-2 transition-colors cursor-pointer group">
                      <div className="col-span-2 text-sm font-bold text-stone-800 flex items-center gap-1.5">
                         <Clock size={14} className="text-stone-400" /> {item.time}
                      </div>
                      <div className="col-span-4 font-extrabold text-stone-900 text-sm">
                         {item.name}
                      </div>
                      <div className="col-span-3 text-sm text-stone-500 font-medium">
                         {item.type}
                      </div>
                      <div className="col-span-3 flex items-center justify-between">
                                     <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.color}`}>
                           {item.status}
                         </span>
                         <MoreHorizontal size={20} className="text-stone-300 group-hover:text-stone-800 transition-colors" />
                      </div>
                   </div>
                ))}
             </div>
          </div>

        </main>
    </DoctorLayout>
  );
}
