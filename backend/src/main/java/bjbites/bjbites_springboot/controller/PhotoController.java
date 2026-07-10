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
    @PreAuthorize("hasAuthority('admin')")
    @GetMapping("/all")
    public ResponseEntity<List<Photo>> getAllPhotos() {
        List<Photo> photos = photoRepository.findAll();
        return new ResponseEntity<>(photos, HttpStatus.OK);
    }

    // Get photo by id
    @PreAuthorize("hasAuthority('admin')")
    @GetMapping("/{id}")
    public ResponseEntity<Photo> getPhotoById(@PathVariable int id) {
        Optional<Photo> photo = photoRepository.findById(id);
        return photo.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Get photo by url
    @PreAuthorize("hasAuthority('admin')")
    @GetMapping("/url/{photoUrl}")
    public ResponseEntity<Photo> getPhotoByUrl(@PathVariable String photoUrl) {
        Optional<Photo> photo = photoRepository.findByPhotoUrl(photoUrl);
        return photo.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Create photo
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
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    // Delete photo
    @PreAuthorize("hasAuthority('admin') or hasAuthority('event_organizer')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Photo> deletePhoto(@PathVariable int id) {
            Optional<Photo> photo = photoRepository.findById(id);
            if (photo.isPresent()) {
                Photo existingPhoto = photo.get();
                photoRepository.delete(existingPhoto);
                return new ResponseEntity<>(HttpStatus.NO_CONTENT); }
            else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND); }
        }

    // Get all photos for a post (by display order)
    @PreAuthorize("hasAuthority('admin') or hasAuthority('event_organizer')")
    @GetMapping("/post/{postId}")
    public ResponseEntity<List<Photo>> getEventPhotos(@PathVariable Integer postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        List<Photo> photoOrder = photoRepository.findByPostOrderByDisplayOrderAsc(post);
        return new ResponseEntity<>(photoOrder, HttpStatus.OK); }

    }