import Head from 'next/head';
import Link from 'next/link';
import { Leaf, User, HeartPulse, Pill, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center text-stone-800 font-sans antialiased selection:bg-teal-200 selection:text-teal-900 p-8">
      <Head>
        <title>MediConnect | Wellness Clinic</title>
      </Head>

      <div className="w-16 h-16 rounded-full bg-teal-700 flex items-center justify-center text-stone-50 font-bold text-3xl mb-8 shadow-md">
        <Leaf size={32} />
      </div>
      
      <h1 className="text-4xl md:text-5xl font-semibold text-stone-900 mb-4 text-center tracking-tight">
        Welcome to your <span className="text-teal-700">Wellness Journey</span>
      </h1>
      <p className="text-stone-500 text-lg max-w-xl text-center mb-16 leading-relaxed">
        Select a portal below to experience our personalized, compassionate care interfaces, designed for human connection.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        
        <Link href="/patient-dashboard" className="group">
          <div className="bg-white border border-stone-200 rounded-[2rem] p-8 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-300 h-full flex flex-col items-start relative overflow-hidden">
            <div className="w-14 h-14 rounded-2xl bg-sky-50 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
              <User size={28} className="text-sky-600" />
            </div>
            <h2 className="text-2xl font-semibold text-stone-800 mb-2">Patient Care</h2>
            <p className="text-stone-500 text-sm leading-relaxed mb-6">Connect with your doctor face-to-face from the comfort of your home.</p>
            <div className="mt-auto flex items-center text-sky-600 font-medium text-sm group-hover:gap-2 transition-all">
              Enter Portal <ArrowRight size={16} className="ml-1" />
            </div>
          </div>
        </Link>

        <Link href="/doctor-dashboard" className="group">
          <div className="bg-white border border-stone-200 rounded-[2rem] p-8 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-300 h-full flex flex-col items-start relative overflow-hidden">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
              <HeartPulse size={28} className="text-teal-700" />
            </div>
            <h2 className="text-2xl font-semibold text-stone-800 mb-2">Provider Tools</h2>
            <p className="text-stone-500 text-sm leading-relaxed mb-6">Manage your patient schedule and issue compassionate care plans seamlessly.</p>
            <div className="mt-auto flex items-center text-teal-700 font-medium text-sm group-hover:gap-2 transition-all">
              Enter Workspace <ArrowRight size={16} className="ml-1" />
            </div>
          </div>
        </Link>

        <Link href="/pharmacy" className="group">
          <div className="bg-white border border-stone-200 rounded-[2rem] p-8 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-300 h-full flex flex-col items-start relative overflow-hidden">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
              <Pill size={28} className="text-rose-500" />
            </div>
            <h2 className="text-2xl font-semibold text-stone-800 mb-2">Apothecary</h2>
            <p className="text-stone-500 text-sm leading-relaxed mb-6">Browse curated holistic health essentials and fulfill your prescriptions.</p>
            <div className="mt-auto flex items-center text-rose-500 font-medium text-sm group-hover:gap-2 transition-all">
              Shop Essentials <ArrowRight size={16} className="ml-1" />
            </div>
          </div>
        </Link>

      </div>
      
      <div className="mt-20 text-stone-400 text-sm flex items-center gap-2">
        <Leaf size={16} /> Curated with care by MediConnect
      </div>
    </div>
  );
}
