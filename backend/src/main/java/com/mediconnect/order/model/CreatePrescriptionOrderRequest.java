package com.mediconnect.order.model;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreatePrescriptionOrderRequest {

    @NotNull(message = "Prescription id is required")
    private Long prescriptionId;

    private String deliveryAddress;
}