package com.marketplace.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "offers")
public class Offer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "negotiation_id")
    private Negotiation negotiation;

    @ManyToOne(optional = false)
    @JoinColumn(name = "sender_id")
    private User sender;

    @Positive(message = "Le prix proposé doit être positif")
    @Column(name = "proposed_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal proposedPrice;

    @Column(name = "proposed_quantity")
    private Integer proposedQuantity = 1;

    @Column(name = "round_number", nullable = false)
    private Integer roundNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OfferStatus status = OfferStatus.PENDING;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public Offer() {}

    public Offer(Negotiation negotiation, User sender, BigDecimal proposedPrice, Integer roundNumber) {
        this.negotiation = negotiation;
        this.sender = sender;
        this.proposedPrice = proposedPrice;
        this.roundNumber = roundNumber;
    }

    public Long getId() { return id; }

    public Negotiation getNegotiation() { return negotiation; }
    public void setNegotiation(Negotiation negotiation) { this.negotiation = negotiation; }

    public User getSender() { return sender; }
    public void setSender(User sender) { this.sender = sender; }

    public BigDecimal getProposedPrice() { return proposedPrice; }
    public void setProposedPrice(BigDecimal proposedPrice) { this.proposedPrice = proposedPrice; }

    public Integer getProposedQuantity() { return proposedQuantity; }
    public void setProposedQuantity(Integer proposedQuantity) { this.proposedQuantity = proposedQuantity; }

    public Integer getRoundNumber() { return roundNumber; }
    public void setRoundNumber(Integer roundNumber) { this.roundNumber = roundNumber; }

    public OfferStatus getStatus() { return status; }
    public void setStatus(OfferStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}
