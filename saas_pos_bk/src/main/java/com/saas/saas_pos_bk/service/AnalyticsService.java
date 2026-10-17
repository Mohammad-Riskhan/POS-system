package com.saas.saas_pos_bk.service;

import com.saas.saas_pos_bk.dto.BusinessAnalyticsResponseDTO;

public interface AnalyticsService {
    BusinessAnalyticsResponseDTO getBusinessAnalytics(Long businessId);
}
