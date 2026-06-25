package bjbites.bjbites_springboot.service;

import bjbites.bjbites_springboot.entity.Notification;
import bjbites.bjbites_springboot.entity.Post;
import bjbites.bjbites_springboot.entity.User;
import bjbites.bjbites_springboot.entity.UserPreference;
import bjbites.bjbites_springboot.repository.NotificationRepository;
import bjbites.bjbites_springboot.repository.UserPreferenceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;
    @Autowired
    private UserPreferenceRepository userPreferenceRepository;
    @Autowired
    private NotificationSseService notificationSseService;

    public void createNotification(User user, Post post, String type) {
        UserPreference preference = userPreferenceRepository.findByUser(user);

        if (preference == null || preference.getNotificationPreference() == null ||
                !"on".equals(preference.getNotificationPreference())) {
            return;
        }

        Notification notification =
                new Notification(user, post, type);

        notificationRepository.save(notification);
        
        notificationSseService.publish(
                user.getId(),
                notification);

    }
}
