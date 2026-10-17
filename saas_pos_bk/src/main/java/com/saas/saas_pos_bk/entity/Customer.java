package com.saas.saas_pos_bk.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "customers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cus_id")
    private Long cusId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "b_id", nullable = false)
    private Business business;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "mobile", length = 20)
    private String mobile;

    @Column(name = "email", length = 150)
    private String email;
}
