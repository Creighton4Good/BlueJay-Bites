package bjbites.bjbites_springboot.service;

import bjbites.bjbites_springboot.entity.Photo;
import bjbites.bjbites_springboot.entity.Post;
import bjbites.bjbites_springboot.repository.PhotoRepository;
import bjbites.bjbites_springboot.repository.PostRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.nio.file.Paths;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

@Transactional
@Service
public class PhotoService {

    @Autowired
    private PhotoRepository photoRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private S3Client s3Client;

    // Bucket that holds uploaded event photos. Container storage is not durable,
    // so photos are kept in S3 rather than on local disk.
    @Value("${app.photo-bucket}")
    private String photoBucket;

    public Photo uploadPhoto(MultipartFile file, Integer postId) throws IOException {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        UUID fileName = saveImage(file);

        Photo photo = new Photo(post, "/api/uploads/photos/" + fileName);
        photo.setPost(post);
        photo.setDisplayOrder(photoRepository.countByPost(post));

        post.setPhotoUrl("/api/uploads/photos/" + fileName);
        postRepository.save(post);

        return photoRepository.save(photo);
    }

    // Upload the file to S3 under a random key and return that key.
    private UUID saveImage(MultipartFile file) throws IOException {
        String contentType = file.getContentType();
        if (!Objects.equals(contentType, "image/jpeg") && !Objects.equals(contentType, "image/png")) {
            throw new IllegalArgumentException("Only JPEG or PNG images are allowed");
        }

        UUID randomFileName = UUID.randomUUID();

        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(photoBucket)
                .key(String.valueOf(randomFileName))
                .contentType(contentType)
                .build();

        s3Client.putObject(request, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

        return randomFileName;
    }

    // Read a photo back out of S3. Returns null when the key does not exist.
    public ResponseBytes<GetObjectResponse> getImage(String fileName) {
        try {
            GetObjectRequest request = GetObjectRequest.builder()
                    .bucket(photoBucket)
                    .key(fileName)
                    .build();

            return s3Client.getObjectAsBytes(request);
        } catch (NoSuchKeyException e) {
            return null;
        }
    }

    public void deletePhoto(int id) throws IOException {
        Optional<Photo> photo = photoRepository.findById(id);

        if (photo.isPresent()) {
            Photo existingPhoto = photo.get();

            String fileName = Paths.get(existingPhoto.getPhotoUrl())
                    .getFileName()
                    .toString();

            DeleteObjectRequest request = DeleteObjectRequest.builder()
                    .bucket(photoBucket)
                    .key(fileName)
                    .build();

            s3Client.deleteObject(request);

            Post post = existingPhoto.getPost();
            photoRepository.delete(existingPhoto);

            if (Objects.equals(post.getPhotoUrl(), "/api/uploads/photos/" + fileName)) {
                Optional<Photo> replacement = photoRepository
                        .findFirstByPostOrderByDisplayOrderDescIdDesc(post);

                if (replacement.isPresent()) {
                    Photo replacementPhoto = replacement.get();
                    post.setPhotoUrl(replacementPhoto.getPhotoUrl());
                }
                else {
                    post.setPhotoUrl(null);
                }
            }

            postRepository.save(post);
        }
    }
}
