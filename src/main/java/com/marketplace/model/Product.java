package com.marketplace.model;

import jakarta.persistence.*;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private Double basePrice;

    public Product() {}

    public Product(String name, Double basePrice) {
        this.name = name;
        this.basePrice = basePrice;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public Double getBasePrice() { return basePrice; }

    public void setName(String name) { this.name = name; }
    public void setBasePrice(Double basePrice) { this.basePrice = basePrice; }
}
