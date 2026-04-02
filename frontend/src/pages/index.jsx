import Head from 'next/head';
import Link from 'next/link';
import { Leaf, ArrowRight, HeartPulse, ShieldCheck, Stethoscope, BriefcaseMedical, Pill, CheckCircle2 } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-stone-800 font-sans antialiased selection:bg-teal-200">
      <Head>
        <title>MediConnect | Premium Telemedicine & Wellness</title>
      </Head>

      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-100 flex justify-between items-center px-8 py-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white"><Leaf size={16}/></div>
          <span className="font-bold text-xl tracking-tight text-stone-900">MediConnect</span>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-semibold text-stone-500">
          <a href="#patient" className="hover:text-stone-900 transition-colors">For Patients</a>
          <a href="#provider" className="hover:text-stone-900 transition-colors">For Providers</a>
          <a href="#pharmacy" className="hover:text-stone-900 transition-colors">Apothecary</a>
        </div>
        <div>
            <Link href="/auth/login?role=PATIENT&next=%2Fpatient%2Fdashboard" className="bg-stone-900 hover:bg-black text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-md transition-all">
             Client Portal
           </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden px-6 lg:px-8 bg-[#e7f0f8]">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/60 via-emerald-50/60 to-blue-100/60 z-0"></div>
        <div className="relative z-10 max-w-5xl mx-auto text-center">
           <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-white/80 text-teal-700 text-sm font-bold mb-8 shadow-sm">
             <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500"></span></span>
             Accepting New Patients
           </div>
           <h1 className="text-5xl lg:text-7xl font-extrabold text-stone-900 tracking-tight leading-[1.1] mb-6">
             The future of care is <br className="hidden lg:block"/> deeply <span className="text-teal-600">human-centric.</span>
           </h1>
           <p className="text-lg lg:text-xl text-stone-600 max-w-2xl mx-auto font-medium mb-10 leading-relaxed">
             Experience a beautifully crafted, seamless telemedicine platform bridging the gap between world-class providers and your daily wellness.
           </p>
           <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
             <Link href="#patient" className="px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-full font-bold text-base shadow-lg shadow-teal-500/30 transition-all flex items-center gap-2">
               Discover Patient Care <ArrowRight size={18}/>
             </Link>
             <Link href="#provider" className="px-8 py-4 bg-white hover:bg-stone-50 text-stone-800 rounded-full font-bold text-base shadow-sm border border-stone-200 transition-all">
               Explore Provider Tools
             </Link>
           </div>
        </div>
      </section>

      {/* Patient Section */}
      <section id="patient" className="py-24 px-6 lg:px-8 bg-white max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
        <div className="lg:w-1/2 relative">
           <div className="w-full aspect-[4/3] bg-gradient-to-tr from-sky-100 to-indigo-50 rounded-[2.5rem] shadow-xl border border-stone-100 overflow-hidden flex items-center justify-center relative p-8">
             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80')] bg-cover bg-center mix-blend-multiply opacity-20"></div>
             <div className="relative z-10 bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-lg border border-white max-w-sm w-full">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center text-sky-600"><HeartPulse size={24}/></div>
                  <div><h3 className="font-bold text-stone-900">Virtual Checkup</h3><p className="text-xs text-stone-500">Connected with Dr. Sarah</p></div>
                </div>
                <div className="h-2 w-full bg-stone-100 rounded-full mb-3"><div className="h-full bg-sky-400 rounded-full w-[70%]"></div></div>
                <div className="h-2 w-full bg-stone-100 rounded-full mb-3"><div className="h-full bg-stone-300 rounded-full w-[40%]"></div></div>
             </div>
           </div>
        </div>
        <div className="lg:w-1/2 pr-lg-12">
           <h2 className="text-sm font-extrabold text-sky-600 uppercase tracking-widest mb-3">For Patients</h2>
           <h3 className="text-4xl font-extrabold text-stone-900 mb-6 leading-tight">Your health journey, <br/>beautifully simplified.</h3>
           <p className="text-stone-600 text-lg mb-8 leading-relaxed">Access world-class healthcare from the comfort of your sanctuary. Track your vital signs, organize your medical records, and connect with physicians face-to-face.</p>
           <ul className="space-y-4 mb-10">
             {['HD Video Consultations', 'Secure Medical Records', 'Instant Prescriptions', 'Personalized Health Dashboard'].map((item, i) => (
               <li key={i} className="flex items-center gap-3 font-semibold text-stone-800"><CheckCircle2 className="text-sky-500" size={20}/> {item}</li>
             ))}
           </ul>
            <Link href="/auth/login?role=PATIENT&next=%2Fpatient%2Fdashboard" className="inline-flex items-center gap-2 text-sky-600 font-bold hover:text-sky-700 transition-colors">
              Access Patient Hub <ArrowRight size={18}/>
           </Link>
        </div>
      </section>

      {/* Provider Section */}
      <section id="provider" className="py-24 px-6 lg:px-8 bg-stone-50 flex flex-col lg:flex-row-reverse items-center gap-16 border-y border-stone-100">
        <div className="lg:w-1/2 relative max-w-7xl mx-auto flex justify-end">
           <div className="w-full lg:w-[110%] aspect-[4/3] bg-gradient-to-bl from-teal-100 to-emerald-50 rounded-[2.5rem] shadow-xl border border-stone-100 overflow-hidden flex justify-center items-center relative p-8 lg:-mr-12">
             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&q=80')] bg-cover bg-center mix-blend-multiply opacity-10"></div>
             <div className="relative z-10 bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-lg border border-white max-w-sm w-full">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-600"><Stethoscope size={24}/></div>
                  <div><h3 className="font-bold text-stone-900">Dr. Jenkins Queue</h3><p className="text-xs text-stone-500">4 Patients Waiting</p></div>
                </div>
                <div className="space-y-3">
                   <div className="flex justify-between items-center bg-stone-50 p-3 rounded-xl"><span className="text-sm font-bold text-stone-800">10:00 AM</span><span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-md font-bold">Consultation</span></div>
                   <div className="flex justify-between items-center bg-stone-50 p-3 rounded-xl"><span className="text-sm font-bold text-stone-800">10:30 AM</span><span className="text-xs bg-stone-200 text-stone-600 px-2 py-1 rounded-md font-bold">Follow-up</span></div>
                </div>
             </div>
           </div>
        </div>
        <div className="lg:w-1/2 max-w-7xl mx-auto pl-lg-12">
           <h2 className="text-sm font-extrabold text-teal-600 uppercase tracking-widest mb-3">For Providers</h2>
           <h3 className="text-4xl font-extrabold text-stone-900 mb-6 leading-tight">Empowering doctors <br/>to focus on care.</h3>
           <p className="text-stone-600 text-lg mb-8 leading-relaxed">A pristine, distraction-free environment to manage your schedule, issue precise e-prescriptions, and review comprehensive patient profiles.</p>
           <ul className="space-y-4 mb-10">
             {['Smart Patient Queue Management', 'Integrated E-Prescriptions', 'Direct Patient Messaging', 'Comprehensive Clinical Records'].map((item, i) => (
               <li key={i} className="flex items-center gap-3 font-semibold text-stone-800"><ShieldCheck className="text-teal-500" size={20}/> {item}</li>
             ))}
           </ul>
            <Link href="/auth/login?role=DOCTOR&next=%2Fdoctor%2Fdashboard" className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-full font-bold hover:bg-stone-800 transition-colors shadow-md">
              Launch Provider Workspace
           </Link>
        </div>
      </section>

      {/* Pharmacy Section */}
      <section id="pharmacy" className="py-24 px-6 lg:px-8 bg-white max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
        <div className="lg:w-1/2 relative">
           <div className="w-full aspect-[4/3] bg-gradient-to-tr from-rose-100 to-orange-50 rounded-[2.5rem] shadow-xl border border-stone-100 overflow-hidden flex items-center justify-center relative p-8">
             <div className="relative z-10 bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-lg border border-white max-w-sm w-full">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-500"><Pill size={24}/></div>
                  <div><h3 className="font-bold text-stone-900">E-Prescription Ready</h3><p className="text-xs text-emerald-600 font-bold uppercase tracking-widest">Covered By Insurance</p></div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-stone-100">
                  <span className="font-bold text-stone-900">Amoxicillin 500mg</span>
                  <span className="bg-stone-900 text-white px-3 py-1.5 text-xs font-bold rounded-full">Checkout</span>
                </div>
             </div>
           </div>
        </div>
        <div className="lg:w-1/2 pr-lg-12">
           <h2 className="text-sm font-extrabold text-rose-500 uppercase tracking-widest mb-3">Apothecary</h2>
           <h3 className="text-4xl font-extrabold text-stone-900 mb-6 leading-tight">Wellness essentials, <br/>delivered seamlessly.</h3>
           <p className="text-stone-600 text-lg mb-8 leading-relaxed">Fulfill your prescriptions instantly after your doctor visit. Browse curated, premium supplements and have them shipped directly to your sanctuary.</p>
           <Link href="/patient/pharmacy" className="inline-flex items-center gap-2 text-rose-500 font-bold hover:text-rose-600 border-b-2 border-rose-200 hover:border-rose-500 pb-1 transition-colors">
              Visit The Apothecary <ArrowRight size={18}/>
           </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 pt-16 pb-8 px-6 lg:px-8 text-stone-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="flex items-center gap-2 text-white">
             <Leaf size={20}/>
             <span className="font-bold text-xl tracking-tight">MediConnect</span>
           </div>
           <p className="text-sm font-medium">© 2026 Ethereal Clinic Network. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
