package com.saas.saas_pos_bk.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupplierRequestDTO {

    @NotBlank(message = "Supplier name is required")
    @JsonAlias({"sName", "supplierName"})
    private String supplierName;

    private String mobile;
    private String address;

    // Helper getter for compatibility
    public String getSName() {
        return supplierName;
    }
}
