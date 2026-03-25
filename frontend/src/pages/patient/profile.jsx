import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import PatientLayout from '../../components/PatientLayout';
import { 
  ChevronLeft, MessageCircle, PlusSquare, AlertCircle, ChevronRight,
  User, ShieldCheck, FileText, HeartPulse, Pill, Activity, Stethoscope, 
  MapPin, Phone, Mail, Droplet, Download
} from 'lucide-react';

export default function PatientProfile() {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'clinical', label: 'Clinical Record' },
    { id: 'medications', label: 'Medications' },
    { id: 'documents', label: 'Documents' },
    { id: 'insurance', label: 'Insurance' }
  ];

  const medications = [
    { id: 1, image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100&q=80", name: "PEAKfresh USA", type: "Packets", duration: "14", startDate: "18/09/2022", progress: 75, alert: false },
    { id: 2, image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=100&q=80", name: "HydraFiz", type: "Packets", duration: "30", startDate: "2/10/2022", progress: 25, alert: true },
    { id: 3, image: "https://images.unsplash.com/photo-1550572017-0b19614742cb?w=100&q=80", name: "Barlean's", type: "Tea", duration: "60", startDate: "25/10/2022", progress: 10, alert: false },
    { id: 4, image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100&q=80", name: "HeartburnStop", type: "Tablets", duration: "7", startDate: "30/09/2022", progress: 90, alert: false }
  ];

  return (
    <PatientLayout title="My Profile" activePage="profile">
        <main className="flex-1 px-8 py-10 flex flex-col h-full overflow-hidden">
          
          {/* Top Bar */}
          <div className="flex items-center mb-8">
             <h1 className="text-3xl font-extrabold text-stone-900">Health Profile</h1>
          </div>

          {/* Cards Row */}
          <div className="flex flex-col lg:flex-row gap-6 mb-10 w-full shrink-0">
            
            {/* Profile Card */}
            <div className="flex-1 bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col sm:flex-row items-center gap-6 relative">
              <div className="w-20 h-20 rounded-full bg-rose-200 overflow-hidden border-4 border-white shadow-sm shrink-0">
                <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200&q=80" alt="Alex Clare" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                 <h2 className="text-xl font-bold text-stone-900 mb-1">ALEX CLARE</h2>
                 <p className="text-sm font-medium text-stone-600 mb-1">Medical number: <span className="text-stone-900 font-bold">AK6383950K</span></p>
                 <p className="text-sm font-medium text-stone-600">
                   Diagnosis: <span className="text-teal-600 border-b border-teal-600/30 pb-0.5 cursor-pointer hover:border-teal-600 transition-colors">Gastritis</span>, <span className="text-teal-600 border-b border-teal-600/30 pb-0.5 cursor-pointer hover:border-teal-600 transition-colors">Chronic cholecystitis</span>.
                 </p>
              </div>
              <button className="absolute right-6 top-6 text-stone-400 hover:text-stone-800 transition-colors hidden sm:block">
                 <MessageCircle size={24} />
              </button>
            </div>

            {/* Notes Card */}
            <div className="w-full lg:w-72 bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative">
               <h3 className="text-sm font-bold text-stone-900 mb-4">Urgent Alerts</h3>
               <div className="border-l-2 border-rose-300 pl-3">
                 <p className="text-sm font-bold text-rose-600 leading-snug">Severe Allergy: Walnuts & Penicillin.</p>
               </div>
            </div>

          </div>

          {/* Tabs */}
          <div className="flex overflow-x-auto custom-scrollbar items-end gap-2 px-4 border-b-0 border-transparent relative z-10 w-full shrink-0">
            {tabs.map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 sm:px-8 py-3.5 text-sm font-bold whitespace-nowrap transition-colors rounded-t-2xl relative ${
                  activeTab === tab.id 
                    ? "text-stone-900 bg-white shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] after:content-[''] after:absolute after:bottom-0 after:inset-x-0 after:h-2 after:bg-white after:translate-y-1" 
                    : "text-stone-500 hover:text-stone-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content Container */}
          <div className="bg-transparent sm:bg-white sm:rounded-3xl sm:rounded-tl-none sm:p-8 sm:shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex-1 overflow-hidden flex flex-col relative z-0 w-full">
            
            {/* =========================================================
                SCREEN 1: PROFILE TAB
                ========================================================= */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-[2rem] sm:rounded-none p-6 sm:p-0 shadow-sm sm:shadow-none flex flex-col lg:flex-row gap-12 flex-1 overflow-y-auto custom-scrollbar pr-2">
                <div className="flex-1 space-y-8">
                   <h3 className="text-xl font-extrabold text-stone-900 border-b border-stone-100 pb-4">Personal Information</h3>
                   <div className="grid grid-cols-2 gap-6">
                     <div><p className="text-sm font-medium text-stone-500 mb-1">Full Name</p><p className="font-bold text-stone-900">Alex Clare</p></div>
                     <div><p className="text-sm font-medium text-stone-500 mb-1">Date of Birth</p><p className="font-bold text-stone-900">May 14, 1992 (34 y/o)</p></div>
                     <div><p className="text-sm font-medium text-stone-500 mb-1">Gender</p><p className="font-bold text-stone-900">Female</p></div>
                     <div><p className="text-sm font-medium text-stone-500 mb-1">Blood Type</p><p className="font-bold text-stone-900">O+</p></div>
                   </div>
                   <h3 className="text-xl font-extrabold text-stone-900 border-b border-stone-100 pb-4 mt-8">Contact Details</h3>
                   <div className="space-y-4">
                     <div className="flex items-center gap-4"><Phone className="text-teal-600" size={20}/> <span className="font-bold text-stone-900">+1 (555) 123-4567</span></div>
                     <div className="flex items-center gap-4"><Mail className="text-teal-600" size={20}/> <span className="font-bold text-stone-900">alex.clare@example.com</span></div>
                     <div className="flex items-center gap-4"><MapPin className="text-teal-600" size={20}/> <span className="font-bold text-stone-900">1294 Wellness Blvd, San Francisco, CA</span></div>
                   </div>
                </div>
                <div className="flex-1 space-y-6">
                   <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100">
                      <h3 className="text-lg font-extrabold text-stone-900 mb-4 flex items-center gap-2"><HeartPulse className="text-rose-500" size={20}/> Emergency Contact</h3>
                      <p className="font-bold text-stone-900 text-lg">Michael Clare</p>
                      <p className="text-stone-500 font-medium mb-3">Husband</p>
                      <div className="flex items-center gap-2 text-stone-700 font-bold"><Phone size={16}/> +1 (555) 987-6543</div>
                   </div>
                   <div className="bg-sky-50 rounded-2xl p-6 border border-sky-100">
                      <h3 className="text-lg font-extrabold text-stone-900 mb-4 flex items-center gap-2"><Stethoscope className="text-sky-600" size={20}/> Primary Care Provider</h3>
                      <div className="flex items-center gap-4">
                         <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&q=80" alt="Dr. Jenkins" className="w-12 h-12 rounded-full shadow-sm object-cover" />
                         <div>
                           <p className="font-bold text-stone-900 text-lg">Dr. Sarah Jenkins</p>
                           <p className="text-stone-500 text-sm font-medium">Internal Medicine</p>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            )}

            {/* =========================================================
                SCREEN 2: CLINICAL RECORD TAB
                ========================================================= */}
            {activeTab === 'clinical' && (
              <div className="flex flex-col gap-6 flex-1 overflow-y-auto custom-scrollbar pr-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100 flex items-center gap-4">
                     <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center shrink-0"><Activity size={24}/></div>
                     <div><p className="text-stone-500 text-sm font-medium">Blood Pressure</p><p className="font-extrabold text-xl text-stone-900">118/76</p></div>
                  </div>
                  <div className="bg-white p-6 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100 flex items-center gap-4">
                     <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center shrink-0"><HeartPulse size={24}/></div>
                     <div><p className="text-stone-500 text-sm font-medium">Heart Rate</p><p className="font-extrabold text-xl text-stone-900">72 bpm</p></div>
                  </div>
                  <div className="bg-white p-6 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100 flex items-center gap-4">
                     <div className="w-12 h-12 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center shrink-0"><Droplet size={24}/></div>
                     <div><p className="text-stone-500 text-sm font-medium">Blood Sugar</p><p className="font-extrabold text-xl text-stone-900">95 mg/dL</p></div>
                  </div>
                </div>
                <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100">
                   <h3 className="text-xl font-extrabold text-stone-900 border-b border-stone-100 pb-4 mb-6">Conditions & Diagnoses</h3>
                   <div className="space-y-4">
                     <div className="flex justify-between items-center p-5 bg-stone-50 rounded-2xl border border-stone-100">
                       <div><p className="font-bold text-stone-900 text-lg">Gastritis</p><p className="text-stone-500 text-sm font-medium">Diagnosed: Oct 2025</p></div>
                       <span className="bg-teal-100 text-teal-700 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider">Active</span>
                     </div>
                     <div className="flex justify-between items-center p-5 bg-stone-50 rounded-2xl border border-stone-100">
                       <div><p className="font-bold text-stone-900 text-lg">Chronic Cholecystitis</p><p className="text-stone-500 text-sm font-medium">Diagnosed: Jan 2026</p></div>
                       <span className="bg-sky-100 text-sky-700 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider">Monitoring</span>
                     </div>
                   </div>
                </div>
              </div>
            )}

            {/* =========================================================
                SCREEN 3: MEDICATIONS TAB (Original code integrated)
                ========================================================= */}
            {activeTab === 'medications' && (
              <>
                <div className="flex justify-between items-center mb-6 px-4 sm:px-0">
                  <h3 className="text-xl font-extrabold text-stone-900">Active Prescriptions</h3>
                  <button className="text-teal-600 font-bold hover:scale-110 transition-transform"><PlusSquare size={24} /></button>
                </div>
                
                <div className="hidden lg:grid grid-cols-12 gap-4 pb-4 border-b border-stone-100 mb-4 text-xs font-bold text-stone-400">
                   <div className="col-span-1"></div>
                   <div className="col-span-4">Medication</div>
                   <div className="col-span-2 text-center">Duration</div>
                   <div className="col-span-5">Progress</div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-6">
                   {medications.map((med) => (
                     <div key={med.id} className="flex flex-col lg:grid lg:grid-cols-12 gap-4 lg:items-center bg-white sm:bg-transparent p-4 sm:p-0 rounded-[1.5rem] sm:rounded-none shadow-sm sm:shadow-none border border-stone-100 sm:border-transparent group">
                        <div className="lg:col-span-1 flex lg:justify-center absolute sm:relative right-6 sm:right-auto mt-2 sm:mt-0">
                           {med.alert && <AlertCircle className="text-rose-400 stroke-[2.5px]" size={20} />}
                        </div>
                        <div className="lg:col-span-4 flex items-center gap-4">
                           <div className="w-16 h-12 bg-stone-50 rounded-lg overflow-hidden border border-stone-200 p-1 flex items-center justify-center shrink-0">
                              <img src={med.image} alt={med.name} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                           </div>
                           <div>
                             <h4 className="font-bold text-stone-900 text-sm mb-0.5">{med.name}</h4>
                             <p className="text-stone-500 text-xs font-medium">{med.type}</p>
                             <p className="text-teal-600 text-xs font-bold mt-1 inline-block cursor-pointer hover:underline transition-colors">View Details</p>
                           </div>
                        </div>
                        <div className="lg:col-span-2 text-left lg:text-center font-bold text-stone-800 text-sm py-2 lg:py-4">
                           {med.duration} Days
                        </div>
                        <div className="lg:col-span-5 flex flex-col justify-center">
                           <p className="text-stone-500 font-bold text-xs mb-2">Start Date: {med.startDate}</p>
                           <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                             <div className="h-full bg-teal-400 rounded-full" style={{ width: `${med.progress}%` }}></div>
                           </div>
                        </div>
                     </div>
                   ))}
                </div>

                <div className="mt-8 flex items-center justify-center gap-3">
                   <button className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-black transition-colors"><ChevronLeft size={16} strokeWidth={3} /></button>
                   <button className="w-8 h-8 flex items-center justify-center rounded-full bg-black text-white font-bold text-sm shadow-md">1</button>
                   <button className="w-8 h-8 flex items-center justify-center rounded-full text-stone-600 font-bold text-sm hover:bg-stone-100 transition-colors">2</button>
                   <button className="w-8 h-8 flex items-center justify-center text-stone-800 hover:text-black transition-colors"><ChevronRight size={16} strokeWidth={3} /></button>
                </div>
              </>
            )}

            {/* =========================================================
                SCREEN 4: DOCUMENTS TAB
                ========================================================= */}
            {activeTab === 'documents' && (
              <div className="bg-white rounded-[2rem] sm:rounded-none p-6 sm:p-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:shadow-none flex-1 overflow-y-auto custom-scrollbar">
                 <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-extrabold text-stone-900">Medical Documents</h3>
                    <button className="text-teal-600 font-bold hover:text-teal-700 transition-colors flex items-center gap-2"><PlusSquare size={20}/> Upload</button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-2">
                   {[
                     { name: "Comprehensive Metabolic Panel", date: "Oct 12, 2026", type: "Lab Result" },
                     { name: "Visit Summary - Dr. Sarah Jenkins", date: "Sep 14, 2026", type: "Clinical Note" },
                     { name: "Ultrasound Report", date: "Jan 05, 2026", type: "Imaging" },
                     { name: "Referral: Physical Therapy", date: "Nov 20, 2025", type: "Referral" },
                   ].map((doc, idx) => (
                     <div key={idx} className="flex items-center justify-between p-5 bg-stone-50 border border-stone-100 rounded-[1.25rem] hover:border-teal-300 hover:bg-white transition-colors group cursor-pointer shadow-sm">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center shrink-0">
                              <FileText size={24}/>
                           </div>
                           <div>
                              <p className="font-bold text-stone-900 text-sm leading-snug mb-1 truncate max-w-[200px] sm:max-w-xs">{doc.name}</p>
                              <p className="text-stone-500 text-xs font-bold uppercase tracking-wider">{doc.type} • {doc.date}</p>
                           </div>
                        </div>
                        <button className="w-10 h-10 rounded-full flex items-center justify-center text-stone-400 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                           <Download size={18}/>
                        </button>
                     </div>
                   ))}
                 </div>
              </div>
            )}

            {/* =========================================================
                SCREEN 5: INSURANCE TAB
                ========================================================= */}
            {activeTab === 'insurance' && (
              <div className="flex flex-col lg:flex-row gap-8 flex-1 overflow-y-auto custom-scrollbar pr-2">
                 <div className="w-full lg:w-96 shrink-0">
                    <div className="bg-gradient-to-tr from-sky-600 to-blue-800 rounded-[2rem] p-8 shadow-xl text-white relative overflow-hidden h-56 flex flex-col justify-between">
                       <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                       <div className="relative z-10 flex justify-between items-start">
                          <h3 className="font-extrabold text-xl tracking-wide flex items-center gap-2"><ShieldCheck size={28}/> MediShield</h3>
                          <span className="text-sky-200 text-[10px] font-bold uppercase tracking-widest bg-black/20 px-2 py-1 rounded">PPO Premier</span>
                       </div>
                       <div className="relative z-10">
                          <p className="text-sky-200 text-xs uppercase tracking-wider mb-1">Member Name</p>
                          <p className="font-extrabold text-xl tracking-widest mb-4 font-mono">ALEX CLARE</p>
                          <div className="flex justify-between">
                            <div><p className="text-sky-200 text-[10px] uppercase tracking-wider">Member ID</p><p className="font-bold font-mono">MS-93847-XYZ</p></div>
                            <div><p className="text-sky-200 text-[10px] uppercase tracking-wider">Group #</p><p className="font-bold font-mono">1092-B</p></div>
                          </div>
                       </div>
                    </div>
                 </div>
                 <div className="bg-white rounded-[2rem] p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:border border-stone-100 flex-1">
                    <h3 className="text-xl font-extrabold text-stone-900 border-b border-stone-100 pb-4 mb-6">Coverage Details</h3>
                    <div className="space-y-6">
                       <div className="flex justify-between items-center border-b border-stone-50 pb-4">
                         <div><p className="font-bold text-stone-900 text-lg">Primary Care Visit</p><p className="text-stone-500 text-sm font-medium">In-Network Copay</p></div>
                         <p className="font-extrabold text-teal-600 text-2xl">$20</p>
                       </div>
                       <div className="flex justify-between items-center border-b border-stone-50 pb-4">
                         <div><p className="font-bold text-stone-900 text-lg">Specialist Visit</p><p className="text-stone-500 text-sm font-medium">In-Network Copay</p></div>
                         <p className="font-extrabold text-teal-600 text-2xl">$40</p>
                       </div>
                       <div className="flex justify-between items-center border-b border-stone-50 pb-4">
                         <div><p className="font-bold text-stone-900 text-lg">Emergency Room</p><p className="text-stone-500 text-sm font-medium">In-Network Copay</p></div>
                         <p className="font-extrabold text-teal-600 text-2xl">$150</p>
                       </div>
                       <div className="flex justify-between items-center">
                         <div><p className="font-bold text-stone-900 text-lg">Prescription Drugs</p><p className="text-stone-500 text-sm font-medium">Tier 1 Generic</p></div>
                         <p className="font-extrabold text-teal-600 text-2xl">$10</p>
                       </div>
                    </div>
                 </div>
              </div>
            )}

          </div>

        </main>
    </PatientLayout>
  );
}
