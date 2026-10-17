package com.saas.saas_pos_bk.service.impl;

import com.saas.saas_pos_bk.dto.BusinessAnalyticsResponseDTO;
import com.saas.saas_pos_bk.dto.ItemResponseDTO;
import com.saas.saas_pos_bk.dto.OrderItemResponseDTO;
import com.saas.saas_pos_bk.dto.OrderResponseDTO;
import com.saas.saas_pos_bk.entity.Batch;
import com.saas.saas_pos_bk.entity.Item;
import com.saas.saas_pos_bk.entity.Order;
import com.saas.saas_pos_bk.entity.Role;
import com.saas.saas_pos_bk.repository.*;
import com.saas.saas_pos_bk.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private final OrderRepository orderRepository;
    private final ItemRepository itemRepository;
    private final BatchRepository batchRepository;
    private final UserRepository userRepository;
    private final SupplierRepository supplierRepository;

    @Override
    @Transactional(readOnly = true)
    public BusinessAnalyticsResponseDTO getBusinessAnalytics(Long businessId) {
        BigDecimal totalRevenue = orderRepository.sumGrandTotalByBusiness(businessId);
        long totalOrders = orderRepository.countByBusinessBId(businessId);
        long totalItems = itemRepository.countByBusinessBId(businessId);
        long totalBatches = batchRepository.countByBusinessBId(businessId);
        long totalCashiers = userRepository.findByBusinessBIdAndRole(businessId, Role.ROLE_CASHIER).size();
        long totalSuppliers = supplierRepository.countByBusinessBId(businessId);

        List<Order> orders = orderRepository.findByBusinessBIdOrderByDateDesc(businessId);
        List<OrderResponseDTO> recentOrders = orders.stream()
                .limit(5)
                .map(this::mapOrderToDTO)
                .collect(Collectors.toList());

        List<Item> items = itemRepository.findByBusinessBId(businessId);
        List<ItemResponseDTO> lowStockItems = items.stream()
                .map(item -> {
                    int stock = batchRepository.getTotalStockForItem(businessId, item.getItemId());
                    List<Batch> activeBatches = batchRepository.findActiveBatchesByItem(businessId, item.getItemId());
                    BigDecimal price = activeBatches.isEmpty() ? BigDecimal.ZERO : activeBatches.get(0).getUnitPrice();
                    return ItemResponseDTO.builder()
                            .itemId(item.getItemId())
                            .businessId(businessId)
                            .name(item.getName())
                            .description(item.getDescription())
                            .currentStock(stock)
                            .unitPrice(price)
                            .build();
                })
                .filter(itemDTO -> itemDTO.getCurrentStock() <= 10)
                .collect(Collectors.toList());

        return BusinessAnalyticsResponseDTO.builder()
                .totalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO)
                .totalOrders(totalOrders)
                .totalItems(totalItems)
                .totalBatches(totalBatches)
                .totalCashiers(totalCashiers)
                .totalSuppliers(totalSuppliers)
                .recentOrders(recentOrders)
                .lowStockItems(lowStockItems)
                .build();
    }

    private OrderResponseDTO mapOrderToDTO(Order order) {
        List<OrderItemResponseDTO> itemDTOs = order.getOrderItems().stream()
                .map(oi -> OrderItemResponseDTO.builder()
                        .orderItemId(oi.getOdId())
                        .itemId(oi.getItem().getItemId())
                        .itemName(oi.getItem().getName())
                        .batchId(oi.getBatch().getBtId())
                        .qty(oi.getQty())
                        .unitPrice(oi.getUnitPrice())
                        .grandTotal(oi.getGrandTotal())
                        .build())
                .collect(Collectors.toList());

        return OrderResponseDTO.builder()
                .orderId(order.getOId())
                .businessId(order.getBusiness().getBId())
                .businessName(order.getBusiness().getBName())
                .customerId(order.getCustomer() != null ? order.getCustomer().getCusId() : null)
                .customerName(order.getCustomer() != null ? order.getCustomer().getName() : "Walk-in Customer")
                .customerMobile(order.getCustomer() != null ? order.getCustomer().getMobile() : null)
                .reference(order.getReference())
                .date(order.getDate())
                .paymentMethod(order.getPaymentMethod())
                .grandTotal(order.getGrandTotal())
                .items(itemDTOs)
                .build();
    }
}
