package bjbites.bjbites_springboot.controller;

import bjbites.bjbites_springboot.entity.Photo;
import bjbites.bjbites_springboot.entity.Post;
import bjbites.bjbites_springboot.repository.PhotoRepository;
import bjbites.bjbites_springboot.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("api/post-photos")
@CrossOrigin(origins = "*")
public class PhotoController {

    @Autowired
    private PhotoRepository photoRepository;
    @Autowired
    private PostRepository postRepository;


    // Get all photos
    /**
     * Get all photos
     * @return a {@code ResponseEntity} containing all the photos with {@code 200 OK}
     */
    @PreAuthorize("hasAuthority('admin')")
    @GetMapping("/all")
    public ResponseEntity<List<Photo>> getAllPhotos() {
        List<Photo> photos = photoRepository.findAll();
        return new ResponseEntity<>(photos, HttpStatus.OK);
    }

    // Get photo by id
    /**
     * Get photo by id
     * @param id the ID of the photo to retrieve
     * @return a {@code ResponseEntity} containing the photo by ID with {@code 200 OK},
     *          or {@code 404 Not Found} if no photo exists with specified ID
     */
    @PreAuthorize("hasAuthority('admin')")
    @GetMapping("/{id}")
    public ResponseEntity<Photo> getPhotoById(@PathVariable int id) {
        Optional<Photo> photo = photoRepository.findById(id);
        return photo.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Get photo by url
    /**
     * Get photo by url
     * @param photoUrl the url of the photo to retrieve
     * @return a {@code ResponseEntity} containing the photo by url with {@code 200 OK},
     *          or {@code 404 Not Found} if no photo exists with specified url
     */
    @PreAuthorize("hasAuthority('admin')")
    @GetMapping("/url/{photoUrl}")
    public ResponseEntity<Photo> getPhotoByUrl(@PathVariable String photoUrl) {
        Optional<Photo> photo = photoRepository.findByPhotoUrl(photoUrl);
        return photo.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Create photo
    /**
     * Create new photo
     * @param photo the photo to create
     * @return a {@code ResponseEntity} containing the created photo with {@code 201 Created},
     *          or {@code 500 Internal Server Error} if an unexpected error occurs
     */
    @PreAuthorize("hasAuthority('admin') or hasAuthority('event_organizer')")
    @PostMapping("/create")
    public ResponseEntity<Photo> createPhoto(@RequestBody Photo photo) {
       // TODO: Support photo uploads & conversion
        Post post = postRepository.findById(photo.getPost().getId())
            .orElseThrow(() -> new RuntimeException("Post not found"));

        photo.setPost(post);

        photoRepository.save(photo);

        return new ResponseEntity<>(photo, HttpStatus.CREATED);
    }

    // Update photo (for changing uploads and display order changes)

    /**
     * Update photo
     * @param id the ID of the photo to update
     * @param photoDetails the updated photo details
     * @return a {@code ResponseEntity} containing the updated photos with {@code 200 OK},
     *      or {@code 404 Not Found} if no photo exists with specified ID
     */
    @PreAuthorize("hasAuthority('admin') or hasAuthority('event_organizer')")
    @PutMapping("/{id}")
    public ResponseEntity<Photo> updatePhoto(@PathVariable int id, @RequestBody Photo photoDetails) {
        Optional<Photo> photoData = photoRepository.findById(id);
        if (photoData.isPresent()) {
            Photo photo = photoData.get();
            photo.setPhotoUrl((photoDetails.getPhotoUrl()));
            photo.setDisplayOrder(photoDetails.getDisplayOrder());
            return new ResponseEntity<>(photoRepository.save(photo), HttpStatus.OK);
        }
        return ResponseEntity.notFound().build();
    }

    // Delete photo
    /**
     * Delete photo
     * @param id the ID of the photo to delete
     * @return {@code 204 No Content} if photo is successfully deleted,
     *          or {@code 404 Not Found} if no photo exists with specified ID
     */
    @PreAuthorize("hasAuthority('admin') or hasAuthority('event_organizer')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Photo> deletePhoto(@PathVariable int id) {
            Optional<Photo> photo = photoRepository.findById(id);
            if (photo.isPresent()) {
                Photo existingPhoto = photo.get();
                photoRepository.delete(existingPhoto);
                return ResponseEntity.noContent().build(); }
            else {
                return ResponseEntity.notFound().build(); }
        }

    // Get all photos for a post (by display order)
    /**
     * Get all photos for a post
     * @param postId the ID of the post for which to retrieve its photos
     * @return a {@code ResponseEntity} containing the photos list with {@code 200 OK}
     */
    @PreAuthorize("hasAuthority('admin') or hasAuthority('event_organizer')")
    @GetMapping("/post/{postId}")
    public ResponseEntity<List<Photo>> getEventPhotos(@PathVariable Integer postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        List<Photo> photoOrder = photoRepository.findByPostOrderByDisplayOrderAsc(post);
        return new ResponseEntity<>(photoOrder, HttpStatus.OK); }

    }