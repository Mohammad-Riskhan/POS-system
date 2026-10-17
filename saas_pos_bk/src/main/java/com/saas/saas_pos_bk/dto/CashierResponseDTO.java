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
public class CashierResponseDTO {
    private Long userId;
    private Long businessId;
    private String name;
    private String email;
    private String role;
    private String status;
    private String phone;

    // Helper getters for backward compatibility with frontend
    @JsonProperty("uId")
    public Long getUId() {
        return userId;
    }

    @JsonProperty("uName")
    public String getUName() {
        return name;
    }

    @JsonProperty("uEmail")
    public String getUEmail() {
        return email;
    }

    @JsonProperty("bId")
    public Long getBId() {
        return businessId;
    }
}
