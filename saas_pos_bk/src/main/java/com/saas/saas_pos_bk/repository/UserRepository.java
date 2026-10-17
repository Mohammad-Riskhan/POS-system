package com.saas.saas_pos_bk.repository;

import com.saas.saas_pos_bk.entity.Role;
import com.saas.saas_pos_bk.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    @Query("SELECT u FROM User u WHERE u.uEmail = :uEmail")
    Optional<User> findByUEmail(@Param("uEmail") String uEmail);

    @Query("SELECT COUNT(u) > 0 FROM User u WHERE u.uEmail = :uEmail")
    boolean existsByUEmail(@Param("uEmail") String uEmail);

    @Query("SELECT u FROM User u WHERE u.business.bId = :bId")
    List<User> findByBusinessBId(@Param("bId") Long bId);

    @Query("SELECT u FROM User u WHERE u.business.bId = :bId AND u.role = :role")
    List<User> findByBusinessBIdAndRole(@Param("bId") Long bId, @Param("role") Role role);

    @Query("SELECT u FROM User u WHERE u.business.bId = :bId AND u.role = :role")
    List<User> findFirstByBusinessBIdAndRoleList(@Param("bId") Long bId, @Param("role") Role role);

    default Optional<User> findFirstByBusinessBIdAndRole(Long bId, Role role) {
        List<User> list = findByBusinessBIdAndRole(bId, role);
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }

    @Query("SELECT COUNT(u) FROM User u WHERE u.business.bId = :bId")
    long countByBusinessBId(@Param("bId") Long bId);
}
