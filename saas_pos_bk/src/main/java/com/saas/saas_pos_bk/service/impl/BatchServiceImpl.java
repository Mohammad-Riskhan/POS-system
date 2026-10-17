package com.saas.saas_pos_bk.service.impl;

import com.saas.saas_pos_bk.dto.BatchCreateRequestDTO;
import com.saas.saas_pos_bk.dto.BatchResponseDTO;
import com.saas.saas_pos_bk.entity.Batch;
import com.saas.saas_pos_bk.entity.Business;
import com.saas.saas_pos_bk.entity.Item;
import com.saas.saas_pos_bk.entity.Supplier;
import com.saas.saas_pos_bk.exception.BadRequestException;
import com.saas.saas_pos_bk.exception.ResourceNotFoundException;
import com.saas.saas_pos_bk.repository.BatchRepository;
import com.saas.saas_pos_bk.repository.BusinessRepository;
import com.saas.saas_pos_bk.repository.ItemRepository;
import com.saas.saas_pos_bk.repository.SupplierRepository;
import com.saas.saas_pos_bk.service.BatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BatchServiceImpl implements BatchService {

    private final BatchRepository batchRepository;
    private final ItemRepository itemRepository;
    private final SupplierRepository supplierRepository;
    private final BusinessRepository businessRepository;

    @Override
    @Transactional
    public BatchResponseDTO createBatch(BatchCreateRequestDTO dto, Long businessId) {
        // Fetch Business reference
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with ID: " + businessId));

        // Validate Item exists under businessId
        Item item = itemRepository.findById(dto.getItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with ID: " + dto.getItemId()));

        if (!item.getBusiness().getBId().equals(businessId)) {
            throw new BadRequestException("Unauthorized access to item from another business");
        }

        // Validate Supplier exists under businessId
        Long supplierId = dto.getSupplierId() != null ? dto.getSupplierId() : dto.getSId();
        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with ID: " + supplierId));

        if (!supplier.getBusiness().getBId().equals(businessId)) {
            throw new BadRequestException("Unauthorized access to supplier from another business");
        }

        // DTO -> Entity with timestamp
        Batch batch = Batch.builder()
                .business(business)
                .item(item)
                .supplier(supplier)
                .qty(dto.getQty())
                .unitPrice(dto.getUnitPrice())
                .date(dto.getDate() != null ? dto.getDate() : LocalDateTime.now())
                .build();

        // Save
        Batch saved = batchRepository.save(batch);

        // Entity -> ResponseDTO
        return mapToDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BatchResponseDTO> getBatchesByBusiness(Long businessId) {
        return batchRepository.findByBusinessBId(businessId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public BatchResponseDTO getBatchById(Long id, Long businessId) {
        Batch batch = batchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found with ID: " + id));

        if (!batch.getBusiness().getBId().equals(businessId)) {
            throw new BadRequestException("Unauthorized access to batch from another business");
        }

        return mapToDTO(batch);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BatchResponseDTO> getActiveBatchesByItem(Long itemId, Long businessId) {
        return batchRepository.findActiveBatchesByItem(businessId, itemId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private BatchResponseDTO mapToDTO(Batch batch) {
        return BatchResponseDTO.builder()
                .batchId(batch.getBtId())
                .itemId(batch.getItem().getItemId())
                .itemName(batch.getItem().getName())
                .supplierId(batch.getSupplier().getSId())
                .supplierName(batch.getSupplier().getSName())
                .businessId(batch.getBusiness().getBId())
                .qty(batch.getQty())
                .unitPrice(batch.getUnitPrice())
                .date(batch.getDate())
                .build();
    }
}
