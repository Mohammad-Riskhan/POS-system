package com.saas.saas_pos_bk.service;

import com.saas.saas_pos_bk.dto.subscription.AssignSubscriptionRequestDTO;
import com.saas.saas_pos_bk.dto.subscription.BusinessSubscriptionResponseDTO;

import java.util.List;

public interface SubscriptionService {

    BusinessSubscriptionResponseDTO assignSubscription(AssignSubscriptionRequestDTO dto);

    BusinessSubscriptionResponseDTO getActiveSubscription(Long businessId);

    List<BusinessSubscriptionResponseDTO> getSubscriptionHistory(Long businessId);

    boolean isBusinessSubscriptionActive(Long businessId);
}
