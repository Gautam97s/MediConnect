import React, { useEffect, useState } from 'react';
import PatientLayout from '../../components/PatientLayout';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { getUserProfile, updateUserProfile as updateUserProfileRequest } from '../../features/user/api/userApi';
import {
  Activity,
  Droplet,
  FileText,
  HeartPulse,
  PlusSquare,
  ShieldCheck,
  Stethoscope,
  Phone,
  Mail,
  MapPin,
  Download
} from 'lucide-react';

const EMPTY_PROFILE = {
  name: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: '',
  bloodType: '',
  address: '',
  medicalNumber: '',
  diagnosis: '',
  secondaryDiagnosis: '',
  urgentAlerts: '',
  emergencyContactName: '',
  emergencyContactRelation: '',
  emergencyContactPhone: '',
  primaryCareProviderName: '',
  primaryCareProviderSpecialty: '',
  insuranceProvider: '',
  insurancePlan: '',
  insuranceMemberId: '',
  insuranceGroupNumber: '',
  primaryCareVisitCopay: '',
  specialistVisitCopay: '',
  emergencyRoomCopay: '',
  prescriptionDrugsCopay: ''
};

function mapProfile(source = {}) {
  return {
    ...EMPTY_PROFILE,
    ...source
  };
}

export default function PatientProfile() {
  const { user, updateUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileForm, setProfileForm] = useState(EMPTY_PROFILE);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const data = await getUserProfile();
        if (!isMounted) return;
        const mapped = mapProfile(data);
        setProfileForm(mapped);
        await updateUserProfile(mapped);
      } catch {
        if (!isMounted) return;
        setProfileForm(mapProfile(user || {}));
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (isEditingProfile) return;
    setProfileForm((prev) => ({ ...prev, ...mapProfile(user || {}) }));
  }, [user, isEditingProfile]);

  const displayName = (profileForm.name || user?.name || 'Patient').trim() || 'Patient';
  const displayNameUpper = displayName.toUpperCase();

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'clinical', label: 'Clinical Record' },
    { id: 'medications', label: 'Medications' },
    { id: 'documents', label: 'Documents' },
    { id: 'insurance', label: 'Insurance' }
  ];

  const setField = (field, value) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const cancelEdit = () => {
    setProfileError('');
    setProfileForm(mapProfile(user || {}));
    setIsEditingProfile(false);
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileError('');

    try {
      const payload = Object.fromEntries(
        Object.entries(profileForm).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v])
      );

      const updated = await updateUserProfileRequest(payload);
      const mapped = mapProfile(updated);
      setProfileForm(mapped);
      await updateUserProfile(mapped);
      setIsEditingProfile(false);
    } catch (error) {
      setProfileError(error?.response?.data?.message || error?.message || 'Could not update profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  return (
    <PatientLayout title="My Profile" activePage="profile">
      <main className="flex-1 px-8 py-10 flex flex-col h-full overflow-visible">
        <div className="flex items-center mb-8">
          <h1 className="text-3xl font-extrabold text-stone-900">Health Profile</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 mb-10 w-full shrink-0">
          <div className="flex-1 bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col sm:flex-row items-center gap-6 relative">
            <div className="w-20 h-20 rounded-full bg-rose-200 overflow-hidden border-4 border-white shadow-sm shrink-0">
              <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200&q=80" alt={displayName} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl font-bold text-stone-900 mb-1">{displayNameUpper}</h2>
              <p className="text-sm font-medium text-stone-600 mb-1">Medical number: <span className="text-stone-900 font-bold">{profileForm.medicalNumber || 'Not set'}</span></p>
              <p className="text-sm font-medium text-stone-600">
                Diagnosis: <span className="text-teal-700">{profileForm.diagnosis || 'Not set'}</span>{profileForm.secondaryDiagnosis ? `, ${profileForm.secondaryDiagnosis}` : ''}
              </p>
            </div>
          </div>

          <div className="w-full lg:w-72 bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative">
            <h3 className="text-sm font-bold text-stone-900 mb-4">Urgent Alerts</h3>
            <div className="border-l-2 border-rose-300 pl-3">
              <p className="text-sm font-bold text-rose-600 leading-snug">{profileForm.urgentAlerts || 'No urgent alerts added.'}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-2 px-4 relative z-10 w-full shrink-0 overflow-visible pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`min-w-[140px] flex-1 px-6 sm:px-8 py-3.5 text-sm font-bold whitespace-nowrap transition-colors rounded-t-2xl relative ${
                activeTab === tab.id
                  ? "text-stone-900 bg-white shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-transparent sm:bg-white sm:rounded-3xl sm:rounded-tl-none sm:p-8 sm:shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex-1 overflow-hidden flex flex-col relative z-0 w-full">
          {activeTab === 'profile' && (
            <div className="bg-white rounded-[2rem] sm:rounded-none p-6 sm:p-0 shadow-sm sm:shadow-none flex flex-col lg:flex-row gap-10 flex-1 overflow-y-auto custom-scrollbar pr-2">
              <div className="flex-1 space-y-6">
                <div className="flex items-center justify-between gap-4 border-b border-stone-100 pb-4">
                  <h3 className="text-xl font-extrabold text-stone-900">Personal Information</h3>
                  {isEditingProfile ? (
                    <div className="flex gap-2">
                      <button type="button" onClick={cancelEdit} className="rounded-full border border-stone-200 px-4 py-2 text-xs font-bold uppercase tracking-wider text-stone-600">Cancel</button>
                      <button type="submit" form="patient-profile-form" disabled={profileSaving} className="rounded-full bg-teal-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white disabled:opacity-60">{profileSaving ? 'Saving...' : 'Save'}</button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => setIsEditingProfile(true)} className="rounded-full border border-stone-200 px-4 py-2 text-xs font-bold uppercase tracking-wider text-stone-600">Edit</button>
                  )}
                </div>

                {isEditingProfile ? (
                  <form id="patient-profile-form" onSubmit={saveProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-1 sm:pl-2">
                    {[
                      ['name', 'Full Name'],
                      ['email', 'Email'],
                      ['phone', 'Phone'],
                      ['dateOfBirth', 'Date of Birth'],
                      ['gender', 'Gender'],
                      ['bloodType', 'Blood Type'],
                      ['medicalNumber', 'Medical Number'],
                      ['diagnosis', 'Primary Diagnosis'],
                      ['secondaryDiagnosis', 'Secondary Diagnosis'],
                      ['emergencyContactName', 'Emergency Contact Name'],
                      ['emergencyContactRelation', 'Emergency Contact Relation'],
                      ['emergencyContactPhone', 'Emergency Contact Phone'],
                      ['primaryCareProviderName', 'Primary Care Provider'],
                      ['primaryCareProviderSpecialty', 'Provider Specialty'],
                      ['insuranceProvider', 'Insurance Provider'],
                      ['insurancePlan', 'Insurance Plan'],
                      ['insuranceMemberId', 'Insurance Member ID'],
                      ['insuranceGroupNumber', 'Insurance Group Number'],
                      ['primaryCareVisitCopay', 'Primary Care Visit Copay'],
                      ['specialistVisitCopay', 'Specialist Visit Copay'],
                      ['emergencyRoomCopay', 'Emergency Room Copay'],
                      ['prescriptionDrugsCopay', 'Prescription Drugs Copay']
                    ].map(([field, label]) => (
                      <div key={field} className={field === 'address' || field === 'urgentAlerts' ? 'sm:col-span-2' : ''}>
                        <label className="mb-2 block text-sm font-medium text-stone-500">{label}</label>
                        <input
                          type={field === 'dateOfBirth' ? 'date' : field === 'email' ? 'email' : 'text'}
                          value={profileForm[field] || ''}
                          onChange={(e) => setField(field, e.target.value)}
                          className="w-full rounded-xl border border-stone-200 px-4 py-3 font-bold text-stone-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                        />
                      </div>
                    ))}
                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-stone-500">Address</label>
                      <input value={profileForm.address || ''} onChange={(e) => setField('address', e.target.value)} className="w-full rounded-xl border border-stone-200 px-4 py-3 font-bold text-stone-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-stone-500">Urgent Alerts</label>
                      <textarea rows={2} value={profileForm.urgentAlerts || ''} onChange={(e) => setField('urgentAlerts', e.target.value)} className="w-full rounded-xl border border-stone-200 px-4 py-3 font-bold text-stone-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200" />
                    </div>
                    {profileError ? <p className="sm:col-span-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{profileError}</p> : null}
                  </form>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-6">
                      <div><p className="text-sm font-medium text-stone-500 mb-1">Full Name</p><p className="font-bold text-stone-900">{profileForm.name || 'N/A'}</p></div>
                      <div><p className="text-sm font-medium text-stone-500 mb-1">Date of Birth</p><p className="font-bold text-stone-900">{profileForm.dateOfBirth || 'Not set'}</p></div>
                      <div><p className="text-sm font-medium text-stone-500 mb-1">Gender</p><p className="font-bold text-stone-900">{profileForm.gender || 'Not set'}</p></div>
                      <div><p className="text-sm font-medium text-stone-500 mb-1">Blood Type</p><p className="font-bold text-stone-900">{profileForm.bloodType || 'Not set'}</p></div>
                    </div>
                    <h3 className="text-xl font-extrabold text-stone-900 border-b border-stone-100 pb-4 mt-8">Contact Details</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4"><Phone className="text-teal-600" size={20} /> <span className="font-bold text-stone-900">{profileForm.phone || 'Not set'}</span></div>
                      <div className="flex items-center gap-4"><Mail className="text-teal-600" size={20} /> <span className="font-bold text-stone-900">{profileForm.email || 'Not set'}</span></div>
                      <div className="flex items-center gap-4"><MapPin className="text-teal-600" size={20} /> <span className="font-bold text-stone-900">{profileForm.address || 'Not set'}</span></div>
                    </div>
                  </>
                )}
              </div>

              <div className="flex-1 space-y-6">
                <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100">
                  <h3 className="text-lg font-extrabold text-stone-900 mb-4 flex items-center gap-2"><HeartPulse className="text-rose-500" size={20} /> Emergency Contact</h3>
                  <p className="font-bold text-stone-900 text-lg">{profileForm.emergencyContactName || 'Not set'}</p>
                  <p className="text-stone-500 font-medium mb-3">{profileForm.emergencyContactRelation || 'Not set'}</p>
                  <div className="flex items-center gap-2 text-stone-700 font-bold"><Phone size={16} /> {profileForm.emergencyContactPhone || 'Not set'}</div>
                </div>
                <div className="bg-sky-50 rounded-2xl p-6 border border-sky-100">
                  <h3 className="text-lg font-extrabold text-stone-900 mb-4 flex items-center gap-2"><Stethoscope className="text-sky-600" size={20} /> Primary Care Provider</h3>
                  <p className="font-bold text-stone-900 text-lg">{profileForm.primaryCareProviderName || 'Not set'}</p>
                  <p className="text-stone-500 text-sm font-medium">{profileForm.primaryCareProviderSpecialty || 'Not set'}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'clinical' && (
            <div className="flex flex-col gap-6 flex-1 overflow-y-auto custom-scrollbar pr-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100 flex items-center gap-4"><div className="w-12 h-12 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center"><Activity size={24} /></div><div><p className="text-stone-500 text-sm font-medium">Blood Pressure</p><p className="font-extrabold text-xl text-stone-900">118/76</p></div></div>
                <div className="bg-white p-6 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100 flex items-center gap-4"><div className="w-12 h-12 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center"><HeartPulse size={24} /></div><div><p className="text-stone-500 text-sm font-medium">Heart Rate</p><p className="font-extrabold text-xl text-stone-900">72 bpm</p></div></div>
                <div className="bg-white p-6 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100 flex items-center gap-4"><div className="w-12 h-12 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center"><Droplet size={24} /></div><div><p className="text-stone-500 text-sm font-medium">Blood Sugar</p><p className="font-extrabold text-xl text-stone-900">95 mg/dL</p></div></div>
              </div>
            </div>
          )}

          {activeTab === 'medications' && (
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
              <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-extrabold text-stone-900">Active Prescriptions</h3><button className="text-teal-600 font-bold"><PlusSquare size={22} /></button></div>
              {[1, 2].map((id) => (
                <div key={id} className="bg-white border border-stone-100 rounded-2xl p-4 flex justify-between items-center"><div><p className="font-bold text-stone-900">Medication {id}</p><p className="text-stone-500 text-sm">Dose details</p></div><p className="text-xs font-semibold text-stone-400">Active</p></div>
              ))}
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
              {["Lab Result", "Visit Summary", "Imaging"].map((doc) => (
                <div key={doc} className="bg-white border border-stone-100 rounded-2xl p-5 flex justify-between items-center"><div className="flex items-center gap-3"><FileText size={20} className="text-teal-600" /><div><p className="font-bold text-stone-900">{doc}</p><p className="text-xs text-stone-500">Updated recently</p></div></div><Download size={16} className="text-stone-400" /></div>
              ))}
            </div>
          )}

          {activeTab === 'insurance' && (
            <div className="flex flex-col lg:flex-row items-start gap-8 flex-1 overflow-y-auto custom-scrollbar pr-2">
              <div className="w-full lg:w-96 shrink-0 h-fit">
                <div className="bg-gradient-to-tr from-sky-600 to-blue-800 rounded-[2rem] p-8 shadow-xl text-white relative overflow-hidden min-h-56 h-auto flex flex-col gap-6 justify-between">
                  <div className="relative z-10 flex justify-between items-start">
                    <h3 className="font-extrabold text-xl tracking-wide flex items-center gap-2"><ShieldCheck size={28} /> {profileForm.insuranceProvider || 'Insurance'}</h3>
                    <span className="text-sky-200 text-[10px] font-bold uppercase tracking-widest bg-black/20 px-2 py-1 rounded">{profileForm.insurancePlan || 'Plan'}</span>
                  </div>
                  <div className="relative z-10 w-full">
                    <p className="text-sky-200 text-xs uppercase tracking-wider mb-1">Member Name</p>
                    <p className="mb-4 max-w-full break-words font-mono text-lg font-extrabold leading-tight tracking-[0.18em] sm:text-xl sm:tracking-widest">{displayNameUpper}</p>
                    <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:gap-6">
                      <div className="min-w-0"><p className="text-sky-200 text-[10px] uppercase tracking-wider">Member ID</p><p className="break-words font-mono font-bold leading-tight">{profileForm.insuranceMemberId || 'Not set'}</p></div>
                      <div className="min-w-0"><p className="text-sky-200 text-[10px] uppercase tracking-wider">Group #</p><p className="break-words font-mono font-bold leading-tight">{profileForm.insuranceGroupNumber || 'Not set'}</p></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="h-fit self-start bg-white rounded-[2rem] p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100 flex-1">
                <h3 className="text-xl font-extrabold text-stone-900 border-b border-stone-100 pb-4 mb-6">Coverage Details</h3>
                <div className="space-y-6">
                  <div className="flex flex-col gap-1 border-b border-stone-50 pb-4 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0 flex-1"><p className="font-bold text-stone-900 text-lg leading-tight">Primary Care Visit</p><p className="text-stone-500 text-sm font-medium">In-Network Copay</p></div><p className="shrink-0 whitespace-nowrap text-sm font-extrabold text-teal-600 sm:text-base">{profileForm.primaryCareVisitCopay || '$20'}</p></div>
                  <div className="flex flex-col gap-1 border-b border-stone-50 pb-4 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0 flex-1"><p className="font-bold text-stone-900 text-lg leading-tight">Specialist Visit</p><p className="text-stone-500 text-sm font-medium">In-Network Copay</p></div><p className="shrink-0 whitespace-nowrap text-sm font-extrabold text-teal-600 sm:text-base">{profileForm.specialistVisitCopay || '$40'}</p></div>
                  <div className="flex flex-col gap-1 border-b border-stone-50 pb-4 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0 flex-1"><p className="font-bold text-stone-900 text-lg leading-tight">Emergency Room</p><p className="text-stone-500 text-sm font-medium">In-Network Copay</p></div><p className="shrink-0 whitespace-nowrap text-sm font-extrabold text-teal-600 sm:text-base">{profileForm.emergencyRoomCopay || '$150'}</p></div>
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0 flex-1"><p className="font-bold text-stone-900 text-lg leading-tight">Prescription Drugs</p><p className="text-stone-500 text-sm font-medium">Tier 1 Generic</p></div><p className="shrink-0 whitespace-nowrap text-sm font-extrabold text-teal-600 sm:text-base">{profileForm.prescriptionDrugsCopay || '$10'}</p></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </PatientLayout>
  );
}
