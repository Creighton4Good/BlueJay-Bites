package bjbites.bjbites_springboot.repository;

import bjbites.bjbites_springboot.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Integer> {
    List<Post> findByStatus(String status);
    List<Post> findByOrderByCreatedAtDesc();
    List<Post> findByStatusOrderByCreatedAtDesc(String status);
    List<Post> findByCreatedBy_Id(Integer userId);
}
