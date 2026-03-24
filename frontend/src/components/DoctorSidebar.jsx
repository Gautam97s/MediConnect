import Link from 'next/link';
import { LayoutDashboard, Calendar, Users, FileText, MessageSquare, Stethoscope } from 'lucide-react';

export default function DoctorSidebar({ activePage }) {
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
            <span className="text-[11px] font-semibold text-teal-600 md:tracking-wider uppercase">Doctor Portal</span>
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

      <div className="mt-auto flex justify-center pb-4">
         <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 shadow-md border-2 border-white hover:border-stone-200 transition-colors cursor-pointer">
            <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&q=80" alt="Avatar" className="w-full h-full object-cover"/>
         </div>
      </div>
    </aside>
  );
}
