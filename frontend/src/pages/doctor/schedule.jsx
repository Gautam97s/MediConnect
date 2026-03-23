import React from 'react';
import DoctorLayout from '../../components/DoctorLayout';
import { Calendar } from 'lucide-react';

export default function Schedule() {
  return (
    <DoctorLayout title="Schedule" activePage="schedule">
       <main className="flex-1 px-8 py-10 flex flex-col h-full overflow-hidden items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-600 mb-6 shadow-sm">
             <Calendar size={32} />
          </div>
          <h2 className="text-3xl font-extrabold text-stone-900 mb-3">Your Schedule</h2>
          <p className="text-stone-500 font-medium text-lg max-w-sm text-center">Manage your upcoming appointments and set your availability.</p>
       </main>
    </DoctorLayout>
  );
}
