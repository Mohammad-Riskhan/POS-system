package com.saas.saas_pos_bk.service;

import com.saas.saas_pos_bk.dto.ItemRequestDTO;
import com.saas.saas_pos_bk.dto.ItemResponseDTO;

import java.util.List;

public interface ItemService {
    ItemResponseDTO createItem(ItemRequestDTO dto, Long businessId);
    List<ItemResponseDTO> getItemsByBusiness(Long businessId);
    ItemResponseDTO getItemById(Long itemId, Long businessId);
    ItemResponseDTO updateItem(Long itemId, ItemRequestDTO dto, Long businessId);
    void deleteItem(Long itemId, Long businessId);
}
