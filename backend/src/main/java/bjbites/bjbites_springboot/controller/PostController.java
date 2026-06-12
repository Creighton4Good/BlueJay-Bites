package bjbites.bjbites_springboot.controller;

import bjbites.bjbites_springboot.entity.Post;
import bjbites.bjbites_springboot.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "*") // Configure this properly for production
public class PostController {
    
    @Autowired
    private PostRepository postRepository;
    
    // Get all active posts
    @GetMapping("/active")
    public ResponseEntity<List<Post>> getAllActivePosts() {
        List<Post> posts = postRepository.findByStatusOrderByCreatedAtDesc("active");
        return new ResponseEntity<>(posts, HttpStatus.OK);
    }

    // Get all closed posts
    @PreAuthorize("hasAuthority('admin')")
    @GetMapping("/closed")
    public ResponseEntity<List<Post>> getAllClosedPosts() {
        List<Post> posts = postRepository.findByStatusOrderByCreatedAtDesc("closed");
        return new ResponseEntity<>(posts, HttpStatus.OK);
    }


    // Get post by ID (active or closed)
    @PreAuthorize("hasAuthority('admin')")
    @GetMapping("/{id}")
    public ResponseEntity<Post> getPostById(@PathVariable int id) {
        Optional<Post> post = postRepository.findById(id);
        return post.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                   .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Get only posts that they created
    @PreAuthorize("hasAuthority('admin') or hasAuthority('event_organizer')")
    @GetMapping("/created")
    public ResponseEntity<List<Post>> getCreatedPosts(@RequestParam int userId) {

        List<Post> posts = postRepository.findByCreatedBy_Id(userId);

        return new ResponseEntity<>(posts, HttpStatus.OK);

    }

    // Get all posts (active and closed)
    @PreAuthorize("hasAuthority('admin')")
    @GetMapping("/all")
    public ResponseEntity<List<Post>> getAllPosts() {
        List<Post> posts = postRepository.findByOrderByCreatedAtDesc();
        return new ResponseEntity<>(posts, HttpStatus.OK);

    }

    // Create new post
    @PreAuthorize("hasAuthority('admin') or hasAuthority('event_organizer')")
    @PostMapping("/create")
    public ResponseEntity<Post> createPost(@RequestBody Post post) {
        try {
            Post savedPost = postRepository.save(post);
            // TODO: Trigger notification system here
            return new ResponseEntity<>(savedPost, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // Update any post (for admin)
    @PreAuthorize("hasAuthority('admin')")
    @PutMapping("/any/{id}")
    public ResponseEntity<Post> updateAnyPost(@PathVariable int id, @RequestBody Post postDetails) {
        Optional<Post> postData = postRepository.findById(id);
        
        if (postData.isPresent()) {
            Post post = postData.get();
            post.setTitle(postDetails.getTitle());
            post.setDescription(postDetails.getDescription());
            post.setNotes(postDetails.getNotes());
            post.setPhotoUrl(postDetails.getPhotoUrl());
            post.setBuilding(postDetails.getBuilding());
            post.setDirections(postDetails.getDirections());
            post.setRoomNumber(postDetails.getRoomNumber());
            post.setFoodType(postDetails.getFoodType());
            post.setServingsMin(postDetails.getServingsMin());
            post.setServingsMax(postDetails.getServingsMax());
            post.setAvailableFrom(postDetails.getAvailableFrom());
            post.setAvailableUntil(postDetails.getAvailableUntil());
            post.setUpdatedAt(LocalDateTime.now());
            post.setStatus(postDetails.getStatus());
            
            return new ResponseEntity<>(postRepository.save(post), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Update a creator's post
    @PreAuthorize("hasAuthority('admin') or hasAuthority('event_organizer')")
    @PutMapping("/{id}")
    public ResponseEntity<Post> updatePost(@RequestParam int userId, @PathVariable int id, @RequestBody Post postDetails)
    {
        Optional<Post> postData = postRepository.findById(id);

        if (postData.isPresent()) {
            Post post = postData.get();

            if (post.getCreatedBy().getId() == userId) {

                post.setTitle(postDetails.getTitle());
                post.setDescription(postDetails.getDescription());
                post.setNotes(postDetails.getNotes());
                post.setPhotoUrl(postDetails.getPhotoUrl());
                post.setBuilding(postDetails.getBuilding());
                post.setDirections(postDetails.getDirections());
                post.setRoomNumber(postDetails.getRoomNumber());
                post.setFoodType(postDetails.getFoodType());
                post.setServingsMin(postDetails.getServingsMin());
                post.setServingsMax(postDetails.getServingsMax());
                post.setAvailableFrom(postDetails.getAvailableFrom());
                post.setAvailableUntil(postDetails.getAvailableUntil());
                post.setUpdatedAt(LocalDateTime.now());
                post.setStatus(postDetails.getStatus());

                return new ResponseEntity<>(postRepository.save(post), HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    // Delete post (soft delete by changing status)
    @PreAuthorize("hasAuthority('admin') or hasAuthority('event_organizer')")
    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deletePost(@PathVariable int id) {
        try {
            Optional<Post> post = postRepository.findById(id);
            if (post.isPresent()) {
                Post existingPost = post.get();
                existingPost.setStatus("closed");
                postRepository.save(existingPost);
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Recover post (bring back soft deleted posts)
    @PreAuthorize("hasAuthority('admin')")
    @PatchMapping("/{id}/recover")
    public ResponseEntity<HttpStatus> recoverPost(@PathVariable int id) {
        try {
            Optional<Post> post = postRepository.findById(id);
            if (post.isPresent()) {
                Post existingPost = post.get();
                existingPost.setStatus("active");
                postRepository.save(existingPost);
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    }
