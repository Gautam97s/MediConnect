import Link from 'next/link';
import { Activity, ShieldCheck } from 'lucide-react';

export default function AuthShell({
  title,
  subtitle,
  sideTitle,
  sideText,
  children,
  footer,
  accent = 'teal'
}) {
  const accentMap = {
    teal: {
      panel: 'from-teal-600 via-cyan-500 to-sky-500',
      ring: 'ring-teal-200'
    },
    indigo: {
      panel: 'from-slate-800 via-indigo-700 to-cyan-700',
      ring: 'ring-indigo-200'
    },
    sky: {
      panel: 'from-sky-600 via-cyan-500 to-teal-500',
      ring: 'ring-sky-200'
    },
    rose: {
      panel: 'from-sky-600 via-teal-500 to-cyan-500',
      ring: 'ring-teal-200'
    }
  };

  const palette = accentMap[accent] || accentMap.teal;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_20%,#d1fae5_0%,transparent_36%),radial-gradient(circle_at_80%_10%,#e0f2fe_0%,transparent_35%),linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] text-stone-800">
      <div className="mx-auto max-w-6xl px-5 py-8 md:py-12">
        <header className="mb-8 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 font-extrabold tracking-tight text-stone-900">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-stone-900 text-white">
              <Activity size={18} />
            </span>
            MediConnect
          </Link>
        </header>

        <div className="grid overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)] lg:grid-cols-2">
          <section className={`relative overflow-hidden bg-gradient-to-br ${palette.panel} p-8 text-white md:p-12`}>
            <div className="absolute -left-16 top-10 h-44 w-44 rounded-full bg-white/20 blur-2xl" />
            <div className="absolute -bottom-20 right-0 h-56 w-56 rounded-full bg-black/20 blur-2xl" />
            <div className="relative z-10">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em]">
                <ShieldCheck size={14} /> Welcome
              </p>
              <h2 className="mt-6 text-3xl font-black leading-tight md:text-4xl">{sideTitle}</h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-white/90 md:text-base">{sideText}</p>
            </div>
          </section>

          <section className={`p-6 md:p-10 ring-1 ${palette.ring}`}>
            <h1 className="text-3xl font-black tracking-tight text-stone-900">{title}</h1>
            <p className="mt-2 text-sm font-medium text-stone-500">{subtitle}</p>
            <div className="mt-8">{children}</div>
            {footer ? <div className="mt-8 text-sm text-stone-500">{footer}</div> : null}
          </section>
        </div>
      </div>
    </div>
  );
}
