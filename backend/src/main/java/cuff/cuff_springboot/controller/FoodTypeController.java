package cuff.cuff_springboot.controller;

import cuff.cuff_springboot.entity.FoodType;
import cuff.cuff_springboot.repository.FoodTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/foodtypes")
@CrossOrigin(origins = "*")
public class FoodTypeController {

    @Autowired
    private FoodTypeRepository foodTypeRepository;

    // Get all food types
    @GetMapping("/all")
    public ResponseEntity<List<FoodType>> getFoodTypes() {
        List<FoodType> foodTypes = foodTypeRepository.findAll();
        return new ResponseEntity<>(foodTypes, HttpStatus.OK);
    }

    // Create new food type
    @PreAuthorize("hasAuthority('admin') or hasAuthority('event_organizer')")
    @PostMapping("/new")
    public ResponseEntity<FoodType> createFoodType(@RequestBody FoodType foodType) {
        try {
            FoodType newFoodType = foodTypeRepository.save(foodType);
            return new ResponseEntity<>(newFoodType, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    // Delete food type
    @PreAuthorize("hasAuthority('admin') or hasAuthority('event_organizer')")
    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteFoodType(@PathVariable int id) {
        try {
            Optional<FoodType> foodType = foodTypeRepository.findById(id);
            if (foodType.isPresent()) {
                FoodType existingFoodType = foodType.get();
                foodTypeRepository.delete(existingFoodType);
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}