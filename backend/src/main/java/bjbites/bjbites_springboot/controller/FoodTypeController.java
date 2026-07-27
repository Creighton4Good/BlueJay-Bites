package bjbites.bjbites_springboot.controller;

import bjbites.bjbites_springboot.entity.FoodType;
import bjbites.bjbites_springboot.repository.FoodTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/foodtypes")
public class FoodTypeController {

    @Autowired
    private FoodTypeRepository foodTypeRepository;

    // Get all food types
    /**
     * Get all food types
     * @return a {@code ResponseEntity} containing all the food types with {@code 200 OK}
     */
    @GetMapping("/all")
    public ResponseEntity<List<FoodType>> getFoodTypes() {
        List<FoodType> foodTypes = foodTypeRepository.findAll();
        return new ResponseEntity<>(foodTypes, HttpStatus.OK);
    }

    // Get food type by id
    /**
     * Get food type by id
     * @param id the ID of the food type to retrieve
     * @return a {@code ResponseEntity} containing the food type by ID with {@code 200 OK},
     *          or {@code 404 Not Found} if no food type exists with specified ID
     */
    @PreAuthorize("hasAuthority('admin')")
    @GetMapping("/{id}")
    public ResponseEntity<FoodType> getFoodTypeById(@PathVariable int id) {
        Optional<FoodType> foodType = foodTypeRepository.findById(id);
        return foodType.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Get food type by name
    /**
     * Get food type by name
     * @param typeName the name of the food type to retrieve
     * @return a {@code ResponseEntity} containing the food type by name with {@code 200 OK},
     *          or {@code 404 Not Found} if no food type exists with specified name
     */
    @PreAuthorize("hasAuthority('admin')")
    @GetMapping("/name/{typeName}")
    public ResponseEntity<FoodType> getFoodTypeByName(@PathVariable String typeName) {
        Optional<FoodType> foodType = foodTypeRepository.findByTypeName(typeName);
        return foodType.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Create new food type
    /**
     * Create new food type
     * @param foodType the food type to create
     * @return a {@code ResponseEntity} containing the created food type with {@code 201 Created},
     *          or {@code 500 Internal Server Error} if an unexpected error occurs
     */
    @PreAuthorize("hasAuthority('admin')")
    @PostMapping("/create")
    public ResponseEntity<FoodType> createFoodType(@RequestBody FoodType foodType) {
        try {
            FoodType newFoodType = foodTypeRepository.save(foodType);
            return new ResponseEntity<>(newFoodType, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }


    // Delete food type
    /**
     * Delete food type
     * @param id the ID of the food type to delete
     * @return {@code 204 No Content} if food type is successfully deleted,
     *          or {@code 404 Not Found} if no food type exists with specified ID,
     *          or {@code 500 Internal Server Error} if an unexpected error occurs
     */
    @PreAuthorize("hasAuthority('admin')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFoodType(@PathVariable int id) {
        try {
            Optional<FoodType> foodType = foodTypeRepository.findById(id);
            if (foodType.isPresent()) {
                FoodType existingFoodType = foodType.get();
                foodTypeRepository.delete(existingFoodType);
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}