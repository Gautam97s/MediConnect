import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import PatientLayout from '../../components/PatientLayout';
import { useAuth } from '../../features/auth/hooks/useAuth';
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

export default function PatientDashboard() {
  const { user } = useAuth();
  const displayName = user?.name?.trim() || 'Patient';
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
                    <h2 className="text-3xl font-extrabold text-stone-900 mb-2">Dr. Sarah Jenkins</h2>
                    <p className="text-stone-500 font-medium flex items-center gap-2"><Clock size={16}/> Today at 09:30 AM</p>
                 </div>
                 <button className="px-6 py-3 bg-black hover:bg-stone-800 text-white rounded-xl font-bold text-sm shadow-md transition-all">
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
