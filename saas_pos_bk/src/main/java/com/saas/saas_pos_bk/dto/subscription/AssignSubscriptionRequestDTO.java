package com.saas.saas_pos_bk.dto.subscription;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignSubscriptionRequestDTO {

    @NotNull(message = "Business ID is required")
    private Long businessId;

    @NotNull(message = "Plan ID is required")
    private Long planId;

    @NotNull(message = "Duration in months is required")
    @Positive(message = "Duration must be greater than zero")
    private Integer durationMonths;

    private String notes;
}
