package com.marketplace.repository;

import com.marketplace.model.Offer;
import com.marketplace.model.OfferStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OfferRepository extends JpaRepository<Offer, Long> {

    List<Offer> findByNegotiationIdOrderByRoundNumberAsc(Long negotiationId);

    Optional<Offer> findTopByNegotiationIdOrderByRoundNumberDesc(Long negotiationId);

    List<Offer> findByNegotiationIdAndStatus(Long negotiationId, OfferStatus status);
}
