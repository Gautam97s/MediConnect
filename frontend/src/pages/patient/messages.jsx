import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import PatientLayout from '../../components/PatientLayout';
import { 
  Users, 
  Settings,
  MessageSquare,
  Search,
  CheckCircle2,
  Calendar,
  LayoutDashboard,
  FileText,
  Leaf,
  HeartPulse,
  User,
  ShoppingBag,
  Video,
  Phone
} from 'lucide-react';

export default function Messages() {
  return (
    <PatientLayout title="Messages" activePage="messages">
      <main className="flex-1 px-8 py-10 flex flex-col h-full overflow-hidden">
        <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0 w-full">
           
           {/* Chat List */}
           <div className="w-full lg:w-80 bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col">
              <h2 className="text-xl font-bold text-stone-900 mb-6">Inbox</h2>
              
              <div className="relative bg-stone-50 border border-stone-100 rounded-2xl mb-6">
                 <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                   <Search size={16} className="text-stone-400" />
                 </div>
                 <input type="text" placeholder="Search patients..." className="w-full bg-transparent border-none py-3 pl-10 pr-4 text-sm font-medium focus:outline-none" />
              </div>

              <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2 custom-scrollbar">
                 {/* Chat item active */}
                 <div className="p-4 bg-teal-50 border border-teal-100 rounded-2xl cursor-pointer">
                    <div className="flex justify-between items-center mb-1">
                       <h4 className="font-bold text-sm text-teal-800">Alex Clare</h4>
                       <span className="text-xs font-semibold text-teal-600">10:42 AM</span>
                    </div>
                    <p className="text-xs text-teal-700/80 font-medium truncate">Thank you Dr. Jenkins, the prescription works.</p>
                 </div>
                 
                 {/* Chat item */}
                 <div className="p-4 bg-white hover:bg-stone-50 border border-transparent hover:border-stone-100 rounded-2xl cursor-pointer transition-colors">
                    <div className="flex justify-between items-center mb-1">
                       <h4 className="font-bold text-sm text-stone-900">David Chen</h4>
                       <span className="text-xs font-semibold text-stone-400">Yesterday</span>
                    </div>
                    <p className="text-xs text-stone-500 font-medium truncate">Can I reschedule my appointment for Friday?</p>
                 </div>
              </div>
           </div>

           {/* Chat Window */}
           <div className="flex-1 bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
              
              {/* Header */}
              <div className="flex justify-between items-center border-b border-stone-100 pb-6 relative z-10">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-rose-200">
                       <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200&q=80" alt="Alex" className="w-full h-full object-cover" />
                    </div>
                    <div>
                       <h3 className="font-bold text-stone-900">Alex Clare</h3>
                       <p className="text-xs text-stone-500 font-medium">Patient • Last active 5m ago</p>
                    </div>
                 </div>
                 <button className="px-5 py-2 rounded-xl border border-stone-200 text-sm font-bold text-stone-600 hover:bg-stone-50 transition-colors">
                    View Profile
                 </button>
              </div>

              {/* Messages */}
              <div className="flex-1 py-8 overflow-y-auto flex flex-col justify-end gap-6 relative z-10">
                 <div className="flex flex-col gap-6">
                    
                    <div className="flex items-start gap-4">
                       <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 mt-1"><img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100" /></div>
                       <div className="bg-stone-100 px-5 py-3.5 rounded-2xl rounded-tl-sm text-sm font-medium text-stone-700 max-w-sm">
                          Hi doctor, I wanted to ask if I should continue taking the PeakFresh packets after 14 days?
                       </div>
                    </div>
                    
                    <div className="flex items-start gap-4 justify-end">
                       <div className="bg-black text-white px-5 py-3.5 rounded-2xl rounded-tr-sm text-sm font-medium max-w-sm">
                          Hi Alex. Since your gastritis symptoms have almost cleared, you can stop taking them after 14 days. If the symptoms return, let's schedule another consultation.
                       </div>
                    </div>

                 </div>
              </div>

              {/* Input */}
              <div className="pt-4 relative z-10">
                 <div className="relative border border-stone-200 rounded-2xl bg-white shadow-sm overflow-hidden focus-within:border-teal-400 transition-colors">
                    <input type="text" placeholder="Type a message..." className="w-full py-4 pl-4 pr-16 outline-none text-sm font-medium placeholder:text-stone-400" />
                    <button className="absolute right-2 top-2 bottom-2 w-10 bg-teal-500 hover:bg-teal-600 text-white flex items-center justify-center rounded-xl transition-colors">
                       <svg className="w-4 h-4 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </button>
                 </div>
              </div>

           </div>

        </div>
      </main>
    </PatientLayout>
  );
}
