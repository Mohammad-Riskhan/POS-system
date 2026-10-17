package com.saas.saas_pos_bk.service.impl;

import com.saas.saas_pos_bk.dto.ItemRequestDTO;
import com.saas.saas_pos_bk.dto.ItemResponseDTO;
import com.saas.saas_pos_bk.entity.Batch;
import com.saas.saas_pos_bk.entity.Business;
import com.saas.saas_pos_bk.entity.Item;
import com.saas.saas_pos_bk.exception.BadRequestException;
import com.saas.saas_pos_bk.exception.ResourceNotFoundException;
import com.saas.saas_pos_bk.repository.BatchRepository;
import com.saas.saas_pos_bk.repository.BusinessRepository;
import com.saas.saas_pos_bk.repository.ItemRepository;
import com.saas.saas_pos_bk.service.ItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ItemServiceImpl implements ItemService {

    private final ItemRepository itemRepository;
    private final BusinessRepository businessRepository;
    private final BatchRepository batchRepository;

    @Override
    @Transactional
    public ItemResponseDTO createItem(ItemRequestDTO dto, Long businessId) {
        // Fetch Business reference
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with ID: " + businessId));

        // DTO -> Entity
        Item item = Item.builder()
                .business(business)
                .name(dto.getName())
                .description(dto.getDescription())
                .build();

        // Save
        Item saved = itemRepository.save(item);

        // Entity -> ResponseDTO
        return mapToDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ItemResponseDTO> getItemsByBusiness(Long businessId) {
        return itemRepository.findByBusinessBId(businessId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ItemResponseDTO getItemById(Long itemId, Long businessId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with ID: " + itemId));

        if (!item.getBusiness().getBId().equals(businessId)) {
            throw new BadRequestException("Unauthorized access to item from another business");
        }

        return mapToDTO(item);
    }

    @Override
    @Transactional
    public ItemResponseDTO updateItem(Long itemId, ItemRequestDTO dto, Long businessId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with ID: " + itemId));

        if (!item.getBusiness().getBId().equals(businessId)) {
            throw new BadRequestException("Unauthorized access to item from another business");
        }

        item.setName(dto.getName());
        item.setDescription(dto.getDescription());
        Item updated = itemRepository.save(item);
        return mapToDTO(updated);
    }

    @Override
    @Transactional
    public void deleteItem(Long itemId, Long businessId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with ID: " + itemId));

        if (!item.getBusiness().getBId().equals(businessId)) {
            throw new BadRequestException("Unauthorized access to item from another business");
        }

        itemRepository.delete(item);
    }

    private ItemResponseDTO mapToDTO(Item item) {
        List<Batch> activeBatches = batchRepository.findActiveBatchesByItem(item.getBusiness().getBId(), item.getItemId());
        int totalStock = activeBatches.stream().mapToInt(Batch::getQty).sum();
        BigDecimal latestPrice = activeBatches.isEmpty() ? BigDecimal.ZERO : activeBatches.get(0).getUnitPrice();

        return ItemResponseDTO.builder()
                .itemId(item.getItemId())
                .businessId(item.getBusiness().getBId())
                .name(item.getName())
                .description(item.getDescription())
                .currentStock(totalStock)
                .unitPrice(latestPrice)
                .build();
    }
}
