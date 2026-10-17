package com.saas.saas_pos_bk.service.impl;

import com.saas.saas_pos_bk.dto.*;
import com.saas.saas_pos_bk.entity.*;
import com.saas.saas_pos_bk.exception.BadRequestException;
import com.saas.saas_pos_bk.exception.InsufficientStockException;
import com.saas.saas_pos_bk.exception.ResourceNotFoundException;
import com.saas.saas_pos_bk.repository.*;
import com.saas.saas_pos_bk.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final BatchRepository batchRepository;
    private final ItemRepository itemRepository;
    private final CustomerRepository customerRepository;
    private final BusinessRepository businessRepository;

    @Override
    @Transactional
    public OrderResponseDTO processOrder(OrderCreateRequestDTO dto, Long businessId) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with ID: " + businessId));

        if ("SUSPENDED".equalsIgnoreCase(business.getBStatus())) {
            throw new BadRequestException("Business is suspended. Checkout is disabled.");
        }

        Long customerId = dto.getCustomerId() != null ? dto.getCustomerId() : dto.getCusId();
        Customer customer = null;
        if (customerId != null) {
            customer = customerRepository.findById(customerId)
                    .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + customerId));
            if (!customer.getBusiness().getBId().equals(businessId)) {
                throw new BadRequestException("Unauthorized access to customer from another business");
            }
        }

        // 1. Generate tenant-scoped consecutive invoice reference starting from 1 (e.g. INV-0001)
        long nextSeq = orderRepository.countByBusinessBId(businessId) + 1;
        String refCode = String.format("INV-%04d", nextSeq);
        while (orderRepository.findByReferenceAndBusinessBId(refCode, businessId).isPresent()) {
            nextSeq++;
            refCode = String.format("INV-%04d", nextSeq);
        }

        Order order = Order.builder()
                .business(business)
                .customer(customer)
                .reference(refCode)
                .date(LocalDateTime.now())
                .paymentMethod(dto.getPaymentMethod() != null ? dto.getPaymentMethod().toUpperCase() : "CASH")
                .grandTotal(BigDecimal.ZERO)
                .build();

        Order savedOrder = orderRepository.save(order);

        BigDecimal grandTotal = BigDecimal.ZERO;
        List<OrderItem> persistedItems = new ArrayList<>();

        // 2. Iterate through line items: verify stock, deduct quantity, compute line totals
        for (OrderItemRequestDTO itemDto : dto.getItems()) {
            Item item = itemRepository.findById(itemDto.getItemId())
                    .orElseThrow(() -> new ResourceNotFoundException("Item not found with ID: " + itemDto.getItemId()));

            if (!item.getBusiness().getBId().equals(businessId)) {
                throw new BadRequestException("Unauthorized access to item from another business: " + item.getName());
            }

            Long batchId = itemDto.getBatchId() != null ? itemDto.getBatchId() : itemDto.getBtId();

            if (batchId != null) {
                // Deduct from specific batch
                Batch batch = batchRepository.findById(batchId)
                        .orElseThrow(() -> new ResourceNotFoundException("Batch not found with ID: " + batchId));

                if (!batch.getBusiness().getBId().equals(businessId)) {
                    throw new BadRequestException("Batch does not belong to this business");
                }
                if (!batch.getItem().getItemId().equals(item.getItemId())) {
                    throw new BadRequestException("Batch #" + batch.getBtId() + " does not belong to item: " + item.getName());
                }

                if (batch.getQty() < itemDto.getQty()) {
                    throw new InsufficientStockException("Insufficient stock in batch #" + batch.getBtId() +
                            " for item: " + item.getName() + " (Available: " + batch.getQty() + ", Requested: " + itemDto.getQty() + ")");
                }

                // Deduct quantity
                batch.setQty(batch.getQty() - itemDto.getQty());
                batchRepository.save(batch);

                BigDecimal unitPrice = itemDto.getUnitPrice() != null ? itemDto.getUnitPrice() : batch.getUnitPrice();
                BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(itemDto.getQty()));

                OrderItem orderItem = OrderItem.builder()
                        .order(savedOrder)
                        .item(item)
                        .batch(batch)
                        .qty(itemDto.getQty())
                        .unitPrice(unitPrice)
                        .grandTotal(lineTotal)
                        .build();

                persistedItems.add(orderItemRepository.save(orderItem));
                grandTotal = grandTotal.add(lineTotal);

            } else {
                // Auto FIFO allocation across active batches
                List<Batch> activeBatches = batchRepository.findActiveBatchesByItem(businessId, item.getItemId());
                int totalAvailable = activeBatches.stream().mapToInt(Batch::getQty).sum();

                if (totalAvailable < itemDto.getQty()) {
                    throw new InsufficientStockException("Insufficient stock for item: " + item.getName() +
                            " (Total Available: " + totalAvailable + ", Requested: " + itemDto.getQty() + ")");
                }

                int remainingNeeded = itemDto.getQty();
                for (Batch batch : activeBatches) {
                    if (remainingNeeded <= 0) break;

                    int takeQty = Math.min(batch.getQty(), remainingNeeded);
                    batch.setQty(batch.getQty() - takeQty);
                    batchRepository.save(batch);

                    BigDecimal unitPrice = itemDto.getUnitPrice() != null ? itemDto.getUnitPrice() : batch.getUnitPrice();
                    BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(takeQty));

                    OrderItem orderItem = OrderItem.builder()
                        .order(savedOrder)
                        .item(item)
                        .batch(batch)
                        .qty(takeQty)
                        .unitPrice(unitPrice)
                        .grandTotal(lineTotal)
                        .build();

                    persistedItems.add(orderItemRepository.save(orderItem));
                    grandTotal = grandTotal.add(lineTotal);
                    remainingNeeded -= takeQty;
                }
            }
        }

        // 3. Persist Order and cascaded totals
        savedOrder.setGrandTotal(grandTotal);
        savedOrder.setOrderItems(persistedItems);
        orderRepository.save(savedOrder);

        // 4. Convert saved Order entity and child items into OrderResponseDTO and return
        return mapToDTO(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponseDTO> getOrdersByBusiness(Long businessId) {
        return orderRepository.findByBusinessBIdOrderByDateDesc(businessId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponseDTO getOrderByReference(String reference, Long businessId) {
        Order order = orderRepository.findByReferenceAndBusinessBId(reference, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with reference: " + reference));

        return mapToDTO(order);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponseDTO getOrderById(Long orderId, Long businessId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        if (!order.getBusiness().getBId().equals(businessId)) {
            throw new BadRequestException("Unauthorized access to order from another business");
        }

        return mapToDTO(order);
    }

    private OrderResponseDTO mapToDTO(Order order) {
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
                .customerName(order.getCustomer() != null ? order.getCustomer().getName() : "Walk-in Client")
                .customerMobile(order.getCustomer() != null ? order.getCustomer().getMobile() : null)
                .reference(order.getReference())
                .date(order.getDate())
                .paymentMethod(order.getPaymentMethod())
                .grandTotal(order.getGrandTotal())
                .items(itemDTOs)
                .build();
    }
}
