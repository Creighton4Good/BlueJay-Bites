package bjbites.bjbites_springboot.repository;

import bjbites.bjbites_springboot.entity.UserPreference;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserPreferenceRepository extends JpaRepository<UserPreference, Integer> {
    Optional<UserPreference> findByNotificationPreference(String notificationPreference);

}
