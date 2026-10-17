package com.saas.saas_pos_bk.controller;

import com.saas.saas_pos_bk.dto.OrderCreateRequestDTO;
import com.saas.saas_pos_bk.dto.OrderResponseDTO;
import com.saas.saas_pos_bk.service.OrderService;
import com.saas.saas_pos_bk.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pos/orders")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('OWNER', 'BUSINESS_OWNER', 'CASHIER')")
public class OrderController {

    private final OrderService orderService;
    private final SecurityUtils securityUtils;

    @PostMapping
    public ResponseEntity<OrderResponseDTO> processOrder(@Valid @RequestBody OrderCreateRequestDTO dto) {
        Long businessId = securityUtils.getCurrentBusinessId();
        OrderResponseDTO response = orderService.processOrder(dto, businessId);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<OrderResponseDTO>> getOrderHistory() {
        Long businessId = securityUtils.getCurrentBusinessId();
        List<OrderResponseDTO> orders = orderService.getOrdersByBusiness(businessId);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponseDTO> getOrderById(@PathVariable Long id) {
        Long businessId = securityUtils.getCurrentBusinessId();
        OrderResponseDTO order = orderService.getOrderById(id, businessId);
        return ResponseEntity.ok(order);
    }

    @GetMapping("/reference/{reference}")
    public ResponseEntity<OrderResponseDTO> getOrderByReference(@PathVariable String reference) {
        Long businessId = securityUtils.getCurrentBusinessId();
        OrderResponseDTO order = orderService.getOrderByReference(reference, businessId);
        return ResponseEntity.ok(order);
    }
}
