package com.saas.saas_pos_bk.repository;

import com.saas.saas_pos_bk.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    @Query("SELECT oi FROM OrderItem oi WHERE oi.order.oId = :oId")
    List<OrderItem> findByOrderOId(@Param("oId") Long oId);
}
