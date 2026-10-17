package com.saas.saas_pos_bk.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderCreateRequestDTO {

    @JsonAlias({"cusId", "customerId"})
    private Long customerId; // Nullable for walk-in clients

    @NotBlank(message = "Payment method is required")
    @Builder.Default
    private String paymentMethod = "CASH"; // CASH, CARD, ONLINE

    @NotEmpty(message = "Order must contain at least one item")
    @Valid
    private List<OrderItemRequestDTO> items;

    // Helper getter for compatibility
    public Long getCusId() {
        return customerId;
    }
}
