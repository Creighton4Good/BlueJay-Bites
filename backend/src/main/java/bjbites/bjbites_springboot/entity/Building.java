package bjbites.bjbites_springboot.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "buildings")
public class Building {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "building_name", nullable = false, unique = true)
    private String buildingName;

    private Double latitude;

    private Double longitude;

    protected Building() {}

    public Building(String buildingName, Double latitude, Double longitude) {
        this.buildingName = buildingName;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getBuildingName() { return buildingName; }
    public void setBuildingName(String buildingName) { this.buildingName = buildingName; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
}
