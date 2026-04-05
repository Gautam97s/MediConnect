import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuth } from '../features/auth/hooks/useAuth';
import DoctorSidebar from './DoctorSidebar';

export default function DoctorLayout({ children, title, activePage }) {
  const router = useRouter();
  const { isAuthenticated, isAuthReady, user } = useAuth();

  useEffect(() => {
    if (!isAuthReady) {
      return;
    }

    if (!isAuthenticated) {
      router.replace(`/auth/login?next=${encodeURIComponent(router.asPath)}`);
      return;
    }

    if (user?.role !== 'DOCTOR') {
      router.replace('/patient/dashboard');
    }
  }, [isAuthReady, isAuthenticated, user, router]);

  if (!isAuthReady || !isAuthenticated || user?.role !== 'DOCTOR') {
    return (
      <div className="h-screen w-screen bg-gradient-to-br from-[#f8fafc] to-[#eef2f6] grid place-items-center text-stone-600 font-semibold">
        Checking access...
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#f8fafc] to-[#eef2f6] flex flex-col lg:h-screen lg:flex-row font-sans text-stone-800 antialiased selection:bg-teal-200 lg:overflow-hidden">
      <Head>
        <title>{`${title} | MediConnect`}</title>
      </Head>

      <DoctorSidebar activePage={activePage} />

      {/* Main Content Area */}
      {children}
    </div>
  );
}
