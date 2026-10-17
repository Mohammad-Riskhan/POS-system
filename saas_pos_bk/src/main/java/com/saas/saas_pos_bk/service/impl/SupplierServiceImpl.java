package com.saas.saas_pos_bk.service.impl;

import com.saas.saas_pos_bk.dto.SupplierRequestDTO;
import com.saas.saas_pos_bk.dto.SupplierResponseDTO;
import com.saas.saas_pos_bk.entity.Business;
import com.saas.saas_pos_bk.entity.Supplier;
import com.saas.saas_pos_bk.exception.BadRequestException;
import com.saas.saas_pos_bk.exception.ResourceNotFoundException;
import com.saas.saas_pos_bk.repository.BusinessRepository;
import com.saas.saas_pos_bk.repository.SupplierRepository;
import com.saas.saas_pos_bk.service.SupplierService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository supplierRepository;
    private final BusinessRepository businessRepository;

    @Override
    @Transactional
    public SupplierResponseDTO createSupplier(SupplierRequestDTO dto, Long businessId) {
        // Fetch Business reference
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with ID: " + businessId));

        // DTO -> Entity
        Supplier supplier = Supplier.builder()
                .business(business)
                .sName(dto.getSupplierName() != null ? dto.getSupplierName() : dto.getSName())
                .mobile(dto.getMobile())
                .address(dto.getAddress())
                .build();

        // Save
        Supplier saved = supplierRepository.save(supplier);

        // Entity -> ResponseDTO
        return mapToDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupplierResponseDTO> getSuppliersByBusiness(Long businessId) {
        return supplierRepository.findByBusinessBId(businessId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SupplierResponseDTO getSupplierById(Long supplierId, Long businessId) {
        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with ID: " + supplierId));

        if (!supplier.getBusiness().getBId().equals(businessId)) {
            throw new BadRequestException("Unauthorized access to supplier from another business");
        }

        return mapToDTO(supplier);
    }

    @Override
    @Transactional
    public SupplierResponseDTO updateSupplier(Long supplierId, SupplierRequestDTO dto, Long businessId) {
        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with ID: " + supplierId));

        if (!supplier.getBusiness().getBId().equals(businessId)) {
            throw new BadRequestException("Unauthorized access to supplier from another business");
        }

        supplier.setSName(dto.getSupplierName() != null ? dto.getSupplierName() : dto.getSName());
        supplier.setMobile(dto.getMobile());
        supplier.setAddress(dto.getAddress());
        Supplier updated = supplierRepository.save(supplier);
        return mapToDTO(updated);
    }

    @Override
    @Transactional
    public void deleteSupplier(Long supplierId, Long businessId) {
        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with ID: " + supplierId));

        if (!supplier.getBusiness().getBId().equals(businessId)) {
            throw new BadRequestException("Unauthorized access to supplier from another business");
        }

        supplierRepository.delete(supplier);
    }

    private SupplierResponseDTO mapToDTO(Supplier supplier) {
        return SupplierResponseDTO.builder()
                .supplierId(supplier.getSId())
                .businessId(supplier.getBusiness().getBId())
                .supplierName(supplier.getSName())
                .mobile(supplier.getMobile())
                .address(supplier.getAddress())
                .build();
    }
}
