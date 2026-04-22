package com.mediconnect.message.controller;

import com.mediconnect.message.model.Message;
import com.mediconnect.message.model.MessageRequest;
import com.mediconnect.message.service.MessageService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    @GetMapping
    public List<Message> getMessages(
            @RequestHeader(name = "Authorization", required = false) String authorizationHeader,
            @RequestParam(required = false) Long doctorId,
            @RequestParam(required = false) String patientName
    ) {
        return messageService.getMessages(authorizationHeader, doctorId, patientName);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Message createMessage(
            @RequestHeader(name = "Authorization", required = false) String authorizationHeader,
            @Valid @RequestBody MessageRequest request
    ) {
        return messageService.createMessage(authorizationHeader, request);
    }
}
