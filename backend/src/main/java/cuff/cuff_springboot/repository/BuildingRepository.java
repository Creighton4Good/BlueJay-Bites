package cuff.cuff_springboot.repository;

import cuff.cuff_springboot.entity.Building;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BuildingRepository extends JpaRepository<Building, Integer> {
}

