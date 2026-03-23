import React from 'react';
import Link from 'next/link';
import DoctorLayout from '../../components/DoctorLayout';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  FileText, 
  MessageSquare, 
  Settings,
  MoreHorizontal,
  PlusSquare,
  Clock,
  User
} from 'lucide-react';

export default function DoctorDashboard() {
  const queue = [
    { time: "09:30 AM", name: "ALEX CLARE", type: "Follow-up", status: "Waiting", color: "bg-teal-50 text-teal-700" },
    { time: "10:15 AM", name: "EMMA WATSON", type: "Consultation", status: "Upcoming", color: "bg-stone-100 text-stone-600" },
    { time: "11:00 AM", name: "DAVID CHEN", type: "Prescription Refill", status: "Upcoming", color: "bg-stone-100 text-stone-600" },
    { time: "11:45 AM", name: "SARAH LEE", type: "Review Lab Results", status: "Upcoming", color: "bg-stone-100 text-stone-600" },
  ];

  return (
    <DoctorLayout title="Dashboard" activePage="dashboard">
        {/* Main Content Area */}
        <main className="flex-1 px-8 py-10 flex flex-col h-full overflow-hidden">
          
          <div className="flex justify-between items-center mb-8">
             <div>
               <h1 className="text-3xl font-bold text-stone-900">Dr. Sarah Jenkins</h1>
               <p className="text-stone-500 mt-1 font-medium">Here's your schedule for today.</p>
             </div>
             <div className="px-5 py-2.5 bg-white border border-stone-200 rounded-full shadow-sm text-sm font-bold flex items-center gap-2">
                 <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse"></span> Accepting Consultations
             </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full">
             <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                 <h3 className="text-sm font-bold text-stone-400 mb-2">Total Patients Today</h3>
                 <div className="text-4xl font-extrabold text-stone-900">14</div>
             </div>
             <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                 <h3 className="text-sm font-bold text-stone-400 mb-2">Pending Unread Messages</h3>
                 <div className="text-4xl font-extrabold text-stone-900">3</div>
             </div>
             <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-gradient-to-br from-black to-stone-800 text-white">
                 <h3 className="text-sm font-bold text-stone-400 mb-2">Next Break In</h3>
                 <div className="text-4xl font-extrabold text-white">1h 15m</div>
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
