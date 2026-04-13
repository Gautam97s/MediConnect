import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuth } from '../features/auth/hooks/useAuth';
import DoctorSidebar from './DoctorSidebar';

export default function DoctorLayout({ children, title, activePage, showSidebar = true }) {
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
    <div className="min-h-screen w-full bg-gradient-to-br from-[#f8fafc] via-[#f5f9fb] to-[#eef2f6] font-sans text-stone-800 antialiased selection:bg-teal-200">
      <Head>
        <title>{`${title} | MediConnect`}</title>
      </Head>

      <div className={`mx-auto flex min-h-screen w-full max-w-[1680px] flex-col ${showSidebar ? 'lg:flex-row' : ''}`}>
        {showSidebar ? <DoctorSidebar activePage={activePage} /> : null}
        <div className="flex min-h-0 flex-1 flex-col">
          {children}
        </div>
      </div>
    </div>
  );
}
