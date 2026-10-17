package com.saas.saas_pos_bk.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BusinessRegisterRequestDTO {

    @NotBlank(message = "Business name is required")
    @JsonAlias({"bName", "businessName"})
    private String businessName;

    @NotBlank(message = "Business email is required")
    @Email(message = "Valid business email is required")
    @JsonAlias({"email", "businessEmail", "bEmail"})
    private String businessEmail;

    private String phone;

    @NotBlank(message = "Business owner name is required")
    @JsonAlias({"ownerName", "uName"})
    private String ownerName;

    // Optional when only one email is collected in UI; if omitted or blank, falls back to businessEmail
    @Email(message = "Valid owner email is required")
    @JsonAlias({"ownerEmail"})
    private String ownerEmail;

    @NotBlank(message = "Initial password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    @JsonAlias({"ownerPassword", "password"})
    private String password;

    public void setOwnerEmail(String ownerEmail) {
        this.ownerEmail = (ownerEmail != null && !ownerEmail.trim().isEmpty()) ? ownerEmail.trim() : null;
    }

    // Helper getters for backward compatibility
    public String getBName() {
        return businessName;
    }

    public String getEmail() {
        return businessEmail;
    }

    public String getOwnerPassword() {
        return password;
    }
}
