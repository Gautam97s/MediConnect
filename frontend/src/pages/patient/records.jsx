import React, { useState } from 'react';
import Head from 'next/head';
import PatientLayout from '../../components/PatientLayout';
import { 
  FileText, Activity, Image as ImageIcon, Search, Download, Filter, 
  ChevronDown, FileCode, Clock, Share2
} from 'lucide-react';

export default function Records() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const records = [
    { id: 1, name: "Comprehensive Metabolic Panel", date: "Oct 12, 2026", type: "Lab Results", doctor: "Dr. Jenkins", status: "Final", size: "1.2 MB", iconBg: "bg-rose-100" },
    { id: 2, name: "Chest X-Ray - PA & Lateral", date: "Sep 28, 2026", type: "Imaging", doctor: "Dr. Rahman", status: "Final", size: "5.4 MB", iconBg: "bg-indigo-100" },
    { id: 3, name: "Annual Physical Summary", date: "Sep 14, 2026", type: "Visit Summaries", doctor: "Dr. Jenkins", status: "Final", size: "840 KB", iconBg: "bg-teal-100" },
    { id: 4, name: "Lipid Panel", date: "Jun 05, 2026", type: "Lab Results", doctor: "Dr. Jenkins", status: "Final", size: "1.1 MB", iconBg: "bg-rose-100" },
    { id: 5, name: "Dermatology Referral", date: "Mar 10, 2026", type: "Referrals", doctor: "Dr. Jenkins", status: "Processed", size: "450 KB", iconBg: "bg-amber-100" },
    { id: 6, name: "Abdominal Ultrasound", date: "Jan 05, 2026", type: "Imaging", doctor: "Dr. Thorne", status: "Final", size: "8.2 MB", iconBg: "bg-indigo-100" },
    { id: 7, name: "COVID-19 PCR Test", date: "Dec 12, 2025", type: "Lab Results", doctor: "Dr. Thorne", status: "Final", size: "600 KB", iconBg: "bg-rose-100" }
  ];

  const getIcon = (type) => {
    switch(type) {
      case 'Lab Results': return <Activity className="text-rose-500" size={24} />;
      case 'Imaging': return <ImageIcon className="text-indigo-500" size={24} />;
      case 'Referrals': return <FileCode className="text-amber-500" size={24} />;
      default: return <FileText className="text-teal-600" size={24} />;
    }
  };

  const categories = ['All', 'Lab Results', 'Imaging', 'Visit Summaries', 'Referrals'];

  const filteredRecords = records.filter(r => {
    const matchesFilter = activeFilter === 'All' || r.type === activeFilter;
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.doctor.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <PatientLayout title="Records" activePage="records">
       <main className="flex-1 px-8 py-10 flex flex-col h-full overflow-hidden">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 shrink-0">
             <div>
                <h1 className="text-3xl font-extrabold text-stone-900 mb-1">Medical Records</h1>
                <p className="text-stone-500 font-medium text-lg">Secure access to all your clinical documents.</p>
             </div>
             <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 rounded-xl font-bold text-sm shadow-sm transition-colors">
                   <Share2 size={16} /> Share Records
                </button>
             </div>
          </div>

          <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex-1 overflow-hidden flex flex-col relative z-0 w-full">
            
            {/* Toolbar */}
            <div className="p-6 sm:p-8 border-b border-stone-100 flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center shrink-0">
               
               {/* Search */}
               <div className="relative w-full lg:w-96 shrink-0">
                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
                    <Search size={18} />
                 </div>
                 <input 
                   type="text" 
                   placeholder="Search by doc name or doctor..." 
                   className="pl-11 pr-4 py-3 w-full bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-stone-800 placeholder:text-stone-400"
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                 />
               </div>

               {/* Filter Chips */}
               <div className="flex overflow-x-auto custom-scrollbar gap-2 w-full lg:w-auto pb-2 lg:pb-0">
                 {categories.map((cat) => (
                   <button 
                     key={cat}
                     onClick={() => setActiveFilter(cat)}
                     className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                       activeFilter === cat 
                         ? 'bg-stone-900 text-white shadow-md' 
                         : 'bg-stone-50 text-stone-500 hover:bg-stone-100 hover:text-stone-900'
                     }`}
                   >
                     {cat}
                   </button>
                 ))}
               </div>

            </div>

            {/* Headers */}
            <div className="hidden lg:grid grid-cols-12 gap-4 px-8 py-4 bg-stone-50/50 border-b border-stone-100 text-xs font-bold text-stone-400 uppercase tracking-widest shrink-0">
               <div className="col-span-5">Document Name</div>
               <div className="col-span-2">Date</div>
               <div className="col-span-2">Provider</div>
               <div className="col-span-2">Status</div>
               <div className="col-span-1 text-right">Actions</div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-8 space-y-4">
               {filteredRecords.length > 0 ? (
                 filteredRecords.map((record) => (
                   <div key={record.id} className="flex flex-col lg:grid lg:grid-cols-12 gap-4 lg:items-center bg-white border border-stone-100 p-5 rounded-[1.5rem] hover:shadow-md hover:border-stone-200 transition-all cursor-pointer group">
                      
                      <div className="lg:col-span-5 flex items-center gap-4">
                         <div className={`w-14 h-14 rounded-xl ${record.iconBg} flex items-center justify-center shrink-0`}>
                            {getIcon(record.type)}
                         </div>
                         <div>
                            <h4 className="font-bold text-stone-900 text-base mb-0.5">{record.name}</h4>
                            <div className="flex items-center gap-2 text-stone-500 text-xs font-medium">
                               <span className="uppercase tracking-wider font-bold">{record.type}</span> 
                               <span className="text-stone-300">•</span>
                               <span>{record.size}</span>
                            </div>
                         </div>
                      </div>

                      <div className="lg:col-span-2 flex items-center gap-2 text-stone-900 font-bold text-sm">
                         <Clock size={16} className="text-stone-400 lg:hidden" /> {record.date}
                      </div>

                      <div className="lg:col-span-2 text-stone-600 font-medium text-sm">
                         {record.doctor}
                      </div>

                      <div className="lg:col-span-2">
                         <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-stone-100 text-stone-600 text-xs font-bold uppercase tracking-wider">
                           {record.status}
                         </span>
                      </div>

                      <div className="lg:col-span-1 flex lg:justify-end items-center mt-2 lg:mt-0">
                         <button className="w-10 h-10 rounded-full bg-stone-50 text-stone-500 group-hover:bg-teal-600 group-hover:text-white flex items-center justify-center transition-colors shadow-sm lg:shadow-none">
                            <Download size={18} />
                         </button>
                      </div>

                   </div>
                 ))
               ) : (
                 <div className="h-full flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center text-stone-300 mb-4">
                       <Search size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-stone-900 mb-2">No records found</h3>
                    <p className="text-stone-500 font-medium max-w-sm">We couldn't find any medical records matching your search or filter criteria.</p>
                 </div>
               )}
            </div>

          </div>

       </main>
    </PatientLayout>
  );
}
