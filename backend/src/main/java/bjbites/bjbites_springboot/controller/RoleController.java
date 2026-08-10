package bjbites.bjbites_springboot.controller;

import bjbites.bjbites_springboot.entity.Role;
import bjbites.bjbites_springboot.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/roles")
public class RoleController {

    @Autowired
    private RoleRepository roleRepository;

    // Get all roles
    /**
     * Get all roles
     * @return a {@code ResponseEntity} containing all the roles with {@code 200 OK}
     */
    @PreAuthorize("hasAuthority('admin')")
    @GetMapping("/all")
    public ResponseEntity<List<Role>> getAllRoles() {
        return new ResponseEntity<>(roleRepository.findAll(), HttpStatus.OK);
    }

    // Get role by id
    /**
     * Get role by id
     * @param id the ID of the role to retrieve
     * @return a {@code ResponseEntity} containing the role by ID with {@code 200 OK},
     *          or {@code 404 Not Found} if no role exists with specified ID
     */
    @PreAuthorize("hasAuthority('admin')")
    @GetMapping("/{id}")
    public ResponseEntity<Role> getRoleById(@PathVariable Integer id) {
        Optional<Role> role = roleRepository.findById(id);
        return role.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                   .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Get role by name
    /**
     * Get role by name
     * @param roleName the name of the role to retrieve
     * @return a {@code ResponseEntity} containing the role by name with {@code 200 OK},
     *          or {@code 404 Not Found} if no role exists with specified name
     */
    @PreAuthorize("hasAuthority('admin')")
    @GetMapping("/name/{roleName}")
    public ResponseEntity<Role> getRoleByName(@PathVariable String roleName) {
        Optional<Role> role = roleRepository.findByRoleName(roleName);
        return role.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                   .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Create new role
    /**
     * Create new role
     * @param role the role to create
     * @return a {@code ResponseEntity} containing the created role with {@code 201 Created},
     *          or {@code 500 Internal Server Error} if an unexpected error occurs
     */
    @PreAuthorize("hasAuthority('admin')")
    @PostMapping("/create")
    public ResponseEntity<Role> createRole(@RequestBody Role role) {
        try {
            Role saved = roleRepository.save(role);
            return new ResponseEntity<>(saved, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Delete role
    /**
     * Delete role
     * @param id the ID of the role to delete
     * @return {@code 204 No Content} if role is successfully deleted,
     *          or {@code 404 Not Found} if no role exists with specified ID,
     *          or {@code 500 Internal Server Error} if an unexpected error occurs
     */
    @PreAuthorize("hasAuthority('admin')")
    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteRole(@PathVariable Integer id) {
        try {
            Optional<Role> role = roleRepository.findById(id);
            if (role.isPresent()) {
                roleRepository.delete(role.get());
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
