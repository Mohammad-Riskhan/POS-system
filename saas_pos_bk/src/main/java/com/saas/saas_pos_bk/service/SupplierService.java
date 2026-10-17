package com.saas.saas_pos_bk.service;

import com.saas.saas_pos_bk.dto.SupplierRequestDTO;
import com.saas.saas_pos_bk.dto.SupplierResponseDTO;

import java.util.List;

public interface SupplierService {
    SupplierResponseDTO createSupplier(SupplierRequestDTO dto, Long businessId);
    List<SupplierResponseDTO> getSuppliersByBusiness(Long businessId);
    SupplierResponseDTO getSupplierById(Long supplierId, Long businessId);
    SupplierResponseDTO updateSupplier(Long supplierId, SupplierRequestDTO dto, Long businessId);
    void deleteSupplier(Long supplierId, Long businessId);
}
