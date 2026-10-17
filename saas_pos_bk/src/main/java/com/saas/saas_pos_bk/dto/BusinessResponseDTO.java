package com.saas.saas_pos_bk.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BusinessResponseDTO {
    private Long businessId;
    private String businessName;
    private String businessEmail;
    private String phone;
    private String status;
    private Long ownerUserId;
    private String ownerName;
    private String ownerEmail;
    private LocalDateTime createdAt;

    // Helper getters for backward compatibility with frontend
    @JsonProperty("bId")
    public Long getBId() {
        return businessId;
    }

    @JsonProperty("bName")
    public String getBName() {
        return businessName;
    }

    @JsonProperty("email")
    public String getEmail() {
        return businessEmail;
    }

    @JsonProperty("bStatus")
    public String getBStatus() {
        return status;
    }
}
