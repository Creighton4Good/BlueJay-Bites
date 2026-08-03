package bjbites.bjbites_springboot.service;

import bjbites.bjbites_springboot.entity.Post;
import bjbites.bjbites_springboot.repository.PostRepository;
import bjbites.bjbites_springboot.config.EventConstants;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Periodically closes events whose availableUntil time has passed but whose
 * status is still "active", so the stored status reflects reality and expired
 * events show up under closed events rather than falling into a gap.
 */
@Service
public class EventStatusService {

    private final PostRepository postRepository;

    public EventStatusService(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    // Runs every 10 minutes. fixedRate is in milliseconds.
    @Scheduled(fixedRate = 600000)
    public void closeExpiredEvents() {
        LocalDateTime now = LocalDateTime.now();
        // Wait out the same grace period the active feed uses before closing,
        // so an event isn't pulled from the feed before its countdown ends.
        LocalDateTime cutoff = now.minusMinutes(EventConstants.GRACE_PERIOD_MINUTES);
        List<Post> expired = postRepository.findExpiredActive("active", cutoff);
        for (Post post : expired) {
            post.setStatus("closed");
            post.setUpdatedAt(now);
        }
        if (!expired.isEmpty()) {
            postRepository.saveAll(expired);
        }
    }
}
