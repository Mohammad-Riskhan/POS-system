package com.saas.saas_pos_bk.dto.subscription;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubscriptionPlanRequestDTO {

    @NotBlank(message = "Plan name is required")
    private String name;

    private String description;

    @NotNull(message = "Price is required")
    @PositiveOrZero(message = "Price must be positive or zero")
    private BigDecimal price;

    @NotBlank(message = "Billing cycle is required")
    private String billingCycle;

    @NotNull(message = "Max cashiers is required")
    @Positive(message = "Max cashiers must be positive")
    private Integer maxCashiers;

    @NotNull(message = "Max items is required")
    @Positive(message = "Max items must be positive")
    private Integer maxItems;
}
