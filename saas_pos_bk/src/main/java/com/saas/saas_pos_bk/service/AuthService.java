package com.saas.saas_pos_bk.service;

import com.saas.saas_pos_bk.dto.AuthResponseDTO;
import com.saas.saas_pos_bk.dto.LoginRequestDTO;
import com.saas.saas_pos_bk.dto.UserResponseDTO;

public interface AuthService {
    AuthResponseDTO login(LoginRequestDTO dto);
    UserResponseDTO getCurrentUser(String email);
}
