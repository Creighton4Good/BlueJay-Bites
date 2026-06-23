package bjbites.bjbites_springboot.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Integer id;

        @ManyToOne
        @JoinColumn(name = "user_id", nullable = false)
        private User user;

        @ManyToOne
        @JoinColumn(name = "post_id", nullable = false)
        private Post post;

        @Column(nullable = false)
        private String type;

        @Column(name = "is_read", nullable = false)
        private Boolean isRead = false;

        @Column(name = "created_at", nullable = false)
        private LocalDateTime createdAt = LocalDateTime.now();

        protected Notification() {}

        public Notification(User user, Post post, String type) {
            this.user = user;
            this.post = post;
            this.type = type;
            this.isRead = false;
            this.createdAt = LocalDateTime.now();
        }

        public Integer getId() {return id;}
        public void setId(Integer id) {this.id = id;}

        public User getUser() {return user;}
        public void setUser(User user) {this.user = user;}

        public Post getPost() {return post;}
        public void setPost(Post post) {this.post = post;}

        public String getType() {return type;}
        public void setType(String type) {this.type = type;}

        public Boolean getIsRead() {return isRead;}
        public void setIsRead(Boolean isRead) {this.isRead = isRead;}

        public LocalDateTime getCreatedAt() {return createdAt;}
        public void setCreatedAt(LocalDateTime createdAt) {this.createdAt = createdAt;}


        }