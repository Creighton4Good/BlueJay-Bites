package bjbites.bjbites_springboot.controller;

import bjbites.bjbites_springboot.entity.Building;
import bjbites.bjbites_springboot.repository.BuildingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/buildings")
@CrossOrigin(origins = "*")
public class BuildingController {

    @Autowired
    private BuildingRepository buildingRepository;

    // Get all buildings
    @GetMapping("/all")
    public ResponseEntity<List<Building>> getAllBuildings() {
        List<Building> buildings = buildingRepository.findAll();
        return new ResponseEntity<>(buildings, HttpStatus.OK);
    }

    // Get building by id
    @PreAuthorize("hasAuthority('admin')")
    @GetMapping("/{id}")
    public ResponseEntity<Building> getBuildingById(@PathVariable int id) {
        Optional<Building> building = buildingRepository.findById(id);
        return building.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Get building by name
    @PreAuthorize("hasAuthority('admin')")
    @GetMapping("/name/{buildingName}")
    public ResponseEntity<Building> getBuildingByName(@PathVariable String buildingName) {
        Optional<Building> building = buildingRepository.findByBuildingName(buildingName);
        return building.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Create new building
    @PreAuthorize("hasAuthority('admin')")
    @PostMapping("/create")
    public ResponseEntity<Building> createBuilding(@RequestBody Building building) {
        try {
            Building savedBuilding = buildingRepository.save(building);
            return new ResponseEntity<>(savedBuilding, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    // Delete Building
    @PreAuthorize("hasAuthority('admin')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Building> deleteBuilding(@PathVariable int id) {
        try {
            Optional<Building> building = buildingRepository.findById(id);
            if (building.isPresent()) {
                Building existingBuilding = building.get();
                 buildingRepository.delete(existingBuilding);
                 return new ResponseEntity<>(HttpStatus.NO_CONTENT); }
            else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND); }
        }
        catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR); }
    }
}
