package bjbites.bjbites_springboot.controller;

import bjbites.bjbites_springboot.entity.Photo;
import bjbites.bjbites_springboot.entity.Post;
import bjbites.bjbites_springboot.repository.PhotoRepository;
import bjbites.bjbites_springboot.repository.PostRepository;
import bjbites.bjbites_springboot.service.PhotoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.NoSuchFileException;
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
    @Autowired
    private PhotoService photoService;


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
    @GetMapping("/url/")
    public ResponseEntity<Photo> getPhotoByUrl(@RequestParam String photoUrl) {
        Optional<Photo> photo = photoRepository.findByPhotoUrl(photoUrl);
        return photo.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> ResponseEntity.notFound().build());
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
    public ResponseEntity<Void> deletePhoto(@PathVariable int id) {
           try {
                photoService.deletePhoto(id);
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
           catch (NoSuchFileException e) {
               return new ResponseEntity<>(HttpStatus.NOT_FOUND);

           }

           catch (IOException e) {
               return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
           }
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