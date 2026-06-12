package bjbites.bjbites_springboot.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "dietary_options")
public class DietaryOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "option_name", nullable = false, unique = true)
    private String optionName;

    protected DietaryOption() {}

    public DietaryOption(String optionName) {
        this.optionName = optionName;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getOptionName() { return optionName; }
    public void setOptionName(String optionName) { this.optionName = optionName; }
}
