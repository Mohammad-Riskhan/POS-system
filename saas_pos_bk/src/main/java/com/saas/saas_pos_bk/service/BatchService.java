package com.saas.saas_pos_bk.service;

import com.saas.saas_pos_bk.dto.BatchCreateRequestDTO;
import com.saas.saas_pos_bk.dto.BatchResponseDTO;

import java.util.List;

public interface BatchService {
    BatchResponseDTO createBatch(BatchCreateRequestDTO dto, Long businessId);
    List<BatchResponseDTO> getBatchesByBusiness(Long businessId);
    BatchResponseDTO getBatchById(Long id, Long businessId);
    List<BatchResponseDTO> getActiveBatchesByItem(Long itemId, Long businessId);
}
