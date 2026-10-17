package com.saas.saas_pos_bk.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerResponseDTO {
    private Long cusId;
    private Long bId;
    private String name;
    private String mobile;
    private String email;
}
