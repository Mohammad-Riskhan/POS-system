package com.saas.saas_pos_bk.controller;

import com.saas.saas_pos_bk.dto.*;
import com.saas.saas_pos_bk.service.BusinessService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('OWNER', 'SUPER_ADMIN')")
public class BusinessController {

    private final BusinessService businessService;

    @PostMapping("/businesses")
    public ResponseEntity<BusinessResponseDTO> registerBusiness(@Valid @RequestBody BusinessRegisterRequestDTO dto) {
        BusinessResponseDTO response = businessService.registerBusiness(dto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/businesses")
    public ResponseEntity<List<BusinessResponseDTO>> getAllBusinesses() {
        List<BusinessResponseDTO> businesses = businessService.getAllBusinesses();
        return ResponseEntity.ok(businesses);
    }

    @GetMapping("/businesses/{id}")
    public ResponseEntity<BusinessResponseDTO> getBusinessById(@PathVariable Long id) {
        BusinessResponseDTO business = businessService.getBusinessById(id);
        return ResponseEntity.ok(business);
    }

    @PutMapping("/businesses/{id}")
    public ResponseEntity<BusinessResponseDTO> updateBusiness(
            @PathVariable Long id,
            @Valid @RequestBody BusinessUpdateRequestDTO dto
    ) {
        BusinessResponseDTO response = businessService.updateBusiness(id, dto);
        return ResponseEntity.ok(response);
    }

    @RequestMapping(value = "/businesses/{id}/status", method = {RequestMethod.PATCH, RequestMethod.PUT})
    public ResponseEntity<Void> toggleBusinessStatus(
            @PathVariable Long id,
            @RequestBody(required = false) BusinessStatusUpdateDTO dto,
            @RequestParam(required = false) String status
    ) {
        String resolvedStatus = (dto != null && dto.getStatus() != null && !dto.getStatus().isBlank())
                ? dto.getStatus()
                : status;
        businessService.toggleBusinessStatus(id, resolvedStatus);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/businesses/{id}")
    public ResponseEntity<Void> deleteBusiness(@PathVariable Long id) {
        businessService.deleteBusiness(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    public ResponseEntity<PlatformStatsResponseDTO> getPlatformStats() {
        PlatformStatsResponseDTO stats = businessService.getPlatformStats();
        return ResponseEntity.ok(stats);
    }
}
