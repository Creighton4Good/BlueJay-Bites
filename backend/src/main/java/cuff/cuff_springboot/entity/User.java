package cuff.cuff_springboot.entity;

import jakarta.persistence.*;

@Entity
@Table (name = "User")

public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    private int id;
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String notification_type;

    protected User(){}
        public User (int id, String firstName, String lastName, String email, String password, String notification_type){
            this.id = id;
            this.firstName = firstName;
            this.lastName = lastName;
            this.email = email;
            this.password = password;
            this.notification_type = notification_type;

}
public int getId() {
        return id;
    }
    public void setId(int id) {
        this.id = id;
    }
    public String getFirstName() {
        return firstName;
    }
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }
    public String getLastName() {
        return lastName;
    }
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public String getPassword() {
        return password;
    }
    public void setPassword(String password) {
        this.password = password;
    }
    public String getNotification_type() {
        return notification_type;
    }
    public void setNotification_type(String notification_type) {
        this.notification_type = notification_type;
    }
}


