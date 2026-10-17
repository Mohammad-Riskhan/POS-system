package com.saas.saas_pos_bk.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "suppliers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Supplier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "s_id")
    private Long sId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "b_id", nullable = false)
    private Business business;

    @Column(name = "s_name", nullable = false, length = 150)
    private String sName;

    @Column(name = "mobile", length = 20)
    private String mobile;

    @Column(name = "address", columnDefinition = "TEXT")
    private String address;
}
