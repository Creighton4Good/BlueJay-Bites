package bjbites.bjbites_springboot.service;

import bjbites.bjbites_springboot.entity.Notification;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class NotificationSseService {

    private final Map<Integer, SseEmitter> notificationEmitters = new ConcurrentHashMap<>();

    public SseEmitter subscribe(Integer userId) {
        SseEmitter notificationEmitter = new SseEmitter(Long.MAX_VALUE);
        notificationEmitters.put(userId, notificationEmitter);

        notificationEmitter.onCompletion(() -> notificationEmitters.remove(userId));
        notificationEmitter.onTimeout(() -> notificationEmitters.remove(userId));

        return notificationEmitter;

    }

    public void publishNotification(Integer userId, Notification notification) {
        SseEmitter notificationEmitter = notificationEmitters.get(userId);

        // TODO: Add support for storing multiple emitters for a user

        if (notificationEmitter == null) {
            return; }

            try {
                notificationEmitter.send(SseEmitter.event().name("notification").data(notification));
            } catch (Exception e) {
                notificationEmitters.remove(userId);
            }
    }
        }
