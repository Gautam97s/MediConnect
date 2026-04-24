package com.mediconnect.prescription.service;

import com.mediconnect.prescription.model.PrescriptionFinalizeRequest;
import com.mediconnect.prescription.model.PrescriptionResponse;

import java.util.List;

public interface PrescriptionService {
    PrescriptionResponse finalizeConsultationPrescription(String authorizationHeader, PrescriptionFinalizeRequest request);
    List<PrescriptionResponse> getPrescriptions(String authorizationHeader, Long appointmentId, Long doctorId, String patientName);
    byte[] generatePrescriptionPdf(String authorizationHeader, Long prescriptionId);
}
