package com.saas.saas_pos_bk.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlatformStatsResponseDTO {
    private long totalBusinesses;
    private long activeBusinesses;
    private long suspendedBusinesses;
    private long totalUsers;
    private long totalOrders;
    private BigDecimal totalPlatformRevenue;
}
