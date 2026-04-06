function slugifySegment(value) {
  return (value || '')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildChecksum(parts) {
  const rawValue = parts.filter(Boolean).join('|');
  let hash = 0;

  for (let index = 0; index < rawValue.length; index += 1) {
    hash = (hash * 31 + rawValue.charCodeAt(index)) >>> 0;
  }

  return hash.toString(36);
}

export function buildConsultationRoomName({ appointmentId, doctorId, patientName, appointmentDate }) {
  const patientSegment = slugifySegment(patientName).slice(0, 24) || 'patient';
  const dateSegment = slugifySegment(appointmentDate).slice(0, 20) || 'date';
  const checksum = buildChecksum([appointmentId, doctorId, patientName, appointmentDate]).slice(0, 8) || 'room';

  return `mediconnect-vc-${appointmentId || 'session'}-${doctorId || 'doctor'}-${dateSegment}-${patientSegment}-${checksum}`;
}

export function buildConsultationParticipant({
  role,
  appointmentId,
  doctorId,
  doctorName,
  patientName
}) {
  const safeRole = role === 'doctor' ? 'doctor' : 'patient';
  const fallbackName = safeRole === 'doctor'
    ? doctorName || `Doctor ${doctorId || ''}`.trim()
    : patientName || 'Patient';
  const displayName = fallbackName.trim() || (safeRole === 'doctor' ? 'Doctor' : 'Patient');
  const identifierSeed = [safeRole, doctorId || 'doctor', appointmentId || 'session'].join('-');

  return {
    userId: slugifySegment(identifierSeed) || `${safeRole}-user`,
    userName: displayName
  };
}
