import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import PatientLayout from '../../components/PatientLayout';
import { 
  ShoppingBag, 
  Search, 
  Menu,
  Pill,
  HeartPulse,
  Settings,
  ChevronLeft,
  ArrowRight,
  PackageCheck
} from 'lucide-react';

export default function Pharmacy() {
  const products = [
    { id: 1, image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200", name: "Amoxicillin 500mg", type: "Antibiotic • 21 Caps", price: "$14.50" },
    { id: 2, image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200", name: "Lisinopril 10mg", type: "Blood Pressure • 30 Tabs", price: "$8.00" },
    { id: 3, image: "https://images.unsplash.com/photo-1550572017-0b19614742cb?w=200", name: "Vitamin D3", type: "Immunity • 60 Gummies", price: "$12.99" },
    { id: 4, image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200", name: "Melatonin 5mg", type: "Sleep Aid • 60 Tabs", price: "$9.50" }
  ];

  return (
    <PatientLayout title="Apothecary" activePage="pharmacy">
        {/* Main Content Area */}
        <main className="flex-1 px-8 py-10 flex flex-col h-full overflow-hidden">
          
          {/* Top Bar */}
          <div className="flex justify-between items-center mb-8">
             <div className="flex items-center gap-6">
                <Link href="/" className="flex items-center gap-2 text-stone-800 font-semibold hover:text-black transition-colors">
                  <ChevronLeft size={20} /> Storefront
                </Link>
             </div>
             <div className="flex items-center gap-4">
               <div className="relative bg-white rounded-full px-4 py-2 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center w-64 md:w-80">
                 <Search size={16} className="text-stone-400" />
                 <input type="text" placeholder="Search medications..." className="bg-transparent border-none outline-none text-sm w-full font-medium ml-2 placeholder:text-stone-400" />
               </div>
               <button className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform relative">
                 <ShoppingBag size={20} />
                 <span className="absolute -top-1 -right-1 bg-rose-500 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">2</span>
               </button>
             </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0">
             
             {/* Catalog */}
             <div className="flex-1 bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col overflow-hidden">
                <h2 className="text-xl font-bold text-stone-900 mb-6">Curated Essentials</h2>
                
                <div className="grid grid-cols-2 xl:grid-cols-3 gap-6 overflow-y-auto custom-scrollbar pr-2 pb-6">
                   {products.map(prod => (
                      <div key={prod.id} className="group cursor-pointer">
                         <div className="w-full aspect-square bg-stone-50 rounded-2xl border border-stone-100 p-4 mb-3 flex justify-center items-center overflow-hidden group-hover:border-stone-300 transition-colors">
                            <img src={prod.image} className="max-w-full max-h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" />
                         </div>
                         <h3 className="font-bold text-stone-900 text-sm mb-1">{prod.name}</h3>
                         <p className="text-xs text-stone-500 font-medium mb-2">{prod.type}</p>
                         <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-stone-800">{prod.price}</span>
                            <button className="w-8 h-8 rounded-full bg-stone-100 text-stone-600 font-bold group-hover:bg-black group-hover:text-white transition-colors flex items-center justify-center pb-0.5">
                               +
                            </button>
                         </div>
                      </div>
                   ))}
                </div>
             </div>

             {/* Right Sidebar - Active Cart */}
             <div className="w-full lg:w-80 flex flex-col gap-6">
                
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-[2rem] p-6 shadow-sm border border-indigo-100">
                   <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Pill size={16} /> E-Prescriptions
                   </h3>
                   <div className="bg-white rounded-xl p-4 shadow-sm mb-3 cursor-pointer hover:shadow-md transition-shadow">
                      <h4 className="font-bold text-sm text-stone-900">Amoxicillin 500mg</h4>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">Covered (<span className="text-[10px]">$0.00</span>)</span>
                        <span className="w-6 h-6 bg-black text-white flex items-center justify-center rounded-full"><ArrowRight size={12}/></span>
                      </div>
                   </div>
                   <div className="bg-white rounded-xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                      <h4 className="font-bold text-sm text-stone-900">Lisinopril 10mg</h4>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-[11px] font-semibold text-stone-600 bg-stone-100 px-2 py-1 rounded-md"><span className="text-[10px]">$8.00</span> Copay</span>
                        <span className="w-6 h-6 bg-black text-white flex items-center justify-center rounded-full"><ArrowRight size={12}/></span>
                      </div>
                   </div>
                </div>

             </div>

          </div>
        </main>
    </PatientLayout>
  );
}
