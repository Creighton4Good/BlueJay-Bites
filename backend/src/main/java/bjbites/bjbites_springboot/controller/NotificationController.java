package bjbites.bjbites_springboot.controller;

import bjbites.bjbites_springboot.entity.Notification;
import bjbites.bjbites_springboot.entity.User;
import bjbites.bjbites_springboot.repository.NotificationRepository;
import bjbites.bjbites_springboot.repository.UserRepository;
import bjbites.bjbites_springboot.service.NotificationSseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;
    @Autowired
    private NotificationSseService notificationSseService;
    @Autowired
    private UserRepository userRepository;

    // Get all notifications
    /**
     * Get all notifications
     * @return a {@code ResponseEntity} containing all the notifications with {@code 200 OK}
     */
    @PreAuthorize("hasAuthority('admin')")
    @GetMapping("/all")
    public ResponseEntity<List<Notification>> getAllNotifications() {
        List<Notification> notifications = notificationRepository.findByOrderByCreatedAtDesc();
        return new ResponseEntity<>(notifications, HttpStatus.OK);
    }

    // Get notification by id
    /**
     * Get notification by id
     * @param id the ID of the notification to retrieve
     * @return a {@code ResponseEntity} containing the notification by ID with {@code 200 OK},
     *          or {@code 404 Not Found} if no notification exists with specified ID
     */
    @PreAuthorize("hasAuthority('admin')")
    @GetMapping("/{id}")
    public ResponseEntity<Notification> getNotificationById(@PathVariable int id) {
        Optional<Notification> notification = notificationRepository.findById(id);
        return notification.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Get all unread notifications
    /**
     * Get all unread notifications
     * @return a {@code ResponseEntity} containing the unread notifications with {@code 200 OK}
     */
    @PreAuthorize("hasAuthority('admin')")
    @GetMapping("/unread")
    public ResponseEntity<List<Notification>> getAllUnread() {
        List<Notification> notifications = notificationRepository.findByIsReadOrderByCreatedAtDesc(false);
        return new ResponseEntity<>(notifications, HttpStatus.OK);
    }

    // Get all read notifications
    /**
     * Get all read notifications
     * @return a {@code ResponseEntity} containing the read notifications with {@code 200 OK}
     */
    @PreAuthorize("hasAuthority('admin')")
    @GetMapping("/read")
    public ResponseEntity<List<Notification>> getAllRead() {
        List<Notification> notifications = notificationRepository.findByIsReadOrderByCreatedAtDesc(true);
        return new ResponseEntity<>(notifications, HttpStatus.OK);
    }

    // Change notification status to read (for a specific user)
    /**
     * Update notification status to read
     * @param oAuthUser the authenticated user who created the notification
     * @return {@code 200 OK} if notification status is successfully changed to read
     *      or {@code 404 Not Found} if no notification exists with the specified ID
     */
    @PatchMapping("/me/read")
    public ResponseEntity<Void> readNotification(@AuthenticationPrincipal OAuth2User oAuthUser) {
        // TODO: Ensure user is authenticated
        User currentUser = userRepository.findByEmail(oAuthUser.getAttribute("email")).orElseThrow();

        Optional<Notification> notification = notificationRepository.findByUser_Id(currentUser.getId());

        if (notification.isPresent()) {
            Notification existingNotification = notification.get();
            existingNotification.setIsRead(true);
            notificationRepository.save(existingNotification);
            return ResponseEntity.ok().build(); }
        else
            return ResponseEntity.notFound().build();
    }

    // User subscribes to notifications
   @PreAuthorize("hasAuthority('user')")
    @GetMapping(value = "/subscribe/{userId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe(@AuthenticationPrincipal OAuth2User oAuthUser, @PathVariable Integer userId) {
        // TODO: Ensure user is authenticated
       User currentUser = userRepository.findByEmail(oAuthUser.getAttribute("email")).orElseThrow();

       return notificationSseService.subscribe(currentUser.getId()); }

    // TODO: Add GET /user endpoint for user to receive notifications that
    //  they missed when they were not on app/inactive

    // Temporary endpoint for testing SSE functionality
    @PostMapping("/test/{userId}")
    public ResponseEntity<String> testNotification(@PathVariable Integer userId) {

       Notification notification = new Notification();

       notificationSseService.publishNotification(userId, notification);

        return new ResponseEntity<>("Sent", HttpStatus.OK);
    }

}