package com.saas.saas_pos_bk.repository;

import com.saas.saas_pos_bk.entity.Business;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BusinessRepository extends JpaRepository<Business, Long> {
    Optional<Business> findByEmail(String email);
    boolean existsByEmail(String email);
}
