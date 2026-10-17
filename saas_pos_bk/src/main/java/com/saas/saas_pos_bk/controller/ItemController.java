package com.saas.saas_pos_bk.controller;

import com.saas.saas_pos_bk.dto.ItemRequestDTO;
import com.saas.saas_pos_bk.dto.ItemResponseDTO;
import com.saas.saas_pos_bk.service.ItemService;
import com.saas.saas_pos_bk.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ItemController {

    private final ItemService itemService;
    private final SecurityUtils securityUtils;

    @PostMapping("/api/business/items")
    @PreAuthorize("hasAnyRole('OWNER', 'BUSINESS_OWNER')")
    public ResponseEntity<ItemResponseDTO> createItem(@Valid @RequestBody ItemRequestDTO dto) {
        Long businessId = securityUtils.getCurrentBusinessId();
        ItemResponseDTO response = itemService.createItem(dto, businessId);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping({"/api/business/items", "/api/pos/items"})
    @PreAuthorize("hasAnyRole('OWNER', 'BUSINESS_OWNER', 'CASHIER')")
    public ResponseEntity<List<ItemResponseDTO>> getItems() {
        Long businessId = securityUtils.getCurrentBusinessId();
        List<ItemResponseDTO> items = itemService.getItemsByBusiness(businessId);
        return ResponseEntity.ok(items);
    }

    @GetMapping("/api/business/items/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'BUSINESS_OWNER')")
    public ResponseEntity<ItemResponseDTO> getItemById(@PathVariable Long id) {
        Long businessId = securityUtils.getCurrentBusinessId();
        ItemResponseDTO item = itemService.getItemById(id, businessId);
        return ResponseEntity.ok(item);
    }

    @PutMapping("/api/business/items/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'BUSINESS_OWNER')")
    public ResponseEntity<ItemResponseDTO> updateItem(
            @PathVariable Long id,
            @Valid @RequestBody ItemRequestDTO dto
    ) {
        Long businessId = securityUtils.getCurrentBusinessId();
        ItemResponseDTO updated = itemService.updateItem(id, dto, businessId);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/api/business/items/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'BUSINESS_OWNER')")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        Long businessId = securityUtils.getCurrentBusinessId();
        itemService.deleteItem(id, businessId);
        return ResponseEntity.noContent().build();
    }
}
