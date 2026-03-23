import React from 'react';
import PatientLayout from '../../components/PatientLayout';

export default function Records() {
  return (
    <PatientLayout title="Records" activePage="records">
       <main className="flex-1 px-8 py-10 flex flex-col h-full overflow-hidden items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-600 mb-6 shadow-sm">
             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z"></path><path d="M14 3v5h5M16 13H8M16 17H8M10 9H8"></path></svg>
          </div>
          <h2 className="text-3xl font-extrabold text-stone-900 mb-3">Medical Records</h2>
          <p className="text-stone-500 font-medium text-lg max-w-sm text-center">Access and download your comprehensive clinic records securely.</p>
       </main>
    </PatientLayout>
  );
}
