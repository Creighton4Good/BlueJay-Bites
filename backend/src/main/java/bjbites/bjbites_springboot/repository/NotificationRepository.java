package bjbites.bjbites_springboot.repository;

import bjbites.bjbites_springboot.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    List<Notification> findByOrderByCreatedAtDesc();
    List<Notification> findByIsReadOrderByCreatedAtDesc(Boolean findBy);
}
