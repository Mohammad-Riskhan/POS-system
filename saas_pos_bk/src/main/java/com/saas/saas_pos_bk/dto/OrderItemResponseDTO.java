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
public class OrderItemResponseDTO {
    private Long orderItemId;
    private Long itemId;
    private String itemName;
    private Long batchId;
    private Integer qty;
    private BigDecimal unitPrice;
    private BigDecimal grandTotal;

    // Helper getters for backward compatibility with frontend
    @JsonProperty("odId")
    public Long getOdId() {
        return orderItemId;
    }

    @JsonProperty("btId")
    public Long getBtId() {
        return batchId;
    }
}
