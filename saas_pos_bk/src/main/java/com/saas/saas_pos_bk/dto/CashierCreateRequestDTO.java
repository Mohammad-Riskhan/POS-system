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
public class CashierCreateRequestDTO {

    @NotBlank(message = "Staff name is required")
    @JsonAlias({"uName", "name"})
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Valid email is required")
    @JsonAlias({"uEmail", "email"})
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    @JsonAlias({"uPassword", "password"})
    private String password;

    private String phone;

    // Helper getters for compatibility
    public String getUName() {
        return name;
    }

    public String getUEmail() {
        return email;
    }

    public String getUPassword() {
        return password;
    }
}
