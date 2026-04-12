package com.mediconnect.realtime;

import com.mediconnect.appointment.model.Appointment;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mediconnect.doctorslots.model.DoctorAvailabilityResponse;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;

@Service
public class RealtimeEventPublisher {

    private final ObjectMapper objectMapper;
    private final RealtimeWebSocketHandler realtimeWebSocketHandler;

    public RealtimeEventPublisher(ObjectMapper objectMapper, RealtimeWebSocketHandler realtimeWebSocketHandler) {
        this.objectMapper = objectMapper;
        this.realtimeWebSocketHandler = realtimeWebSocketHandler;
    }

    public void publishDoctorSlotsUpdated(DoctorAvailabilityResponse availabilityResponse) {
        publish("doctor-slots.updated", availabilityResponse);
    }

    public void publishAppointmentCreated(Appointment appointment) {
        publish("appointment.created", appointment);
    }

    public void publishAppointmentUpdated(Appointment appointment) {
        publish("appointment.updated", appointment);
    }

    public void publishAppointmentCancelled(Appointment appointment) {
        publish("appointment.cancelled", appointment);
    }

    public void publishAppointmentsCleared() {
        publish("appointment.cleared", Map.of("scope", "all"));
    }

    private void publish(String type, Object payload) {
        try {
            String message = objectMapper.writeValueAsString(Map.of(
                    "type", type,
                    "occurredAt", Instant.now().toString(),
                    "payload", payload
            ));
            realtimeWebSocketHandler.broadcast(message);
        } catch (JsonProcessingException ignored) {
            // Realtime notifications should never block the main request path.
        }
    }
}
