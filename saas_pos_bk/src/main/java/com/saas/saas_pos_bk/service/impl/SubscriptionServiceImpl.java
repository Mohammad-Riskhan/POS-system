package com.saas.saas_pos_bk.service.impl;

import com.saas.saas_pos_bk.dto.subscription.AssignSubscriptionRequestDTO;
import com.saas.saas_pos_bk.dto.subscription.BusinessSubscriptionResponseDTO;
import com.saas.saas_pos_bk.entity.Business;
import com.saas.saas_pos_bk.entity.BusinessSubscription;
import com.saas.saas_pos_bk.entity.SubscriptionPlan;
import com.saas.saas_pos_bk.exception.BadRequestException;
import com.saas.saas_pos_bk.exception.ResourceNotFoundException;
import com.saas.saas_pos_bk.repository.BusinessRepository;
import com.saas.saas_pos_bk.repository.BusinessSubscriptionRepository;
import com.saas.saas_pos_bk.repository.SubscriptionPlanRepository;
import com.saas.saas_pos_bk.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SubscriptionServiceImpl implements SubscriptionService {

    private final BusinessSubscriptionRepository businessSubscriptionRepository;
    private final BusinessRepository businessRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;

    @Override
    @Transactional
    public BusinessSubscriptionResponseDTO assignSubscription(AssignSubscriptionRequestDTO dto) {
        Business business = businessRepository.findById(dto.getBusinessId())
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with id: " + dto.getBusinessId()));

        SubscriptionPlan plan = subscriptionPlanRepository.findById(dto.getPlanId())
                .orElseThrow(() -> new ResourceNotFoundException("Subscription plan not found with id: " + dto.getPlanId()));

        if (Boolean.FALSE.equals(plan.getIsActive())) {
            throw new BadRequestException("Cannot assign inactive subscription plan: " + plan.getName());
        }

        // 1. Expire previous ACTIVE subscriptions for this business
        List<BusinessSubscription> previousActive = businessSubscriptionRepository
                .findByBusinessBIdAndStatus(business.getBId(), "ACTIVE");
        for (BusinessSubscription prev : previousActive) {
            prev.setStatus("EXPIRED");
            businessSubscriptionRepository.save(prev);
        }

        // 2. Calculate end_date based on start_date + durationMonths
        LocalDateTime startDate = LocalDateTime.now();
        LocalDateTime endDate = startDate.plusMonths(dto.getDurationMonths());

        // 3. Persist new BusinessSubscription record as ACTIVE
        BusinessSubscription newSubscription = BusinessSubscription.builder()
                .business(business)
                .plan(plan)
                .startDate(startDate)
                .endDate(endDate)
                .status("ACTIVE")
                .paymentStatus("PAID")
                .notes(dto.getNotes())
                .build();

        BusinessSubscription saved = businessSubscriptionRepository.save(newSubscription);
        log.info("Assigned plan '{}' to business '{}' (ID: {}) for {} months until {}",
                plan.getName(), business.getBName(), business.getBId(), dto.getDurationMonths(), endDate);

        // 4. Map to BusinessSubscriptionResponseDTO and return
        return mapToDTO(saved);
    }

    @Override
    @Transactional
    public BusinessSubscriptionResponseDTO getActiveSubscription(Long businessId) {
        Optional<BusinessSubscription> opt = businessSubscriptionRepository
                .findFirstByBusinessBIdAndStatusOrderByEndDateDesc(businessId, "ACTIVE");

        if (opt.isPresent()) {
            BusinessSubscription sub = opt.get();
            if (sub.getEndDate().isBefore(LocalDateTime.now())) {
                sub.setStatus("EXPIRED");
                businessSubscriptionRepository.save(sub);
                return mapToDTO(sub);
            }
            return mapToDTO(sub);
        }

        // Check if there is any past subscription (to show the most recent status)
        return businessSubscriptionRepository.findFirstByBusinessBIdOrderByEndDateDesc(businessId)
                .map(this::mapToDTO)
                .orElse(null);
    }

    @Override
    @Transactional
    public List<BusinessSubscriptionResponseDTO> getSubscriptionHistory(Long businessId) {
        if (!businessRepository.existsById(businessId)) {
            throw new ResourceNotFoundException("Business not found with id: " + businessId);
        }

        List<BusinessSubscription> list = businessSubscriptionRepository
                .findByBusinessBIdOrderByStartDateDesc(businessId);

        // Update any overdue active records
        for (BusinessSubscription sub : list) {
            if ("ACTIVE".equalsIgnoreCase(sub.getStatus()) && sub.getEndDate().isBefore(LocalDateTime.now())) {
                sub.setStatus("EXPIRED");
                businessSubscriptionRepository.save(sub);
            }
        }

        return list.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public boolean isBusinessSubscriptionActive(Long businessId) {
        Optional<BusinessSubscription> opt = businessSubscriptionRepository
                .findFirstByBusinessBIdAndStatusOrderByEndDateDesc(businessId, "ACTIVE");

        if (opt.isEmpty()) {
            return false;
        }

        BusinessSubscription sub = opt.get();
        if (sub.getEndDate().isBefore(LocalDateTime.now())) {
            sub.setStatus("EXPIRED");
            businessSubscriptionRepository.save(sub);
            return false;
        }

        return true;
    }

    private BusinessSubscriptionResponseDTO mapToDTO(BusinessSubscription sub) {
        boolean isExpired = (sub.getEndDate() != null && sub.getEndDate().isBefore(LocalDateTime.now()))
                || "EXPIRED".equalsIgnoreCase(sub.getStatus());

        return BusinessSubscriptionResponseDTO.builder()
                .subscriptionId(sub.getSubId())
                .businessId(sub.getBusiness() != null ? sub.getBusiness().getBId() : null)
                .businessName(sub.getBusiness() != null ? sub.getBusiness().getBName() : null)
                .planName(sub.getPlan() != null ? sub.getPlan().getName() : null)
                .startDate(sub.getStartDate())
                .endDate(sub.getEndDate())
                .status(sub.getStatus())
                .paymentStatus(sub.getPaymentStatus())
                .isExpired(isExpired)
                .build();
    }
}
