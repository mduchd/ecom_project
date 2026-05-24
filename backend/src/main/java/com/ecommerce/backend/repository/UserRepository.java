package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Boolean existsByUsername(String username);
    Boolean existsByEmail(String email);

    @Query("select coalesce(sum(u.pointsBalance), 0) from User u")
    Long sumActivePoints();

    @Query("select count(u) from User u where u.pointsBalance > 0")
    long countUsersWithPoints();
}
