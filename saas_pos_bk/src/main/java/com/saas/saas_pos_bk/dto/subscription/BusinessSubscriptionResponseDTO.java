package com.saas.saas_pos_bk.dto.subscription;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BusinessSubscriptionResponseDTO {

    private Long subscriptionId;
    private Long businessId;
    private String businessName;
    private String planName;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String status;
    private String paymentStatus;
    private Boolean isExpired;
}
