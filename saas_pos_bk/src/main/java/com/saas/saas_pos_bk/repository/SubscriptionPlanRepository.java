package com.saas.saas_pos_bk.repository;

import com.saas.saas_pos_bk.entity.SubscriptionPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, Long> {

    Optional<SubscriptionPlan> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCaseAndPlanIdNot(String name, Long planId);

    List<SubscriptionPlan> findAllByOrderByCreatedAtDesc();

    List<SubscriptionPlan> findByIsActiveTrue();
}
