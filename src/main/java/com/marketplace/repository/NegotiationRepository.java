package com.marketplace.repository;

import com.marketplace.model.Negotiation;
import com.marketplace.model.NegotiationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NegotiationRepository extends JpaRepository<Negotiation, Long> {

    Page<Negotiation> findByBuyerId(Long buyerId, Pageable pageable);

    Page<Negotiation> findBySellerId(Long sellerId, Pageable pageable);

    List<Negotiation> findByProductId(Long productId);

    List<Negotiation> findByStatus(NegotiationStatus status);
}
