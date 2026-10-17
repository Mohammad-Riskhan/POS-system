package com.saas.saas_pos_bk.service.impl;

import com.saas.saas_pos_bk.dto.CustomerCreateRequestDTO;
import com.saas.saas_pos_bk.dto.CustomerResponseDTO;
import com.saas.saas_pos_bk.entity.Business;
import com.saas.saas_pos_bk.entity.Customer;
import com.saas.saas_pos_bk.exception.ResourceNotFoundException;
import com.saas.saas_pos_bk.repository.BusinessRepository;
import com.saas.saas_pos_bk.repository.CustomerRepository;
import com.saas.saas_pos_bk.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final BusinessRepository businessRepository;

    @Override
    @Transactional
    public CustomerResponseDTO createCustomer(CustomerCreateRequestDTO dto, Long businessId) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with ID: " + businessId));

        Customer customer = Customer.builder()
                .business(business)
                .name(dto.getName())
                .mobile(dto.getMobile())
                .email(dto.getEmail())
                .build();

        Customer saved = customerRepository.save(customer);
        return mapToDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CustomerResponseDTO> getCustomersByBusiness(Long businessId) {
        return customerRepository.findByBusinessBId(businessId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CustomerResponseDTO> searchCustomers(String query, Long businessId) {
        if (query == null || query.isBlank()) {
            return getCustomersByBusiness(businessId);
        }
        return customerRepository.findByBusinessBIdAndNameContainingIgnoreCase(businessId, query).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private CustomerResponseDTO mapToDTO(Customer customer) {
        return CustomerResponseDTO.builder()
                .cusId(customer.getCusId())
                .bId(customer.getBusiness().getBId())
                .name(customer.getName())
                .mobile(customer.getMobile())
                .email(customer.getEmail())
                .build();
    }
}
