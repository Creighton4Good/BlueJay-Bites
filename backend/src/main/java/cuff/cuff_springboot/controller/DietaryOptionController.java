package cuff.cuff_springboot.controller;

import cuff.cuff_springboot.entity.DietaryOption;
import cuff.cuff_springboot.repository.DietaryOptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/dietary")
@CrossOrigin(origins = "*")
public class DietaryOptionController {

    @Autowired
    private DietaryOptionRepository dietaryOptionRepository;

    // Get all dietary options
    @GetMapping("/all")
    public ResponseEntity<List<DietaryOption>> getAllDietaryOptions() {
        List<DietaryOption> dietaryOptions = dietaryOptionRepository.findAll();
        return new ResponseEntity<>(dietaryOptions, HttpStatus.OK); }

        // Create new dietary option
        @PreAuthorize("hasAuthority('admin')")
        @PostMapping("/create")
        public ResponseEntity<DietaryOption> createDietaryOption(@RequestBody DietaryOption dietaryOption) {
            try {
                DietaryOption newDietaryOption = dietaryOptionRepository.save(dietaryOption);
                return new ResponseEntity<>(newDietaryOption, HttpStatus.CREATED); }
            catch(Exception e) {
                    return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
                }
            }

    // Delete dietary option
    @PreAuthorize("hasAuthority('admin')")
    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteDietaryOption(@PathVariable int id) {
        try {
            Optional<DietaryOption> dietaryOption = dietaryOptionRepository.findById(id);
            if (dietaryOption.isPresent()) {
                DietaryOption existingDietaryOption = dietaryOption.get();
                dietaryOptionRepository.delete(existingDietaryOption);
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
        }