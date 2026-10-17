package com.saas.saas_pos_bk.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "u_id")
    private Long uId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "b_id")
    private Business business; // Nullable only for Super Admin (ROLE_OWNER)

    @Column(name = "u_name", nullable = false, length = 100)
    private String uName;

    @Column(name = "u_email", nullable = false, unique = true, length = 150)
    private String uEmail;

    @Column(name = "u_password", nullable = false, length = 255)
    private String uPassword;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 50, columnDefinition = "VARCHAR(50)")
    private Role role;

    @Column(name = "status", length = 30)
    private String status; // ACTIVE, DISABLED
}
