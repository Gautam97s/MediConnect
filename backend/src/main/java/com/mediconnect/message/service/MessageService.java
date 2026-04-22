package com.mediconnect.message.service;

import com.mediconnect.message.model.Message;
import com.mediconnect.message.model.MessageRequest;

import java.util.List;

public interface MessageService {

    List<Message> getMessages(String authorizationHeader, Long doctorId, String patientName);

    Message createMessage(String authorizationHeader, MessageRequest request);
}
