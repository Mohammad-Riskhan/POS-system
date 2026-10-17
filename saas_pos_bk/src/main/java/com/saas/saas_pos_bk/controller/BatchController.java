package com.saas.saas_pos_bk.controller;

import com.saas.saas_pos_bk.dto.BatchCreateRequestDTO;
import com.saas.saas_pos_bk.dto.BatchResponseDTO;
import com.saas.saas_pos_bk.service.BatchService;
import com.saas.saas_pos_bk.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/business/batches", "/api/pos/batches"})
@RequiredArgsConstructor
public class BatchController {

    private final BatchService batchService;
    private final SecurityUtils securityUtils;

    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER', 'BUSINESS_OWNER')")
    public ResponseEntity<BatchResponseDTO> createBatch(@Valid @RequestBody BatchCreateRequestDTO dto) {
        Long businessId = securityUtils.getCurrentBusinessId();
        BatchResponseDTO response = batchService.createBatch(dto, businessId);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('OWNER', 'BUSINESS_OWNER')")
    public ResponseEntity<List<BatchResponseDTO>> getBatches() {
        Long businessId = securityUtils.getCurrentBusinessId();
        List<BatchResponseDTO> batches = batchService.getBatchesByBusiness(businessId);
        return ResponseEntity.ok(batches);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'BUSINESS_OWNER')")
    public ResponseEntity<BatchResponseDTO> getBatchById(@PathVariable Long id) {
        Long businessId = securityUtils.getCurrentBusinessId();
        BatchResponseDTO batch = batchService.getBatchById(id, businessId);
        return ResponseEntity.ok(batch);
    }

    @GetMapping("/item/{itemId}")
    @PreAuthorize("hasAnyRole('OWNER', 'BUSINESS_OWNER', 'CASHIER')")
    public ResponseEntity<List<BatchResponseDTO>> getActiveBatchesByItem(@PathVariable Long itemId) {
        Long businessId = securityUtils.getCurrentBusinessId();
        List<BatchResponseDTO> batches = batchService.getActiveBatchesByItem(itemId, businessId);
        return ResponseEntity.ok(batches);
    }
}
