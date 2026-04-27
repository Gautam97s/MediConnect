package com.mediconnect.order.controller;

import com.mediconnect.order.model.CreatePrescriptionOrderRequest;
import com.mediconnect.order.model.PharmacyOrderResponse;
import com.mediconnect.order.service.PharmacyOrderService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class PharmacyOrderController {

    private final PharmacyOrderService pharmacyOrderService;

    public PharmacyOrderController(PharmacyOrderService pharmacyOrderService) {
        this.pharmacyOrderService = pharmacyOrderService;
    }

    @PostMapping("/prescription")
    public PharmacyOrderResponse createPrescriptionOrder(
            @RequestHeader(name = "Authorization", required = false) String authorizationHeader,
            @Valid @RequestBody CreatePrescriptionOrderRequest request
    ) {
        return pharmacyOrderService.createPrescriptionOrder(authorizationHeader, request);
    }

    @GetMapping("/my")
    public List<PharmacyOrderResponse> getMyOrders(
            @RequestHeader(name = "Authorization", required = false) String authorizationHeader
    ) {
        return pharmacyOrderService.getMyOrders(authorizationHeader);
    }
}