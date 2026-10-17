package com.saas.saas_pos_bk.repository;

import com.saas.saas_pos_bk.entity.Batch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BatchRepository extends JpaRepository<Batch, Long> {

    @Query("SELECT b FROM Batch b WHERE b.business.bId = :bId ORDER BY b.date DESC")
    List<Batch> findByBusinessBId(@Param("bId") Long bId);

    @Query("SELECT b FROM Batch b WHERE b.business.bId = :bId AND b.item.itemId = :itemId AND b.qty > :qty ORDER BY b.date ASC")
    List<Batch> findByBusinessBIdAndItemItemIdAndQtyGreaterThanOrderByDateAsc(
            @Param("bId") Long bId,
            @Param("itemId") Long itemId,
            @Param("qty") Integer qty
    );

    @Query("SELECT b FROM Batch b WHERE b.item.itemId = :itemId AND b.business.bId = :bId AND b.qty > 0 ORDER BY b.date ASC")
    List<Batch> findActiveBatchesByItem(@Param("bId") Long bId, @Param("itemId") Long itemId);

    @Query("SELECT COALESCE(SUM(b.qty), 0) FROM Batch b WHERE b.item.itemId = :itemId AND b.business.bId = :bId")
    int getTotalStockForItem(@Param("bId") Long bId, @Param("itemId") Long itemId);

    @Query("SELECT COUNT(b) FROM Batch b WHERE b.business.bId = :bId")
    long countByBusinessBId(@Param("bId") Long bId);
}
