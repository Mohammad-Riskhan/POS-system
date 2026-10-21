package com.saas.saas_pos_bk.service.impl;

import com.saas.saas_pos_bk.dto.subscription.SubscriptionPlanRequestDTO;
import com.saas.saas_pos_bk.dto.subscription.SubscriptionPlanResponseDTO;
import com.saas.saas_pos_bk.entity.SubscriptionPlan;
import com.saas.saas_pos_bk.exception.BadRequestException;
import com.saas.saas_pos_bk.exception.ResourceNotFoundException;
import com.saas.saas_pos_bk.repository.SubscriptionPlanRepository;
import com.saas.saas_pos_bk.service.SubscriptionPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubscriptionPlanServiceImpl implements SubscriptionPlanService {

    private final SubscriptionPlanRepository subscriptionPlanRepository;

    @Override
    @Transactional
    public SubscriptionPlanResponseDTO createPlan(SubscriptionPlanRequestDTO dto) {
        if (subscriptionPlanRepository.existsByNameIgnoreCase(dto.getName().trim())) {
            throw new BadRequestException("Subscription plan with name '" + dto.getName().trim() + "' already exists");
        }

        SubscriptionPlan plan = SubscriptionPlan.builder()
                .name(dto.getName().trim())
                .description(dto.getDescription())
                .price(dto.getPrice())
                .billingCycle(dto.getBillingCycle().trim().toUpperCase())
                .maxCashiers(dto.getMaxCashiers())
                .maxItems(dto.getMaxItems())
                .isActive(true)
                .build();

        SubscriptionPlan saved = subscriptionPlanRepository.save(plan);
        return mapToDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubscriptionPlanResponseDTO> getAllPlans() {
        return subscriptionPlanRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public SubscriptionPlanResponseDTO updatePlan(Long planId, SubscriptionPlanRequestDTO dto) {
        SubscriptionPlan plan = subscriptionPlanRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription plan not found with id: " + planId));

        if (subscriptionPlanRepository.existsByNameIgnoreCaseAndPlanIdNot(dto.getName().trim(), planId)) {
            throw new BadRequestException("Another subscription plan with name '" + dto.getName().trim() + "' already exists");
        }

        plan.setName(dto.getName().trim());
        plan.setDescription(dto.getDescription());
        plan.setPrice(dto.getPrice());
        plan.setBillingCycle(dto.getBillingCycle().trim().toUpperCase());
        plan.setMaxCashiers(dto.getMaxCashiers());
        plan.setMaxItems(dto.getMaxItems());

        SubscriptionPlan updated = subscriptionPlanRepository.save(plan);
        return mapToDTO(updated);
    }

    @Override
    @Transactional
    public void togglePlanStatus(Long planId) {
        SubscriptionPlan plan = subscriptionPlanRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription plan not found with id: " + planId));

        plan.setIsActive(plan.getIsActive() == null || !plan.getIsActive());
        subscriptionPlanRepository.save(plan);
    }

    private SubscriptionPlanResponseDTO mapToDTO(SubscriptionPlan plan) {
        return SubscriptionPlanResponseDTO.builder()
                .planId(plan.getPlanId())
                .name(plan.getName())
                .description(plan.getDescription())
                .price(plan.getPrice())
                .billingCycle(plan.getBillingCycle())
                .maxCashiers(plan.getMaxCashiers())
                .maxItems(plan.getMaxItems())
                .isActive(plan.getIsActive())
                .build();
    }
}
