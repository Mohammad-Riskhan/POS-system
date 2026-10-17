package com.saas.saas_pos_bk.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BusinessAnalyticsResponseDTO {
    private BigDecimal totalRevenue;
    private long totalOrders;
    private long totalItems;
    private long totalBatches;
    private long totalCashiers;
    private long totalSuppliers;
    private List<OrderResponseDTO> recentOrders;
    private List<ItemResponseDTO> lowStockItems;
}
