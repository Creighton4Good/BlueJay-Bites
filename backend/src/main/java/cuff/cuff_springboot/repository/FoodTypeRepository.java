package cuff.cuff_springboot.repository;

import cuff.cuff_springboot.entity.FoodType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FoodTypeRepository extends JpaRepository<FoodType, Integer> {
}
