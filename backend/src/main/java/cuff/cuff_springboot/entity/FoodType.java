package cuff.cuff_springboot.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "food_types")
public class FoodType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "type_name", nullable = false, unique = true)
    private String typeName;

    protected FoodType() {}

    public FoodType(String typeName) {
        this.typeName = typeName;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getTypeName() { return typeName; }
    public void setTypeName(String typeName) { this.typeName = typeName; }
}
