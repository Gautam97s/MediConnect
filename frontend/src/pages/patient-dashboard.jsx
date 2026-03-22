import React, { useState } from 'react';
import Head from 'next/head';
import { Mic, MicOff, Camera, CameraOff, PhoneOff, Calendar, Leaf, Pill, ArrowRight, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function PatientDashboard() {
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 font-sans antialiased selection:bg-teal-200 selection:text-teal-900 pb-12">
      <Head>
        <title>My Care Dashboard | MediConnect</title>
      </Head>

      {/* Top Navbar */}
      <nav className="w-full px-8 py-5 flex justify-between items-center sticky top-0 z-50 bg-stone-50/80 backdrop-blur-md border-b border-stone-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-teal-700 flex items-center justify-center text-white font-bold text-xl shadow-sm">
            <Leaf size={20} />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-stone-800">MediConnect</h1>
        </div>
        <div className="flex items-center gap-8 text-sm font-medium">
          <span className="text-stone-500 hover:text-teal-700 transition-colors cursor-pointer">Journey</span>
          <span className="text-teal-700 border-b-2 border-teal-700 pb-1">Consult</span>
          <Link href="/pharmacy" className="text-stone-500 hover:text-teal-700 transition-colors cursor-pointer">Apothecary</Link>
          <div className="w-10 h-10 rounded-full bg-stone-200 ml-4 overflow-hidden border border-stone-300">
             <img src="https://ui-avatars.com/api/?name=Emma+W&background=e2e8f0&color=475569" alt="Profile" />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (Video & Prescriptions) */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* Hero Video Section */}
          <section className="relative w-full aspect-video rounded-3xl overflow-hidden bg-stone-200 shadow-sm border border-stone-200 group">
            <img 
              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=1200" 
              alt="Doctor Consultation" 
              className="w-full h-full object-cover"
            />
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent opacity-90"></div>
            
            {/* Doctor Info */}
            <div className="absolute top-6 left-6 flex items-center gap-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
              <span className="flex items-center gap-2 text-xs font-semibold text-teal-700">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
                In Session
              </span>
              <span className="text-stone-400">|</span>
              <span className="text-stone-800 font-medium text-sm">Dr. Sarah Jenkins</span>
            </div>

            {/* Controls */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-lg border border-stone-200">
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
              <button className="px-6 py-3.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-medium flex items-center gap-2 shadow-sm transition-all">
                <PhoneOff size={20} /> Leave Call
              </button>
            </div>
          </section>

          {/* Active Care Plan */}
          <section className="bg-white rounded-[2rem] p-8 border border-stone-200 shadow-sm">
            <h2 className="text-2xl font-semibold text-stone-800 mb-6 flex items-center gap-3">
              <Pill className="text-teal-700" size={24} />
              Active Care Plan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: "Amoxicillin", dose: "500mg • Take with food", tag: "Antibiotic", color: "bg-sky-50 text-sky-700" },
                { name: "Lisinopril", dose: "10mg • Once Daily AM", tag: "Blood Pressure", color: "bg-rose-50 text-rose-700" }
              ].map((med, i) => (
                <div key={i} className="bg-stone-50 p-6 rounded-2xl border border-stone-200 flex flex-col justify-between group hover:border-teal-200 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-stone-800">{med.name}</h3>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${med.color}`}>{med.tag}</span>
                  </div>
                  <p className="text-stone-500 text-sm">{med.dose}</p>
                </div>
              ))}
              {/* Request Renewal Card */}
              <div className="border-2 border-dashed border-stone-300 bg-stone-50/50 p-6 rounded-2xl flex flex-col justify-center items-center text-stone-500 hover:text-teal-700 hover:border-teal-300 hover:bg-teal-50 transition-colors cursor-pointer group">
                <span className="font-medium flex items-center gap-2">
                  Request Refill <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </span>
                <span className="text-xs mt-1 text-stone-400">Takes 24-48 hours</span>
              </div>
            </div>
          </section>

        </div>

        {/* Right Column (Appointments & Pharmacy) */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          
          {/* Upcoming Appointment */}
          <section className="bg-teal-700 rounded-[2rem] p-8 shadow-sm text-white flex flex-col justify-between relative overflow-hidden">
             <Leaf className="absolute -bottom-6 -right-6 w-32 h-32 text-teal-600 opacity-50" />
            <div>
              <h2 className="text-sm font-medium text-teal-100 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Calendar size={16} /> Next Follow-up
              </h2>
              <div className="text-4xl font-semibold mb-1">Tomorrow</div>
              <div className="text-xl text-teal-200 font-medium mb-8">09:30 AM</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm px-5 py-4 rounded-2xl text-sm border border-white/20 relative z-10">
              <span className="font-semibold">Focus:</span> Lab Results & Wellness Review
            </div>
          </section>

          {/* Integrated Pharmacy CTA */}
          <section className="bg-white rounded-[2rem] p-8 border border-stone-200 shadow-sm flex flex-col justify-between items-start group">
            
            <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center mb-6">
              <ShoppingBag className="text-rose-500" size={24} />
            </div>
            <h2 className="text-2xl font-semibold text-stone-800 mb-3">Order Medication</h2>
            <p className="text-stone-500 text-sm leading-relaxed mb-8">
              Skip the line at the pharmacy. We'll deliver your prescribed medications to your door securely.
            </p>
            
            <Link href="/pharmacy" className="w-full">
              <button className="w-full py-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-sm transition-all flex items-center justify-center gap-2 group-hover:shadow-md">
                Visit Apothecary <ArrowRight size={16} />
              </button>
            </Link>
          </section>

        </div>
      </main>
    </div>
  );
}
