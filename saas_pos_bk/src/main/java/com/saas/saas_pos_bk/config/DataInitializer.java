package com.saas.saas_pos_bk.config;

import com.saas.saas_pos_bk.entity.Role;
import com.saas.saas_pos_bk.entity.User;
import com.saas.saas_pos_bk.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    public static final String SUPER_ADMIN_EMAIL = "superadmin@pos.com";
    public static final String SUPER_ADMIN_PASSWORD = "SuperAdmin@123";

    private final UserRepository userRepository;
    private final BusinessRepository businessRepository;
    private final SupplierRepository supplierRepository;
    private final ItemRepository itemRepository;
    private final BatchRepository batchRepository;
    private final CustomerRepository customerRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderRepository orderRepository;
    private final PasswordEncoder passwordEncoder;
    private final javax.sql.DataSource dataSource;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Checking data initialization for Multi-Tenant POS system...");

        // Ensure users.role column accommodates ROLE_SUPER_ADMIN without truncation and index migrations
        try (java.sql.Connection conn = dataSource.getConnection();
             java.sql.Statement stmt = conn.createStatement()) {
            stmt.execute("ALTER TABLE users MODIFY COLUMN role VARCHAR(50) NOT NULL");
            log.info("Verified users.role schema column width to VARCHAR(50)");

            // Drop legacy global unique index on orders(reference) to support tenant-scoped sequences (e.g. INV-0001)
            try {
                stmt.execute("ALTER TABLE orders DROP INDEX UKmsasak5ul79vpg5fimli8jwrd");
            } catch (Exception ignored) {}
            try {
                stmt.execute("ALTER TABLE orders DROP INDEX reference");
            } catch (Exception ignored) {}
            try {
                stmt.execute("ALTER TABLE orders ADD UNIQUE INDEX uk_tenant_order_ref (b_id, reference)");
                log.info("Enforced composite unique index on orders (b_id, reference)");
            } catch (Exception ignored) {}

            // Ensure AUTO_INCREMENT starts from 1 for tables when empty
            String[] tables = {"orders", "order_items", "batches", "items", "customers", "suppliers", "users", "businesses"};
            for (String tbl : tables) {
                try {
                    java.sql.ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM " + tbl);
                    if (rs.next() && rs.getInt(1) == 0) {
                        stmt.execute("ALTER TABLE " + tbl + " AUTO_INCREMENT = 1");
                    }
                } catch (Exception ignored) {}
            }
        } catch (Exception e) {
            log.warn("Schema check note on database: {}", e.getMessage());
        }

        // 1. Purge any dummy demo data if present
        businessRepository.findByEmail("contact@apexretail.com").ifPresent(biz -> {
            log.info("Purging demo business and all dummy data: {}", biz.getBName());
            orderItemRepository.deleteAll();
            orderRepository.deleteAll();
            batchRepository.deleteAll();
            itemRepository.deleteAll();
            supplierRepository.deleteAll();
            customerRepository.deleteAll();
            userRepository.findByBusinessBId(biz.getBId()).forEach(userRepository::delete);
            businessRepository.delete(biz);
            log.info("Demo business and associated dummy records removed successfully.");
        });

        // 2. Remove / wipe out any legacy, outdated, or duplicate Super Admin user records
        java.util.List<String> legacyEmails = java.util.List.of(
                "admin@pos.com",
                "Riskhan@gmail.com",
                "owner@apexretail.com",
                "cashier@apexretail.com"
        );
        for (String legacyEmail : legacyEmails) {
            userRepository.findByUEmail(legacyEmail).ifPresent(user -> {
                log.info("Wiping legacy account: {}", legacyEmail);
                userRepository.delete(user);
            });
        }

        // Wipe any extraneous accounts that have ROLE_SUPER_ADMIN or no business, except the single designated SUPER_ADMIN_EMAIL
        userRepository.findAll().stream()
                .filter(u -> (u.getRole() == Role.ROLE_SUPER_ADMIN || (u.getBusiness() == null && u.getRole() == Role.ROLE_OWNER)))
                .filter(u -> !SUPER_ADMIN_EMAIL.equalsIgnoreCase(u.getUEmail()))
                .forEach(u -> {
                    log.info("Wiping duplicate/extraneous admin account: {}", u.getUEmail());
                    userRepository.delete(u);
                });

        // 3. Create / Enforce ONE and ONLY ONE Super Admin account
        User superAdmin = userRepository.findByUEmail(SUPER_ADMIN_EMAIL).orElse(null);
        if (superAdmin == null) {
            superAdmin = User.builder()
                    .business(null)
                    .uName("System Super Admin")
                    .uEmail(SUPER_ADMIN_EMAIL)
                    .uPassword(passwordEncoder.encode(SUPER_ADMIN_PASSWORD))
                    .role(Role.ROLE_SUPER_ADMIN)
                    .status("ACTIVE")
                    .build();
            userRepository.save(superAdmin);
            log.info(">>> Provisioned single dedicated Super Admin: {} / {}", SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD);
        } else {
            boolean updated = false;
            if (!passwordEncoder.matches(SUPER_ADMIN_PASSWORD, superAdmin.getUPassword())) {
                superAdmin.setUPassword(passwordEncoder.encode(SUPER_ADMIN_PASSWORD));
                updated = true;
            }
            if (!"ACTIVE".equalsIgnoreCase(superAdmin.getStatus())) {
                superAdmin.setStatus("ACTIVE");
                updated = true;
            }
            if (superAdmin.getRole() != Role.ROLE_SUPER_ADMIN) {
                superAdmin.setRole(Role.ROLE_SUPER_ADMIN);
                updated = true;
            }
            if (superAdmin.getBusiness() != null) {
                superAdmin.setBusiness(null);
                updated = true;
            }
            if (updated) {
                userRepository.save(superAdmin);
                log.info(">>> Enforced clean credentials and ROLE_SUPER_ADMIN for {}", SUPER_ADMIN_EMAIL);
            }
        }
    }
}
