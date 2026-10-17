package com.saas.saas_pos_bk.controller;

import com.saas.saas_pos_bk.dto.CustomerCreateRequestDTO;
import com.saas.saas_pos_bk.dto.CustomerResponseDTO;
import com.saas.saas_pos_bk.service.CustomerService;
import com.saas.saas_pos_bk.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pos/customers")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('OWNER', 'BUSINESS_OWNER', 'CASHIER')")
public class CustomerController {

    private final CustomerService customerService;
    private final SecurityUtils securityUtils;

    @PostMapping
    public ResponseEntity<CustomerResponseDTO> createCustomer(@Valid @RequestBody CustomerCreateRequestDTO dto) {
        Long businessId = securityUtils.getCurrentBusinessId();
        CustomerResponseDTO response = customerService.createCustomer(dto, businessId);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<CustomerResponseDTO>> getCustomers(@RequestParam(required = false) String search) {
        Long businessId = securityUtils.getCurrentBusinessId();
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(customerService.searchCustomers(search, businessId));
        }
        return ResponseEntity.ok(customerService.getCustomersByBusiness(businessId));
    }
}
