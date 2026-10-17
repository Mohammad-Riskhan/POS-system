package com.saas.saas_pos_bk.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemResponseDTO {
    private Long itemId;
    private Long businessId;
    private String name;
    private String description;
    private Integer currentStock;
    private BigDecimal unitPrice;

    // Helper getter for compatibility
    @JsonProperty("bId")
    public Long getBId() {
        return businessId;
    }
}
