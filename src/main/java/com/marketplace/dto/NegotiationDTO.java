package com.marketplace.dto;

import com.marketplace.model.NegotiationStatus;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class NegotiationDTO {

    private Long id;
    private NegotiationStatus status;
    private BigDecimal finalPrice;
    private Integer finalQuantity;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private List<OfferDTO> offers;

    // Lecture
    private Long buyerId;
    private String buyerName;
    private Long sellerId;
    private String sellerName;
    private Long productId;
    private String productName;

    // Création (entrée)
    @NotNull(message = "L'identifiant du produit est obligatoire")
    private Long productIdRequest;

    @NotNull(message = "L'identifiant de l'acheteur est obligatoire")
    private Long buyerIdRequest;

    public NegotiationDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public NegotiationStatus getStatus() { return status; }
    public void setStatus(NegotiationStatus status) { this.status = status; }

    public BigDecimal getFinalPrice() { return finalPrice; }
    public void setFinalPrice(BigDecimal finalPrice) { this.finalPrice = finalPrice; }

    public Integer getFinalQuantity() { return finalQuantity; }
    public void setFinalQuantity(Integer finalQuantity) { this.finalQuantity = finalQuantity; }

    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }

    public LocalDateTime getEndedAt() { return endedAt; }
    public void setEndedAt(LocalDateTime endedAt) { this.endedAt = endedAt; }

    public List<OfferDTO> getOffers() { return offers; }
    public void setOffers(List<OfferDTO> offers) { this.offers = offers; }

    public Long getBuyerId() { return buyerId; }
    public void setBuyerId(Long buyerId) { this.buyerId = buyerId; }

    public String getBuyerName() { return buyerName; }
    public void setBuyerName(String buyerName) { this.buyerName = buyerName; }

    public Long getSellerId() { return sellerId; }
    public void setSellerId(Long sellerId) { this.sellerId = sellerId; }

    public String getSellerName() { return sellerName; }
    public void setSellerName(String sellerName) { this.sellerName = sellerName; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public Long getProductIdRequest() { return productIdRequest; }
    public void setProductIdRequest(Long productIdRequest) { this.productIdRequest = productIdRequest; }

    public Long getBuyerIdRequest() { return buyerIdRequest; }
    public void setBuyerIdRequest(Long buyerIdRequest) { this.buyerIdRequest = buyerIdRequest; }
}
