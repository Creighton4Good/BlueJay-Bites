package bjbites.bjbites_springboot.controller;

import bjbites.bjbites_springboot.entity.Role;
import bjbites.bjbites_springboot.entity.User;
import bjbites.bjbites_springboot.repository.RoleRepository;
import bjbites.bjbites_springboot.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RoleRepository roleRepository;

    // Get all users (admin only)
    /**
     * Get all users
     * @return a {@code ResponseEntity} containing all the users with {@code 200 OK}
     */
    @PreAuthorize("hasAuthority('admin')")
    @GetMapping("/all")
    public ResponseEntity<List<User>> getAllUsers() {
        return new ResponseEntity<>(userRepository.findAll(), HttpStatus.OK);
    }

    // Get user by ID
    /**
     * Get user by id
     * @param id the ID of the user to retrieve
     * @return a {@code ResponseEntity} containing the user by ID with {@code 200 OK},
     *          or {@code 404 Not Found} if no user exists with specified ID
     */
    @PreAuthorize("hasAuthority('admin')")
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Integer id) {
        Optional<User> user = userRepository.findById(id);
        return user.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                   .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Get user by email
    /**
     * Get user by email
     * @param email the email of the user to retrieve
     * @return a {@code ResponseEntity} containing the user by email with {@code 200 OK},
     *          or {@code 404 Not Found} if no user exists with specified email
     */
    @PreAuthorize("hasAuthority('admin')")
    @GetMapping("/email/{email}")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email) {
        Optional<User> user = userRepository.findByEmail(email);
        return user.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                   .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Get users by role
    /**
     * Get users by role
     * @param roleId the ID of the role for which to retrieve users
     * @return a {@code ResponseEntity} containing the users by role ID with {@code 200 OK}
     */
    @PreAuthorize("hasAuthority('admin')")
    @GetMapping("/role/{roleId}")
    public ResponseEntity<List<User>> getUsersByRole(@PathVariable Integer roleId) {
        List<User> users = userRepository.findByRole_Id(roleId);
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    // Assign the admin
    /**
     * Assign the admin
     * @param id the ID of the user to retrieve
     * @return a {@code ResponseEntity} containing the newly assigned admin with {@code 200 OK},
     *          or {@code 404 Not Found} if no user exists with specified ID,
     *          or {@code 400 Bad Request} if the role name of the user is an admin
     */
    @PreAuthorize("hasAuthority('admin')")
    @PutMapping("/{id}/admin/promote")
    public ResponseEntity<User> promoteToAdmin(@PathVariable Integer id) {
        Optional<User> userData = userRepository.findById(id);

        if (userData.isPresent()) {
            User user = userData.get();

            if (Objects.equals("admin", user.getRole().getRoleName())) {
                return ResponseEntity.badRequest().build();
            }

            Role adminRole = roleRepository.findByRoleName("admin")
                    .orElseThrow(() -> new RuntimeException("Admin role not found"));
            user.setRole(adminRole);
            return new ResponseEntity<>(userRepository.save(user), HttpStatus.OK);
        }
        else {
            return ResponseEntity.notFound().build();
        }
    }

    // Demote the admin
    /**
     * Demote the admin
     * @param id the ID of the user to retrieve
     * @return a {@code ResponseEntity} containing the newly demoted admin with {@code 200 OK},
     *          or {@code 404 Not Found} if no user exists with specified ID,
     *          or {@code 400 Bad Request} if there is only one total user with admin role when making the request,
     *          or if the role name of the user is not an admin
     */
    @PreAuthorize("hasAuthority('admin')")
    @PutMapping("/{id}/admin/demote")
    public ResponseEntity<User> demoteAdmin(@PathVariable Integer id) {
        long adminCount = userRepository.countByRoleRoleName("admin");
        if (adminCount <= 1) {
            return ResponseEntity.badRequest().build();
        }

        Optional<User> userData = userRepository.findById(id);

        if (userData.isPresent()) {
            User user = userData.get();

            if (!Objects.equals("admin", user.getRole().getRoleName())) {
                return ResponseEntity.badRequest().build();
            }

            Role userRole = roleRepository.findByRoleName("user")
                    .orElseThrow(() -> new RuntimeException("user role not found"));
            user.setRole(userRole);
            return new ResponseEntity<>(userRepository.save(user), HttpStatus.OK);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Assign the organizer
    /**
     * Assign the organizer
     * @param id the ID of the user to retrieve
     * @return a {@code ResponseEntity} containing the newly assigned organizer with {@code 200 OK},
     *          or {@code 404 Not Found} if no user exists with specified ID,
     *          or {@code 400 Bad Request} if the role name of the user is an event organizer
     */
    @PreAuthorize("hasAuthority('admin')")
    @PutMapping("/{id}/event-organizer/promote")
    public ResponseEntity<User> promoteToOrganizer(@PathVariable Integer id) {
        Optional<User> userData = userRepository.findById(id);

        if (userData.isPresent()) {
            User user = userData.get();

            if (Objects.equals("event_organizer", user.getRole().getRoleName())) {
                return ResponseEntity.badRequest().build();
            }

            Role organizerRole = roleRepository.findByRoleName("event_organizer")
                            .orElseThrow(() -> new RuntimeException("event organizer role not found"));
            user.setRole(organizerRole);
            return new ResponseEntity<>(userRepository.save(user), HttpStatus.OK);
        }
        else {
            return ResponseEntity.notFound().build();
        }
    }

    // Demote the organizer
    /**
     * Demote the organizer
     * @param id the ID of the user to retrieve
     * @return a {@code ResponseEntity} containing the newly demoted organizer with {@code 200 OK},
     *          or {@code 404 Not Found} if no user exists with specified ID,
     *          or {@code 400 Bad Request} if the role name of the user is not an organizer
     */
    @PreAuthorize("hasAuthority('admin')")
    @PutMapping("/{id}/event-organizer/demote")
    public ResponseEntity<User> demoteOrganizer(@PathVariable Integer id) {
        Optional<User> userData = userRepository.findById(id);

        if (userData.isPresent()) {
            User user = userData.get();

            if (!Objects.equals("event_organizer", user.getRole().getRoleName())) {
                return ResponseEntity.badRequest().build();
            }

            Role userRole = roleRepository.findByRoleName("user")
                            .orElseThrow(() -> new RuntimeException("user role not found"));
            user.setRole(userRole);
            return new ResponseEntity<>(userRepository.save(user), HttpStatus.OK);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Create new user (admin only)
    /**
     * Create new user
     * @param user the user to create
     * @return a {@code ResponseEntity} containing the created user with {@code 201 Created},
     *          or {@code 500 Internal Server Error} if an unexpected error occurs
     */
    @PreAuthorize("hasAuthority('admin')")
    @PostMapping("/create")
    public ResponseEntity<User> createUser(@RequestBody User user) {
        try {
            User saved = userRepository.save(user);
            return new ResponseEntity<>(saved, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Update user
    /**
     * Update a user
     * @param oAuthUser the authenticated user
     * @param userDetails the updated user details
     * @return a {@code ResponseEntity} containing the updated user with {@code 200 OK},
     *      or {@code 404 Not Found} if the user data does not exist
     */
    @PutMapping("/me")
    public ResponseEntity<User> updateUser(@AuthenticationPrincipal OAuth2User oAuthUser, @RequestBody User userDetails) {
        User currentUser = userRepository.findByEmail(oAuthUser.getAttribute("email")).orElseThrow();

        Optional<User> userData = userRepository.findById(currentUser.getId());
        if (userData.isPresent()) {
            User user = userData.get();
                // TODO: change userId to authenticated user
                user.setEmail(userDetails.getEmail());
                user.setDisplayName(userDetails.getDisplayName());
                // sensitive fields commented out
                // user.setEntraId(userDetails.getEntraId());
                // user.setAuthProvider(userDetails.getAuthProvider());

                return new ResponseEntity<>(userRepository.save(user), HttpStatus.OK);
        }
        return ResponseEntity.notFound().build();
    }

    // Delete user (admin only)
    /**
     * Delete user
     * @param id the ID of the user to delete
     * @return {@code 204 No Content} if user is successfully deleted,
     *          or {@code 404 Not Found} if no user exists with specified ID,
     *          or {@code 500 Internal Server Error} if an unexpected error occurs
     */
    @PreAuthorize("hasAuthority('admin')")
    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteUser(@PathVariable Integer id) {
        try {
            Optional<User> user = userRepository.findById(id);
            if (user.isPresent()) {
                userRepository.delete(user.get());
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
