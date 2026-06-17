package bjbites.bjbites_springboot.controller;

import bjbites.bjbites_springboot.entity.User;
import bjbites.bjbites_springboot.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserRepository userRepository;

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
    @PreAuthorize("hasAuthority('admin')")
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Integer id, @RequestBody User userDetails) {
        Optional<User> userData = userRepository.findById(id);
        if (userData.isPresent()) {
            User user = userData.get();
            user.setEmail(userDetails.getEmail());
            user.setDisplayName(userDetails.getDisplayName());
            user.setRole(userDetails.getRole());
            user.setEntraId(userDetails.getEntraId());
            user.setAuthProvider(userDetails.getAuthProvider());
            return new ResponseEntity<>(userRepository.save(user), HttpStatus.OK);
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
