package com.marketplace.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
public class Product {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "seller_id")
    private User seller;
    
    @NotBlank(message = "Le nom du produit est obligatoire")
    @Column(nullable = false)
    private String name;
    
    private String category;
    private String brand;
    
    @Column(name = "price_min")
    private BigDecimal priceMin;
    
    @Column(name = "price_max")
    private BigDecimal priceMax;
    
    @Column(name = "base_price")
    private BigDecimal basePrice;
    
    @Column(name = "stock_quantity")
    @PositiveOrZero(message = "Le stock doit être positif ou zéro")
    private Integer stockQuantity;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
    
    public Product() {}
    
    public Product(User seller, String name, String category, BigDecimal priceMin, BigDecimal priceMax) {
        this.seller = seller;
        this.name = name;
        this.category = category;
        this.priceMin = priceMin;
        this.priceMax = priceMax;
    }
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public User getSeller() { return seller; }
    public void setSeller(User seller) { this.seller = seller; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    
    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }
    
    public BigDecimal getPriceMin() { return priceMin; }
    public void setPriceMin(BigDecimal priceMin) { this.priceMin = priceMin; }
    
    public BigDecimal getPriceMax() { return priceMax; }
    public void setPriceMax(BigDecimal priceMax) { this.priceMax = priceMax; }
    
    @Positive(message = "Le prix de base doit être positif")
    public BigDecimal getBasePrice() { return basePrice; }
    public void setBasePrice(BigDecimal basePrice) { this.basePrice = basePrice; }
    
    public Integer getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
}
