package bjbites.bjbites_springboot.controller;

import bjbites.bjbites_springboot.entity.Post;
import bjbites.bjbites_springboot.repository.PostRepository;
import bjbites.bjbites_springboot.repository.UserRepository;
import bjbites.bjbites_springboot.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import bjbites.bjbites_springboot.entity.User;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

/**
 * PostController class for endpoints when managing post views, creation, updates,
 * and deletion
 */
@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "*") // Configure this properly for production
public class PostController {
    
    @Autowired
    private PostRepository postRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private NotificationService notificationService;
    @Autowired
    private bjbites.bjbites_springboot.service.UserProvisioningService userProvisioningService;

    // How long an event keeps showing in the feed after its availableUntil time
    // passes, so the frontend can display a countdown before it disappears.
    private static final long GRACE_PERIOD_MINUTES = 5;

    // Get all active posts (excludes events whose availableUntil passed more than
    // the grace period ago; events with no end time always show)
    /**
     * Get all active posts
     * @return a {@code ResponseEntity} containing the active posts with {@code 200 OK}
     */
    @GetMapping("/active")
    public ResponseEntity<List<Post>> getAllActivePosts() {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(GRACE_PERIOD_MINUTES);
        List<Post> posts = postRepository.findActiveWithinGrace("active", cutoff);
        return new ResponseEntity<>(posts, HttpStatus.OK);
    }

    // Get all closed posts
    /**
     * Get all closed posts
     * @return a {@code ResponseEntity} containing the closed posts with {@code 200 OK}
     */
    @PreAuthorize("hasAuthority('admin')")
    @GetMapping("/closed")
    public ResponseEntity<List<Post>> getAllClosedPosts() {
        List<Post> posts = postRepository.findByStatusOrderByCreatedAtDesc("closed");
        return new ResponseEntity<>(posts, HttpStatus.OK);
    }


    // Get post by ID (active or closed)
    /**
     * Get post by ID (active or closed)
     * @param id the ID of the post to retrieve
     * @return a {@code ResponseEntity} containing the post by ID with {@code 200 OK},
     *      or {@code 404 Not Found} if no post exists with the specified ID
     */
    @PreAuthorize("hasAuthority('admin')")
    @GetMapping("/{id}")
    public ResponseEntity<Post> getPostById(@PathVariable int id) {
        Optional<Post> post = postRepository.findById(id);
        return post.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                   .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Get only posts that they created
    /**
     * Get only posts that the user created
     * @param oAuthUser the authenticated user who created the post
     * @return a {@code ResponseEntity} containing the posts created by a specific user with {@code 200 OK}
     */
    @PreAuthorize("hasAuthority('admin') or hasAuthority('event_organizer')")
    @GetMapping("/created")
    public ResponseEntity<List<Post>> getCreatedPosts(@AuthenticationPrincipal OAuth2User oAuthUser) {
        User currentUser = userProvisioningService.getOrCreateUser(oAuthUser);

        List<Post> posts = postRepository.findByCreatedBy_IdOrderByCreatedAtDesc(currentUser.getId());

        return new ResponseEntity<>(posts, HttpStatus.OK);

    }

    // Get all posts (active and closed)
    /**
     * Get all posts (active and closed)
     * @return a {@code ResponseEntity} containing all posts with {@code 200 OK}
     */
    @PreAuthorize("hasAuthority('admin')")
    @GetMapping("/all")
    public ResponseEntity<List<Post>> getAllPosts() {
        List<Post> posts = postRepository.findByOrderByCreatedAtDesc();
        return new ResponseEntity<>(posts, HttpStatus.OK);

    }

    // Create new post
    /**
     * Create new post
     * @param post the post that is being created
     * @return a {@code ResponseEntity} containing the created post with {@code 201 Created},
     *      or {@code 500 Internal Server Error} if an unexpected error occurs
     */
    @PreAuthorize("hasAuthority('admin') or hasAuthority('event_organizer')")
    @PostMapping("/create")
    public ResponseEntity<Post> createPost(@RequestBody Post post) {
        try {

            User creator = userRepository.findById(post.getCreatedBy().getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            post.setCreatedBy(creator);

            Post savedPost = postRepository.save(post);

            List<User> users = userRepository.findByRoleRoleName("user");

           users.forEach(user ->
                    notificationService.createNotification(user, savedPost, "NEW_POST"));

                return new ResponseEntity<>(savedPost, HttpStatus.CREATED);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Update a post or creator's post
    /**
     * Update any post for admin, or a creator's post for organizer
     * @param id the ID of the post to update
     * @param postDetails the updated post details
     * @param oAuthUser the authenticated user who created the post
     * @return a {@code ResponseEntity} containing the updated post by admin or organizer with {@code 200 OK},
     *      or {@code 404 Not Found} if no post exists with the specified ID,
     *      or {@code 403 Forbidden} if the authenticated event organizer is not the owner of the post that is
     *      trying to be updated
     */
    @PreAuthorize("hasAuthority('admin') or hasAuthority('event_organizer')")
    @PutMapping()
    public ResponseEntity<Post> updatePost(@AuthenticationPrincipal OAuth2User oAuthUser, @PathVariable int id, @RequestBody Post postDetails)
    {
        User currentUser = userProvisioningService.getOrCreateUser(oAuthUser);

        Optional<Post> postData = postRepository.findById(id);

        if (postData.isPresent()) {
            Post post = postData.get();

            if (Objects.equals(currentUser.getRole().getRoleName(), "event_organizer")) {

                if (Objects.equals(post.getCreatedBy().getId(), currentUser.getId()))
                // TODO: Ensure user is authenticated
                {
                    post.setTitle(postDetails.getTitle());
                    post.setDescription(postDetails.getDescription());
                    post.setNotes(postDetails.getNotes());
                    post.setPhotoUrl(postDetails.getPhotoUrl());
                    post.setBuilding(postDetails.getBuilding());
                    post.setDirections(postDetails.getDirections());
                    post.setRoomNumber(postDetails.getRoomNumber());
                    post.setFoodType(postDetails.getFoodType());
                    post.setDietaryOptions(postDetails.getDietaryOptions());
                    post.setServingsMin(postDetails.getServingsMin());
                    post.setServingsMax(postDetails.getServingsMax());
                    post.setAvailableFrom(postDetails.getAvailableFrom());
                    post.setAvailableUntil(postDetails.getAvailableUntil());
                    post.setUpdatedAt(LocalDateTime.now());
                    post.setStatus(postDetails.getStatus());

                    return new ResponseEntity<>(postRepository.save(post), HttpStatus.OK);
                } else {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                }
            } else {
                post.setTitle(postDetails.getTitle());
                post.setDescription(postDetails.getDescription());
                post.setNotes(postDetails.getNotes());
                post.setPhotoUrl(postDetails.getPhotoUrl());
                post.setBuilding(postDetails.getBuilding());
                post.setDirections(postDetails.getDirections());
                post.setRoomNumber(postDetails.getRoomNumber());
                post.setFoodType(postDetails.getFoodType());
                post.setDietaryOptions(postDetails.getDietaryOptions());
                post.setServingsMin(postDetails.getServingsMin());
                post.setServingsMax(postDetails.getServingsMax());
                post.setAvailableFrom(postDetails.getAvailableFrom());
                post.setAvailableUntil(postDetails.getAvailableUntil());
                post.setUpdatedAt(LocalDateTime.now());
                post.setStatus(postDetails.getStatus());
            }

        }
        return ResponseEntity.notFound().build();

    }

    // Delete a post or creator's post (soft delete by changing status)
    /**
     * Delete any post for admin, or a creator's post for organizer (soft delete by changing status)
     * @param id the ID of the post to delete
     * @param oAuthUser the authenticated user who created the post
     * @return {@code 204 No Content} if post is successfully deleted by admin or owner,
     *      or {@code 404 Not Found} if no post exists with the specified ID,
     *      or {@code 403 Forbidden} if the authenticated event organizer is not the owner of the post that is
     *      trying to be deleted
     */
    @PreAuthorize("hasAuthority('admin') or hasAuthority('event_organizer')")
    @DeleteMapping()
    public ResponseEntity<Void> deletePost(@AuthenticationPrincipal OAuth2User oAuthUser, @PathVariable int id) {
        User currentUser = userProvisioningService.getOrCreateUser(oAuthUser);

        Optional<Post> postData = postRepository.findById(id);

            if (postData.isPresent()) {
                Post existingPost = postData.get();

                if (Objects.equals(currentUser.getRole().getRoleName(), "event_organizer")) {


                if (Objects.equals(existingPost.getCreatedBy().getId(), currentUser.getId()))
                // TODO: Ensure user is authenticated
                {
                existingPost.setStatus("closed");
                postRepository.save(existingPost);
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }
        else {
                    existingPost.setStatus("closed");
                    postRepository.save(existingPost);
                    return ResponseEntity.noContent().build();
                }
                }
        return ResponseEntity.notFound().build();
    }

    // Recover any post (bring back soft deleted posts)
    /**
     * Recover any post (bring back soft deleted posts)
     * @param id the ID of the post to recover
     * @return {@code 200 OK} if post is successfully recovered,
     *      or {@code 404 Not Found} if no post exists with the specified ID,
     *      or {@code 500 Internal Server Error} if an unexpected error occurs
     */
    @PreAuthorize("hasAuthority('admin')")
    @PatchMapping("/{id}/recover")
    public ResponseEntity<Void> recoverPost(@PathVariable int id) {
        try {
            Optional<Post> post = postRepository.findById(id);
            if (post.isPresent()) {
                Post existingPost = post.get();
                existingPost.setStatus("active");
                postRepository.save(existingPost);
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    }
