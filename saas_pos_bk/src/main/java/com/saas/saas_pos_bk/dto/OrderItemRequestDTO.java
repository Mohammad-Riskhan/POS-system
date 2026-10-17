package com.saas.saas_pos_bk.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemRequestDTO {

    @NotNull(message = "Item ID is required")
    private Long itemId;

    @JsonAlias({"btId", "batchId"})
    private Long batchId; // Optional: specific batch or FIFO auto-allocation

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer qty;

    private BigDecimal unitPrice;

    // Helper getter for compatibility
    public Long getBtId() {
        return batchId;
    }
}
