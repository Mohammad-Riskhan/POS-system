package com.saas.saas_pos_bk.service.impl;

import com.saas.saas_pos_bk.dto.CashierCreateRequestDTO;
import com.saas.saas_pos_bk.dto.CashierResponseDTO;
import com.saas.saas_pos_bk.entity.Business;
import com.saas.saas_pos_bk.entity.Role;
import com.saas.saas_pos_bk.entity.User;
import com.saas.saas_pos_bk.exception.BadRequestException;
import com.saas.saas_pos_bk.exception.ResourceNotFoundException;
import com.saas.saas_pos_bk.repository.BusinessRepository;
import com.saas.saas_pos_bk.repository.UserRepository;
import com.saas.saas_pos_bk.service.StaffService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StaffServiceImpl implements StaffService {

    private final UserRepository userRepository;
    private final BusinessRepository businessRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public CashierResponseDTO createCashier(CashierCreateRequestDTO dto, Long businessId) {
        String email = dto.getEmail() != null ? dto.getEmail() : dto.getUEmail();
        String name = dto.getName() != null ? dto.getName() : dto.getUName();
        String password = dto.getPassword() != null ? dto.getPassword() : dto.getUPassword();

        if (userRepository.existsByUEmail(email)) {
            throw new BadRequestException("User with email " + email + " already exists");
        }

        // 1. Fetch Business reference by businessId
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with ID: " + businessId));

        // 2. Converts CashierCreateRequestDTO -> User entity (ROLE_CASHIER, BCrypt password, assigned Business)
        User cashier = User.builder()
                .business(business)
                .uName(name)
                .uEmail(email)
                .uPassword(passwordEncoder.encode(password))
                .role(Role.ROLE_CASHIER)
                .status("ACTIVE")
                .build();

        // 3. Persists User entity
        User savedCashier = userRepository.save(cashier);

        // 4. Converts saved User -> CashierResponseDTO
        return mapToDTO(savedCashier);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CashierResponseDTO> getStaffByBusiness(Long businessId) {
        return userRepository.findByBusinessBIdAndRole(businessId, Role.ROLE_CASHIER).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void updateCashierStatus(Long userId, String status, Long businessId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff user not found with ID: " + userId));

        if (!user.getBusiness().getBId().equals(businessId)) {
            throw new BadRequestException("Unauthorized access to user from another business");
        }

        if (status != null && !status.trim().isEmpty()) {
            user.setStatus(status.trim().toUpperCase());
        } else {
            String current = user.getStatus();
            user.setStatus("ACTIVE".equalsIgnoreCase(current) ? "DISABLED" : "ACTIVE");
        }
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void deleteCashier(Long userId, Long businessId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff user not found with ID: " + userId));

        if (!user.getBusiness().getBId().equals(businessId)) {
            throw new BadRequestException("Unauthorized access to user from another business");
        }

        userRepository.delete(user);
    }

    private CashierResponseDTO mapToDTO(User user) {
        return CashierResponseDTO.builder()
                .userId(user.getUId())
                .businessId(user.getBusiness() != null ? user.getBusiness().getBId() : null)
                .name(user.getUName())
                .email(user.getUEmail())
                .role(user.getRole().name())
                .status(user.getStatus())
                .build();
    }
}
