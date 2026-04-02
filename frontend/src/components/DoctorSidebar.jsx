import Link from 'next/link';
import { useRouter } from 'next/router';
import { LayoutDashboard, Calendar, Users, FileText, MessageSquare, Stethoscope } from 'lucide-react';
import { useAuth } from '../features/auth/hooks/useAuth';

export default function DoctorSidebar({ activePage }) {
  const router = useRouter();
  const { logout, user } = useAuth();

  const displayName = (user?.name || 'Doctor').trim() || 'Doctor';
  const subtitle = user?.licenseNumber ? `License ${user.licenseNumber}` : 'Doctor Portal';
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'D';

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const navItems = [
    { name: 'Dashboard', href: '/doctor/dashboard', icon: LayoutDashboard, id: 'dashboard' },
    { name: 'Schedule', href: '/doctor/schedule', icon: Calendar, id: 'schedule' },
    { name: 'Patients', href: '/doctor/patients', icon: Users, id: 'patients' },
    { name: 'Documents', href: '/doctor/documents', icon: FileText, id: 'documents' },
    { name: 'Messages', href: '/doctor/messages', icon: MessageSquare, id: 'messages' }
  ];

  return (
    <aside className="w-64 bg-white m-3 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col py-8 px-6 z-10 shrink-0">
      <div className="flex items-center gap-3 mb-10 px-2 mt-2">
         <div className="w-10 h-10 bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl flex items-center justify-center text-teal-600 border border-teal-200/50 shadow-sm shrink-0">
            <Stethoscope size={24} strokeWidth={2.5} />
         </div>
         <div className="flex flex-col">
            <span className="font-bold text-[17px] text-stone-900 leading-tight tracking-tight">MediConnect</span>
          <span className="text-[11px] font-semibold text-teal-600 md:tracking-wider uppercase">{subtitle}</span>
         </div>
      </div>

      <nav className="flex flex-col gap-2">
         {navItems.map((item) => {
           const Icon = item.icon;
           const isActive = activePage === item.id;
           return (
             <div key={item.id} className="relative flex items-center mt-2 group">
               {isActive && (
                 <div className="absolute left-0 w-1.5 h-8 bg-black rounded-r-md -ml-6"></div>
               )}
               <Link 
                 href={item.href} 
                 className={`flex items-center gap-4 px-4 py-3 w-full rounded-xl transition-colors ${isActive ? 'text-black font-bold bg-white' : 'text-stone-500 font-medium hover:text-black hover:bg-stone-50'}`}
               >
                 <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-black' : 'text-stone-500'} /> 
                 {item.name}
               </Link>
             </div>
           );
         })}
      </nav>

      <div className="mt-auto space-y-4 pb-2">
         <div className="flex justify-center">
           <div className="w-14 h-14 rounded-full shrink-0 shadow-md border-2 border-white bg-gradient-to-br from-teal-600 to-cyan-500 text-white flex items-center justify-center font-extrabold tracking-wide hover:border-stone-200 transition-colors cursor-pointer" title={displayName}>
              {initials}
           </div>
         </div>
         <div className="text-center px-2">
           <div className="text-sm font-bold text-stone-900 truncate">{displayName}</div>
           <div className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 truncate">{user?.role === 'DOCTOR' ? 'Provider Account' : 'Doctor Portal'}</div>
         </div>
         <button
           type="button"
           onClick={handleLogout}
           className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-bold uppercase tracking-wider text-stone-600 hover:bg-stone-50 hover:text-stone-900"
         >
           Logout
         </button>
      </div>
    </aside>
  );
}
