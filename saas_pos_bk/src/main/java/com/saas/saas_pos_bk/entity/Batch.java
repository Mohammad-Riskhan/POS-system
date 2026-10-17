package com.saas.saas_pos_bk.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
    name = "batches",
    indexes = {
        @Index(name = "idx_batch_business", columnList = "b_id"),
        @Index(name = "idx_batch_item", columnList = "item_id"),
        @Index(name = "idx_batch_supplier", columnList = "s_id"),
        @Index(name = "idx_batch_item_fifo", columnList = "b_id, item_id, qty, date")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"item", "supplier", "business", "orderItems"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Batch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "bt_id")
    @EqualsAndHashCode.Include
    private Long btId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "s_id", nullable = false)
    private Supplier supplier;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "b_id", nullable = false)
    private Business business;

    @Column(name = "qty", nullable = false)
    private Integer qty;

    @Column(name = "unit_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "date", nullable = false)
    private LocalDateTime date;

    @Builder.Default
    @OneToMany(mappedBy = "batch", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<OrderItem> orderItems = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (this.date == null) {
            this.date = LocalDateTime.now();
        }
        if (this.qty == null) {
            this.qty = 0;
        }
    }

    // Convenience getter alias
    public Long getId() {
        return btId;
    }

    // Business domain helper methods
    public boolean hasSufficientStock(int requestedQty) {
        return this.qty != null && this.qty >= requestedQty;
    }

    public void deductStock(int amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Deduction quantity must be positive: " + amount);
        }
        if (!hasSufficientStock(amount)) {
            throw new IllegalStateException("Insufficient stock in batch #" + this.btId + 
                    ". Available: " + (this.qty != null ? this.qty : 0) + ", Requested: " + amount);
        }
        this.qty -= amount;
    }

    public void addStock(int amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Added stock quantity must be positive: " + amount);
        }
        this.qty = (this.qty != null ? this.qty : 0) + amount;
    }

    public boolean isOutOfStock() {
        return this.qty == null || this.qty <= 0;
    }

    public BigDecimal getTotalValue() {
        if (this.unitPrice == null || this.qty == null) {
            return BigDecimal.ZERO;
        }
        return this.unitPrice.multiply(BigDecimal.valueOf(this.qty));
    }
}

