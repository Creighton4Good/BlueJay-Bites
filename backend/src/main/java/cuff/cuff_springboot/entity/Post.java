package cuff.cuff_springboot.entity;

import jakarta.persistence.*;

import java.math.BigInteger;
import java.time.LocalDateTime;

@Entity
@Table(name = "posts")
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private int id;

    @Column(name = "title")
    private String title;

    @Column(name = "description")
    private String description;

    @Column(name = "notes")
    private String notes;
    
   @Column(name = "photo_url")
   private String photoUrl;

   @Column(name = "building_id")
   private int buildingId;

    @Column(name = "directions")
    private String directions;

    @Column(name = "room_number")
    private String roomNumber;

    @Column(name = "food_type_id")
    private int foodTypeId;

    @Column(name = "servings_min")
    private int servingsMin;

    @Column(name = "servings_max")
    private int servingsMax;

    @Column(name = "expiration_time")
    private LocalDateTime expirationTime;

    @Column(name = "status")
    private String status;

    @Column(name = "created_by")
    private int createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Constructors
    protected Post() {}
    
    public Post(int id, String title, String description, String notes, String photoUrl,
               int buildingId, String directions, String roomNumber, int foodTypeId,
                int servingsMin, int servingsMax, LocalDateTime expirationTime, String status,
                int createdBy, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.notes = notes;
        this.photoUrl = photoUrl;
        this.buildingId = buildingId;
        this.directions = directions;
        this.roomNumber = roomNumber;
        this.foodTypeId = foodTypeId;
        this.servingsMin = servingsMin;
        this.servingsMax = servingsMax;
        this.expirationTime = expirationTime;
        this.status = "active";
        this.createdBy = createdBy;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    
    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }


    public int getBuildingId() { return buildingId; }
    public void setBuildingId(int buildingId) { this.buildingId = buildingId; }

    public String getDirections() { return directions; }
    public void setDirections(String directions) { this.directions = directions; }

    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }

    public int getFoodTypeId() { return foodTypeId; }
    public void setFoodTypeId(int foodTypeId) { this.foodTypeId = foodTypeId; }

    public int getServingsMin() { return servingsMin; }
    public void setServingsMin(int servingsMin) { this.servingsMin = servingsMin; }

    public int getServingsMax() { return servingsMax; }
    public void setServingsMax(int servingsMax) { this.servingsMax = servingsMax; }

    public LocalDateTime getExpirationTime() {return expirationTime;}
    public void setExpirationTime(LocalDateTime expirationTime) {this.expirationTime = expirationTime;}

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public int getCreatedBy() { return createdBy; }
    public void setCreatedBy(int createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
