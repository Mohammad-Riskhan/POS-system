package com.saas.saas_pos_bk.service.impl;

import com.saas.saas_pos_bk.config.JwtTokenProvider;
import com.saas.saas_pos_bk.dto.AuthResponseDTO;
import com.saas.saas_pos_bk.dto.LoginRequestDTO;
import com.saas.saas_pos_bk.dto.UserResponseDTO;
import com.saas.saas_pos_bk.entity.User;
import com.saas.saas_pos_bk.exception.BadRequestException;
import com.saas.saas_pos_bk.exception.ResourceNotFoundException;
import com.saas.saas_pos_bk.repository.UserRepository;
import com.saas.saas_pos_bk.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    @Override
    @Transactional(readOnly = true)
    public AuthResponseDTO login(LoginRequestDTO dto) {
        User user = userRepository.findByUEmail(dto.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if ("DISABLED".equalsIgnoreCase(user.getStatus())) {
            throw new BadRequestException("Your account is disabled. Please contact your administrator.");
        }

        if (user.getBusiness() != null && "SUSPENDED".equalsIgnoreCase(user.getBusiness().getBStatus())) {
            throw new BadRequestException("Your business account has been suspended. Please contact platform admin.");
        }

        if (!passwordEncoder.matches(dto.getPassword(), user.getUPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        String token = tokenProvider.generateToken(user);

        return AuthResponseDTO.builder()
                .token(token)
                .type("Bearer")
                .uId(user.getUId())
                .uName(user.getUName())
                .uEmail(user.getUEmail())
                .role(user.getRole())
                .bId(user.getBusiness() != null ? user.getBusiness().getBId() : null)
                .bName(user.getBusiness() != null ? user.getBusiness().getBName() : null)
                .bStatus(user.getBusiness() != null ? user.getBusiness().getBStatus() : null)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponseDTO getCurrentUser(String email) {
        User user = userRepository.findByUEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        return UserResponseDTO.builder()
                .uId(user.getUId())
                .bId(user.getBusiness() != null ? user.getBusiness().getBId() : null)
                .bName(user.getBusiness() != null ? user.getBusiness().getBName() : null)
                .uName(user.getUName())
                .uEmail(user.getUEmail())
                .role(user.getRole())
                .status(user.getStatus())
                .permissions(java.util.List.of(user.getRole().name()))
                .build();
    }
}
