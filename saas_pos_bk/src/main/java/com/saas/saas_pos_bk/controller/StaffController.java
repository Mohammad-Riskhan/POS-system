package com.saas.saas_pos_bk.controller;

import com.saas.saas_pos_bk.dto.CashierCreateRequestDTO;
import com.saas.saas_pos_bk.dto.CashierResponseDTO;
import com.saas.saas_pos_bk.dto.UserStatusUpdateDTO;
import com.saas.saas_pos_bk.service.StaffService;
import com.saas.saas_pos_bk.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/business/staff", "/api/business/cashiers"})
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('OWNER', 'BUSINESS_OWNER')")
public class StaffController {

    private final StaffService staffService;
    private final SecurityUtils securityUtils;

    @PostMapping
    public ResponseEntity<CashierResponseDTO> createCashier(@Valid @RequestBody CashierCreateRequestDTO dto) {
        Long businessId = securityUtils.getCurrentBusinessId();
        CashierResponseDTO created = staffService.createCashier(dto, businessId);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<CashierResponseDTO>> getStaff() {
        Long businessId = securityUtils.getCurrentBusinessId();
        List<CashierResponseDTO> staff = staffService.getStaffByBusiness(businessId);
        return ResponseEntity.ok(staff);
    }

    @RequestMapping(value = "/{userId}/status", method = {RequestMethod.PATCH, RequestMethod.PUT})
    public ResponseEntity<Void> updateCashierStatus(
            @PathVariable Long userId,
            @RequestBody(required = false) UserStatusUpdateDTO dto
    ) {
        Long businessId = securityUtils.getCurrentBusinessId();
        String status = dto != null ? dto.getStatus() : null;
        staffService.updateCashierStatus(userId, status, businessId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteCashier(@PathVariable Long userId) {
        Long businessId = securityUtils.getCurrentBusinessId();
        staffService.deleteCashier(userId, businessId);
        return ResponseEntity.noContent().build();
    }
}
