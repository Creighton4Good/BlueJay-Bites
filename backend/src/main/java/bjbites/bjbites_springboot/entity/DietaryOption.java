package bjbites.bjbites_springboot.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "dietary_options")
public class DietaryOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "option_name", nullable = false, unique = true)
    private String optionName;

    @ManyToMany(mappedBy = "dietaryOptions")
    @JsonIgnoreProperties("dietaryOptions")
    private Set<Post> posts = new HashSet<>();

    protected DietaryOption() {}

    public DietaryOption(String optionName) {
        this.optionName = optionName;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getOptionName() { return optionName; }
    public void setOptionName(String optionName) { this.optionName = optionName; }

    public Set<Post> getPosts() { return posts; }
    public void setPosts(Set<Post> posts) { this.posts = posts; }
}
