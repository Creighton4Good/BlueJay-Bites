package bjbites.bjbites_springboot.repository;

import bjbites.bjbites_springboot.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    List<Notification> findByOrderByCreatedAtDesc();
    List<Notification> findByIsReadOrderByCreatedAtDesc(Boolean findBy);
    Optional<Notification> findByUser_Id(Integer userId);
}
