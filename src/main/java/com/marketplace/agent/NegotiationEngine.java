package com.marketplace.agent;

import com.marketplace.dto.NegotiationDTO;
import com.marketplace.dto.OfferDTO;
import com.marketplace.model.*;
import com.marketplace.repository.NegotiationRepository;
import com.marketplace.repository.OfferRepository;
import com.marketplace.service.NegotiationService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Moteur de négociation automatique (protocole alternant).
 *
 * Orchestre un round complet :
 *   1. Récupère la dernière offre PENDING
 *   2. Applique la stratégie choisie
 *   3. Accepte / contre-propose / rejette automatiquement
 */
@Component
public class NegotiationEngine {

    private static final int MAX_ROUNDS = 10;

    private final NegotiationRepository negotiationRepository;
    private final OfferRepository offerRepository;
    private final NegotiationService negotiationService;

    public NegotiationEngine(NegotiationRepository negotiationRepository,
                             OfferRepository offerRepository,
                             NegotiationService negotiationService) {
        this.negotiationRepository = negotiationRepository;
        this.offerRepository = offerRepository;
        this.negotiationService = negotiationService;
    }

    /**
     * Joue un round automatique pour un participant (acheteur ou vendeur).
     *
     * @param negotiationId  identifiant de la négociation
     * @param responderId    identifiant du participant qui répond automatiquement
     * @param strategyName   "GREEDY", "FRUGAL" ou "COOL_HEADED"
     * @return               DTO de la négociation mise à jour
     */
    @Transactional
    public NegotiationDTO autoRespond(Long negotiationId, Long responderId, String strategyName) {
        Negotiation negotiation = negotiationRepository.findById(negotiationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Négociation introuvable : " + negotiationId));

        if (negotiation.getStatus() != NegotiationStatus.NEGOTIATING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "La négociation n'est pas active (statut : " + negotiation.getStatus() + ")");
        }

        Optional<Offer> lastOfferOpt = offerRepository.findTopByNegotiationIdOrderByRoundNumberDesc(negotiationId);
        if (lastOfferOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Aucune offre à traiter");
        }

        Offer lastOffer = lastOfferOpt.get();
        if (lastOffer.getStatus() != OfferStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "La dernière offre a déjà été traitée");
        }
        if (lastOffer.getSender().getId().equals(responderId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "C'est à l'adversaire de répondre");
        }

        // Récupérer la plage de prix du produit
        BigDecimal minPrice = negotiation.getProduct().getPriceMin() != null
                ? negotiation.getProduct().getPriceMin()
                : lastOffer.getProposedPrice().multiply(BigDecimal.valueOf(0.7));
        BigDecimal maxPrice = negotiation.getProduct().getPriceMax() != null
                ? negotiation.getProduct().getPriceMax()
                : lastOffer.getProposedPrice().multiply(BigDecimal.valueOf(1.3));

        NegotiationStrategy strategy = resolveStrategy(strategyName);
        StrategyDecision decision = strategy.evaluate(
                lastOffer.getProposedPrice(),
                minPrice,
                maxPrice,
                lastOffer.getRoundNumber(),
                MAX_ROUNDS
        );

        User responder = responderId.equals(negotiation.getBuyer().getId())
                ? negotiation.getBuyer()
                : negotiation.getSeller();

        switch (decision.getAction()) {
            case ACCEPT -> {
                lastOffer.setStatus(OfferStatus.ACCEPTED);
                offerRepository.save(lastOffer);
                negotiation.setStatus(NegotiationStatus.AGREED);
                negotiation.setFinalPrice(lastOffer.getProposedPrice());
                negotiation.setFinalQuantity(lastOffer.getProposedQuantity());
                negotiation.setEndedAt(LocalDateTime.now());
                negotiationRepository.save(negotiation);
            }
            case REJECT -> {
                lastOffer.setStatus(OfferStatus.REJECTED);
                offerRepository.save(lastOffer);
                negotiation.setStatus(NegotiationStatus.FAILED);
                negotiation.setEndedAt(LocalDateTime.now());
                negotiationRepository.save(negotiation);
            }
            case COUNTER -> {
                lastOffer.setStatus(OfferStatus.REJECTED);
                offerRepository.save(lastOffer);
                Offer counter = new Offer(negotiation, responder,
                        decision.getCounterPrice(), lastOffer.getRoundNumber() + 1);
                offerRepository.save(counter);
            }
        }

        return negotiationService.findById(negotiationId);
    }

    private NegotiationStrategy resolveStrategy(String name) {
        return switch (name.toUpperCase()) {
            case "GREEDY"      -> new GreedyStrategy();
            case "FRUGAL"      -> new FrugalStrategy();
            case "COOL_HEADED" -> new CoolHeadedStrategy();
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Stratégie inconnue : " + name + ". Valeurs : GREEDY, FRUGAL, COOL_HEADED");
        };
    }
}
