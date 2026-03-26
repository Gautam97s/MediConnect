import React, { useState } from 'react';
import Head from 'next/head';
import PatientLayout from '../../components/PatientLayout';
import { 
  Calendar, 
  Video, 
  Clock, 
  ChevronRight, 
  Plus, 
  User, 
  Stethoscope, 
  MapPin,
  ArrowLeft,
  CheckCircle,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Star
} from 'lucide-react';
import { CATEGORIES, DOCTORS } from '../../data/bookingData';

function BookingWizard({ onCancel, onComplete }) {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [timeSlot, setTimeSlot] = useState(null);
  const [expandedDoctorId, setExpandedDoctorId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleNextStep = () => setStep(s => s + 1);
  const handlePrevStep = () => setStep(s => s - 1);

  const handleCategorySelect = (cat) => {
    setCategory(cat);
    handleNextStep();
  };

  const handleTimeSelect = (doc, slot) => {
    setDoctor(doc);
    setTimeSlot(slot);
    handleNextStep();
  };

  const handlePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStep(4);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        {step < 4 && (
          <button onClick={step === 1 ? onCancel : handlePrevStep} className="p-2 hover:bg-stone-100 rounded-full transition-colors shrink-0">
            <ArrowLeft size={24} className="text-stone-600" />
          </button>
        )}
        <div>
          <h2 className="text-3xl font-extrabold text-stone-900 mb-2">
            {step === 1 && "What do you need help with?"}
            {step === 2 && "Select a Doctor & Time"}
            {step === 3 && "Complete Payment"}
            {step === 4 && "Appointment Confirmed!"}
          </h2>
          {step < 4 && (
            <div className="flex items-center gap-2">
              {[1, 2, 3].map(s => (
                <div key={s} className={`h-1.5 w-12 rounded-full transition-colors ${s <= step ? 'bg-teal-600' : 'bg-stone-200'}`} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-1 pb-12 custom-scrollbar">
        {step === 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {CATEGORIES.map(cat => (
              <button 
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className="bg-white p-5 rounded-[1.25rem] shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-md border border-stone-100 hover:border-teal-300 transition-all text-left flex flex-col group h-full"
              >
                <h3 className="text-lg font-bold text-stone-900 mb-2 group-hover:text-teal-700 transition-colors">{cat.name}</h3>
                <p className="text-stone-500 text-sm font-medium leading-snug">{cat.description}</p>
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 max-w-4xl mx-auto">
            {(DOCTORS[category] || []).map(doc => {
              const isExpanded = expandedDoctorId === doc.id;
              return (
                <div key={doc.id} className={`bg-white rounded-[1.5rem] border transition-all duration-300 overflow-hidden ${isExpanded ? 'border-teal-300 shadow-md transform -translate-y-1' : 'border-stone-100 shadow-sm hover:border-teal-200'}`}>
                  <div 
                    className="p-6 cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                    onClick={() => setExpandedDoctorId(isExpanded ? null : doc.id)}
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-20 h-20 rounded-[1.25rem] overflow-hidden shrink-0 shadow-sm border border-stone-100">
                        <img src={doc.image} alt={doc.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-stone-900 mb-1">{doc.name}</h3>
                        <div className="flex items-center gap-3 text-stone-500 font-medium whitespace-nowrap overflow-x-auto p-1 -m-1 hide-scrollbar">
                          <span className="flex items-center gap-1 text-amber-500 font-bold"><Star size={18} fill="currentColor" /> {doc.rating}</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-stone-300 shrink-0" />
                          <span>{doc.experience} exp.</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-stone-300 shrink-0" />
                          <span className="text-stone-900 font-bold">${doc.fee} / visit</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto mt-2 md:mt-0 justify-between md:justify-end shrink-0">
                      <div className="text-teal-700 font-bold bg-teal-50/50 px-4 py-2 rounded-xl flex items-center gap-2 border border-teal-100">
                        <Clock size={16} /> {doc.availableSlots.length} slots today
                      </div>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0 ${isExpanded ? 'bg-teal-600 text-white' : 'bg-stone-50 text-stone-400'}`}>
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="px-6 pb-6 pt-4 bg-stone-50/50 border-t border-stone-100">
                      <h4 className="text-sm font-bold text-stone-900 mb-4 flex items-center gap-2">
                        <Calendar size={18} className="text-teal-600" /> Available Time Slots
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        {doc.availableSlots.map(slot => (
                          <button
                            key={slot}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTimeSelect(doc, slot);
                            }}
                            className="px-6 py-3 bg-white border-2 border-transparent shadow-[0_2px_10px_rgb(0,0,0,0.04)] hover:border-teal-600 hover:text-teal-700 rounded-xl font-bold text-stone-600 transition-all hover:-translate-y-0.5"
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {(!DOCTORS[category] || DOCTORS[category].length === 0) && (
              <div className="text-center py-20 bg-white rounded-[2rem] border border-stone-100 shadow-sm">
                <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6 text-stone-400">
                  <Stethoscope size={32} />
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-2">No doctors available</h3>
                <p className="text-stone-500 font-medium max-w-sm mx-auto">There are currently no doctors available for this category. Please check back later or try another category.</p>
              </div>
            )}
          </div>
        )}

        {step === 3 && doctor && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-bl-full -z-10 blur-xl"></div>
              
              <h3 className="text-xl font-bold text-stone-900 mb-6">Appointment Summary</h3>
              
              <div className="flex items-center gap-6 pb-6 border-b border-stone-100 mb-6 z-10 relative">
                <div className="w-20 h-20 rounded-[1.25rem] overflow-hidden shrink-0 shadow-sm border border-stone-100">
                  <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-teal-50 text-teal-700 text-xs font-bold uppercase tracking-wider mb-2">
                    <Video size={14} /> Video Consult
                  </div>
                  <h4 className="text-xl font-bold text-stone-900">{doctor.name}</h4>
                  <p className="text-stone-600 font-medium flex items-center gap-2 mt-1">
                    <Calendar size={16} /> Today at {timeSlot}
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="flex justify-between items-center font-medium text-lg">
                  <span className="text-stone-600">Consultation Fee</span>
                  <span className="text-stone-900 font-bold">${doctor.fee}</span>
                </div>
                <div className="flex justify-between items-center font-medium text-lg">
                  <span className="text-stone-600">Platform Fee</span>
                  <span className="text-stone-900 font-bold">$5</span>
                </div>
                <div className="pt-5 border-t border-stone-100 flex justify-between items-center">
                  <span className="text-xl font-bold text-stone-900">Total Amount</span>
                  <span className="text-3xl font-extrabold text-teal-600">${doctor.fee + 5}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100">
              <h3 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2">
                <CreditCard size={24} className="text-teal-600" /> Payment Method
              </h3>
              <div className="space-y-4">
                <div className="p-5 rounded-[1.5rem] border-2 border-teal-600 bg-teal-50/30 flex items-center justify-between cursor-pointer shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-8 bg-stone-900 rounded-lg flex items-center justify-center text-white text-[11px] font-bold tracking-wider">VISA</div>
                    <span className="font-bold text-stone-900 text-lg">•••• 4242</span>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center text-white shadow-sm">
                    <CheckCircle size={14} />
                  </div>
                </div>
                <button className="w-full py-5 border-2 border-dashed border-stone-200 rounded-[1.5rem] font-bold text-stone-500 hover:border-stone-300 hover:text-stone-700 hover:bg-stone-50 transition-all text-lg">
                  + Add New Card
                </button>
              </div>
            </div>

            <button 
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full py-5 bg-teal-600 hover:bg-teal-700 text-white rounded-[1.5rem] font-bold text-xl shadow-[0_8px_20px_rgb(13,148,136,0.3)] hover:shadow-[0_8px_25px_rgb(13,148,136,0.4)] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5 mt-4"
            >
              {isProcessing ? (
                <>
                  <div className="w-6 h-6 rounded-full border-4 border-white border-t-transparent animate-spin" />
                  Processing Payment...
                </>
              ) : (
                `Pay $${doctor.fee + 5} & Confirm`
              )}
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="max-w-xl mx-auto text-center py-20 bg-white rounded-[2rem] border border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="w-32 h-32 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-10 shadow-sm relative">
              <div className="absolute inset-0 bg-teal-100 rounded-full animate-ping opacity-20"></div>
              <CheckCircle size={64} />
            </div>
            <h3 className="text-4xl font-extrabold text-stone-900 mb-6">You're all set!</h3>
            <p className="text-stone-500 font-medium mb-12 text-xl max-w-md mx-auto leading-relaxed">
              Your appointment with <br/>
              <span className="text-stone-900 font-bold block mt-2 text-2xl">{doctor?.name}</span>
              is confirmed for today at <span className="text-teal-600 font-extrabold">{timeSlot}</span>.
            </p>
            <div className="flex gap-4 max-w-sm mx-auto px-6">
              <button 
                onClick={onComplete}
                className="flex-1 py-4 bg-stone-900 hover:bg-black text-white rounded-xl font-bold text-lg shadow-md transition-all"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Appointments() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [isBooking, setIsBooking] = useState(false);

  return (
    <PatientLayout title="Appointments" activePage="appointments">
       <main className="flex-1 px-8 py-10 flex flex-col h-full overflow-hidden">
          {isBooking ? (
             <BookingWizard onCancel={() => setIsBooking(false)} onComplete={() => setIsBooking(false)} />
          ) : (
             <>
                <div className="flex items-center justify-between mb-8">
                   <div>
                      <h1 className="text-3xl font-extrabold text-stone-900 mb-1">Appointments</h1>
                      <p className="text-stone-500 font-medium text-lg">Manage your schedule and consultations.</p>
                   </div>
             
             <button 
                onClick={() => setIsBooking(true)}
                className="flex items-center gap-2 px-6 py-3 bg-stone-900 hover:bg-black text-white rounded-xl font-bold text-sm shadow-md transition-all"
             >
                <Plus size={18} /> Book New Appointment
             </button>
          </div>

          <div className="flex-1 overflow-y-auto pb-12 custom-scrollbar pr-2">
             
             {/* Section Tabs */}
             <div className="flex items-center gap-6 mb-8 border-b border-stone-200">
               {['upcoming', 'history'].map((tab) => (
                 <button 
                   key={tab}
                   onClick={() => setActiveTab(tab)}
                   className={`pb-4 text-sm font-bold tracking-wide transition-colors relative ${activeTab === tab ? 'text-teal-600' : 'text-stone-500 hover:text-stone-900'}`}
                 >
                   {tab === 'upcoming' ? 'Upcoming' : 'Past Visits'}
                   {activeTab === tab && (
                     <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 rounded-t-full"></div>
                   )}
                 </button>
               ))}
             </div>

             {activeTab === 'upcoming' && (
               <div className="space-y-6">
                 {/* Hero Featured Appointment */}
                 <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-teal-100 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4"></div>
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                       
                       <div className="flex items-start gap-6">
                         <div className="w-20 h-20 rounded-[1.25rem] overflow-hidden shadow-sm shrink-0">
                            <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&q=80" alt="Dr. Sarah Jenkins" className="w-full h-full object-cover" />
                         </div>
                         <div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-teal-100 text-teal-700 text-xs font-bold uppercase tracking-wider mb-3">
                               <Video size={14} /> Video Consult
                            </div>
                            <h2 className="text-2xl font-extrabold text-stone-900 mb-1">Dr. Sarah Jenkins</h2>
                            <p className="text-stone-500 flex items-center gap-2 font-medium">
                               <Stethoscope size={16} /> General Practice • Primary Care
                            </p>
                         </div>
                       </div>

                       <div className="flex flex-col items-start lg:items-end gap-4 bg-stone-50 rounded-2xl p-5 border border-stone-100 min-w-[240px]">
                          <div className="flex items-center gap-3 text-stone-900 font-extrabold text-lg">
                             <Calendar size={20} className="text-teal-600" /> Tomorrow, Oct 24
                          </div>
                          <div className="flex items-center gap-3 text-stone-500 font-medium">
                             <Clock size={18} /> 09:30 AM - 10:00 AM
                          </div>
                       </div>

                    </div>

                    <div className="mt-8 pt-6 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
                       <p className="text-sm text-stone-500 font-medium flex-1">
                          Reason: <span className="text-stone-900">Routine Follow-up & Bloodwork Review</span>
                       </p>
                       <div className="flex gap-3 w-full sm:w-auto">
                          <button className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-bold text-sm text-stone-600 border border-stone-200 hover:bg-stone-50 transition-colors">
                             Reschedule
                          </button>
                          <button className="flex-1 sm:flex-none px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm shadow-md transition-all">
                             Join Room
                          </button>
                       </div>
                    </div>
                 </div>

                 {/* Standard Upcoming Appointment */}
                 <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:shadow-md transition-shadow border border-transparent hover:border-teal-100 cursor-pointer group">
                    <div className="flex items-center gap-5">
                       <div className="w-16 h-16 rounded-[1.25rem] bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                          <MapPin size={28} />
                       </div>
                       <div>
                          <h3 className="text-lg font-bold text-stone-900 mb-1">Dermatology Check</h3>
                          <p className="text-stone-500 text-sm font-medium">Dr. Emily Chen • Downtown Clinic</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                       <div className="text-left sm:text-right">
                          <div className="text-stone-900 font-extrabold text-md mb-0.5">Nov 12, 2026</div>
                          <div className="text-stone-500 text-sm font-medium">02:15 PM</div>
                       </div>
                       <div className="w-10 h-10 rounded-full bg-stone-50 text-stone-400 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors">
                          <ChevronRight size={18} />
                       </div>
                    </div>
                 </div>

               </div>
             )}

             {activeTab === 'history' && (
               <div className="space-y-4">
                 {[
                   { title: "Annual Physical", doc: "Dr. Sarah Jenkins", date: "Sep 14, 2026", type: "In-Person", status: "Completed" },
                   { title: "Prescription Renewal", doc: "Dr. Sarah Jenkins", date: "Jul 02, 2026", type: "Video", status: "Completed" },
                   { title: "Allergy Consultation", doc: "Dr. Marcus Thorne", date: "Apr 28, 2026", type: "In-Person", status: "Completed" }
                 ].map((visit, i) => (
                   <div key={i} className="bg-white rounded-[1.5rem] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-between gap-4 hover:shadow-md transition-shadow border border-transparent hover:border-stone-200 cursor-pointer group">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 group-hover:bg-stone-100 group-hover:text-stone-900 transition-colors">
                            {visit.type === 'Video' ? <Video size={20} /> : <User size={20} />}
                         </div>
                         <div>
                            <h4 className="font-bold text-stone-900">{visit.title}</h4>
                            <p className="text-xs text-stone-500 mt-0.5 font-medium">{visit.doc} • {visit.type}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-6">
                         <div className="text-sm font-extrabold text-stone-900">{visit.date}</div>
                         <div className="px-3 py-1 bg-stone-100 text-stone-600 text-xs font-bold uppercase tracking-wider rounded-md hidden sm:block">
                            {visit.status}
                         </div>
                      </div>
                   </div>
                 ))}
               </div>
             )}
             
          </div>
          </>
          )}
       </main>
    </PatientLayout>
  );
}
