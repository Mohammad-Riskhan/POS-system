package com.saas.saas_pos_bk.service;

import com.saas.saas_pos_bk.dto.CashierCreateRequestDTO;
import com.saas.saas_pos_bk.dto.CashierResponseDTO;

import java.util.List;

public interface StaffService {
    CashierResponseDTO createCashier(CashierCreateRequestDTO dto, Long businessId);
    List<CashierResponseDTO> getStaffByBusiness(Long businessId);
    void updateCashierStatus(Long userId, String status, Long businessId);
    void deleteCashier(Long userId, Long businessId);
}
