package com.marketplace.repository;

import com.marketplace.model.Negotiation;
import com.marketplace.model.NegotiationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NegotiationRepository extends JpaRepository<Negotiation, Long> {

    List<Negotiation> findByBuyerId(Long buyerId);

    List<Negotiation> findBySellerId(Long sellerId);

    List<Negotiation> findByProductId(Long productId);

    List<Negotiation> findByStatus(NegotiationStatus status);
}
