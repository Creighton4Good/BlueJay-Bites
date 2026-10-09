package bjbites.bjbites_springboot.controller;

import bjbites.bjbites_springboot.entity.Photo;
import bjbites.bjbites_springboot.service.PhotoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;

import java.io.IOException;

@RestController
@RequestMapping("/api/uploads")
public class PhotoUploadController {

    @Autowired
    private PhotoService photoService;

    // Upload photo
    @PreAuthorize("hasAuthority('admin') or hasAuthority('event_organizer')")
    @PostMapping("/photos")
    public ResponseEntity<Photo> uploadPhoto(@RequestParam("file") MultipartFile file, @RequestParam("postId") Integer postId) {
        try {
            Photo photo = photoService.uploadPhoto(file, postId);
            return ResponseEntity.status(HttpStatus.CREATED).body(photo);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get photo. The file lives in S3, so it is read back and streamed to the
    // caller rather than served off local disk.
    @GetMapping("/photos/{filename}")
    public ResponseEntity<Resource> getImage(@PathVariable String filename) {
        ResponseBytes<GetObjectResponse> object = photoService.getImage(filename);

        if (object == null) {
            return ResponseEntity.notFound().build();
        }

        String contentType = object.response().contentType();

        return ResponseEntity.ok()
                .contentType(contentType != null
                        ? MediaType.parseMediaType(contentType)
                        : MediaType.IMAGE_JPEG)
                .body(new ByteArrayResource(object.asByteArray()));
    }
}
