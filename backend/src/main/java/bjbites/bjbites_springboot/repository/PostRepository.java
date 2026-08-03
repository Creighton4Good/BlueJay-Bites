package bjbites.bjbites_springboot.repository;

import bjbites.bjbites_springboot.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Integer> {
    List<Post> findByOrderByCreatedAtDesc();
    List<Post> findByStatusOrderByCreatedAtDesc(String status);
    List<Post> findByCreatedBy_IdOrderByCreatedAtDesc(Integer userId);

    // Active events that have not yet passed the grace cutoff.
    // Events with no end time (availableUntil is null) are always included.
    // Events still keep showing for a grace window after their end time so the
    // frontend can show a countdown rather than removing them instantly.
    @Query("SELECT p FROM Post p WHERE p.status = :status " +
           "AND (p.availableUntil IS NULL OR p.availableUntil > :cutoff) " +
           "ORDER BY p.createdAt DESC")
    List<Post> findActiveWithinGrace(@Param("status") String status,
                                     @Param("cutoff") LocalDateTime cutoff);

    // Events still marked active whose end time has passed. Used to close them out.
    @Query("SELECT p FROM Post p WHERE p.status = :status " +
           "AND p.availableUntil IS NOT NULL AND p.availableUntil < :cutoff")
    List<Post> findExpiredActive(@Param("status") String status,
                                 @Param("cutoff") LocalDateTime cutoff);
}
