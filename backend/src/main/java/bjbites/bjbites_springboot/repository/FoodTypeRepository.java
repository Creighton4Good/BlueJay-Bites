package bjbites.bjbites_springboot.repository;

import bjbites.bjbites_springboot.entity.FoodType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FoodTypeRepository extends JpaRepository<FoodType, Integer> {
    Optional<FoodType> findByName(String typeName);
}
