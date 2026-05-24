package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.PointTransaction;
import com.ecommerce.backend.entity.PointTransactionType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PointTransactionRepository extends JpaRepository<PointTransaction, Long> {
    List<PointTransaction> findAllByOrderByCreatedAtDesc();

    @Query("""
            select t
            from PointTransaction t
            join fetch t.user
            left join fetch t.order
            order by t.createdAt desc
            """)
    List<PointTransaction> findRecentWithUserAndOrder(Pageable pageable);

    List<PointTransaction> findByUserIdOrderByCreatedAtDesc(Long userId);

    boolean existsByOrderIdAndType(Long orderId, PointTransactionType type);

    @Query("""
            select coalesce(sum(t.points), 0)
            from PointTransaction t
            where t.type = :type
            """)
    Integer sumPointsByType(@Param("type") PointTransactionType type);

    @Query("""
            select coalesce(sum(abs(t.points)), 0)
            from PointTransaction t
            where t.type = :type
            """)
    Integer sumAbsolutePointsByType(@Param("type") PointTransactionType type);
}
