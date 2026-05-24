package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
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

    @Query("""
            SELECT o FROM Order o
            WHERE (:statusGroup IS NULL OR
                   (:statusGroup = 'PENDING' AND LOWER(o.status) IN ('chờ duyệt', 'pending')) OR
                   (:statusGroup = 'PAID' AND LOWER(o.status) IN ('đã thanh toán', 'paid')) OR
                   (:statusGroup = 'SHIPPING' AND LOWER(o.status) IN ('đang giao', 'shipping', 'shipped')) OR
                   (:statusGroup = 'DELIVERED' AND LOWER(o.status) IN ('đã giao', 'delivered')) OR
                   (:statusGroup = 'CANCELED' AND LOWER(o.status) IN ('đã hủy', 'canceled', 'cancelled')))
            AND (:search IS NULL OR :search = '' OR
                 LOWER(o.orderCode) LIKE LOWER(CONCAT('%', :search, '%')) OR
                 LOWER(o.customerName) LIKE LOWER(CONCAT('%', :search, '%')) OR
                 LOWER(o.customerEmail) LIKE LOWER(CONCAT('%', :search, '%')) OR
                 LOWER(o.productSummary) LIKE LOWER(CONCAT('%', :search, '%')) OR
                 LOWER(o.paymentMethod) LIKE LOWER(CONCAT('%', :search, '%')))
            ORDER BY o.createdAt DESC
            """)
    Page<Order> findAdminOrders(@Param("statusGroup") String statusGroup, @Param("search") String search, Pageable pageable);

    @Query("SELECT COUNT(o) FROM Order o WHERE LOWER(o.status) IN ('chờ duyệt', 'pending', 'đã thanh toán', 'paid')")
    long countAwaitingActionOrders();

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE LOWER(o.status) IN ('đã giao', 'delivered')")
    BigDecimal sumDeliveredRevenue();

    @Query("""
            SELECT MONTH(o.createdAt), COALESCE(SUM(o.totalAmount), 0)
            FROM Order o
            WHERE LOWER(o.status) IN ('đã giao', 'delivered')
            AND YEAR(o.createdAt) = :year
            GROUP BY MONTH(o.createdAt)
            """)
    List<Object[]> sumDeliveredRevenueByMonth(@Param("year") int year);

    @Query("""
            SELECT COUNT(o) FROM Order o
            WHERE YEAR(o.createdAt) = :year AND MONTH(o.createdAt) = :month
            """)
    long countOrdersByMonth(@Param("year") int year, @Param("month") int month);

    @Query("""
            SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o
            WHERE LOWER(o.status) IN ('đã giao', 'delivered')
            AND YEAR(o.createdAt) = :year AND MONTH(o.createdAt) = :month
            """)
    BigDecimal sumDeliveredRevenueForMonth(@Param("year") int year, @Param("month") int month);
}
