import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import PatientLayout from '../../components/PatientLayout';
import { ArrowLeft, Calendar, CheckCircle, Clock, CreditCard, ShieldCheck, User } from 'lucide-react';
import { createAppointment } from '../../api/appointments';
import { CATEGORIES, DOCTORS } from '../../data/bookingData';

function formatCardNumber(value) {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  const groups = digits.match(/.{1,4}/g);
  return groups ? groups.join(' ') : '';
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return { day: 'Unknown date', time: 'Unknown time' };
  }

  return {
    day: date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }),
    time: date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    })
  };
}

export default function PaymentPage() {
  const router = useRouter();
  const [appointmentDraft, setAppointmentDraft] = useState(null);
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState('');
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const raw = window.sessionStorage.getItem('pendingAppointmentPayment');
    if (!raw) {
      router.replace('/patient/appointments');
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      setAppointmentDraft(parsed);
    } catch {
      router.replace('/patient/appointments');
    }
  }, [router]);

  const amount = useMemo(() => {
    const consultFee = Number(appointmentDraft?.fee || 0);
    const platformFee = 5;
    return {
      consultFee,
      platformFee,
      total: consultFee + platformFee
    };
  }, [appointmentDraft]);

  const doctorCategory = useMemo(() => {
    if (!appointmentDraft) {
      return 'Specialist';
    }
    if (appointmentDraft.doctorCategory) {
      return appointmentDraft.doctorCategory;
    }

    const found = Object.entries(DOCTORS).find(([, doctors]) =>
      doctors.some((doctor) => Number(doctor.id) === Number(appointmentDraft.doctorId))
    );

    if (!found) {
      return 'Specialist';
    }

    const [categoryId] = found;
    return CATEGORIES.find((item) => item.id === categoryId)?.name || 'Specialist';
  }, [appointmentDraft]);

  const validate = () => {
    if (!cardName.trim()) {
      return 'Cardholder name is required.';
    }
    if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ''))) {
      return 'Enter a valid 16-digit card number.';
    }
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
      return 'Expiry must be in MM/YY format.';
    }
    if (!/^\d{3,4}$/.test(cvv)) {
      return 'CVV must be 3 or 4 digits.';
    }
    return '';
  };

  const handlePayment = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!appointmentDraft) {
      setError('Appointment details are missing.');
      return;
    }

    setError('');
    setIsPaying(true);

    try {
      await createAppointment({
        patientName: appointmentDraft.patientName,
        doctorId: appointmentDraft.doctorId,
        appointmentDate: appointmentDraft.appointmentDate,
        reason: appointmentDraft.reason,
        status: appointmentDraft.status || 'SCHEDULED'
      });

      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem('pendingAppointmentPayment');
      }

      setIsDone(true);
      setTimeout(() => {
        router.push('/patient/appointments');
      }, 1200);
    } catch (err) {
      setError(err?.response?.data?.message || 'Payment succeeded but booking failed. Please retry.');
    } finally {
      setIsPaying(false);
    }
  };

  if (!appointmentDraft) {
    return (
      <PatientLayout title="Payment" activePage="appointments">
        <main className="flex-1 px-8 py-10 flex items-center justify-center">
          <div className="text-stone-500 font-semibold">Loading payment details...</div>
        </main>
      </PatientLayout>
    );
  }

  const { day, time } = formatDateTime(appointmentDraft.appointmentDate);

  return (
    <PatientLayout title="Payment" activePage="appointments">
      <main className="flex-1 px-8 py-10 flex flex-col overflow-y-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.push('/patient/appointments')}
            className="p-2 rounded-full hover:bg-stone-100 transition-colors"
          >
            <ArrowLeft size={20} className="text-stone-600" />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold text-stone-900">Payment</h1>
            <p className="text-stone-500 font-medium">Complete payment to confirm your appointment.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <section className="xl:col-span-2 bg-white rounded-[1.5rem] border border-stone-100 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h2 className="text-xl font-bold text-stone-900 mb-5 flex items-center gap-2">
              <CreditCard size={20} className="text-teal-600" /> Card details
            </h2>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">Cardholder name</label>
                <input
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl px-4 py-3"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">Card number</label>
                <input
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  className="w-full border border-stone-300 rounded-xl px-4 py-3"
                  placeholder="4242 4242 4242 4242"
                  inputMode="numeric"
                  maxLength={19}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">Expiry (MM/YY)</label>
                  <input
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value.slice(0, 5))}
                    className="w-full border border-stone-300 rounded-xl px-4 py-3"
                    placeholder="12/28"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">CVV</label>
                  <input
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className="w-full border border-stone-300 rounded-xl px-4 py-3"
                    placeholder="123"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-teal-50 text-teal-700 p-3 text-sm font-semibold flex items-center gap-2">
              <ShieldCheck size={18} /> Test payment flow: no real card is charged.
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-700 text-sm font-semibold">
                {error}
              </div>
            )}

            <button
              onClick={handlePayment}
              disabled={isPaying || isDone}
              className="mt-6 w-full px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold disabled:opacity-60"
            >
              {isDone ? 'Payment successful' : isPaying ? 'Processing payment...' : `Pay $${amount.total} & Confirm`}
            </button>
          </section>

          <aside className="bg-white rounded-[1.5rem] border border-stone-100 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-fit">
            <h3 className="text-lg font-bold text-stone-900 mb-4">Appointment summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-stone-700"><User size={14} /> {appointmentDraft.patientName}</div>
              <div className="text-stone-700">
                Doctor: {appointmentDraft.doctorName || `#${appointmentDraft.doctorId}`}
                <span className="ml-2 text-stone-400">{doctorCategory}</span>
              </div>
              <div className="text-stone-700">Reason: {appointmentDraft.reason || 'Consultation'}</div>
              <div className="flex items-center gap-2 text-stone-700"><Calendar size={14} /> {day}</div>
              <div className="flex items-center gap-2 text-stone-700"><Clock size={14} /> {time}</div>
            </div>

            <div className="mt-5 pt-4 border-t border-stone-200 space-y-2 text-sm font-semibold">
              <div className="flex justify-between"><span className="text-stone-500">Consultation</span><span>${amount.consultFee}</span></div>
              <div className="flex justify-between"><span className="text-stone-500">Platform fee</span><span>${amount.platformFee}</span></div>
              <div className="flex justify-between text-base font-bold"><span>Total</span><span className="text-teal-700">${amount.total}</span></div>
            </div>

            {isDone && (
              <div className="mt-5 rounded-xl bg-emerald-50 text-emerald-700 p-3 text-sm font-semibold flex items-center gap-2">
                <CheckCircle size={18} /> Redirecting to your appointments...
              </div>
            )}
          </aside>
        </div>
      </main>
    </PatientLayout>
  );
}
