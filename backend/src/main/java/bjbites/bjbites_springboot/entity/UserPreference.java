package bjbites.bjbites_springboot.entity;


import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_preferences")
public class UserPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "notification_preference")
    private String notificationPreference = "on";

    private String description;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    protected UserPreference() {}

    public UserPreference(String description) {
        this.notificationPreference = "on";
        this.description = description;
        this.updatedAt = LocalDateTime.now();
    }

    public Integer getId() {return id;}
    public void setId(Integer id) {this.id = id;}

    public String getNotificationPreference() {return notificationPreference;}
    public void setNotificationPreference(String notificationPreference)
    {this.notificationPreference = notificationPreference;}

    public String getDescription() {return description;}
    public void setDescription(String description) {this.description = description;}

    public LocalDateTime getUpdatedAt() {return updatedAt;}
    public void setUpdatedAt(LocalDateTime updatedAt) {this.updatedAt = updatedAt;}
}
