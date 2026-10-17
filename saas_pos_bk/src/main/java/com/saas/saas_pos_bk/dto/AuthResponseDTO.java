package com.saas.saas_pos_bk.dto;

import com.saas.saas_pos_bk.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponseDTO {
    private String token;
    @Builder.Default
    private String type = "Bearer";
    private Long uId;
    private String uName;
    private String uEmail;
    private Role role;
    private Long bId;
    private String bName;
    private String bStatus;
}
