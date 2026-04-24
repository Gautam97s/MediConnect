package com.mediconnect.message.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageRequest {

    @NotNull(message = "Doctor id is required")
    private Long doctorId;

    @NotBlank(message = "Patient name is required")
    private String patientName;

    @NotBlank(message = "Message content is required")
    @Size(max = 2000, message = "Message content must be at most 2000 characters")
    private String content;
}
