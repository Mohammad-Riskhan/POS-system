package com.saas.saas_pos_bk.service.impl;

import com.saas.saas_pos_bk.dto.*;
import com.saas.saas_pos_bk.entity.Business;
import com.saas.saas_pos_bk.entity.Order;
import com.saas.saas_pos_bk.entity.Role;
import com.saas.saas_pos_bk.entity.User;
import com.saas.saas_pos_bk.exception.BadRequestException;
import com.saas.saas_pos_bk.exception.ResourceNotFoundException;
import com.saas.saas_pos_bk.repository.*;
import com.saas.saas_pos_bk.service.BusinessService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BusinessServiceImpl implements BusinessService {

    private final BusinessRepository businessRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final BatchRepository batchRepository;
    private final ItemRepository itemRepository;
    private final SupplierRepository supplierRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public BusinessResponseDTO registerBusiness(BusinessRegisterRequestDTO dto) {
        String bizEmail = dto.getBusinessEmail() != null ? dto.getBusinessEmail().trim() : (dto.getEmail() != null ? dto.getEmail().trim() : null);
        String ownEmail = (dto.getOwnerEmail() != null && !dto.getOwnerEmail().trim().isEmpty())
                ? dto.getOwnerEmail().trim()
                : bizEmail;

        if (businessRepository.existsByEmail(bizEmail)) {
            throw new BadRequestException("A business with email " + bizEmail + " already exists");
        }
        if (userRepository.existsByUEmail(ownEmail)) {
            throw new BadRequestException("A user with email " + ownEmail + " already exists");
        }

        // 1. Transactionally persist Business record (DTO -> Entity -> DB)
        Business business = Business.builder()
                .bName(dto.getBusinessName() != null ? dto.getBusinessName() : dto.getBName())
                .bStatus("ACTIVE")
                .email(bizEmail)
                .phone(dto.getPhone())
                .build();
        Business savedBusiness = businessRepository.save(business);

        // 2. Transactionally provision initial Business Owner credentials (DTO -> Entity -> DB)
        String rawPassword = dto.getPassword() != null ? dto.getPassword() : dto.getOwnerPassword();
        User businessOwner = User.builder()
                .business(savedBusiness)
                .uName(dto.getOwnerName())
                .uEmail(ownEmail)
                .uPassword(passwordEncoder.encode(rawPassword))
                .role(Role.ROLE_BUSINESS_OWNER)
                .status("ACTIVE")
                .build();
        User savedOwner = userRepository.save(businessOwner);

        // 3. Entity -> ResponseDTO
        return mapToDTO(savedBusiness, savedOwner);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BusinessResponseDTO> getAllBusinesses() {
        return businessRepository.findAll().stream()
                .map(b -> {
                    Optional<User> owner = userRepository.findFirstByBusinessBIdAndRole(b.getBId(), Role.ROLE_BUSINESS_OWNER);
                    return mapToDTO(b, owner.orElse(null));
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void toggleBusinessStatus(Long businessId, String status) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with ID: " + businessId));

        if (status != null && !status.trim().isEmpty()) {
            business.setBStatus(status.trim().toUpperCase());
        } else {
            String current = business.getBStatus();
            business.setBStatus("ACTIVE".equalsIgnoreCase(current) ? "SUSPENDED" : "ACTIVE");
        }
        businessRepository.save(business);
    }

    @Override
    @Transactional(readOnly = true)
    public BusinessResponseDTO getBusinessById(Long id) {
        Business business = businessRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with ID: " + id));
        Optional<User> owner = userRepository.findFirstByBusinessBIdAndRole(business.getBId(), Role.ROLE_BUSINESS_OWNER);
        return mapToDTO(business, owner.orElse(null));
    }

    @Override
    @Transactional
    public BusinessResponseDTO updateBusiness(Long id, BusinessUpdateRequestDTO dto) {
        Business business = businessRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with ID: " + id));

        String bName = dto.getBusinessName() != null ? dto.getBusinessName() : dto.getBName();
        String email = dto.getBusinessEmail() != null ? dto.getBusinessEmail() : dto.getEmail();

        business.setBName(bName);
        business.setEmail(email);
        business.setPhone(dto.getPhone());
        Business updated = businessRepository.save(business);

        Optional<User> owner = userRepository.findFirstByBusinessBIdAndRole(updated.getBId(), Role.ROLE_BUSINESS_OWNER);
        return mapToDTO(updated, owner.orElse(null));
    }

    @Override
    @Transactional
    public void deleteBusiness(Long id) {
        Business business = businessRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with ID: " + id));

        // Cascading deletion of business child records
        List<Order> orders = orderRepository.findByBusinessBIdOrderByDateDesc(id);
        for (Order o : orders) {
            orderItemRepository.deleteAll(orderItemRepository.findByOrderOId(o.getOId()));
        }
        orderRepository.deleteAll(orders);
        batchRepository.deleteAll(batchRepository.findByBusinessBId(id));
        itemRepository.deleteAll(itemRepository.findByBusinessBId(id));
        supplierRepository.deleteAll(supplierRepository.findByBusinessBId(id));
        customerRepository.deleteAll(customerRepository.findByBusinessBId(id));
        userRepository.deleteAll(userRepository.findByBusinessBId(id));
        businessRepository.delete(business);
    }

    @Override
    @Transactional(readOnly = true)
    public PlatformStatsResponseDTO getPlatformStats() {
        List<Business> allBusinesses = businessRepository.findAll();
        long totalBusinesses = allBusinesses.size();
        long activeBusinesses = allBusinesses.stream()
                .filter(b -> "ACTIVE".equalsIgnoreCase(b.getBStatus()))
                .count();
        long suspendedBusinesses = allBusinesses.stream()
                .filter(b -> "SUSPENDED".equalsIgnoreCase(b.getBStatus()))
                .count();

        long totalUsers = userRepository.count();
        long totalOrders = orderRepository.count();
        BigDecimal totalRevenue = orderRepository.sumPlatformGrandTotal();

        return PlatformStatsResponseDTO.builder()
                .totalBusinesses(totalBusinesses)
                .activeBusinesses(activeBusinesses)
                .suspendedBusinesses(suspendedBusinesses)
                .totalUsers(totalUsers)
                .totalOrders(totalOrders)
                .totalPlatformRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO)
                .build();
    }

    private BusinessResponseDTO mapToDTO(Business b, User owner) {
        return BusinessResponseDTO.builder()
                .businessId(b.getBId())
                .businessName(b.getBName())
                .businessEmail(b.getEmail())
                .phone(b.getPhone())
                .status(b.getBStatus())
                .ownerUserId(owner != null ? owner.getUId() : null)
                .ownerName(owner != null ? owner.getUName() : null)
                .ownerEmail(owner != null ? owner.getUEmail() : null)
                .createdAt(b.getCreatedAt())
                .build();
    }
}
