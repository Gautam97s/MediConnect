package com.mediconnect.appointment.service;

import com.mediconnect.appointment.model.Appointment;
import com.mediconnect.appointment.model.AppointmentStatus;
import com.mediconnect.appointment.repository.AppointmentRepository;
import com.mediconnect.realtime.RealtimeEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final RealtimeEventPublisher realtimeEventPublisher;

    public AppointmentServiceImpl(
            AppointmentRepository appointmentRepository,
            RealtimeEventPublisher realtimeEventPublisher
    ) {
        this.appointmentRepository = appointmentRepository;
        this.realtimeEventPublisher = realtimeEventPublisher;
    }

    @Override
    public List<Appointment> getAllAppointments(Long doctorId, String patientName) {
        if (doctorId != null) {
            return appointmentRepository.findByDoctorId(doctorId);
        }
        if (StringUtils.hasText(patientName)) {
            return appointmentRepository.findByPatientNameContainingIgnoreCase(patientName.trim());
        }
        return appointmentRepository.findAll();
    }

    @Override
    public Appointment getAppointmentById(Long id) {
        if (id == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Appointment id cannot be null"
            );
        }
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Appointment not found with id: " + id
                ));
    }

    @Override
    @Transactional
    public Appointment createAppointment(Appointment appointment) {
        appointment.setId(null);
        if (appointment.getStatus() == null) {
            appointment.setStatus(AppointmentStatus.SCHEDULED);
        }
        Appointment saved = appointmentRepository.save(appointment);
        realtimeEventPublisher.publishAppointmentCreated(saved);
        return saved;
    }

    @Override
    @Transactional
    public Appointment updateAppointment(Long id, Appointment appointmentDetails) {
        Appointment existing = getAppointmentById(id);

        existing.setPatientName(appointmentDetails.getPatientName());
        existing.setDoctorId(appointmentDetails.getDoctorId());
        existing.setAppointmentDate(appointmentDetails.getAppointmentDate());
        existing.setReason(appointmentDetails.getReason());

        if (appointmentDetails.getStatus() != null) {
            existing.setStatus(appointmentDetails.getStatus());
        }

        Appointment saved = appointmentRepository.save(existing);
        realtimeEventPublisher.publishAppointmentUpdated(saved);
        return saved;
    }

    @Override
    @Transactional
    public Appointment cancelAppointment(Long id) {
        Appointment existing = getAppointmentById(id);
        existing.setStatus(AppointmentStatus.CANCELLED);
        Appointment saved = appointmentRepository.save(existing);
        realtimeEventPublisher.publishAppointmentCancelled(saved);
        return saved;
    }

    @Override
    @Transactional
    public void clearAllAndReset() {
        appointmentRepository.truncateAndResetId();
        realtimeEventPublisher.publishAppointmentsCleared();
    }
}
