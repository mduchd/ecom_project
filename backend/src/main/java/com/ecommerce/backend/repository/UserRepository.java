package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.ERole;
import com.ecommerce.backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
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

    List<User> findAllByOrderByIdDesc();

    @Query("SELECT COUNT(DISTINCT u) FROM User u JOIN u.roles r WHERE r.name = :role AND u.enabled = true")
    long countEnabledAdmins(@Param("role") ERole role);

    @Query("""
            SELECT u FROM User u
            WHERE (:search IS NULL OR :search = '' OR
                   LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%')) OR
                   LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) OR
                   LOWER(COALESCE(u.fullName, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR
                   LOWER(COALESCE(u.phoneNumber, '')) LIKE LOWER(CONCAT('%', :search, '%')))
            AND (
                :role IS NULL OR :role = '' OR :role = 'ALL' OR
                (:role = 'ADMIN' AND EXISTS (SELECT 1 FROM u.roles r WHERE r.name = com.ecommerce.backend.entity.ERole.ROLE_ADMIN)) OR
                (:role = 'USER' AND NOT EXISTS (SELECT 1 FROM u.roles r WHERE r.name = com.ecommerce.backend.entity.ERole.ROLE_ADMIN))
            )
            AND (
                :tier IS NULL OR :tier = '' OR :tier = 'ALL' OR
                (:tier = 'BRONZE' AND COALESCE(u.deliveredSpend, 0) < :silverMin) OR
                (:tier = 'SILVER' AND COALESCE(u.deliveredSpend, 0) >= :silverMin AND COALESCE(u.deliveredSpend, 0) < :goldMin) OR
                (:tier = 'GOLD' AND COALESCE(u.deliveredSpend, 0) >= :goldMin AND COALESCE(u.deliveredSpend, 0) < :diamondMin) OR
                (:tier = 'DIAMOND' AND COALESCE(u.deliveredSpend, 0) >= :diamondMin)
            )
            """)
    Page<User> findAdminUsers(@Param("search") String search,
                              @Param("role") String role,
                              @Param("tier") String tier,
                              @Param("silverMin") java.math.BigDecimal silverMin,
                              @Param("goldMin") java.math.BigDecimal goldMin,
                              @Param("diamondMin") java.math.BigDecimal diamondMin,
                              Pageable pageable);

    @Query("SELECT COUNT(u) FROM User u WHERE u.enabled = true")
    long countEnabledUsers();

    @Query("SELECT COUNT(DISTINCT u) FROM User u JOIN u.roles r WHERE r.name = :role")
    long countUsersWithRole(@Param("role") ERole role);

    @Query("SELECT COUNT(u) FROM User u WHERE u.pointsLocked = true")
    long countPointsLockedUsers();
}
