import React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import DoctorLayout from '../../components/DoctorLayout';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { fetchAppointments, updateAppointment, cancelAppointment } from '../../api/appointments';
import { DOCTORS } from '../../data/bookingData';
import { fetchDoctorSlotsByIds, formatTimeValueToSlotLabel, mergeDoctorSlots, saveDoctorSlots } from '../../utils/doctorSlots';
import { subscribeToRealtimeEvents } from '../../utils/realtime';
import { 
  MoreHorizontal,
  Clock,
  User,
  Video,
  X
} from 'lucide-react';

function resolveBookingDoctorId(user) {
   const name = (user?.name || '').trim().toLowerCase();

   const matchedDoctor = Object.values(DOCTORS)
      .flat()
      .find((doctor) => doctor.name.toLowerCase().includes(name) || name.includes(doctor.name.toLowerCase()));

   if (matchedDoctor) {
      return Number(matchedDoctor.id) || 0;
   }

   return Number(user?.id) || 0;
}

function formatTimeLabel(value) {
   const date = new Date(value);
   if (Number.isNaN(date.getTime())) {
      return 'Unknown time';
   }

   return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
   });
}

function getTodayStart() {
   const start = new Date();
   start.setHours(0, 0, 0, 0);
   return start;
}

function mergeAppointmentById(currentAppointments, incomingAppointment) {
   if (!incomingAppointment?.id) {
      return currentAppointments;
   }

   const existingIndex = currentAppointments.findIndex(
      (appointment) => appointment.id === incomingAppointment.id
   );

   if (existingIndex === -1) {
      return [...currentAppointments, incomingAppointment];
   }

   return currentAppointments.map((appointment) =>
      appointment.id === incomingAppointment.id ? incomingAppointment : appointment
   );
}

export default function DoctorDashboard() {
   const router = useRouter();
   const { user, isAuthReady } = useAuth();
   const [appointments, setAppointments] = useState([]);
   const [loading, setLoading] = useState(true);
   const [menuOpenFor, setMenuOpenFor] = useState(null);
   const [actioningId, setActioningId] = useState(null);
   const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(false);
   const [isAcceptingConsultations, setIsAcceptingConsultations] = useState(true);
   const [isStatusPopupOpen, setIsStatusPopupOpen] = useState(false);
   const [isSlotPopupOpen, setIsSlotPopupOpen] = useState(false);
   const [pendingAvailability, setPendingAvailability] = useState(null);
   const [pauseNote, setPauseNote] = useState('On a short break. Please check back soon.');
   const [slotTimeValue, setSlotTimeValue] = useState('');
   const [slotNotice, setSlotNotice] = useState('');
   const [doctorSlots, setDoctorSlots] = useState([]);
   const [isSavingSlots, setIsSavingSlots] = useState(false);

   const doctorId = resolveBookingDoctorId(user);
   const displayName = (user?.name || 'Doctor').trim() || 'Doctor';

   useEffect(() => {
      if (!doctorId) {
         setDoctorSlots([]);
         return;
      }

      let cancelled = false;

      const loadDoctorSlots = async () => {
         try {
            const slotMap = await fetchDoctorSlotsByIds([doctorId]);
            if (!cancelled) {
               setDoctorSlots(mergeDoctorSlots(slotMap[doctorId] || []));
            }
         } catch {
            if (!cancelled) {
               setDoctorSlots([]);
            }
         }
      };

      void loadDoctorSlots();

      return () => {
         cancelled = true;
      };
   }, [displayName, doctorId]);

   useEffect(() => {
      if (!doctorId) {
         return undefined;
      }

      return subscribeToRealtimeEvents((event) => {
         if (event?.type !== 'doctor-slots.updated') {
            return;
         }

         const payloadDoctorId = Number(event?.payload?.bookingDoctorId);
         if (payloadDoctorId !== Number(doctorId)) {
            return;
         }

         setDoctorSlots(
            mergeDoctorSlots(event?.payload?.slots || [])
         );
      });
   }, [doctorId]);

   useEffect(() => {
      if (!doctorId) {
         return undefined;
      }

      return subscribeToRealtimeEvents((event) => {
         const type = (event?.type || '').toString();
         if (!type.startsWith('appointment.')) {
            return;
         }

         if (type === 'appointment.cleared') {
            setAppointments([]);
            return;
         }

         const payload = event?.payload;
         const payloadDoctorId = Number(payload?.doctorId);
         if (payloadDoctorId !== Number(doctorId)) {
            return;
         }

         setAppointments((current) => mergeAppointmentById(current, payload));
      });
   }, [doctorId]);

   useEffect(() => {
      let cancelled = false;

      const loadDashboard = async () => {
         if (!isAuthReady || !doctorId) {
            return;
         }

         setLoading(true);

         try {
            const data = await fetchAppointments({ doctorId });
            if (!cancelled) {
               setAppointments(Array.isArray(data) ? data : []);
            }
         } catch {
            if (!cancelled) {
               setAppointments([]);
            }
         } finally {
            if (!cancelled) {
               setLoading(false);
            }
         }
      };

      loadDashboard();

      return () => {
         cancelled = true;
      };
   }, [doctorId, isAuthReady]);

   const upcomingScheduledAppointments = useMemo(() => {
      const now = Date.now();
      return appointments
         .filter((appointment) => {
            const status = (appointment.status || '').toString().toUpperCase();
            const when = new Date(appointment.appointmentDate).getTime();
            return status === 'SCHEDULED' && !Number.isNaN(when) && when >= now;
         })
         .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
   }, [appointments]);

   const queue = useMemo(() => {
      return [...upcomingScheduledAppointments]
         .slice(0, 4)
         .map((appointment, index) => {
            const isWaiting = index === 0;
            const statusColor = isWaiting ? 'bg-teal-50 text-teal-700' : 'bg-stone-100 text-stone-600';

            return {
               id: appointment.id,
               appointment,
               time: formatTimeLabel(appointment.appointmentDate),
               name: appointment.patientName || 'Patient',
               type: appointment.reason || 'Consultation',
               status: isWaiting ? 'WAITING' : 'UPCOMING',
               color: statusColor
            };
         });
   }, [upcomingScheduledAppointments]);

   const applyAppointmentUpdate = (updatedAppointment) => {
      setAppointments((current) =>
         current.map((appointment) =>
            appointment.id === updatedAppointment.id ? updatedAppointment : appointment
         )
      );
   };

   const handleMarkCompleted = async (item) => {
      if (!item?.id || !item?.appointment) {
         return;
      }

      setActioningId(item.id);
      try {
         const updated = await updateAppointment(item.id, {
            ...item.appointment,
            status: 'COMPLETED'
         });
         applyAppointmentUpdate(updated);
      } finally {
         setActioningId(null);
         setMenuOpenFor(null);
      }
   };

   const handleMarkNoShow = async (item) => {
      if (!item?.id || !item?.appointment) {
         return;
      }

      setActioningId(item.id);
      try {
         const updated = await updateAppointment(item.id, {
            ...item.appointment,
            status: 'NO_SHOW'
         });
         applyAppointmentUpdate(updated);
      } finally {
         setActioningId(null);
         setMenuOpenFor(null);
      }
   };

   const handleCancelAppointment = async (item) => {
      if (!item?.id) {
         return;
      }

      setActioningId(item.id);
      try {
         const updated = await cancelAppointment(item.id);
         applyAppointmentUpdate(updated);
      } finally {
         setActioningId(null);
         setMenuOpenFor(null);
      }
   };

   const upcomingCount = useMemo(() => {
      return upcomingScheduledAppointments.length;
   }, [upcomingScheduledAppointments]);

   const todayCount = useMemo(() => {
      const todayStart = getTodayStart();
      const todayEnd = new Date(todayStart);
      todayEnd.setDate(todayEnd.getDate() + 1);

      return appointments.filter((appointment) => {
         const appointmentDate = new Date(appointment.appointmentDate);
         return !Number.isNaN(appointmentDate.getTime()) && appointmentDate >= todayStart && appointmentDate < todayEnd;
      }).length;
   }, [appointments]);

   const nextBreakText = useMemo(() => {
      const upcomingAppointment = [...upcomingScheduledAppointments]
         .map((appointment) => new Date(appointment.appointmentDate))
         .filter((date) => !Number.isNaN(date.getTime()))
         .sort((a, b) => a - b)[0];

      if (!upcomingAppointment) {
         return 'No visits';
      }

      const diffMinutes = Math.max(0, Math.round((upcomingAppointment.getTime() - Date.now()) / 60000));
      if (diffMinutes < 60) {
         return `${diffMinutes}m`;
      }

      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      return `${hours}h ${minutes}m`;
   }, [upcomingScheduledAppointments]);

   const activeConsultation = useMemo(() => {
      return upcomingScheduledAppointments[0] || null;
   }, [upcomingScheduledAppointments]);

   const canJoinActiveConsultation = useMemo(() => {
      if (!activeConsultation?.appointmentDate) {
         return false;
      }

      const appointmentMs = new Date(activeConsultation.appointmentDate).getTime();
      if (Number.isNaN(appointmentMs)) {
         return false;
      }

      const diffMs = appointmentMs - Date.now();
      return diffMs <= 10 * 60 * 1000;
   }, [activeConsultation]);

   const openAvailabilityPopup = (nextAccepting) => {
      setPendingAvailability(nextAccepting);
      setIsAvailabilityOpen(false);
      setIsStatusPopupOpen(true);
   };

   const applyAvailabilityUpdate = () => {
      if (pendingAvailability === null) {
         return;
      }

      setIsAcceptingConsultations(pendingAvailability);
      setPendingAvailability(null);
      setIsStatusPopupOpen(false);
   };

   const handleAddSlot = async () => {
      const formattedSlot = formatTimeValueToSlotLabel(slotTimeValue);
      if (!formattedSlot || !doctorId) {
         setSlotNotice('Pick a valid time first.');
         return;
      }

      if (doctorSlots.includes(formattedSlot)) {
         setSlotNotice(`${formattedSlot} is already in your available slots.`);
         return;
      }

      const updatedSlots = mergeDoctorSlots([...doctorSlots, formattedSlot]);
      const previousSlots = doctorSlots;
      setIsSavingSlots(true);
      setDoctorSlots(updatedSlots);
      setSlotNotice('');

      try {
         const saved = await saveDoctorSlots({
            bookingDoctorId: doctorId,
            doctorName: displayName,
            slots: updatedSlots
         });
         setDoctorSlots(mergeDoctorSlots(saved.slots || []));
         setSlotNotice(`Added ${formattedSlot} to your booking slots.`);
         setSlotTimeValue('');
      } catch (error) {
         setDoctorSlots(previousSlots);
         setSlotNotice(error?.response?.data?.message || 'Could not save this slot right now.');
      } finally {
         setIsSavingSlots(false);
      }
   };

   const handleMarkSlotUnavailable = async (slotToRemove) => {
      if (!doctorId || !slotToRemove || isSavingSlots) {
         return;
      }

      const updatedSlots = doctorSlots.filter((slot) => slot !== slotToRemove);
      const previousSlots = doctorSlots;
      setIsSavingSlots(true);
      setDoctorSlots(updatedSlots);
      setSlotNotice('');

      try {
         const saved = await saveDoctorSlots({
            bookingDoctorId: doctorId,
            doctorName: displayName,
            slots: updatedSlots
         });
         setDoctorSlots(mergeDoctorSlots(saved.slots || []));
         setSlotNotice(`Marked ${slotToRemove} unavailable.`);
      } catch (error) {
         setDoctorSlots(previousSlots);
         setSlotNotice(error?.response?.data?.message || 'Could not update slot availability right now.');
      } finally {
         setIsSavingSlots(false);
      }
   };

  return (
    <DoctorLayout title="Dashboard" activePage="dashboard">
        {/* Main Content Area */}
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-10 flex flex-col min-h-0 overflow-y-auto">
          
          <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
             <div>
                      <h1 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">{displayName}</h1>
                      <p className="text-stone-500 mt-1 font-medium">Here is your schedule for today.</p>
             </div>

             <div className="relative inline-block self-start xl:self-auto">
                <button
                   type="button"
                   onClick={() => setIsAvailabilityOpen((open) => !open)}
                            className="px-5 py-2.5 bg-white border border-stone-200 rounded-full shadow-sm text-sm font-bold flex items-center gap-2 hover:border-stone-300 transition-colors"
                >
                            <span className={`w-2.5 h-2.5 rounded-full ${isAcceptingConsultations ? 'bg-teal-500 animate-pulse' : 'bg-amber-500'}`}></span>
                            {isAcceptingConsultations ? 'Accepting Consultations' : 'Consultations Paused'}
                </button>

                <div
                   className={`absolute right-0 mt-2 min-w-full rounded-2xl border border-stone-200 bg-white shadow-[0_20px_40px_rgba(15,23,42,0.12)] p-3 z-20 transition-all duration-200 origin-top ${
                      isAvailabilityOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
                   }`}
                >
                   <div className="grid grid-cols-1 gap-2">
                      <button
                         type="button"
                         onClick={() => openAvailabilityPopup(true)}
                         className={`rounded-xl border px-3 py-2 text-left text-sm font-semibold transition-colors flex items-center justify-between ${
                            isAcceptingConsultations
                               ? 'border-teal-300 bg-teal-50 text-teal-800'
                               : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                         }`}
                      >
                         <span>Accept consultations</span>
                         <span className={`h-2.5 w-2.5 rounded-full ${isAcceptingConsultations ? 'bg-teal-500' : 'bg-stone-300'}`}></span>
                      </button>

                      <button
                         type="button"
                         onClick={() => openAvailabilityPopup(false)}
                         className={`rounded-xl border px-3 py-2 text-left text-sm font-semibold transition-colors flex items-center justify-between ${
                            !isAcceptingConsultations
                               ? 'border-amber-300 bg-amber-50 text-amber-800'
                               : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                         }`}
                      >
                         <span>Pause consultations</span>
                         <span className={`h-2.5 w-2.5 rounded-full ${!isAcceptingConsultations ? 'bg-amber-500' : 'bg-stone-300'}`}></span>
                      </button>
                   </div>
                </div>
             </div>
          </div>

               {isStatusPopupOpen ? (
                  <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px] flex items-center justify-center p-4">
                     <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.2)] p-5">
                        <h3 className="text-lg font-extrabold text-stone-900">
                           {pendingAvailability ? 'Accept Consultations' : 'Pause Consultations'}
                        </h3>
                        <p className="mt-1 text-sm text-stone-500">
                           {pendingAvailability
                              ? 'You are about to mark yourself available for new consultations.'
                              : 'Add a short status note for patients while consultations are paused.'}
                        </p>

                        {!pendingAvailability ? (
                           <>
                              <label className="mt-4 mb-1 block text-xs font-semibold text-stone-500">Status note</label>
                              <textarea
                                 rows={3}
                                 value={pauseNote}
                                 onChange={(e) => setPauseNote(e.target.value)}
                                 className="w-full resize-none rounded-xl border border-stone-200 px-3 py-2 text-sm font-medium text-stone-700 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                              />
                           </>
                        ) : null}

                        <div className="mt-4 flex justify-end gap-2">
                           <button
                              type="button"
                              onClick={() => {
                                 setPendingAvailability(null);
                                 setIsStatusPopupOpen(false);
                              }}
                              className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-bold uppercase tracking-wider text-stone-600 hover:bg-stone-50"
                           >
                              Cancel
                           </button>
                           <button
                              type="button"
                              onClick={applyAvailabilityUpdate}
                              className="rounded-xl bg-stone-900 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-black"
                           >
                              Update status
                           </button>
                        </div>
                     </div>
                  </div>
               ) : null}

               {isSlotPopupOpen ? (
                  <div className="fixed inset-0 z-40 bg-stone-950/40 backdrop-blur-sm flex items-center justify-center p-4">
                     <div className="w-full max-w-md overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbfb_100%)] shadow-[0_28px_80px_rgba(15,23,42,0.22)]">
                        <div className="border-b border-stone-100 bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.12),_transparent_55%)] px-6 py-5">
                           <div className="flex items-start gap-3">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 ring-1 ring-teal-100">
                                 <Clock size={20} />
                              </div>
                              <div className="min-w-0">
                                 <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-teal-700">Schedule Update</p>
                                 <h3 className="mt-1 text-xl font-extrabold tracking-tight text-stone-900">Manage Consultation Slots</h3>
                                 <p className="mt-1 text-sm leading-6 text-stone-500">
                                    Review your available slots and add a new time when needed.
                                 </p>
                              </div>
                           </div>
                        </div>

                        <div className="px-6 py-5">
                           <div className="rounded-2xl border border-stone-200/80 bg-stone-50/90 p-4">
                              <div className="flex items-center justify-between gap-3">
                                 <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                                    Available Slots
                                 </p>
                                 <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-stone-500 ring-1 ring-stone-200">
                                    {doctorSlots.length} active
                                 </span>
                              </div>

                              <div className="mt-3 flex flex-wrap gap-2">
                                 {doctorSlots.length > 0 ? (
                                    doctorSlots.map((slot) => (
                                       <button
                                          type="button"
                                          key={`modal-${slot}`}
                                          onClick={() => void handleMarkSlotUnavailable(slot)}
                                          disabled={isSavingSlots}
                                          className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-teal-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                                       >
                                          {slot}
                                          <X size={12} />
                                       </button>
                                    ))
                                 ) : (
                                    <p className="text-sm text-stone-500">No time slots added yet.</p>
                                 )}
                              </div>
                           </div>

                           <div className="mt-4 rounded-2xl border border-stone-200 bg-white/90 p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                              <div className="flex items-center justify-between gap-3">
                                 <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                                    Consultation Time
                                 </label>
                                 <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-semibold text-stone-500">
                                    {slotTimeValue ? formatTimeValueToSlotLabel(slotTimeValue) : 'No time selected'}
                                 </span>
                              </div>

                              <input
                                 type="time"
                                 value={slotTimeValue}
                                 onChange={(e) => {
                                    setSlotTimeValue(e.target.value);
                                    setSlotNotice('');
                                 }}
                                 className="mt-3 h-14 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 text-base font-bold text-stone-800 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-100"
                              />

                              <p className="mt-3 text-xs leading-5 text-stone-500">
                                 Pick the exact start time you want patients to see when they book.
                              </p>

                              <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-dashed border-stone-200 bg-stone-50/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                                 <div className="min-w-0">
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">New Slot</p>
                                    <p className="mt-1 text-sm text-stone-500">Pick a new consultation start time to add to your availability.</p>
                                 </div>
                                 <button
                                    type="button"
                                    onClick={handleAddSlot}
                                    disabled={isSavingSlots}
                                    className="shrink-0 rounded-xl bg-stone-900 px-4 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-[0_10px_24px_rgba(15,23,42,0.18)] hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                                 >
                                    {isSavingSlots ? 'Saving...' : 'Add Time Slot'}
                                 </button>
                              </div>

                              {slotNotice ? (
                                 <div className="mt-4 rounded-2xl border border-teal-100 bg-teal-50/80 px-4 py-3 text-sm font-semibold text-teal-700">
                                    {slotNotice}
                                 </div>
                              ) : null}
                           </div>

                           <div className="mt-5 flex items-center justify-end gap-3">
                            <button
                               type="button"
                               onClick={() => setIsSlotPopupOpen(false)}
                              className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-stone-600 hover:bg-stone-50"
                           >
                              Cancel
                           </button>
                            <button
                               type="button"
                               onClick={() => setIsSlotPopupOpen(false)}
                               className="rounded-xl bg-stone-900 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-[0_10px_24px_rgba(15,23,42,0.18)] hover:bg-black"
                            >
                              Done
                            </button>
                           </div>
                        </div>
                     </div>
                  </div>
               ) : null}

          {/* Quick Metrics */}
          <div className="mb-8 grid grid-cols-1 gap-6 w-full xl:grid-cols-4">
             <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] min-h-[142px] flex flex-col justify-between">
                         <h3 className="text-sm font-bold text-stone-400">Today's Visits</h3>
                         <div className="text-4xl font-extrabold text-stone-900">{loading ? '...' : todayCount}</div>
             </div>
             <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] min-h-[142px] flex flex-col justify-between">
                         <h3 className="text-sm font-bold text-stone-400">Upcoming Appointments</h3>
                         <div className="text-4xl font-extrabold text-stone-900">{loading ? '...' : upcomingCount}</div>
             </div>
             <div className="rounded-[2rem] bg-gradient-to-br from-stone-950 via-stone-900 to-stone-800 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.08)] text-white min-h-[142px] flex flex-col justify-between">
                 <h3 className="text-sm font-bold text-stone-300">Next Break In</h3>
                         <div className="text-4xl font-extrabold text-white">{loading ? '...' : nextBreakText}</div>
             </div>
             <section className="bg-white rounded-[2rem] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-[142px] flex flex-col justify-between overflow-hidden">
                  <div className="flex items-start justify-between gap-3">
                     <div className="min-w-0">
                        <h3 className="text-base font-extrabold text-stone-900 leading-tight">Manage Time Slots</h3>
                        <p className="mt-1 truncate text-sm text-stone-500">Update your booking availability.</p>
                     </div>

                     <div className="flex items-center gap-2 shrink-0">
                        <button
                           type="button"
                           onClick={() => setIsSlotPopupOpen(true)}
                           className="h-10 rounded-xl bg-stone-900 px-4 text-[11px] font-bold uppercase tracking-wider text-white hover:bg-black"
                        >
                           Manage Slots
                        </button>
                     </div>
                  </div>

                  {slotNotice ? (
                     <p className="truncate text-xs font-semibold text-teal-700">{slotNotice}</p>
                  ) : null}
                  <div className="text-sm">
                     <span className="block truncate font-medium text-stone-500">
                        {doctorSlots.length > 0 ? `${doctorSlots.length} active slots` : 'No slots configured yet'}
                     </span>
                  </div>
               </section>
          </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
               <section className="bg-white rounded-[2rem] p-6 sm:p-8 xl:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col">
                  <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                     <h2 className="text-xl font-bold text-stone-900">Active Consultation</h2>
                     <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 border border-teal-200 rounded-full px-3 py-1">
                        <span className="h-2.5 w-2.5 rounded-full bg-teal-500"></span>
                        Live Overview
                     </span>
                  </div>

                  {!loading && !activeConsultation ? (
                     <div className="rounded-3xl border border-dashed border-stone-200 min-h-[280px] grid place-items-center text-stone-500 font-medium text-center px-8">
                        No active consultation. Your next scheduled patient will appear here.
                     </div>
                  ) : (
                     <div className="rounded-2xl border border-stone-100 bg-stone-50/60 p-5 sm:p-6">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                           <div>
                              <p className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Patient</p>
                              <h3 className="text-xl sm:text-2xl font-extrabold text-stone-900 flex items-center gap-2 break-words">
                                 <User size={20} className="text-stone-500" />
                                 {activeConsultation?.patientName || 'Patient'}
                              </h3>
                           </div>
                           <div className="rounded-xl bg-white border border-stone-200 px-4 py-3 w-full lg:w-auto lg:min-w-[180px]">
                              <p className="text-xs uppercase tracking-wider font-bold text-stone-500">Consult Starts</p>
                              <p className="mt-1 text-base font-extrabold text-stone-900 flex items-center gap-2">
                                 <Clock size={16} className="text-stone-500" />
                                 {formatTimeLabel(activeConsultation?.appointmentDate)}
                              </p>
                           </div>
                        </div>

                        <div className="mt-5 rounded-xl bg-white border border-stone-200 p-4">
                           <p className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Reason</p>
                           <p className="text-sm font-semibold text-stone-700">
                              {activeConsultation?.reason || 'General consultation'}
                           </p>
                        </div>

                        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                           <p className="text-sm text-stone-500">
                              {canJoinActiveConsultation
                                 ? 'Your consultation room is ready to join.'
                                 : 'Session access opens 10 minutes before the scheduled time.'}
                           </p>
                           <button
                              type="button"
                              disabled={!canJoinActiveConsultation}
                              onClick={() => {
                                 if (activeConsultation?.id) {
                                    void router.push(`/doctor/consultation/${activeConsultation.id}`);
                                 }
                              }}
                              className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
                                 canJoinActiveConsultation
                                    ? 'bg-stone-900 text-white hover:bg-black'
                                    : 'cursor-not-allowed border border-stone-200 bg-stone-100 text-stone-400'
                              }`}
                           >
                              <Video size={15} />
                              Join Session
                           </button>
                        </div>
                     </div>
                  )}
               </section>

          {/* Patient Queue */}
            <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col relative">
             <h2 className="text-xl font-bold text-stone-900 mb-6">Patient Queue</h2>

             <div className="overflow-x-auto">
             <div className="min-w-[640px]">
             <div className="grid grid-cols-12 gap-4 pb-4 border-b border-stone-100 mb-4 text-xs font-bold uppercase tracking-wider text-stone-400">
               <div className="col-span-2">Time</div>
               <div className="col-span-4">Patient Name</div>
               <div className="col-span-3">Reason</div>
               <div className="col-span-3">Status</div>
             </div>

             <div className="flex flex-col gap-4 pr-1">
                {!loading && queue.length === 0 ? (
                  <div className="rounded-2xl border border-stone-200 bg-stone-50 p-6 text-center text-stone-500 font-medium">
                    No appointments available yet.
                  </div>
                ) : null}

                {queue.map((item, i) => (
                   <div key={item.id || i} className="grid grid-cols-12 gap-4 items-center bg-transparent border-b border-stone-50 pb-4 hover:bg-stone-50 rounded-xl px-2 -mx-2 transition-colors cursor-pointer group">
                      <div className="col-span-2 text-sm font-bold text-stone-800 flex items-center gap-1.5">
                         <Clock size={14} className="text-stone-400" /> {item.time}
                      </div>
                      <div className="col-span-4 font-extrabold text-stone-900 text-sm break-words">
                         {item.name}
                      </div>
                      <div className="col-span-3 text-sm text-stone-500 font-medium break-words">
                         {item.type}
                      </div>
                                 <div className="col-span-3 flex items-center justify-between relative">
                                     <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.color}`}>
                           {item.status}
                         </span>

                                     <button
                                        type="button"
                                        className="rounded-full p-1 text-stone-300 group-hover:text-stone-800 transition-colors hover:bg-stone-100"
                                        onClick={(e) => {
                                             e.stopPropagation();
                                             setMenuOpenFor((current) => (current === item.id ? null : item.id));
                                        }}
                                     >
                                        <MoreHorizontal size={20} />
                                     </button>

                                     {menuOpenFor === item.id ? (
                                        <div className="absolute right-0 top-8 z-20 w-44 rounded-xl border border-stone-200 bg-white p-1.5 shadow-lg">
                                           <button
                                              type="button"
                                              disabled={actioningId === item.id}
                                              className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-60"
                                              onClick={(e) => {
                                                   e.stopPropagation();
                                                   void handleMarkCompleted(item);
                                              }}
                                           >
                                              Mark as completed
                                           </button>
                                           <button
                                              type="button"
                                              disabled={actioningId === item.id}
                                              className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-60"
                                              onClick={(e) => {
                                                   e.stopPropagation();
                                                   void handleMarkNoShow(item);
                                              }}
                                           >
                                              Mark as no-show
                                           </button>
                                           <button
                                              type="button"
                                              disabled={actioningId === item.id}
                                              className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                                              onClick={(e) => {
                                                   e.stopPropagation();
                                                   void handleCancelAppointment(item);
                                              }}
                                           >
                                              Cancel appointment
                                           </button>
                                        </div>
                                     ) : null}
                      </div>
                   </div>
                ))}
             </div>
             </div>
             </div>
          </div>
               </div>

        </main>
    </DoctorLayout>
  );
}
