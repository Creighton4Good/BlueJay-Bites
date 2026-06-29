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
import org.springframework.web.server.ResponseStatusException;

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

    // Get all photos for a post (by display order)
    @GetMapping("/post/{postId}")
    public ResponseEntity<List<Photo>> getEventPhotos(@PathVariable Integer postId, @RequestParam Integer displayOrder) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        List<Photo> photoOrder = photoRepository.findByPostAndDisplayOrder(post, displayOrder);
        return new ResponseEntity<>(photoOrder, HttpStatus.OK); }

    }