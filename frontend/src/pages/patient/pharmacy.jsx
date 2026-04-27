import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import PatientLayout from '../../components/PatientLayout';
import { fetchMedicines } from '../../api/medicines';
import { ShoppingBag, Search, Pill, ChevronLeft, ArrowRight } from 'lucide-react';

export async function getServerSideProps() {
   try {
      const data = await fetchMedicines();

      return {
         props: {
            initialMedicines: Array.isArray(data) ? data : [],
            initialError: ''
         }
      };
   } catch {
      return {
         props: {
            initialMedicines: [],
            initialError: 'Unable to load medicine catalog right now.'
         }
      };
   }
}

export default function Pharmacy({ initialMedicines = [], initialError = '' }) {
   const [medicines] = useState(initialMedicines);
   const [searchText, setSearchText] = useState('');

   const featuredMedicines = useMemo(() => {
      const preferredNames = ['Amoxicillin', 'Lisinopril'];
      const featured = preferredNames
         .map((name) => medicines.find((medicine) => medicine.name === name))
         .filter(Boolean);

      if (featured.length > 0) {
         return featured;
      }

      return medicines.slice(0, 2);
   }, [medicines]);

   const visibleMedicines = useMemo(() => {
      const query = searchText.trim().toLowerCase();

      if (!query) {
         return medicines;
      }

      return medicines.filter((medicine) => {
         const haystack = [
            medicine.name,
            medicine.strength,
            medicine.category,
            medicine.packSize,
            medicine.dosageForm
         ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

         return haystack.includes(query);
      });
   }, [medicines, searchText]);

   const formatCurrency = (value) => {
      const amount = Number(value || 0);
      return new Intl.NumberFormat('en-US', {
         style: 'currency',
         currency: 'USD'
      }).format(Number.isNaN(amount) ? 0 : amount);
   };

   const loading = false;
   const error = initialError;

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
                         <input
                            type="text"
                            placeholder="Search medications..."
                            value={searchText}
                            onChange={(event) => setSearchText(event.target.value)}
                            className="bg-transparent border-none outline-none text-sm w-full font-medium ml-2 placeholder:text-stone-400"
                         />
               </div>
               <button className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform relative">
                 <ShoppingBag size={20} />
                         <span className="absolute -top-1 -right-1 bg-rose-500 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                            {featuredMedicines.length}
                         </span>
               </button>
             </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0">
             
             {/* Catalog */}
             <div className="flex-1 bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col overflow-hidden">
                <div className="flex items-center justify-between gap-3 mb-6">
                  <h2 className="text-xl font-bold text-stone-900">Curated Essentials</h2>
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
                    {loading ? 'Loading catalog' : `${visibleMedicines.length} medicines`}
                  </span>
                </div>

                        {!error && visibleMedicines.length === 0 ? (
                           <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50 px-5 py-12 text-center text-sm font-medium text-stone-500">
                              No medicines match your search.
                           </div>
                        ) : null}

                {error ? (
                  <div className="mb-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                    {error}
                  </div>
                ) : null}
                
                <div className="grid grid-cols-2 xl:grid-cols-3 gap-6 overflow-y-auto custom-scrollbar pr-2 pb-6">
                   {(loading ? Array.from({ length: 6 }) : visibleMedicines).map((prod, index) => (
                      <div key={prod?.id || `placeholder-${index}`} className="group cursor-pointer">
                         <div className="w-full aspect-square bg-stone-50 rounded-2xl border border-stone-100 p-4 mb-3 flex justify-center items-center overflow-hidden group-hover:border-stone-300 transition-colors">
                            {loading ? (
                              <div className="h-12 w-12 rounded-full bg-stone-200 animate-pulse" />
                            ) : (
                              <img
                                src={prod.imageUrl || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200'}
                                alt={prod.name}
                                className="max-w-full max-h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                              />
                            )}
                         </div>
                         <h3 className="font-bold text-stone-900 text-sm mb-1">
                           {loading ? 'Loading medicine...' : `${prod.name} ${prod.strength}`}
                         </h3>
                         <p className="text-xs text-stone-500 font-medium mb-2">
                           {loading ? 'Fetching catalog' : `${prod.category} • ${prod.packSize}`}
                         </p>
                         <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-stone-800">
                              {loading ? '$0.00' : formatCurrency(prod.price)}
                            </span>
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
                   {featuredMedicines.map((medicine) => (
                     <div key={medicine.id} className="bg-white rounded-xl p-4 shadow-sm mb-3 cursor-pointer hover:shadow-md transition-shadow last:mb-0">
                        <h4 className="font-bold text-sm text-stone-900">{medicine.name} {medicine.strength}</h4>
                        <div className="flex justify-between items-center mt-2 gap-2">
                          <span className={`text-[11px] font-semibold px-2 py-1 rounded-md ${medicine.covered ? 'text-emerald-600 bg-emerald-50' : 'text-stone-600 bg-stone-100'}`}>
                            {medicine.covered ? `Covered (${formatCurrency(0)})` : `${formatCurrency(medicine.copay)} Copay`}
                          </span>
                          <span className="w-6 h-6 bg-black text-white flex items-center justify-center rounded-full"><ArrowRight size={12}/></span>
                        </div>
                     </div>
                   ))}
                </div>

             </div>

          </div>
        </main>
    </PatientLayout>
  );
}
