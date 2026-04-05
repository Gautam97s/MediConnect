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
  { id: 'gastro', name: 'Gastroenterologist', description: 'Digestive system health' },
  { id: 'endo', name: 'Endocrinologist', description: 'Hormones, thyroid, and metabolism' },
  { id: 'pulmo', name: 'Pulmonologist', description: 'Lungs and respiratory health' },
  { id: 'nephro', name: 'Nephrologist', description: 'Kidney and renal care' },
  { id: 'uro', name: 'Urologist', description: 'Urinary tract and male reproductive health' },
  { id: 'onco', name: 'Oncologist', description: 'Cancer diagnosis and treatment' },
  { id: 'rheuma', name: 'Rheumatologist', description: 'Autoimmune and joint inflammatory disorders' }
];

export const DOCTORS = {
  general: [
    { id: 100, name: 'Dr. Gautam Sharma', experience: '9 yrs', rating: 4.8, fee: 90, image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&q=80', availableSlots: ['08:00 AM', '10:30 AM', '01:00 PM', '03:45 PM', '08:40 PM'] },
    { id: 101, name: 'Dr. Marcus Thorne', experience: '15 yrs', rating: 4.7, fee: 100, image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&q=80', availableSlots: ['08:30 AM', '09:45 AM', '11:00 AM', '02:30 PM', '05:00 PM'] },
    { id: 102, name: 'Dr. Olivia Newton', experience: '5 yrs', rating: 4.6, fee: 80, image: 'https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?w=200&q=80', availableSlots: ['11:00 AM', '01:15 PM', '04:00 PM'] },
  ],
  dentist: [
    { id: 103, name: 'Dr. Alan Smile', experience: '10 yrs', rating: 4.8, fee: 150, image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&q=80', availableSlots: ['10:00 AM', '11:30 AM', '02:00 PM', '04:15 PM'] },
    { id: 104, name: 'Dr. Sarah Tooth', experience: '8 yrs', rating: 4.9, fee: 130, image: 'https://images.unsplash.com/photo-1594824432258-3ebce606f7df?w=200&q=80', availableSlots: ['09:00 AM', '01:00 PM', '03:30 PM'] },
  ],
  derma: [
    { id: 105, name: 'Dr. Emily Chen', experience: '12 yrs', rating: 4.9, fee: 200, image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&q=80', availableSlots: ['10:30 AM', '12:00 PM', '03:00 PM'] },
  ],
  cardio: [
    { id: 106, name: 'Dr. Robert Heart', experience: '20 yrs', rating: 5.0, fee: 250, image: 'https://images.unsplash.com/photo-1537368910025-702800faa86b?w=200&q=80', availableSlots: ['09:00 AM', '11:00 AM'] },
  ],
  neuro: [
    { id: 107, name: 'Dr. Ananya Bose', experience: '14 yrs', rating: 4.8, fee: 220, image: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=200&q=80', availableSlots: ['09:30 AM', '12:15 PM', '04:30 PM'] },
  ],
  ortho: [
    { id: 108, name: 'Dr. Karan Malhotra', experience: '11 yrs', rating: 4.7, fee: 180, image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&q=80', availableSlots: ['10:00 AM', '01:30 PM', '05:15 PM'] },
  ],
  pedia: [
    { id: 109, name: 'Dr. Meera Iyer', experience: '9 yrs', rating: 4.9, fee: 140, image: 'https://images.unsplash.com/photo-1594824475317-5f3f8f0b8e7f?w=200&q=80', availableSlots: ['08:45 AM', '11:45 AM', '03:30 PM'] },
  ],
  psych: [
    { id: 110, name: 'Dr. Raghav Menon', experience: '13 yrs', rating: 4.8, fee: 170, image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&q=80', availableSlots: ['10:30 AM', '02:00 PM', '06:00 PM'] },
  ],
  gynae: [
    { id: 111, name: 'Dr. Nisha Verma', experience: '16 yrs', rating: 4.9, fee: 210, image: 'https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?w=200&q=80', availableSlots: ['09:15 AM', '12:45 PM', '04:00 PM'] },
  ],
  ent: [
    { id: 112, name: 'Dr. Arjun Rao', experience: '10 yrs', rating: 4.6, fee: 150, image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&q=80', availableSlots: ['11:00 AM', '01:00 PM', '05:30 PM'] },
  ],
  ophthal: [
    { id: 113, name: 'Dr. Sofia Kapoor', experience: '12 yrs', rating: 4.8, fee: 160, image: 'https://images.unsplash.com/photo-1537368910025-702800faa86b?w=200&q=80', availableSlots: ['09:00 AM', '12:30 PM', '03:45 PM'] },
  ],
  gastro: [
    { id: 114, name: 'Dr. Vivek Sinha', experience: '15 yrs', rating: 4.7, fee: 195, image: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=200&q=80', availableSlots: ['10:15 AM', '02:45 PM', '05:00 PM'] },
  ],
  endo: [
    { id: 115, name: 'Dr. Tara Deshmukh', experience: '11 yrs', rating: 4.7, fee: 185, image: 'https://images.unsplash.com/photo-1594824475317-5f3f8f0b8e7f?w=200&q=80', availableSlots: ['09:00 AM', '11:30 AM', '04:15 PM'] },
  ],
  pulmo: [
    { id: 116, name: 'Dr. Imran Qureshi', experience: '13 yrs', rating: 4.8, fee: 190, image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&q=80', availableSlots: ['10:45 AM', '01:15 PM', '06:15 PM'] },
  ],
  nephro: [
    { id: 117, name: 'Dr. Neha Kulkarni', experience: '14 yrs', rating: 4.8, fee: 205, image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&q=80', availableSlots: ['08:30 AM', '12:00 PM', '03:30 PM'] },
  ],
  uro: [
    { id: 118, name: 'Dr. Siddharth Jain', experience: '12 yrs', rating: 4.6, fee: 175, image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&q=80', availableSlots: ['09:45 AM', '02:15 PM', '05:45 PM'] },
  ],
  onco: [
    { id: 119, name: 'Dr. Pooja Narang', experience: '17 yrs', rating: 4.9, fee: 260, image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&q=80', availableSlots: ['10:00 AM', '01:45 PM', '04:45 PM'] },
  ],
  rheuma: [
    { id: 120, name: 'Dr. Harsh Patel', experience: '10 yrs', rating: 4.7, fee: 170, image: 'https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?w=200&q=80', availableSlots: ['08:15 AM', '11:15 AM', '03:15 PM'] },
  ]
};
