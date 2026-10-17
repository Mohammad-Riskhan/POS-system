package com.saas.saas_pos_bk.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BusinessUpdateRequestDTO {
    @NotBlank(message = "Business name is required")
    @JsonAlias({"businessName", "bName"})
    private String bName;

    @NotBlank(message = "Email is required")
    @Email(message = "Valid email is required")
    @JsonAlias({"businessEmail", "email", "bEmail"})
    private String email;

    private String phone;

    public String getBusinessName() {
        return bName;
    }

    public String getBusinessEmail() {
        return email;
    }
}
