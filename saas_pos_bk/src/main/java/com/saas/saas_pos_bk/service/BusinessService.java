package com.saas.saas_pos_bk.service;

import com.saas.saas_pos_bk.dto.BusinessRegisterRequestDTO;
import com.saas.saas_pos_bk.dto.BusinessResponseDTO;
import com.saas.saas_pos_bk.dto.BusinessUpdateRequestDTO;
import com.saas.saas_pos_bk.dto.PlatformStatsResponseDTO;

import java.util.List;

public interface BusinessService {
    BusinessResponseDTO registerBusiness(BusinessRegisterRequestDTO dto);
    List<BusinessResponseDTO> getAllBusinesses();
    void toggleBusinessStatus(Long businessId, String status);
    BusinessResponseDTO getBusinessById(Long id);
    BusinessResponseDTO updateBusiness(Long id, BusinessUpdateRequestDTO dto);
    void deleteBusiness(Long id);
    PlatformStatsResponseDTO getPlatformStats();
}
