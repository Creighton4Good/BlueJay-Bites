package bjbites.bjbites_springboot.entity;


import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_preferences")
public class UserPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "notification_preference")
    private String notificationPreference = "on";

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    protected UserPreference() {}

    public UserPreference(User user) {
        this.user = user;
        this.notificationPreference = "in_app";
        this.updatedAt = LocalDateTime.now();
    }

    public Integer getId() {return id;}
    public void setId(Integer id) {this.id = id;}

    public User getUser() {return user;}
    public void setUser(User user) {this.user = user;}

    public String getNotificationPreference() {return notificationPreference;}
    public void setNotificationPreference(String notificationPreference)
    {this.notificationPreference = notificationPreference;}

    public LocalDateTime getUpdatedAt() {return updatedAt;}
    public void setUpdatedAt(LocalDateTime updatedAt) {this.updatedAt = updatedAt;}
}
