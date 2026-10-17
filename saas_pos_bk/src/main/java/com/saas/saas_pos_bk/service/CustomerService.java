package com.saas.saas_pos_bk.service;

import com.saas.saas_pos_bk.dto.CustomerCreateRequestDTO;
import com.saas.saas_pos_bk.dto.CustomerResponseDTO;

import java.util.List;

public interface CustomerService {
    CustomerResponseDTO createCustomer(CustomerCreateRequestDTO dto, Long businessId);
    List<CustomerResponseDTO> getCustomersByBusiness(Long businessId);
    List<CustomerResponseDTO> searchCustomers(String query, Long businessId);
}
