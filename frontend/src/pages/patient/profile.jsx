import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import PatientLayout from '../../components/PatientLayout';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  FileText, 
  MessageSquare, 
  Settings,
  ChevronLeft,
  MessageCircle,
  PlusSquare,
  AlertCircle,
  MoreHorizontal,
  ChevronRight,
  Leaf,
  HeartPulse,
  User,
  ShoppingBag,
  Video,
  Phone
} from 'lucide-react';

export default function PatientProfile() {
  const medications = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100&q=80",
      name: "PEAKfresh USA",
      type: "Packets",
      duration: "14",
      startDate: "18/09/2022",
      progress: 75,
      alert: false
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=100&q=80",
      name: "HydraFiz",
      type: "Packets",
      duration: "30",
      startDate: "2/10/2022",
      progress: 25,
      alert: true
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1550572017-0b19614742cb?w=100&q=80",
      name: "Barlean's",
      type: "Tea",
      duration: "60",
      startDate: "25/10/2022",
      progress: 10,
      alert: false
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100&q=80",
      name: "HeartburnStop",
      type: "Tablets",
      duration: "7",
      startDate: "30/09/2022",
      progress: 90,
      alert: false
    }
  ];

  return (
    <PatientLayout title="My Profile" activePage="profile">
        <main className="flex-1 px-8 py-10 flex flex-col h-full overflow-hidden">
          
          {/* Top Bar */}
          <div className="flex items-center mb-8">
            <Link href="/" className="flex items-center gap-2 text-stone-800 font-semibold hover:text-black transition-colors">
              <ChevronLeft size={20} /> Back
            </Link>
          </div>

          {/* Cards Row */}
          <div className="flex flex-col lg:flex-row gap-6 mb-10 w-full">
            
            {/* Profile Card */}
            <div className="flex-1 bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-6 relative">
              <div className="w-20 h-20 rounded-full bg-rose-200 overflow-hidden border-4 border-white shadow-sm shrink-0">
                <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200&q=80" alt="Alex Clare" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                 <h2 className="text-xl font-bold text-stone-900 mb-1">ALEX CLARE</h2>
                 <p className="text-sm font-medium text-stone-600 mb-1">Medical number: <span className="text-stone-900 font-bold">AK6383950K</span></p>
                 <p className="text-sm font-medium text-stone-600">
                   Diagnosis: <span className="text-teal-600 border-b border-teal-600/30 pb-0.5 cursor-pointer hover:border-teal-600 transition-colors">Gastritis</span>, <span className="text-teal-600 border-b border-teal-600/30 pb-0.5 cursor-pointer hover:border-teal-600 transition-colors">Chronic cholecystitis</span>.
                 </p>
              </div>
              <button className="absolute right-6 top-6 text-stone-400 hover:text-stone-800 transition-colors">
                 <MessageCircle size={24} />
              </button>
            </div>

            {/* Notes Card */}
            <div className="w-full lg:w-72 bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative">
               <h3 className="text-sm font-bold text-stone-900 mb-4">Notes</h3>
               <div className="border-l-2 border-stone-200 pl-3">
                 <p className="text-sm font-medium text-stone-700 leading-snug">Patient is allergic to walnuts and ivy syrup.</p>
               </div>
               <button className="absolute right-6 top-6 text-stone-800 hover:scale-110 transition-transform">
                 <PlusSquare size={20} />
               </button>
            </div>

          </div>

          {/* Tabs */}
          <div className="flex items-end gap-2 px-4 border-b-0 border-transparent relative z-10 w-full">
            <button className="px-6 py-3 text-sm font-bold text-stone-500 hover:text-stone-800 transition-colors rounded-t-2xl">Profile</button>
            <button className="px-6 py-3 text-sm font-bold text-stone-500 hover:text-stone-800 transition-colors rounded-t-2xl">Clinical Record</button>
            <button className="px-8 py-3.5 text-sm font-extrabold text-stone-900 bg-white rounded-t-2xl shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] relative after:content-[''] after:absolute after:bottom-0 after:inset-x-0 after:h-2 after:bg-white after:translate-y-1">Medications</button>
            <button className="px-6 py-3 text-sm font-bold text-stone-500 hover:text-stone-800 transition-colors rounded-t-2xl">Documents</button>
            <button className="px-6 py-3 text-sm font-bold text-stone-500 hover:text-stone-800 transition-colors rounded-t-2xl">Insurance</button>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-3xl rounded-tl-none p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex-1 overflow-hidden flex flex-col relative z-0 w-full">
            
            <button className="absolute right-8 top-8 text-stone-800 hover:scale-110 transition-transform">
              <PlusSquare size={24} />
            </button>

            {/* Headers */}
            <div className="grid grid-cols-12 gap-4 pb-4 border-b border-white mb-4 text-xs font-bold text-stone-400">
               <div className="col-span-1"></div>
               <div className="col-span-4">Medication</div>
               <div className="col-span-2 text-center">Duration</div>
               <div className="col-span-5">Progress</div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-6">
               {medications.map((med) => (
                 <div key={med.id} className="grid grid-cols-12 gap-4 items-center group">
                    <div className="col-span-1 flex justify-center">
                       {med.alert && <AlertCircle className="text-rose-400 stroke-[2.5px]" size={20} />}
                    </div>
                    <div className="col-span-4 flex items-center gap-4">
                       <div className="w-16 h-12 bg-stone-100 rounded-lg overflow-hidden border border-stone-200 p-1 flex items-center justify-center">
                          <img src={med.image} alt={med.name} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                       </div>
                       <div>
                         <h4 className="font-bold text-stone-900 text-sm mb-0.5">{med.name}</h4>
                         <p className="text-stone-500 text-xs">{med.type}</p>
                         <p className="text-teal-600 text-xs font-semibold mt-1 border-b border-teal-600/30 inline-block cursor-pointer hover:border-teal-600 transition-colors">View Details</p>
                       </div>
                    </div>
                    <div className="col-span-2 text-center font-semibold text-stone-800 text-sm py-4">
                       {med.duration}
                    </div>
                    <div className="col-span-5 flex flex-col justify-center">
                       <p className="text-stone-600 font-bold text-xs mb-2">Start Date: {med.startDate}</p>
                       <div className="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden">
                         <div 
                            className="h-full bg-teal-400 rounded-full" 
                            style={{ width: `${med.progress}%` }}
                          ></div>
                       </div>
                    </div>
                 </div>
               ))}
            </div>

            {/* Pagination */}
            <div className="mt-8 flex items-center justify-center gap-3">
               <button className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-black transition-colors"><ChevronLeft size={16} strokeWidth={3} /></button>
               <button className="w-8 h-8 flex items-center justify-center rounded-full bg-black text-white font-bold text-sm shadow-md">1</button>
               <button className="w-8 h-8 flex items-center justify-center rounded-full text-stone-600 font-bold text-sm hover:bg-stone-100 transition-colors">2</button>
               <button className="w-8 h-8 flex items-center justify-center rounded-full text-stone-600 font-bold text-sm hover:bg-stone-100 transition-colors">3</button>
               <span className="text-stone-400 font-bold">...</span>
               <button className="w-8 h-8 flex items-center justify-center rounded-full text-stone-600 font-bold text-sm hover:bg-stone-100 transition-colors">7</button>
               <button className="w-8 h-8 flex items-center justify-center text-stone-800 hover:text-black transition-colors"><ChevronRight size={16} strokeWidth={3} /></button>
            </div>

          </div>

        </main>

    </PatientLayout>
  );
}
