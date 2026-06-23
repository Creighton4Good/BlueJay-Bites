package bjbites.bjbites_springboot.repository;

import bjbites.bjbites_springboot.entity.User;
import bjbites.bjbites_springboot.entity.UserPreference;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserPreferenceRepository extends JpaRepository<UserPreference, Integer> {
UserPreference findByUser(User user);
}
