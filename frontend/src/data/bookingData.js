export const CATEGORIES = [
  { id: 'general', name: 'General Physician', description: 'Primary care and general health' },
  { id: 'dentist', name: 'Dentist', description: 'Dental care and surgery' },
  { id: 'derma', name: 'Dermatologist', description: 'Skin, hair, and nail care' },
  { id: 'cardio', name: 'Cardiologist', description: 'Heart and blood vessels' },
  { id: 'neuro', name: 'Neurologist', description: 'Brain and nervous system' },
  { id: 'ortho', name: 'Orthopedist', description: 'Bones, joints, and muscles' },
  { id: 'pedia', name: 'Pediatrician', description: 'Child and infant care' },
  { id: 'psych', name: 'Psychiatrist', description: 'Mental health and therapy' },
  { id: 'gynae', name: 'Gynecologist', description: 'Women\'s health and pregnancy' },
  { id: 'ent', name: 'ENT Specialist', description: 'Ear, nose, and throat' },
  { id: 'ophthal', name: 'Ophthalmologist', description: 'Eye and vision care' },
  { id: 'gastro', name: 'Gastroenterologist', description: 'Digestive system health' }
];

export const DOCTORS = {
  general: [
    { id: 'g1', name: 'Dr. Marcus Thorne', experience: '15 yrs', rating: 4.7, fee: 100, image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&q=80', availableSlots: ['08:30 AM', '09:45 AM', '11:00 AM', '02:30 PM', '05:00 PM'] },
    { id: 'g2', name: 'Dr. Olivia Newton', experience: '5 yrs', rating: 4.6, fee: 80, image: 'https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?w=200&q=80', availableSlots: ['11:00 AM', '01:15 PM', '04:00 PM'] },
  ],
  dentist: [
    { id: 'd1', name: 'Dr. Alan Smile', experience: '10 yrs', rating: 4.8, fee: 150, image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&q=80', availableSlots: ['10:00 AM', '11:30 AM', '02:00 PM', '04:15 PM'] },
    { id: 'd2', name: 'Dr. Sarah Tooth', experience: '8 yrs', rating: 4.9, fee: 130, image: 'https://images.unsplash.com/photo-1594824432258-3ebce606f7df?w=200&q=80', availableSlots: ['09:00 AM', '01:00 PM', '03:30 PM'] },
  ],
  derma: [
    { id: 's1', name: 'Dr. Emily Chen', experience: '12 yrs', rating: 4.9, fee: 200, image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&q=80', availableSlots: ['10:30 AM', '12:00 PM', '03:00 PM'] },
  ],
  cardio: [
    { id: 'c1', name: 'Dr. Robert Heart', experience: '20 yrs', rating: 5.0, fee: 250, image: 'https://images.unsplash.com/photo-1537368910025-702800faa86b?w=200&q=80', availableSlots: ['09:00 AM', '11:00 AM'] },
  ]
};
