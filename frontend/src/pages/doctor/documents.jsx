import React from 'react';
import DoctorLayout from '../../components/DoctorLayout';
import { FileText } from 'lucide-react';
import { useAuth } from '../../features/auth/hooks/useAuth';

export default function Documents() {
  const { user } = useAuth();
  const displayName = (user?.name || 'Doctor').trim() || 'Doctor';

  return (
    <DoctorLayout title="Documents" activePage="documents">
       <main className="flex-1 px-8 py-10 flex flex-col h-full overflow-hidden items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-600 mb-6 shadow-sm">
             <FileText size={32} />
          </div>
          <h2 className="text-3xl font-extrabold text-stone-900 mb-3">{displayName}'s Documents</h2>
          <p className="text-stone-500 font-medium text-lg max-w-sm text-center">Access lab results, referrals, and signed forms securely.</p>
       </main>
    </DoctorLayout>
  );
}
