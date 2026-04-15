package main.java.cuff.cuff_springboot.repository;

import cuff.cuff_springboot.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Integer> {
    List<Post> findByStatus(String status);
    List<Post> findByUserId(int userId);
    List<Post> findByStatusOrderByCreatedAtDesc(String status);
}
