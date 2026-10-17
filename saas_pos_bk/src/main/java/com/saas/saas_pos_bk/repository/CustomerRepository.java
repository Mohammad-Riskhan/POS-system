package com.saas.saas_pos_bk.repository;

import com.saas.saas_pos_bk.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    @Query("SELECT c FROM Customer c WHERE c.business.bId = :bId")
    List<Customer> findByBusinessBId(@Param("bId") Long bId);

    @Query("SELECT c FROM Customer c WHERE c.business.bId = :bId AND c.mobile LIKE %:mobile%")
    List<Customer> findByBusinessBIdAndMobileContaining(@Param("bId") Long bId, @Param("mobile") String mobile);

    @Query("SELECT c FROM Customer c WHERE c.business.bId = :bId AND LOWER(c.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Customer> findByBusinessBIdAndNameContainingIgnoreCase(@Param("bId") Long bId, @Param("name") String name);
}
