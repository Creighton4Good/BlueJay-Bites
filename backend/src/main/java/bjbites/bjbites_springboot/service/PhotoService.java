package bjbites.bjbites_springboot.service;

import bjbites.bjbites_springboot.entity.Photo;
import bjbites.bjbites_springboot.entity.Post;
import bjbites.bjbites_springboot.repository.PhotoRepository;
import bjbites.bjbites_springboot.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Optional;

@Service
public class PhotoService {

    @Autowired
    private PhotoRepository photoRepository;
    @Autowired
    private PostRepository postRepository;
    @Value("${file.upload-dir}")
    private String uploadDir;


    public Photo uploadPhoto(MultipartFile file, Integer postId) throws IOException {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        // Save the file to the directory
        String fileName = saveImage(file);

        Photo photo = new Photo(post, "api/uploads/photos/" + fileName);
        photo.setPost(post);
        photo.setDisplayOrder(photoRepository.countByPost(post));
        post.setPhotoUrl("api/uploads/photos/" + fileName);

        return photoRepository.save(photo);

    }

    // Save photo
    private String saveImage(MultipartFile file) throws IOException {
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // TODO: Use a UUID for file storage to prevent overwriting images
        String fileName = file.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        return fileName;
    }

    public void deletePhoto(int id) throws IOException {
        Optional<Photo> photo = photoRepository.findById(id);
        if (photo.isPresent()) {
            Photo existingPhoto = photo.get();
            Files.delete(Paths.get(uploadDir)
                    .resolve(existingPhoto.getPhotoUrl()));
            photoRepository.delete(existingPhoto);
        }

    }


}
