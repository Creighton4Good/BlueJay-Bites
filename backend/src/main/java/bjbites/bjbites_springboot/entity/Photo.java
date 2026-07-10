package bjbites.bjbites_springboot.entity;


import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "post_photos")
public class Photo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @Column(name = "photo_url", nullable = false)
    private String photoUrl;

    @Column(name = "display_order")
    private Integer displayOrder;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    protected Photo() {}

    public Photo(Post post, String photoUrl) {
        this.post = post;
        this.photoUrl = photoUrl;
        this.displayOrder = 0;
        this.createdAt = LocalDateTime.now();
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Post getPost() {return post;}
    public void setPost(Post post) {this.post = post;}

    public String getPhotoUrl() { return photoUrl;}
    public void setPhotoUrl(String photoUrl) {this.photoUrl = photoUrl;}

    public Integer getDisplayOrder() {return displayOrder;}
    public void setDisplayOrder(Integer displayOrder) {this.displayOrder = displayOrder;}

    public LocalDateTime getCreatedAt() {return createdAt;}
    public void setCreatedAt(LocalDateTime createdAt) {this.createdAt = createdAt;}

}
