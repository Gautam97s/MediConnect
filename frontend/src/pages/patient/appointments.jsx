import React, { useState } from 'react';
import Head from 'next/head';
import PatientLayout from '../../components/PatientLayout';
import { 
  Calendar, 
  Video, 
  Clock, 
  ChevronRight, 
  Plus, 
  User, 
  Stethoscope, 
  MapPin 
} from 'lucide-react';

export default function Appointments() {
  const [activeTab, setActiveTab] = useState('upcoming');

  return (
    <PatientLayout title="Appointments" activePage="appointments">
       <main className="flex-1 px-8 py-10 flex flex-col h-full overflow-hidden">
          
          <div className="flex items-center justify-between mb-8">
             <div>
                <h1 className="text-3xl font-extrabold text-stone-900 mb-1">Appointments</h1>
                <p className="text-stone-500 font-medium text-lg">Manage your schedule and consultations.</p>
             </div>
             
             <button className="flex items-center gap-2 px-6 py-3 bg-stone-900 hover:bg-black text-white rounded-xl font-bold text-sm shadow-md transition-all">
                <Plus size={18} /> Book New Appointment
             </button>
          </div>

          <div className="flex-1 overflow-y-auto pb-12 custom-scrollbar pr-2">
             
             {/* Section Tabs */}
             <div className="flex items-center gap-6 mb-8 border-b border-stone-200">
               {['upcoming', 'history'].map((tab) => (
                 <button 
                   key={tab}
                   onClick={() => setActiveTab(tab)}
                   className={`pb-4 text-sm font-bold tracking-wide transition-colors relative ${activeTab === tab ? 'text-teal-600' : 'text-stone-500 hover:text-stone-900'}`}
                 >
                   {tab === 'upcoming' ? 'Upcoming' : 'Past Visits'}
                   {activeTab === tab && (
                     <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 rounded-t-full"></div>
                   )}
                 </button>
               ))}
             </div>

             {activeTab === 'upcoming' && (
               <div className="space-y-6">
                 {/* Hero Featured Appointment */}
                 <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-teal-100 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4"></div>
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                       
                       <div className="flex items-start gap-6">
                         <div className="w-20 h-20 rounded-[1.25rem] overflow-hidden shadow-sm shrink-0">
                            <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&q=80" alt="Dr. Sarah Jenkins" className="w-full h-full object-cover" />
                         </div>
                         <div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-teal-100 text-teal-700 text-xs font-bold uppercase tracking-wider mb-3">
                               <Video size={14} /> Video Consult
                            </div>
                            <h2 className="text-2xl font-extrabold text-stone-900 mb-1">Dr. Sarah Jenkins</h2>
                            <p className="text-stone-500 flex items-center gap-2 font-medium">
                               <Stethoscope size={16} /> General Practice • Primary Care
                            </p>
                         </div>
                       </div>

                       <div className="flex flex-col items-start lg:items-end gap-4 bg-stone-50 rounded-2xl p-5 border border-stone-100 min-w-[240px]">
                          <div className="flex items-center gap-3 text-stone-900 font-extrabold text-lg">
                             <Calendar size={20} className="text-teal-600" /> Tomorrow, Oct 24
                          </div>
                          <div className="flex items-center gap-3 text-stone-500 font-medium">
                             <Clock size={18} /> 09:30 AM - 10:00 AM
                          </div>
                       </div>

                    </div>

                    <div className="mt-8 pt-6 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
                       <p className="text-sm text-stone-500 font-medium flex-1">
                          Reason: <span className="text-stone-900">Routine Follow-up & Bloodwork Review</span>
                       </p>
                       <div className="flex gap-3 w-full sm:w-auto">
                          <button className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-bold text-sm text-stone-600 border border-stone-200 hover:bg-stone-50 transition-colors">
                             Reschedule
                          </button>
                          <button className="flex-1 sm:flex-none px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm shadow-md transition-all">
                             Join Room
                          </button>
                       </div>
                    </div>
                 </div>

                 {/* Standard Upcoming Appointment */}
                 <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:shadow-md transition-shadow border border-transparent hover:border-teal-100 cursor-pointer group">
                    <div className="flex items-center gap-5">
                       <div className="w-16 h-16 rounded-[1.25rem] bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                          <MapPin size={28} />
                       </div>
                       <div>
                          <h3 className="text-lg font-bold text-stone-900 mb-1">Dermatology Check</h3>
                          <p className="text-stone-500 text-sm font-medium">Dr. Emily Chen • Downtown Clinic</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                       <div className="text-left sm:text-right">
                          <div className="text-stone-900 font-extrabold text-md mb-0.5">Nov 12, 2026</div>
                          <div className="text-stone-500 text-sm font-medium">02:15 PM</div>
                       </div>
                       <div className="w-10 h-10 rounded-full bg-stone-50 text-stone-400 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors">
                          <ChevronRight size={18} />
                       </div>
                    </div>
                 </div>

               </div>
             )}

             {activeTab === 'history' && (
               <div className="space-y-4">
                 {[
                   { title: "Annual Physical", doc: "Dr. Sarah Jenkins", date: "Sep 14, 2026", type: "In-Person", status: "Completed" },
                   { title: "Prescription Renewal", doc: "Dr. Sarah Jenkins", date: "Jul 02, 2026", type: "Video", status: "Completed" },
                   { title: "Allergy Consultation", doc: "Dr. Marcus Thorne", date: "Apr 28, 2026", type: "In-Person", status: "Completed" }
                 ].map((visit, i) => (
                   <div key={i} className="bg-white rounded-[1.5rem] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-between gap-4 hover:shadow-md transition-shadow border border-transparent hover:border-stone-200 cursor-pointer group">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 group-hover:bg-stone-100 group-hover:text-stone-900 transition-colors">
                            {visit.type === 'Video' ? <Video size={20} /> : <User size={20} />}
                         </div>
                         <div>
                            <h4 className="font-bold text-stone-900">{visit.title}</h4>
                            <p className="text-xs text-stone-500 mt-0.5 font-medium">{visit.doc} • {visit.type}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-6">
                         <div className="text-sm font-extrabold text-stone-900">{visit.date}</div>
                         <div className="px-3 py-1 bg-stone-100 text-stone-600 text-xs font-bold uppercase tracking-wider rounded-md hidden sm:block">
                            {visit.status}
                         </div>
                      </div>
                   </div>
                 ))}
               </div>
             )}
             
          </div>
       </main>
    </PatientLayout>
  );
}
