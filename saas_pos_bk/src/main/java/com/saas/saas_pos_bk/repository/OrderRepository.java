package com.saas.saas_pos_bk.repository;

import com.saas.saas_pos_bk.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query("SELECT o FROM Order o WHERE o.business.bId = :bId ORDER BY o.date DESC")
    List<Order> findByBusinessBIdOrderByDateDesc(@Param("bId") Long bId);

    @Query("SELECT o FROM Order o WHERE o.reference = :reference")
    Optional<Order> findByReference(@Param("reference") String reference);

    @Query("SELECT o FROM Order o WHERE o.reference = :reference AND o.business.bId = :bId")
    Optional<Order> findByReferenceAndBusinessBId(@Param("reference") String reference, @Param("bId") Long bId);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.business.bId = :bId")
    long countByBusinessBId(@Param("bId") Long bId);

    @Query("SELECT COALESCE(SUM(o.grandTotal), 0) FROM Order o WHERE o.business.bId = :bId")
    BigDecimal sumGrandTotalByBusiness(@Param("bId") Long bId);

    @Query("SELECT COALESCE(SUM(o.grandTotal), 0) FROM Order o")
    BigDecimal sumPlatformGrandTotal();

    @Query("SELECT o FROM Order o ORDER BY o.date DESC")
    List<Order> findAllOrderByDateDesc();
}
