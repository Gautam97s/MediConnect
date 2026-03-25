import Head from 'next/head';
import PatientSidebar from './PatientSidebar';

export default function PatientLayout({ children, title, activePage }) {
  return (
    <div className="h-screen w-screen bg-gradient-to-br from-[#f8fafc] to-[#eef2f6] flex font-sans text-stone-800 antialiased selection:bg-teal-200 overflow-hidden">
      <Head>
        <title>{`${title} | MediConnect`}</title>
      </Head>

      <PatientSidebar activePage={activePage} />

      {/* Main Content Area */}
      {children}

    </div>
  );
}
