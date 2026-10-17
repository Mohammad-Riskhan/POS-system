package com.saas.saas_pos_bk.repository;

import com.saas.saas_pos_bk.entity.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {

    @Query("SELECT i FROM Item i WHERE i.business.bId = :bId")
    List<Item> findByBusinessBId(@Param("bId") Long bId);

    @Query("SELECT i FROM Item i WHERE i.business.bId = :bId AND LOWER(i.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Item> findByBusinessBIdAndNameContainingIgnoreCase(@Param("bId") Long bId, @Param("name") String name);

    @Query("SELECT COUNT(i) FROM Item i WHERE i.business.bId = :bId")
    long countByBusinessBId(@Param("bId") Long bId);
}
