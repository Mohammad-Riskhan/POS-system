package com.saas.saas_pos_bk.dto.subscription;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubscriptionPlanResponseDTO {

    private Long planId;
    private String name;
    private String description;
    private BigDecimal price;
    private String billingCycle;
    private Integer maxCashiers;
    private Integer maxItems;
    private Boolean isActive;
}
