package bjbites.bjbites_springboot.repository;

import bjbites.bjbites_springboot.entity.Building;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BuildingRepository extends JpaRepository<Building, Integer> {
    Optional<Building> findByBuildingName(String buildingName);
}

