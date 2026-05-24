package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findAllByOrderByCreatedAtDesc();
    Optional<Order> findByOrderCode(String orderCode);
    Optional<Order> findByOrderCodeIgnoreCaseAndCustomerEmailIgnoreCase(String orderCode, String customerEmail);

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.user WHERE o.id = :id")
    Optional<Order> findByIdWithUser(@Param("id") Long id);

    @Query("""
            SELECT o FROM Order o LEFT JOIN FETCH o.user
            WHERE LOWER(o.orderCode) = LOWER(:orderCode)
            AND LOWER(o.customerEmail) = LOWER(:customerEmail)
            """)
    Optional<Order> findByOrderCodeAndEmailWithUser(@Param("orderCode") String orderCode, @Param("customerEmail") String customerEmail);

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.user WHERE LOWER(o.orderCode) = LOWER(:orderCode)")
    Optional<Order> findByOrderCodeWithUser(@Param("orderCode") String orderCode);
}
