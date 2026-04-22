package com.mediconnect.appointment.service;

import com.mediconnect.appointment.model.Appointment;

import java.util.List;

public interface AppointmentService {

    List<Appointment> getAllAppointments(Long doctorId, String patientName);

    Appointment getAppointmentById(Long id);

    Appointment createAppointment(Appointment appointment);

    Appointment updateAppointment(Long id, Appointment appointmentDetails);

    Appointment cancelAppointment(Long id);

    int deleteAppointmentsForDoctorPatient(Long doctorId, String patientName);

    void clearAllAndReset();
}
