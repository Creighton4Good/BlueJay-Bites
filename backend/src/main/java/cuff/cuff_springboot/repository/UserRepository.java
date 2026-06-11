package cuff.cuff_springboot.repository;

import cuff.cuff_springboot.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByEmail(String email);
    Optional<User> findByEntraId(String entraId);
    List<User> findByRole_Id(Integer roleId);
}
