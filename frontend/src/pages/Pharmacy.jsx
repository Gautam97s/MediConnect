import React, { useState } from 'react';
import Head from 'next/head';
import { ShoppingBag, ChevronRight, CheckCircle2, Search, ArrowLeft, Pill } from 'lucide-react';
import Link from 'next/link';

export default function Pharmacy() {
  const [cartCount, setCartCount] = useState(2);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 font-sans antialiased selection:bg-rose-200 selection:text-rose-900 pb-12">
      <Head>
        <title>Apothecary | MediConnect</title>
      </Head>

      {/* Top Navbar */}
      <nav className="w-full px-8 py-5 flex justify-between items-center sticky top-0 z-50 bg-stone-50/80 backdrop-blur-md border-b border-stone-200 block md:flex hidden sm:flex">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-stone-400 hover:text-stone-800 transition-colors p-2 bg-white rounded-full border border-stone-200 shadow-sm">
             <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold tracking-tight text-stone-800">Apothecary</h1>
          </div>
        </div>
        
        {/* Search */}
        <div className="hidden md:flex flex-1 max-w-lg mx-8 relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search size={18} className="text-stone-400 group-focus-within:text-rose-500 transition-colors" />
          </div>
          <input 
            type="text" 
            placeholder="Search wellness essentials..." 
            className="w-full bg-white border border-stone-200 shadow-sm rounded-full py-2.5 pl-12 pr-4 text-sm text-stone-800 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all placeholder:text-stone-400" 
          />
        </div>

        <div className="flex items-center gap-6">
          <div className="relative cursor-pointer p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-stone-200">
            <ShoppingBag size={24} className="text-stone-600" />
            <span className="absolute -top-1 -right-1 bg-rose-500 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center text-white">
              {cartCount}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-stone-200 overflow-hidden border border-stone-300 hidden sm:block">
             <img src="https://ui-avatars.com/api/?name=Emma+W&background=e2e8f0&color=475569" alt="Profile" />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Central Content */}
        <div className="lg:col-span-8 flex flex-col gap-10">
          
          {/* E-Prescriptions Cart (Highlighted) */}
          <section className="bg-sky-50 rounded-[2rem] p-8 border border-sky-100 shadow-sm relative">
             <div className="flex justify-between items-start mb-6">
               <div>
                  <h2 className="text-2xl font-semibold text-stone-800 mb-2 flex items-center gap-2">Ready for fulfillment</h2>
                  <p className="text-stone-500 text-sm">Prescribed by Dr. Sarah Jenkins and ready for checkout.</p>
               </div>
               <CheckCircle2 size={32} className="text-sky-600 shrink-0" />
             </div>

             <div className="space-y-3">
               {/* Item 1 */}
               <div className="bg-white rounded-2xl p-5 flex justify-between items-center border border-sky-100 shadow-sm">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center">
                      <Pill size={24} className="text-sky-600" />
                   </div>
                   <div>
                     <h3 className="font-semibold text-stone-800">Amoxicillin <span className="text-stone-400 font-normal text-sm ml-2">500mg</span></h3>
                     <p className="text-sm text-stone-500 mt-0.5">21 capsules • Take 3x Daily</p>
                   </div>
                 </div>
                 <div className="text-right">
                   <div className="text-lg font-bold text-stone-800">$14.50</div>
                   <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Covered</span>
                 </div>
               </div>

               {/* Item 2 */}
               <div className="bg-white rounded-2xl p-5 flex justify-between items-center border border-sky-100 shadow-sm">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center">
                      <Pill size={24} className="text-slate-500" />
                   </div>
                   <div>
                     <h3 className="font-semibold text-stone-800">Lisinopril <span className="text-stone-400 font-normal text-sm ml-2">10mg</span></h3>
                     <p className="text-sm text-stone-500 mt-0.5">30 tablets • Take Once Daily</p>
                   </div>
                 </div>
                 <div className="text-right">
                   <div className="text-lg font-bold text-stone-800">$8.00</div>
                   <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Out of Pocket</span>
                 </div>
               </div>
             </div>
          </section>

          {/* Health Catalog */}
          <section>
             <div className="flex justify-between items-center mb-6 px-2">
                <h2 className="text-xl font-semibold text-stone-800">Wellness Curations</h2>
                <a href="#" className="text-sm font-medium text-rose-500 hover:text-rose-600 transition-colors">See all products</a>
             </div>
             
             <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
               {[
                 { src: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&q=80', name: 'Melatonin', desc: 'Sleep Support • 5mg', price: '$12.99' },
                 { src: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=300&q=80', name: 'Vitamin C', desc: 'Immunity • 1000mg', price: '$18.50' },
                 { src: 'https://images.unsplash.com/photo-1550572017-0b19614742cb?w=300&q=80', name: 'Magnesium', desc: 'Bone Health • 400mg', price: '$15.00' }
               ].map((prod, i) => (
                 <div key={i} className="bg-white rounded-3xl overflow-hidden border border-stone-200 hover:shadow-md transition-all group flex flex-col">
                   <div className="w-full aspect-square bg-stone-100 overflow-hidden relative">
                     <img src={prod.src} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                   </div>
                   <div className="p-5 flex-1 flex flex-col justify-between">
                     <div>
                       <h3 className="font-semibold text-stone-800 text-base">{prod.name}</h3>
                       <p className="text-sm text-stone-500 mt-1">{prod.desc}</p>
                     </div>
                     <div className="mt-5 flex items-center justify-between">
                       <span className="font-bold text-stone-800">{prod.price}</span>
                       <button className="w-10 h-10 rounded-full border border-stone-200 text-stone-600 hover:bg-rose-500 hover:text-white hover:border-transparent flex items-center justify-center transition-colors">
                         +
                       </button>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
          </section>

        </div>

        {/* Right Sidebar (Checkout) */}
        <div className="lg:col-span-4">
          
          <section className="bg-white rounded-[2rem] p-6 lg:p-8 border border-stone-200 shadow-sm sticky top-32">
            <h2 className="text-lg font-semibold text-stone-800 mb-6 font-serif">Order Summary</h2>
            
            <div className="space-y-4 mb-6 pb-6 border-b border-stone-100">
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">Prescriptions (2)</span>
                <span className="text-stone-800 font-medium">$22.50</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">Delivery</span>
                <span className="text-teal-600 font-medium">Free Express</span>
              </div>
            </div>

            <div className="flex justify-between items-end mb-8">
              <span className="text-stone-500 font-medium font-serif">Total</span>
              <span className="text-3xl font-bold text-stone-800">$22.50</span>
            </div>

            <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 mb-8">
              <div className="text-xs font-semibold tracking-wide text-stone-500 uppercase mb-2">Delivering to</div>
              <div className="text-sm text-stone-800 font-medium leading-relaxed">Emma Watson<br/>123 Sanctuary Ln, Suite 400</div>
              <div className="text-xs text-rose-500 mt-3 hover:text-rose-600 cursor-pointer font-medium">Edit address</div>
            </div>

            <button className="w-full py-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-sm transition-all shadow-sm flex justify-center items-center gap-2 group">
              Complete Order <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-center text-stone-400 text-xs mt-4 flex items-center justify-center gap-1"><CheckCircle2 size={12}/> Secure Payment</p>
          </section>

        </div>
      </main>
    </div>
  );
}
