package com.saas.saas_pos_bk.controller;

import com.saas.saas_pos_bk.dto.SupplierRequestDTO;
import com.saas.saas_pos_bk.dto.SupplierResponseDTO;
import com.saas.saas_pos_bk.service.SupplierService;
import com.saas.saas_pos_bk.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/business/suppliers")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('OWNER', 'BUSINESS_OWNER')")
public class SupplierController {

    private final SupplierService supplierService;
    private final SecurityUtils securityUtils;

    @PostMapping
    public ResponseEntity<SupplierResponseDTO> createSupplier(@Valid @RequestBody SupplierRequestDTO dto) {
        Long businessId = securityUtils.getCurrentBusinessId();
        SupplierResponseDTO response = supplierService.createSupplier(dto, businessId);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<SupplierResponseDTO>> getSuppliers() {
        Long businessId = securityUtils.getCurrentBusinessId();
        List<SupplierResponseDTO> suppliers = supplierService.getSuppliersByBusiness(businessId);
        return ResponseEntity.ok(suppliers);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SupplierResponseDTO> getSupplierById(@PathVariable Long id) {
        Long businessId = securityUtils.getCurrentBusinessId();
        SupplierResponseDTO supplier = supplierService.getSupplierById(id, businessId);
        return ResponseEntity.ok(supplier);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SupplierResponseDTO> updateSupplier(
            @PathVariable Long id,
            @Valid @RequestBody SupplierRequestDTO dto
    ) {
        Long businessId = securityUtils.getCurrentBusinessId();
        SupplierResponseDTO updated = supplierService.updateSupplier(id, dto, businessId);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSupplier(@PathVariable Long id) {
        Long businessId = securityUtils.getCurrentBusinessId();
        supplierService.deleteSupplier(id, businessId);
        return ResponseEntity.noContent().build();
    }
}
