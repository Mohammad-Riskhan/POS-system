package com.saas.saas_pos_bk.service;

import com.saas.saas_pos_bk.dto.OrderCreateRequestDTO;
import com.saas.saas_pos_bk.dto.OrderResponseDTO;

import java.util.List;

public interface OrderService {
    OrderResponseDTO processOrder(OrderCreateRequestDTO dto, Long businessId);
    OrderResponseDTO getOrderById(Long orderId, Long businessId);
    List<OrderResponseDTO> getOrdersByBusiness(Long businessId);
    OrderResponseDTO getOrderByReference(String reference, Long businessId);
}
