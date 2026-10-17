package com.saas.saas_pos_bk.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupplierResponseDTO {
    private Long supplierId;
    private Long businessId;
    private String supplierName;
    private String mobile;
    private String address;

    // Helper getters for backward compatibility with frontend
    @JsonProperty("sId")
    public Long getSId() {
        return supplierId;
    }

    @JsonProperty("sName")
    public String getSName() {
        return supplierName;
    }

    @JsonProperty("bId")
    public Long getBId() {
        return businessId;
    }
}
