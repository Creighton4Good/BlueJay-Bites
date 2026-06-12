package bjbites.bjbites_springboot.repository;

import bjbites.bjbites_springboot.entity.DietaryOption;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DietaryOptionRepository extends JpaRepository<DietaryOption, Integer> {
    Optional<DietaryOption> findByName(String optionName);
}

