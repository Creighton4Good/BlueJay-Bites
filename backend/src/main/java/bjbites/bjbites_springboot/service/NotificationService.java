package bjbites.bjbites_springboot.service;

import bjbites.bjbites_springboot.entity.Notification;
import bjbites.bjbites_springboot.entity.Post;
import bjbites.bjbites_springboot.entity.User;
import bjbites.bjbites_springboot.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;
    @Autowired
    private NotificationSseService notificationSseService;

    public void createNotification(User user, Post post, String type) {
        if (user == null || user.getUserPreference().getNotificationPreference() == null ||
                !"on".equals(user.getUserPreference().getNotificationPreference())) {
            return;
        }

        Notification notification =
                new Notification(user, post, type);

        notificationRepository.save(notification);
        
        notificationSseService.publishNotification(
                user.getId(),
                notification);

    }
}
