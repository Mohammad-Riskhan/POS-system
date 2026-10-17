package com.saas.saas_pos_bk.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BatchResponseDTO {
    private Long batchId;
    private Long itemId;
    private String itemName;
    private Long supplierId;
    private String supplierName;
    private Long businessId;
    private Integer qty;
    private BigDecimal unitPrice;
    private LocalDateTime date;

    // Helper getters for backward compatibility with frontend
    @JsonProperty("btId")
    public Long getBtId() {
        return batchId;
    }

    @JsonProperty("sId")
    public Long getSId() {
        return supplierId;
    }

    @JsonProperty("bId")
    public Long getBId() {
        return businessId;
    }
}
