package com.mediconnect.order.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PharmacyOrderResponse {

    private Long id;
    private Long prescriptionId;
    private Long appointmentId;
    private Long patientId;
    private String patientName;
    private String doctorName;
    private String deliveryAddress;
    private PharmacyOrderStatus status;
    private List<PharmacyOrderItemData> items;
    private LocalDateTime orderedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PharmacyOrderItemData {
        private String medicationName;
        private String dosage;
        private String frequency;
        private String duration;
        private String instructions;
    }
}