package com.saas.saas_pos_bk.service;

import com.saas.saas_pos_bk.dto.subscription.SubscriptionPlanRequestDTO;
import com.saas.saas_pos_bk.dto.subscription.SubscriptionPlanResponseDTO;

import java.util.List;

public interface SubscriptionPlanService {

    SubscriptionPlanResponseDTO createPlan(SubscriptionPlanRequestDTO dto);

    List<SubscriptionPlanResponseDTO> getAllPlans();

    SubscriptionPlanResponseDTO updatePlan(Long planId, SubscriptionPlanRequestDTO dto);

    void togglePlanStatus(Long planId);
}
