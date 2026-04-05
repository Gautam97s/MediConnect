const STORAGE_KEY = 'doctorCustomSlotsById';

function parseStoredSlots() {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeStoredSlots(payload) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function toSlotMinutes(slotLabel) {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec((slotLabel || '').trim());
  if (!match) {
    return Number.MAX_SAFE_INTEGER;
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

  return hours * 60 + minutes;
}

function normalizeSlotLabel(slotLabel) {
  return (slotLabel || '').toString().trim().toUpperCase();
}

export function formatTimeValueToSlotLabel(timeValue) {
  const match = /^(\d{1,2}):(\d{2})$/.exec((timeValue || '').trim());
  if (!match) {
    return '';
  }

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const period = hours >= 12 ? 'PM' : 'AM';

  if (hours === 0) {
    hours = 12;
  } else if (hours > 12) {
    hours -= 12;
  }

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
}

export function getDoctorSlots(doctorId, fallbackSlots = []) {
  const stored = parseStoredSlots();
  const storedSlots = Array.isArray(stored?.[String(doctorId)]) ? stored[String(doctorId)] : [];

  const merged = [...(fallbackSlots || []), ...storedSlots]
    .map(normalizeSlotLabel)
    .filter(Boolean);

  return Array.from(new Set(merged)).sort((a, b) => toSlotMinutes(a) - toSlotMinutes(b));
}

export function addDoctorSlot(doctorId, slotLabel, fallbackSlots = []) {
  const normalized = normalizeSlotLabel(slotLabel);
  if (!normalized) {
    return getDoctorSlots(doctorId, fallbackSlots);
  }

  const stored = parseStoredSlots();
  const current = Array.isArray(stored?.[String(doctorId)]) ? stored[String(doctorId)] : [];
  stored[String(doctorId)] = Array.from(new Set([...current, normalized]));
  writeStoredSlots(stored);

  return getDoctorSlots(doctorId, fallbackSlots);
}