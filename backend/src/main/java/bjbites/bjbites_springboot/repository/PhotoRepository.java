package bjbites.bjbites_springboot.repository;

import bjbites.bjbites_springboot.entity.Photo;
import bjbites.bjbites_springboot.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PhotoRepository extends JpaRepository<Photo, Integer> {
    Optional<Photo> findByPhotoUrl(String photoUrl);
    List<Photo> findByPostOrderByDisplayOrderAsc(Post post);
    int countByPost(Post post);
    Optional<Photo> findFirstByPostOrderByDisplayOrderAsc(Post post);
}
