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
public class BusinessStatusUpdateDTO {

    @NotBlank(message = "Status is required (ACTIVE, INACTIVE, SUSPENDED)")
    @JsonAlias({"status", "bStatus"})
    private String bStatus;

    public String getStatus() {
        return bStatus;
    }
}
