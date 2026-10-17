package com.saas.saas_pos_bk.repository;

import com.saas.saas_pos_bk.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {

    @Query("SELECT s FROM Supplier s WHERE s.business.bId = :bId")
    List<Supplier> findByBusinessBId(@Param("bId") Long bId);

    @Query("SELECT COUNT(s) FROM Supplier s WHERE s.business.bId = :bId")
    long countByBusinessBId(@Param("bId") Long bId);
}
