package com.saas.saas_pos_bk.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserStatusUpdateDTO {
    @NotBlank(message = "Status is required (ACTIVE, DISABLED)")
    private String status;
}
