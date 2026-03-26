package com.mediconnect.config;

import com.mediconnect.appointment.model.Appointment;
import com.mediconnect.appointment.model.AppointmentStatus;
import com.mediconnect.appointment.repository.AppointmentRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final AppointmentRepository appointmentRepository;

    public DataSeeder(AppointmentRepository appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    @Override
    public void run(String... args) {
        if (appointmentRepository.count() > 0) {
            return;
        }

        LocalDateTime base = LocalDateTime.now().withSecond(0).withNano(0);

        List<Appointment> sampleAppointments = List.of(
                Appointment.builder()
                        .patientName("Aarav Sharma")
                        .doctorId(101L)
                        .appointmentDate(base.plusDays(1).withHour(10).withMinute(0))
                        .reason("Follow-up for blood pressure management")
                        .status(AppointmentStatus.SCHEDULED)
                        .build(),
                Appointment.builder()
                        .patientName("Priya Nair")
                        .doctorId(102L)
                        .appointmentDate(base.plusDays(2).withHour(14).withMinute(30))
                        .reason("Dermatology consultation for recurring rash")
                        .status(AppointmentStatus.SCHEDULED)
                        .build(),
                Appointment.builder()
                        .patientName("Rohan Mehta")
                        .doctorId(101L)
                        .appointmentDate(base.minusDays(1).withHour(11).withMinute(15))
                        .reason("Review lab results and treatment plan")
                        .status(AppointmentStatus.COMPLETED)
                        .build(),
                Appointment.builder()
                        .patientName("Sneha Kapoor")
                        .doctorId(103L)
                        .appointmentDate(base.minusDays(2).withHour(9).withMinute(45))
                        .reason("Routine diabetes monitoring")
                        .status(AppointmentStatus.NO_SHOW)
                        .build(),
                Appointment.builder()
                        .patientName("Vikram Singh")
                        .doctorId(104L)
                        .appointmentDate(base.plusDays(3).withHour(16).withMinute(0))
                        .reason("Initial consultation for knee pain")
                        .status(AppointmentStatus.SCHEDULED)
                        .build()
        );

        appointmentRepository.saveAll(sampleAppointments);
    }
}
