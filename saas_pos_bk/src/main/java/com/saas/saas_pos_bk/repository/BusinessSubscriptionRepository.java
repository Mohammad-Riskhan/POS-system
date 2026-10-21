package com.saas.saas_pos_bk.repository;

import com.saas.saas_pos_bk.entity.BusinessSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BusinessSubscriptionRepository extends JpaRepository<BusinessSubscription, Long> {

    @Query("SELECT bs FROM BusinessSubscription bs WHERE bs.business.bId = :businessId AND bs.status = :status ORDER BY bs.endDate DESC")
    Optional<BusinessSubscription> findFirstByBusinessBIdAndStatusOrderByEndDateDesc(
        @Param("businessId") Long businessId, 
        @Param("status") String status
    );

    @Query("SELECT bs FROM BusinessSubscription bs WHERE bs.business.bId = :businessId ORDER BY bs.startDate DESC")
    List<BusinessSubscription> findByBusinessBIdOrderByStartDateDesc(
        @Param("businessId") Long businessId
    );

    @Query("SELECT bs FROM BusinessSubscription bs WHERE bs.business.bId = :businessId AND bs.status = :status")
    List<BusinessSubscription> findByBusinessBIdAndStatus(
        @Param("businessId") Long businessId, 
        @Param("status") String status
    );

    @Query("SELECT bs FROM BusinessSubscription bs WHERE bs.business.bId = :businessId ORDER BY bs.endDate DESC")
    Optional<BusinessSubscription> findFirstByBusinessBIdOrderByEndDateDesc(
        @Param("businessId") Long businessId
    );

    List<BusinessSubscription> findAllByStatus(String status);
}

