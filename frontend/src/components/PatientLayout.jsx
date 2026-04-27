import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuth } from '../features/auth/hooks/useAuth';
import PatientSidebar from './PatientSidebar';

export default function PatientLayout({ children, title, activePage, hideSidebar = false }) {
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

    if (user?.role === 'DOCTOR') {
      router.replace('/doctor/dashboard');
    }
  }, [isAuthReady, isAuthenticated, user, router]);

  if (!isAuthReady || !isAuthenticated || user?.role === 'DOCTOR') {
    return (
      <div className="h-screen w-screen bg-gradient-to-br from-[#f8fafc] to-[#eef2f6] grid place-items-center text-stone-600 font-semibold">
        Checking access...
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-[#f8fafc] to-[#eef2f6] flex font-sans text-stone-800 antialiased selection:bg-teal-200 overflow-hidden">
      <Head>
        <title>{`${title} | MediConnect`}</title>
      </Head>

      {!hideSidebar && <PatientSidebar activePage={activePage} />}

        <div className="flex-1 flex flex-col overflow-hidden relative">
          {children}
      </div>

    </div>
  );
}

