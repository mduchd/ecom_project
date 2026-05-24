package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.PointTransaction;
import com.ecommerce.backend.entity.PointTransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PointTransactionRepository extends JpaRepository<PointTransaction, Long> {
    List<PointTransaction> findAllByOrderByCreatedAtDesc();

    List<PointTransaction> findByUserIdOrderByCreatedAtDesc(Long userId);

    boolean existsByOrderIdAndType(Long orderId, PointTransactionType type);

    @Query("""
            select coalesce(sum(t.points), 0)
            from PointTransaction t
            where t.type = :type
            """)
    Integer sumPointsByType(@Param("type") PointTransactionType type);
}
