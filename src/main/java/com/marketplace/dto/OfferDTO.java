package com.marketplace.dto;

import com.marketplace.model.OfferStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class OfferDTO {

    private Long id;
    private Long negotiationId;
    @NotNull(message = "L'identifiant de l'émetteur est obligatoire")
    private Long senderId;
    private String senderName;
    private OfferStatus status;
    private Integer roundNumber;
    private LocalDateTime createdAt;

    @NotNull(message = "Le prix proposé est obligatoire")
    @Positive(message = "Le prix proposé doit être positif")
    private BigDecimal proposedPrice;

    @PositiveOrZero(message = "La quantité doit être positive ou zéro")
    private Integer proposedQuantity = 1;

    public OfferDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getNegotiationId() { return negotiationId; }
    public void setNegotiationId(Long negotiationId) { this.negotiationId = negotiationId; }

    public Long getSenderId() { return senderId; }
    public void setSenderId(Long senderId) { this.senderId = senderId; }

    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }

    public OfferStatus getStatus() { return status; }
    public void setStatus(OfferStatus status) { this.status = status; }

    public Integer getRoundNumber() { return roundNumber; }
    public void setRoundNumber(Integer roundNumber) { this.roundNumber = roundNumber; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public BigDecimal getProposedPrice() { return proposedPrice; }
    public void setProposedPrice(BigDecimal proposedPrice) { this.proposedPrice = proposedPrice; }

    public Integer getProposedQuantity() { return proposedQuantity; }
    public void setProposedQuantity(Integer proposedQuantity) { this.proposedQuantity = proposedQuantity; }
}
