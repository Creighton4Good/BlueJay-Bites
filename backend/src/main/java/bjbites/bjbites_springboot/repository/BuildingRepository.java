package bjbites.bjbites_springboot.repository;

import bjbites.bjbites_springboot.entity.Building;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BuildingRepository extends JpaRepository<Building, Integer> {
}

