package com.saas.saas_pos_bk.repository;

import com.saas.saas_pos_bk.entity.BusinessSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BusinessSubscriptionRepository extends JpaRepository<BusinessSubscription, Long> {

    List<BusinessSubscription> findByBusinessBIdOrderByStartDateDesc(Long businessId);

    List<BusinessSubscription> findByBusinessBIdAndStatus(Long businessId, String status);

    Optional<BusinessSubscription> findFirstByBusinessBIdAndStatusOrderByEndDateDesc(Long businessId, String status);

    Optional<BusinessSubscription> findFirstByBusinessBIdOrderByEndDateDesc(Long businessId);

    List<BusinessSubscription> findAllByStatus(String status);
}
