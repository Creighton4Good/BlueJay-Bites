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
public class DietaryOptionController {

    @Autowired
    private DietaryOptionRepository dietaryOptionRepository;

    // Get all dietary options
    /**
     * Get all dietary options
     * @return a {@code ResponseEntity} containing all the dietary options with {@code 200 OK}
     */
    @GetMapping("/all")
    public ResponseEntity<List<DietaryOption>> getAllDietaryOptions() {
        List<DietaryOption> dietaryOptions = dietaryOptionRepository.findAll();
        return new ResponseEntity<>(dietaryOptions, HttpStatus.OK); }

    // Get dietary option by id
    /**
     * Get dietary option by id
     * @param id the ID of the dietary option to retrieve
     * @return a {@code ResponseEntity} containing the dietary option by ID with {@code 200 OK},
     *          or {@code 404 Not Found} if no dietary option exists with specified ID
     */
    @PreAuthorize("hasAuthority('admin')")
    @GetMapping("/{id}")
    public ResponseEntity<DietaryOption> getDietaryOptionById(@PathVariable int id) {
        Optional<DietaryOption> dietaryOption = dietaryOptionRepository.findById(id);
        return dietaryOption.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Get dietary option by name
    /**
     * Get dietary option by name
     * @param optionName the name of the dietary option to retrieve
     * @return a {@code ResponseEntity} containing the dietary option by name with {@code 200 OK},
     *          or {@code 404 Not Found} if no dietary option exists with specified name
     */
    @PreAuthorize("hasAuthority('admin')")
    @GetMapping("/name/{optionName}")
    public ResponseEntity<DietaryOption> getDietaryOptionByName(@PathVariable String optionName) {
        Optional<DietaryOption> dietaryOption = dietaryOptionRepository.findByOptionName(optionName);
        return dietaryOption.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Create new dietary option
    /**
     * Create new dietary option
     * @param dietaryOption the dietary option to create
     * @return a {@code ResponseEntity} containing the created dietary option with {@code 201 Created},
     *          or {@code 500 Internal Server Error} if an unexpected error occurs
     */
    @PreAuthorize("hasAuthority('admin')")
    @PostMapping("/create")
    public ResponseEntity<DietaryOption> createDietaryOption(@RequestBody DietaryOption dietaryOption) {
        try {
            DietaryOption newDietaryOption = dietaryOptionRepository.save(dietaryOption);
            return new ResponseEntity<>(newDietaryOption, HttpStatus.CREATED); }
        catch(Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Delete dietary option
    /**
     * Delete dietary option
     * @param id the ID of the dietary option to delete
     * @return {@code 204 No Content} if dietary option is successfully deleted,
     *          or {@code 404 Not Found} if no dietary option exists with specified ID,
     *          or {@code 500 Internal Server Error} if an unexpected error occurs
     */
    @PreAuthorize("hasAuthority('admin')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDietaryOption(@PathVariable int id) {
        try {
            Optional<DietaryOption> dietaryOption = dietaryOptionRepository.findById(id);
            if (dietaryOption.isPresent()) {
                DietaryOption existingDietaryOption = dietaryOption.get();
                dietaryOptionRepository.delete(existingDietaryOption);
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
        }