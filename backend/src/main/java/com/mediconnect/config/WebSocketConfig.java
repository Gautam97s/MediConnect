package com.mediconnect.config;

import com.mediconnect.realtime.RealtimeWebSocketHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final RealtimeWebSocketHandler realtimeWebSocketHandler;

    public WebSocketConfig(RealtimeWebSocketHandler realtimeWebSocketHandler) {
        this.realtimeWebSocketHandler = realtimeWebSocketHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(realtimeWebSocketHandler, "/ws/updates")
                .setAllowedOrigins(
                        "http://localhost:3000",
                        "http://127.0.0.1:3000",
                        "http://localhost:3001",
                        "http://127.0.0.1:3001"
                );
    }
}
