package com.mediconnect.order.service;

import com.mediconnect.order.model.CreatePrescriptionOrderRequest;
import com.mediconnect.order.model.PharmacyOrderResponse;

import java.util.List;

public interface PharmacyOrderService {

    PharmacyOrderResponse createPrescriptionOrder(String authorizationHeader, CreatePrescriptionOrderRequest request);

    List<PharmacyOrderResponse> getMyOrders(String authorizationHeader);
}