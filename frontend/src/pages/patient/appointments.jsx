import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import PatientLayout from '../../components/PatientLayout';
import { useAuth } from '../../features/auth/hooks/useAuth';
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Clock,
  Plus,
  Stethoscope,
  User,
  Video
} from 'lucide-react';
import { CATEGORIES, DOCTORS } from '../../data/bookingData';
import { fetchDoctorSlotsByIds, mergeDoctorSlots } from '../../utils/doctorSlots';
import { 
  createAppointment, 
  getAllAppointments, 
  deleteAppointment 
} from '../../features/appointments/api/appointmentApi';

function parseSlotToDate(timeSlot) {
  const now = new Date();
  const date = new Date(now);

  const toLocalDateTimeString = (value) => {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    const hours = String(value.getHours()).padStart(2, '0');
    const minutes = String(value.getMinutes()).padStart(2, '0');
    const seconds = String(value.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };

  const match = /(\d{1,2}):(\d{2})\s*(AM|PM)/i.exec(timeSlot || '10:00 AM');
  if (!match) {
    date.setHours(10, 0, 0, 0);
    return toLocalDateTimeString(date);
  }

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const period = match[3].toUpperCase();

  if (period === 'PM' && hours !== 12) {
    hours += 12;
  }
  if (period === 'AM' && hours === 12) {
    hours = 0;
  }

  date.setHours(hours, minutes, 0, 0);
  return toLocalDateTimeString(date);
}

function isSlotTimePassed(timeSlot) {
  const slotTime = new Date(parseSlotToDate(timeSlot)).getTime();
  if (Number.isNaN(slotTime)) {
    return false;
  }

  return slotTime <= Date.now();
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

function BookingWizard({ onCancel, onProceedToPayment }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [timeSlot, setTimeSlot] = useState(null);
  const [expandedDoctorId, setExpandedDoctorId] = useState(null);
  const [patientName, setPatientName] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [doctorSlotMap, setDoctorSlotMap] = useState({});

  useEffect(() => {
    if (!patientName.trim() && user?.name) {
      setPatientName(user.name);
    }
  }, [patientName, user]);

  useEffect(() => {
    const doctorsInCategory = DOCTORS[category] || [];
    if (doctorsInCategory.length === 0) {
      setDoctorSlotMap({});
      return;
    }

    let cancelled = false;

    const loadDoctorSlots = async () => {
      try {
        const slotMap = await fetchDoctorSlotsByIds(doctorsInCategory.map((doctor) => doctor.id));
        if (!cancelled) {
          setDoctorSlotMap(slotMap);
        }
      } catch {
        if (!cancelled) {
          setDoctorSlotMap({});
        }
      }
    };

    void loadDoctorSlots();

    return () => {
      cancelled = true;
    };
  }, [category]);

  const doctors = useMemo(() => {
    const list = DOCTORS[category] || [];
    return list.map((doc) => ({
      ...doc,
      availableSlots: mergeDoctorSlots(doctorSlotMap[doc.id] || [], doc.availableSlots)
    }));
  }, [category, doctorSlotMap]);

  const submitBooking = async () => {
    if (!doctor || !timeSlot) {
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const selectedCategory = CATEGORIES.find((item) => item.id === category);
      await onProceedToPayment({
        patientName,
        doctorId: Number(doctor.id),
        appointmentDate: parseSlotToDate(timeSlot),
        reason,
        status: 'SCHEDULED',
        doctorName: doctor.name,
        doctorCategory: selectedCategory?.name || 'Specialist',
        selectedSlot: timeSlot,
        fee: doctor.fee || 0
      });
      setStep(4);
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not continue to payment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100">
      <div className="flex items-center gap-3 mb-6">
        {step < 4 && (
          <button
            onClick={step === 1 ? onCancel : () => setStep((s) => s - 1)}
            className="p-2 rounded-full hover:bg-stone-100 transition-colors"
          >
            <ArrowLeft size={20} className="text-stone-600" />
          </button>
        )}
        <h2 className="text-2xl md:text-3xl font-extrabold text-stone-900">
          {step === 1 && 'Choose specialty'}
          {step === 2 && 'Choose doctor and slot'}
          {step === 3 && 'Confirm details'}
          {step === 4 && 'Appointment created'}
        </h2>
      </div>

      {step === 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setCategory(cat.id);
                setExpandedDoctorId(null);
                setStep(2);
              }}
              className="text-left rounded-xl border border-stone-200 p-4 hover:border-teal-400 hover:bg-teal-50/30 transition-colors"
            >
              <div className="font-bold text-stone-900">{cat.name}</div>
              <div className="text-sm text-stone-500 mt-1">{cat.description}</div>
            </button>
          ))}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          {doctors.map((doc) => {
            const isExpanded = expandedDoctorId === doc.id;
            return (
              <div key={doc.id} className="rounded-xl border border-stone-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandedDoctorId(isExpanded ? null : doc.id)}
                  className="w-full p-4 flex items-center justify-between gap-4 text-left hover:bg-stone-50 transition-colors"
                >
                  <div>
                    <div className="font-bold text-stone-900">{doc.name}</div>
                    <div className="text-xs text-stone-400">{CATEGORIES.find((item) => item.id === category)?.name || 'Specialist'}</div>
                    <div className="text-sm text-stone-500">{doc.experience} experience</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-semibold text-teal-700">Doctor #{doc.id}</div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isExpanded ? 'bg-teal-600 text-white' : 'bg-stone-100 text-stone-500'}`}>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-stone-100 bg-stone-50/50">
                    <div className="flex flex-wrap gap-2">
                      {doc.availableSlots.map((slot) => {
                        const isExpired = isSlotTimePassed(slot);
                        return (
                          <button
                            key={slot}
                            disabled={isExpired}
                            onClick={() => {
                              if (isExpired) {
                                return;
                              }
                              setDoctor(doc);
                              setTimeSlot(slot);
                              setStep(3);
                            }}
                            className={`px-4 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                              isExpired
                                ? 'border-stone-200 bg-stone-100 text-stone-400 cursor-not-allowed'
                                : 'border-stone-200 bg-white text-stone-700 hover:border-teal-500 hover:text-teal-700'
                            }`}
                            title={isExpired ? 'This time slot has already passed' : 'Select slot'}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {doctors.length === 0 && (
            <div className="rounded-xl border border-stone-200 p-8 text-center text-stone-500">
              No doctors are configured for this category.
            </div>
          )}
        </div>
      )}

      {step === 3 && doctor && (
        <div className="space-y-5 max-w-2xl">
          <div className="rounded-xl border border-stone-200 p-4">
            <div className="font-bold text-stone-900 mb-1">{doctor.name}</div>
            <div className="text-xs text-stone-400 mb-1">{CATEGORIES.find((item) => item.id === category)?.name || 'Specialist'}</div>
            <div className="text-sm text-stone-500">Slot: {timeSlot}</div>
            <div className="text-sm text-stone-500">Doctor ID sent to backend: {doctor.id}</div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">Patient name</label>
            <input
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder={user?.name || 'Enter patient name'}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">Reason for visit</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full resize-none border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Describe the concern"
            />
          </div>

          {error && <div className="text-sm font-semibold text-rose-600">{error}</div>}

          <button
            onClick={submitBooking}
            disabled={isSubmitting || !patientName.trim()}
            className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold disabled:opacity-60"
          >
            {isSubmitting ? 'Preparing...' : 'Proceed to Payment'}
          </button>
        </div>
      )}

      {step === 4 && (
        <div className="text-center py-8">
          <div className="w-20 h-20 mx-auto rounded-full bg-teal-100 text-teal-700 flex items-center justify-center mb-4">
            <CheckCircle size={44} />
          </div>
          <div className="text-2xl font-extrabold text-stone-900">Redirecting to payment...</div>
          <div className="text-stone-500 mt-2">Please wait while we open your payment page.</div>
          <button
            onClick={onCancel}
            className="mt-6 px-6 py-3 rounded-xl bg-stone-900 hover:bg-black text-white font-bold"
          >
            Back to list
          </button>
        </div>
      )}
    </div>
  );
}

export default function Appointments() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [isBooking, setIsBooking] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [cancelingIds, setCancelingIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const doctorMap = useMemo(() => {
    return Object.entries(DOCTORS).reduce((acc, [categoryId, doctors]) => {
      const categoryName = CATEGORIES.find((item) => item.id === categoryId)?.name || 'Specialist';
      doctors.forEach((doctor) => {
        acc[Number(doctor.id)] = {
          ...doctor,
          categoryName
        };
      });
      return acc;
    }, {});
  }, []);

  const loadAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllAppointments();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load appointments from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleProceedToPayment = async (payload) => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('pendingAppointmentPayment', JSON.stringify(payload));
    }
    await router.push('/patient/payment');
  };

  const handleCancel = async (id) => {
    const currentAppointments = appointments;
    setError('');
    setCancelingIds((prev) => [...prev, id]);
    setAppointments((prev) => prev.filter((item) => item.id !== id));

    try {
      await deleteAppointment(id);
    } catch (err) {
      setAppointments(currentAppointments);
      setError(err?.response?.data?.message || 'Could not cancel appointment.');
    } finally {
      setCancelingIds((prev) => prev.filter((itemId) => itemId !== id));
    }
  };

  const upcoming = appointments
    .filter((item) => item.status === 'SCHEDULED')
    .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));

  const history = appointments
    .filter((item) => item.status !== 'SCHEDULED')
    .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));

  const visible = activeTab === 'upcoming' ? upcoming : history;

  return (
    <PatientLayout title="Appointments" activePage="appointments">
      <main className="flex-1 px-8 py-10 flex flex-col h-full overflow-hidden">
        {isBooking ? (
          <BookingWizard
            onCancel={() => setIsBooking(false)}
            onProceedToPayment={handleProceedToPayment}
          />
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-extrabold text-stone-900 mb-1">Appointments</h1>
              </div>
              <button
                onClick={() => setIsBooking(true)}
                className="flex items-center gap-2 px-6 py-3 bg-stone-900 hover:bg-black text-white rounded-xl font-bold text-sm shadow-md transition-all"
              >
                <Plus size={18} /> Book New Appointment
              </button>
            </div>

            <div className="flex items-center gap-6 mb-6 border-b border-stone-200">
              {['upcoming', 'history'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 text-sm font-bold tracking-wide transition-colors relative ${activeTab === tab ? 'text-teal-600' : 'text-stone-500 hover:text-stone-900'}`}
                >
                  {tab === 'upcoming' ? 'Upcoming' : 'History'}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 rounded-t-full" />
                  )}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto pb-12 custom-scrollbar pr-2">
              {loading && (
                <div className="rounded-xl border border-stone-200 bg-white p-6 text-stone-600 font-semibold">
                  Loading appointments...
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-700 font-semibold">
                  {error}
                </div>
              )}

              {!loading && !error && visible.length === 0 && (
                <div className="rounded-xl border border-stone-200 bg-white p-8 text-stone-500 text-center">
                  No {activeTab} appointments found.
                </div>
              )}

              {!loading && !error && visible.length > 0 && (
                <div className="space-y-4">
                  {visible.map((appointment) => {
                    const doctor = doctorMap[Number(appointment.doctorId)];
                    const { day, time } = formatDateTime(appointment.appointmentDate);
                    const isUpcoming = activeTab === 'upcoming';

                    return (
                      <div
                        key={appointment.id}
                        className="bg-white rounded-[1.5rem] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-stone-100"
                      >
                        <div>
                          <h4 className="font-bold text-stone-900 flex items-center gap-2">
                            {isUpcoming ? <Video size={16} /> : <User size={16} />}
                            {doctor?.name || `Doctor #${appointment.doctorId}`}
                          </h4>
                          <p className="text-xs text-stone-400 mt-1">{doctor?.categoryName || 'Specialist'}</p>
                          <p className="text-sm text-stone-500 mt-1">Patient: {appointment.patientName}</p>
                          <p className="text-sm text-stone-500 mt-1 flex items-center gap-2">
                            <Stethoscope size={14} /> {appointment.reason || 'Consultation'}
                          </p>
                        </div>

                        <div className="flex items-center gap-5 w-full sm:w-auto justify-between">
                          <div className="text-sm text-stone-700 font-semibold">
                            <div className="flex items-center gap-2"><Calendar size={14} /> {day}</div>
                            <div className="flex items-center gap-2 mt-1"><Clock size={14} /> {time}</div>
                            <div className="mt-1 text-xs uppercase tracking-wide text-stone-500">{appointment.status}</div>
                          </div>

                          {isUpcoming && (
                            <button
                              onClick={() => handleCancel(appointment.id)}
                              disabled={cancelingIds.includes(appointment.id)}
                              className="px-4 py-2 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-sm font-bold"
                            >
                              {cancelingIds.includes(appointment.id) ? 'Cancelling...' : 'Cancel'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </PatientLayout>
  );
}
