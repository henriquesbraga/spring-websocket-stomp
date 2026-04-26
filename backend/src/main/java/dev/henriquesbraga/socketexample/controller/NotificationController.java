package dev.henriquesbraga.socketexample.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
public class NotificationController {



    private final SimpMessagingTemplate messagingTemplate;


    public NotificationController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }


    // Cliente envia o click
    @MessageMapping("click")
    public void handleClick(String itemId) {

        // Envia o evento de remoção
        messagingTemplate.convertAndSend("/topic/remove", itemId);
    }

}
