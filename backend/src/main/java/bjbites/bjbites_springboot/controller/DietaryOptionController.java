package bjbites.bjbites_springboot.controller;

import bjbites.bjbites_springboot.entity.DietaryOption;
import bjbites.bjbites_springboot.repository.DietaryOptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/dietary-options")
@CrossOrigin(origins = "*")
public class DietaryOptionController {

    @Autowired
    private DietaryOptionRepository dietaryOptionRepository;

    // Get all dietary options
    @GetMapping("/all")
    public ResponseEntity<List<DietaryOption>> getAllDietaryOptions() {
        List<DietaryOption> dietaryOptions = dietaryOptionRepository.findAll();
        return new ResponseEntity<>(dietaryOptions, HttpStatus.OK); }

    // Get dietary option by id
    @PreAuthorize("hasAuthority('admin')")
    @GetMapping("/{id}")
    public ResponseEntity<DietaryOption> getDietaryOptionById(@PathVariable int id) {
        Optional<DietaryOption> dietaryOption = dietaryOptionRepository.findById(id);
        return dietaryOption.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Get dietary option by name
    @PreAuthorize("hasAuthority('admin')")
    @GetMapping("/name/{optionName}")
    public ResponseEntity<DietaryOption> getDietaryOptionByName(@PathVariable String optionName) {
        Optional<DietaryOption> dietaryOption = dietaryOptionRepository.findByName(optionName);
        return dietaryOption.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

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