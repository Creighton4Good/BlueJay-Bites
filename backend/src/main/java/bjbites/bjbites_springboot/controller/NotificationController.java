package bjbites.bjbites_springboot.controller;

import bjbites.bjbites_springboot.entity.Notification;
import bjbites.bjbites_springboot.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    // Get all notifications
    @PreAuthorize("hasAuthority('admin')")
    @GetMapping("/all")
    public ResponseEntity<List<Notification>> getAllNotifications() {
        List<Notification> notifications = notificationRepository.findByOrderByCreatedAtDesc();
        return new ResponseEntity<>(notifications, HttpStatus.OK);
    }

    // Get notification by id
    @PreAuthorize("hasAuthority('admin')")
    @GetMapping("/{id}")
    public ResponseEntity<Notification> getNotificationById(@PathVariable int id) {
        Optional<Notification> notification = notificationRepository.findById(id);
        return notification.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Get all unread notifications
    @PreAuthorize("hasAuthority('admin')")
    @GetMapping("/unread")
    public ResponseEntity<List<Notification>> getAllUnread() {
        List<Notification> notifications = notificationRepository.findByIsReadOrderByCreatedAtDesc(false);
        return new ResponseEntity<>(notifications, HttpStatus.OK);
    }

    // Get all read notifications
    @PreAuthorize("hasAuthority('admin')")
    @GetMapping("/read")
    public ResponseEntity<List<Notification>> getAllRead() {
        List<Notification> notifications = notificationRepository.findByIsReadOrderByCreatedAtDesc(true);
        return new ResponseEntity<>(notifications, HttpStatus.OK);
    }

    // Change notification status to read (for a specific user)
    @PatchMapping("/{id}/read")
    public ResponseEntity<HttpStatus> readNotification(@PathVariable int id) {
            // TODO: Ensure spring security checks authenticated user
            Optional<Notification> notification = notificationRepository.findById(id);

            if (notification.isPresent()) {
                Notification existingNotification = notification.get();
                existingNotification.setIsRead(true);
                notificationRepository.save(existingNotification);
                return new ResponseEntity<>(HttpStatus.OK); }
            else
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }