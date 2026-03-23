import React from 'react';
import PatientLayout from '../../components/PatientLayout';

export default function Appointments() {
  return (
    <PatientLayout title="Appointments" activePage="appointments">
       <main className="flex-1 px-8 py-10 flex flex-col h-full overflow-hidden items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-600 mb-6 shadow-sm">
             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          </div>
          <h2 className="text-3xl font-extrabold text-stone-900 mb-3">Appointments</h2>
          <p className="text-stone-500 font-medium text-lg max-w-sm text-center">Manage your upcoming schedules and view your consultation history.</p>
       </main>
    </PatientLayout>
  );
}
