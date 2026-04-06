import axiosInstance from './axiosConfig';

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

export function mergeDoctorSlots(primarySlots = [], fallbackSlots = []) {
  const merged = [...(fallbackSlots || []), ...(primarySlots || [])]
    .map(normalizeSlotLabel)
    .filter(Boolean);

  return Array.from(new Set(merged)).sort((a, b) => toSlotMinutes(a) - toSlotMinutes(b));
}

export async function fetchDoctorSlotsByIds(doctorIds = []) {
  const ids = Array.from(
    new Set(
      (doctorIds || [])
        .map((value) => Number(value))
        .filter((value) => Number.isFinite(value) && value > 0)
    )
  );

  if (ids.length === 0) {
    return {};
  }

  const response = await axiosInstance.get('/doctor-slots', {
    params: {
      doctorIds: ids.join(',')
    }
  });

  const records = Array.isArray(response.data) ? response.data : [];
  return records.reduce((acc, item) => {
    const doctorId = Number(item?.bookingDoctorId);
    if (Number.isFinite(doctorId) && doctorId > 0) {
      acc[doctorId] = mergeDoctorSlots(item?.slots || []);
    }
    return acc;
  }, {});
}

export async function saveDoctorSlots({ bookingDoctorId, doctorName, slots }) {
  const payload = {
    bookingDoctorId: Number(bookingDoctorId),
    doctorName: (doctorName || '').toString().trim(),
    slots: mergeDoctorSlots(slots || [])
  };

  const response = await axiosInstance.put('/doctor-slots/me', payload);
  return {
    ...response.data,
    slots: mergeDoctorSlots(response.data?.slots || [])
  };
}
