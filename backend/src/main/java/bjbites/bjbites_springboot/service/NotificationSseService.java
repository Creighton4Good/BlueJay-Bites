package bjbites.bjbites_springboot.service;

import bjbites.bjbites_springboot.entity.Notification;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class NotificationSseService {

    private final Map<Integer, SseEmitter> emitters = new ConcurrentHashMap<>();

    public SseEmitter subscribe(Integer userId) {
        SseEmitter emitter = new SseEmitter(0L); // no timeout
        emitters.put(userId, emitter);

        emitter.onCompletion(() -> emitters.remove(userId));
        emitter.onTimeout(() -> emitters.remove(userId));

        return emitter;
    }

    public void publish(Integer userId, Notification notification) {
        SseEmitter emitter = emitters.get(userId);

        // TODO: Add support for storing multiple emitters for a user
        if (emitter == null) {
            return; }
            try {
                emitter.send(SseEmitter.event().name("notification").data(notification));
            } catch (IOException e) {
                emitters.remove(userId);
            }
        }
    }