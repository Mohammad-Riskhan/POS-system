package com.saas.saas_pos_bk.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponseDTO {
    private Long orderId;
    private String reference;
    private LocalDateTime date;
    private String paymentMethod;
    private BigDecimal grandTotal;
    private List<OrderItemResponseDTO> items;
    private Long businessId;
    private String businessName;
    private Long customerId;
    private String customerName;
    private String customerMobile;

    // Helper getters for backward compatibility with frontend
    @JsonProperty("oId")
    public Long getOId() {
        return orderId;
    }

    @JsonProperty("bId")
    public Long getBId() {
        return businessId;
    }

    @JsonProperty("bName")
    public String getBName() {
        return businessName;
    }

    @JsonProperty("cusId")
    public Long getCusId() {
        return customerId;
    }
}
