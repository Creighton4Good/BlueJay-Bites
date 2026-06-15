package bjbites.bjbites_springboot.repository;

import bjbites.bjbites_springboot.entity.FoodType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FoodTypeRepository extends JpaRepository<FoodType, Integer> {
}
