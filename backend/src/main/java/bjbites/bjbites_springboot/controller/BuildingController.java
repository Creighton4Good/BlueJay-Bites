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
public class BuildingController {

    @Autowired
    private BuildingRepository buildingRepository;

    // Get all buildings
    /**
     * Get all buildings
     * @return a {@code ResponseEntity} containing all the buildings with {@code 200 OK}
     */
    @GetMapping("/all")
    public ResponseEntity<List<Building>> getAllBuildings() {
        List<Building> buildings = buildingRepository.findAll();
        return new ResponseEntity<>(buildings, HttpStatus.OK);
    }

    // Get building by id
    /**
     * Get building by id
     * @param id the ID of the building to retrieve
     * @return a {@code ResponseEntity} containing the building by ID with {@code 200 OK},
     *          or {@code 404 Not Found} if no building exists with specified ID
     */
    @PreAuthorize("hasAuthority('admin')")
    @GetMapping("/{id}")
    public ResponseEntity<Building> getBuildingById(@PathVariable int id) {
        Optional<Building> building = buildingRepository.findById(id);
        return building.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Get building by name
    /**
     * Get building by name
     * @param buildingName the name of the building to retrieve
     * @return a {@code ResponseEntity} containing the building by name with {@code 200 OK},
     *          or {@code 404 Not Found} if no building exists with specified name
     */
    @PreAuthorize("hasAuthority('admin')")
    @GetMapping("/name/{buildingName}")
    public ResponseEntity<Building> getBuildingByName(@PathVariable String buildingName) {
        Optional<Building> building = buildingRepository.findByBuildingName(buildingName);
        return building.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Create new building
    /**
     * Create new building
     * @param building the building to create
     * @return a {@code ResponseEntity} containing the created building with {@code 201 Created},
     *          or {@code 500 Internal Server Error} if an unexpected error occurs
     */
    @PreAuthorize("hasAuthority('admin')")
    @PostMapping("/create")
    public ResponseEntity<Building> createBuilding(@RequestBody Building building) {
        try {
            Building savedBuilding = buildingRepository.save(building);
            return new ResponseEntity<>(savedBuilding, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }

    }

    // Delete building
    /**
     * Delete building
     * @param id the ID of the building to delete
     * @return {@code 204 No Content} if building is successfully deleted,
     *          or {@code 404 Not Found} if no building exists with specified ID,
     *          or {@code 500 Internal Server Error} if an unexpected error occurs
     */
    @PreAuthorize("hasAuthority('admin')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBuilding(@PathVariable int id) {
        try {
            Optional<Building> building = buildingRepository.findById(id);
            if (building.isPresent()) {
                Building existingBuilding = building.get();
                 buildingRepository.delete(existingBuilding);
                 return ResponseEntity.noContent().build(); }
            else {
                return ResponseEntity.notFound().build(); }
        }
        catch (Exception e) {
            return ResponseEntity.internalServerError().build(); }
    }
}
