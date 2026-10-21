package com.saas.saas_pos_bk.controller;

import com.saas.saas_pos_bk.dto.subscription.AssignSubscriptionRequestDTO;
import com.saas.saas_pos_bk.dto.subscription.BusinessSubscriptionResponseDTO;
import com.saas.saas_pos_bk.dto.subscription.SubscriptionPlanRequestDTO;
import com.saas.saas_pos_bk.dto.subscription.SubscriptionPlanResponseDTO;
import com.saas.saas_pos_bk.service.SubscriptionPlanService;
import com.saas.saas_pos_bk.service.SubscriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/subscriptions")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('OWNER', 'SUPER_ADMIN')")
public class AdminSubscriptionController {

    private final SubscriptionPlanService subscriptionPlanService;
    private final SubscriptionService subscriptionService;

    @PostMapping("/plans")
    public ResponseEntity<SubscriptionPlanResponseDTO> createPlan(@Valid @RequestBody SubscriptionPlanRequestDTO dto) {
        SubscriptionPlanResponseDTO plan = subscriptionPlanService.createPlan(dto);
        return new ResponseEntity<>(plan, HttpStatus.CREATED);
    }

    @GetMapping("/plans")
    public ResponseEntity<List<SubscriptionPlanResponseDTO>> getAllPlans() {
        return ResponseEntity.ok(subscriptionPlanService.getAllPlans());
    }

    @PutMapping("/plans/{id}")
    public ResponseEntity<SubscriptionPlanResponseDTO> updatePlan(
            @PathVariable Long id,
            @Valid @RequestBody SubscriptionPlanRequestDTO dto
    ) {
        SubscriptionPlanResponseDTO plan = subscriptionPlanService.updatePlan(id, dto);
        return ResponseEntity.ok(plan);
    }

    @PatchMapping("/plans/{id}/toggle")
    public ResponseEntity<Void> togglePlanStatus(@PathVariable Long id) {
        subscriptionPlanService.togglePlanStatus(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/assign")
    public ResponseEntity<BusinessSubscriptionResponseDTO> assignSubscription(
            @Valid @RequestBody AssignSubscriptionRequestDTO dto
    ) {
        BusinessSubscriptionResponseDTO response = subscriptionService.assignSubscription(dto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/business/{businessId}/active")
    public ResponseEntity<BusinessSubscriptionResponseDTO> getActiveSubscription(@PathVariable Long businessId) {
        BusinessSubscriptionResponseDTO response = subscriptionService.getActiveSubscription(businessId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/business/{businessId}/history")
    public ResponseEntity<List<BusinessSubscriptionResponseDTO>> getSubscriptionHistory(@PathVariable Long businessId) {
        List<BusinessSubscriptionResponseDTO> history = subscriptionService.getSubscriptionHistory(businessId);
        return ResponseEntity.ok(history);
    }
}
