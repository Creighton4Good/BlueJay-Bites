package cuff.cuff_springboot.repository;

import cuff.cuff_springboot.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PostRepository extends JpaRepository<Post, Integer> {
    List<Post> findByStatus(String status);
   // Optional<Post> findById(int id);
    List<Post> orderByCreatedAtDesc();
    List<Post> findByStatusOrderByCreatedAtDesc(String status);
    List<Post> findByCreatedBy_Id(Integer userId);
}
