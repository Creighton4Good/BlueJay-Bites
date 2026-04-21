package cuff.cuff_springboot.controller;

import cuff.cuff_springboot.entity.Post;
import cuff.cuff_springboot.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
    
    // Get post by ID
    @GetMapping("/{id}")
    public ResponseEntity<Post> getPostById(@PathVariable int id) {
        Optional<Post> post = postRepository.findById(id);
        return post.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                   .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
    
    // Create new post
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
    @PutMapping("/{id}")
    public ResponseEntity<Post> updatePost(@PathVariable int id, @RequestBody Post postDetails) {
        Optional<Post> postData = postRepository.findById(id);
        
        if (postData.isPresent()) {
            Post post = postData.get();
            post.setTitle(postDetails.getTitle());
            post.setLocation(postDetails.getLocation());
            post.setDescription(postDetails.getDescription());
            post.setDietarySpecification(postDetails.getDietarySpecification());
            post.setAvailableFrom(postDetails.getAvailableFrom());
            post.setAvailableUntil(postDetails.getAvailableUntil());
            post.setStatus(postDetails.getStatus());
            
            return new ResponseEntity<>(postRepository.save(post), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    // Delete post (soft delete by changing status)
    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deletePost(@PathVariable int id) {
        try {
            Optional<Post> post = postRepository.findById(id);
            if (post.isPresent()) {
                Post existingPost = post.get();
                existingPost.setStatus("deleted");
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
