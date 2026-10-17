package com.saas.saas_pos_bk.controller;

import com.saas.saas_pos_bk.dto.BusinessAnalyticsResponseDTO;
import com.saas.saas_pos_bk.service.AnalyticsService;
import com.saas.saas_pos_bk.util.SecurityUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/business/analytics")
@PreAuthorize("hasAnyRole('OWNER', 'BUSINESS_OWNER')")
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final SecurityUtils securityUtils;

    public AnalyticsController(AnalyticsService analyticsService, SecurityUtils securityUtils) {
        this.analyticsService = analyticsService;
        this.securityUtils = securityUtils;
    }

    @GetMapping
    public ResponseEntity<BusinessAnalyticsResponseDTO> getBusinessAnalytics() {
        Long businessId = securityUtils.getCurrentBusinessId();
        BusinessAnalyticsResponseDTO analytics = analyticsService.getBusinessAnalytics(businessId);
        return ResponseEntity.ok(analytics);
    }
}
