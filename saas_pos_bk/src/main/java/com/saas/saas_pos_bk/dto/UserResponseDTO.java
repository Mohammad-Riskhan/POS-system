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
public class UserResponseDTO {
    private Long uId;
    private Long bId;
    private String bName;
    private String uName;
    private String uEmail;
    private Role role;
    private String status;
    private java.util.List<String> permissions;
}
