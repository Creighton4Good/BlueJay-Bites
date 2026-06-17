package bjbites.bjbites_springboot.controller;

import bjbites.bjbites_springboot.entity.Role;
import bjbites.bjbites_springboot.entity.User;
import bjbites.bjbites_springboot.repository.RoleRepository;
import bjbites.bjbites_springboot.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
    @PreAuthorize("hasAuthority('admin')")
    @GetMapping("/all")
    public ResponseEntity<List<User>> getAllUsers() {
        return new ResponseEntity<>(userRepository.findAll(), HttpStatus.OK);
    }

    // Get user by ID
    @PreAuthorize("hasAuthority('admin')")
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Integer id) {
        Optional<User> user = userRepository.findById(id);
        return user.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                   .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Get user by email
    @PreAuthorize("hasAuthority('admin')")
    @GetMapping("/email/{email}")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email) {
        Optional<User> user = userRepository.findByEmail(email);
        return user.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                   .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Get users by role
    @PreAuthorize("hasAuthority('admin')")
    @GetMapping("/role/{roleId}")
    public ResponseEntity<List<User>> getUsersByRole(@PathVariable Integer roleId) {
        List<User> users = userRepository.findByRole_Id(roleId);
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    // Assign the admin
    @PreAuthorize("hasAuthority('admin')")
    @PutMapping("/{id}/admin/promote")
    public ResponseEntity<User> promoteToAdmin(@PathVariable Integer id) {
        Optional<User> userData = userRepository.findById(id);

        if (userData.isPresent()) {
            User user = userData.get();

            if ("admin".equals(user.getRole().getRoleName())) {
                return ResponseEntity.badRequest().build();
            }

            Role adminRole = roleRepository.findByRoleName("admin")
                    .orElseThrow(() -> new RuntimeException("Admin role not found"));
            user.setRole(adminRole);
            return new ResponseEntity<>(userRepository.save(user), HttpStatus.OK);
        }
        else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Demote the admin
    @PreAuthorize("hasAuthority('admin')")
    @PutMapping("/{id}/admin/demote")
    public ResponseEntity<User> demoteAdmin(@PathVariable Integer id) {
        long adminCount = userRepository.countByRoleRoleName("admin");
        if (adminCount <= 1) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        Optional<User> userData = userRepository.findById(id);

        if (userData.isPresent()) {
            User user = userData.get();

            if (!"admin".equals(user.getRole().getRoleName())) {
                return ResponseEntity.badRequest().build();
            }

            Role userRole = roleRepository.findByRoleName("user")
                    .orElseThrow(() -> new RuntimeException("user role not found"));
            user.setRole(userRole);
            return new ResponseEntity<>(userRepository.save(user), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Assign the organizer
    @PreAuthorize("hasAuthority('admin')")
    @PutMapping("/{id}/event-organizer/promote")
    public ResponseEntity<User> promoteToOrganizer(@PathVariable Integer id) {
        Optional<User> userData = userRepository.findById(id);

        if (userData.isPresent()) {
            User user = userData.get();

            if ("event_organizer".equals(user.getRole().getRoleName())) {
                return ResponseEntity.badRequest().build();
            }

            Role organizerRole = roleRepository.findByRoleName("event_organizer")
                            .orElseThrow(() -> new RuntimeException("event organizer role not found"));
            user.setRole(organizerRole);
            return new ResponseEntity<>(userRepository.save(user), HttpStatus.OK);
        }
        else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Demote the organizer
    @PreAuthorize("hasAuthority('admin')")
    @PutMapping("/{id}/event-organizer/demote")
    public ResponseEntity<User> demoteOrganizer(@PathVariable Integer id) {
        Optional<User> userData = userRepository.findById(id);

        if (userData.isPresent()) {
            User user = userData.get();

            if (!"event_organizer".equals(user.getRole().getRoleName())) {
                return ResponseEntity.badRequest().build();
            }

            Role userRole = roleRepository.findByRoleName("user")
                            .orElseThrow(() -> new RuntimeException("user role not found"));
            user.setRole(userRole);
            return new ResponseEntity<>(userRepository.save(user), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Create new user (admin only)
    @PreAuthorize("hasAuthority('admin')")
    @PostMapping("/create")
    public ResponseEntity<User> createUser(@RequestBody User user) {
        try {
            User saved = userRepository.save(user);
            return new ResponseEntity<>(saved, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Update user
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Integer id, @RequestBody User userDetails) {
        Optional<User> userData = userRepository.findById(id);
        if (userData.isPresent()) {
            User user = userData.get();

            if (Objects.equals(user.getId(), id)) {
                // TODO: change userId to authenticated user

                user.setEmail(userDetails.getEmail());
                user.setDisplayName(userDetails.getDisplayName());
                user.setEntraId(userDetails.getEntraId());
                user.setAuthProvider(userDetails.getAuthProvider());
                return new ResponseEntity<>(userRepository.save(user), HttpStatus.OK);
            }
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    // Delete user (admin only)
    @PreAuthorize("hasAuthority('admin')")
    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteUser(@PathVariable Integer id) {
        try {
            Optional<User> user = userRepository.findById(id);
            if (user.isPresent()) {
                userRepository.delete(user.get());
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
