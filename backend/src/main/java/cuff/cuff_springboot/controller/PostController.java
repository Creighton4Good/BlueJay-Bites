package cuff.cuff_springboot.controller;

import cuff.cuff_springboot.entity.Post;
import cuff.cuff_springboot.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "*") // Configure this properly for production
public class PostController {
    
    @Autowired
    private PostRepository postRepository;
    
    // Get all active posts
    @GetMapping
    public ResponseEntity<List<Post>> getAllActivePosts() {
        List<Post> posts = postRepository.findByStatusOrderByCreatedAtDesc("active");
        return new ResponseEntity<>(posts, HttpStatus.OK);
    }

    // Get all closed posts
    @PreAuthorize("hasRole('admin')")
    @GetMapping
    public ResponseEntity<List<Post>> getAllClosedPosts() {
        List<Post> posts = postRepository.findByStatusOrderByCreatedAtDesc("closed");
        return new ResponseEntity<>(posts, HttpStatus.OK);
    }

    
    // Get post by ID
    @PreAuthorize("hasRole('admin')")
    @GetMapping("/{id}")
    public ResponseEntity<Post> getPostById(@PathVariable int id) {
        Optional<Post> post = postRepository.findById(id);
        return post.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                   .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
    
    // Create new post
    @PreAuthorize("hasAnyRole('admin', 'event_organizer')")
    @PostMapping
    public ResponseEntity<Post> createPost(@RequestBody Post post) {
        try {
            Post savedPost = postRepository.save(post);
            // TODO: Trigger notification system here
            return new ResponseEntity<>(savedPost, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // Update post
    @PreAuthorize("hasAnyRole('admin', 'event_organizer')")
    @PutMapping("/{id}")
    public ResponseEntity<Post> updatePost(@PathVariable int id, @RequestBody Post postDetails) {
        Optional<Post> postData = postRepository.findById(id);
        
        if (postData.isPresent()) {
            Post post = postData.get();
            post.setID(postDetails.getID());
            post.setTitle(postDetails.getTitle());
            post.setDescription(postDetails.getDescription());
            post.setNotes(postDetails.getNotes());
            post.setPhotoURL(postDetails.getPhotoURL());
            post.setBuildingID(postDetails.getBuildingID());
            post.setDirections(postDetails.getDirections());
            post.setRoomNumber(postDetails.getRoomNumber());
            post.setFoodTypeID(postDetails.getFoodTypeID());
            post.setServingsMin(postDetails.getServingsMax());
            post.setServingsMax(postDetails.getServingsMax());
            post.setExpirationTime(postDetails.getExpirationTime());
            post.setCreatedBy(postDetails.getCreatedBy());
            post.setCreatedAt(postDetails.getCreatedAt());
            post.setUpdatedAt(postDetails.getUpdatedAt());
            post.setStatus(postDetails.getStatus());
            
            return new ResponseEntity<>(postRepository.save(post), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    // Delete post (soft delete by changing status)
    @PreAuthorize("hasAnyRole('admin', 'event_organizer')")
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
}
