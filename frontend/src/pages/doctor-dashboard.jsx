import React, { useState } from 'react';
import Head from 'next/head';
import { Mic, MicOff, Camera, CameraOff, PhoneOff, Users, Clock, Send, HeartPulse, FileText, Leaf } from 'lucide-react';

export default function DoctorDashboard() {
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 font-sans antialiased selection:bg-teal-200 selection:text-teal-900 pb-12">
      <Head>
        <title>Provider Workspace | MediConnect</title>
      </Head>

      {/* Top Navbar */}
      <nav className="w-full px-8 py-5 flex justify-between items-center sticky top-0 z-50 bg-stone-50/80 backdrop-blur-md border-b border-stone-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-teal-700 flex items-center justify-center text-white font-bold text-xl shadow-sm">
            <Leaf size={20} />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-stone-800">MediConnect <span className="text-stone-400 font-normal text-base ml-2">Provider</span></h1>
        </div>
        <div className="flex items-center gap-6 text-sm font-medium">
           <div className="flex items-center gap-2 text-teal-700 bg-teal-50 px-4 py-2 rounded-full border border-teal-100 font-semibold">
             <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span> On Call
           </div>
          <div className="w-10 h-10 rounded-full bg-stone-200 ml-4 overflow-hidden border border-stone-300">
             <img src="https://ui-avatars.com/api/?name=Dr+J&background=115e59&color=fff" alt="Profile" />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (Video & Prescriptions) */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* Hero Video Section with Patient Overlay */}
          <section className="relative w-full aspect-video rounded-3xl overflow-hidden bg-stone-200 border border-stone-200 shadow-sm group">
            <img 
              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=1200" 
              alt="Patient Video Feed" 
              className="w-full h-full object-cover"
            />
            {/* Overlay Gradient for Text readability */}
            <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-stone-900/40 to-transparent"></div>
            
            {/* Patient Vitals Overlay */}
            <div className="absolute top-6 left-6 flex flex-col gap-3">
              <div className="bg-white/95 backdrop-blur-sm px-4 py-3 rounded-2xl shadow-sm border border-stone-100 flex flex-col gap-1 max-w-xs">
                <span className="text-xs font-semibold text-teal-600 uppercase tracking-widest">Consulting</span>
                <h2 className="text-xl text-stone-800 font-bold">Emma Watson, 34</h2>
                 <div className="flex items-center gap-2 text-sm text-stone-600 mt-2 bg-stone-50 p-2 rounded-lg border border-stone-100">
                   <HeartPulse size={16} className="text-rose-500" /> Vitals steady
                 </div>
                 <div className="flex items-center gap-2 text-sm text-stone-600 mt-1 bg-stone-50 p-2 rounded-lg border border-stone-100">
                   <FileText size={16} className="text-sky-600" /> Reviewing lab results from 10/12
                 </div>
              </div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/95 backdrop-blur-md px-6 py-3 rounded-full shadow-lg border border-stone-200">
              <button 
                onClick={() => setMicOn(!micOn)}
                className={`p-3.5 rounded-full transition-all ${micOn ? 'bg-stone-100 hover:bg-stone-200 text-stone-700' : 'bg-rose-100 text-rose-600'}`}
              >
                {micOn ? <Mic size={20} /> : <MicOff size={20} />}
              </button>
              <button 
                onClick={() => setCamOn(!camOn)}
                className={`p-3.5 rounded-full transition-all ${camOn ? 'bg-stone-100 hover:bg-stone-200 text-stone-700' : 'bg-rose-100 text-rose-600'}`}
              >
                {camOn ? <Camera size={20} /> : <CameraOff size={20} />}
              </button>
              <button className="px-6 py-3.5 rounded-full bg-stone-800 hover:bg-stone-900 text-white font-medium flex items-center gap-2 shadow-sm transition-all">
                <PhoneOff size={20} /> End Session
              </button>
            </div>
          </section>

          {/* Rx Generator Form */}
          <section className="bg-white rounded-[2rem] p-8 border border-stone-200 shadow-sm relative overflow-hidden">
            <h2 className="text-2xl font-semibold text-stone-800 mb-6 flex items-center gap-3">
              <Send className="text-teal-700" size={24} /> Care Plan & Scripts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="col-span-1 md:col-span-2 space-y-5">
                  <div>
                    <label className="text-xs text-stone-500 font-semibold tracking-wide uppercase mb-2 block">Medication Name & Strength</label>
                    <input type="text" placeholder="e.g. Levothyroxine 50 mcg" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-800 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all placeholder:text-stone-400" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-stone-500 font-semibold tracking-wide uppercase mb-2 block">Frequency</label>
                      <input type="text" placeholder="e.g. Once daily AM" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-800 focus:outline-none focus:border-teal-500 transition-all placeholder:text-stone-400" />
                    </div>
                    <div>
                      <label className="text-xs text-stone-500 font-semibold tracking-wide uppercase mb-2 block">Duration</label>
                      <input type="text" placeholder="e.g. 30 Days" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-800 focus:outline-none focus:border-teal-500 transition-all placeholder:text-stone-400" />
                    </div>
                  </div>
               </div>
               <div className="flex flex-col justify-end">
                  <button className="w-full py-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm shadow-sm hover:-translate-y-0.5 transition-all">
                    Issue Prescription
                  </button>
               </div>
            </div>
          </section>

        </div>

        {/* Right Column (Patient Queue) */}
        <div className="lg:col-span-4 flex flex-col h-full">
          
          <section className="bg-white rounded-[2rem] p-6 border border-stone-200 flex-1 flex flex-col shadow-sm">
            <h2 className="text-xl font-semibold text-stone-800 mb-6 flex items-center justify-between">
              <span className="flex items-center gap-2"><Users className="text-stone-400" size={20} /> Today's Queue</span>
              <span className="bg-stone-100 text-stone-600 text-xs px-3 py-1 rounded-full font-semibold">4 Waiting</span>
            </h2>
            
            <div className="flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar">
              {[
                { name: "Michael T.", time: "10:00 AM", symptom: "Routine checkup", wait: "5 min" },
                { name: "Sarah L.", time: "10:30 AM", symptom: "Sinus infection symptoms", wait: "Upcoming" },
                { name: "David Chen", time: "11:00 AM", symptom: "Refill consultation", wait: "Upcoming" },
                { name: "Amanda P.", time: "11:30 AM", symptom: "Dermatitis evaluation", wait: "Upcoming" },
              ].map((patient, i) => (
                <div key={i} className="bg-stone-50 p-4 rounded-2xl border border-stone-100 hover:border-teal-200 transition-colors cursor-pointer group flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <h3 className="text-base font-semibold text-stone-800 group-hover:text-teal-700 transition-colors">{patient.name}</h3>
                    <span className="text-xs font-medium text-stone-500 bg-stone-200 px-2 py-0.5 rounded-full">{patient.wait}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-stone-500 text-sm line-clamp-1">{patient.symptom}</p>
                    <span className="text-xs text-stone-400 flex items-center gap-1 shrink-0"><Clock size={12} /> {patient.time}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="mt-6 w-full py-3 rounded-xl border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-all font-medium text-sm">
              See Full Schedule
            </button>
          </section>

        </div>
      </main>
    </div>
  );
}
