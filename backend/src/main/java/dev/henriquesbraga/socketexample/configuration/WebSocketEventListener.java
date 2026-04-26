package dev.henriquesbraga.socketexample.configuration;

import org.springframework.context.event.EventListener;
import org.springframework.messaging.MessageHeaders;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageType;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;

import java.util.List;
import java.util.Map;

@Component
public class WebSocketEventListener {

    private static final String USER_LIST_DESTINATION = "/user/queue/list";

    private final SimpMessagingTemplate messagingTemplate;


    public WebSocketEventListener(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }


    @EventListener
    public void handleWebSocketSubscriptionListener(SessionSubscribeEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String destination = accessor.getDestination();

        if (!USER_LIST_DESTINATION.equals(destination)) {
            return;
        }

        String sessionId = accessor.getSessionId();

        List<Object> lista = List.of(
            Map.of("id", 1, "nome", "Item 1"),
            Map.of("id", 2, "nome", "Item 2")
        );

        messagingTemplate.convertAndSendToUser(
                sessionId,
                "/queue/list",
                lista,
                createHeaders(sessionId)
        );

    }

    private MessageHeaders createHeaders(String sessionId) {
        SimpMessageHeaderAccessor headerAccessor = SimpMessageHeaderAccessor.create(SimpMessageType.MESSAGE);
        headerAccessor.setSessionId(sessionId);
        headerAccessor.setLeaveMutable(true);
        return headerAccessor.getMessageHeaders();
    }

}
