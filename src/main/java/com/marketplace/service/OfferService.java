package com.marketplace.service;

import com.marketplace.dto.OfferDTO;
import com.marketplace.model.*;
import com.marketplace.repository.NegotiationRepository;
import com.marketplace.repository.OfferRepository;
import com.marketplace.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class OfferService {

    private final OfferRepository offerRepository;
    private final NegotiationRepository negotiationRepository;
    private final UserRepository userRepository;
    private final NegotiationService negotiationService;

    public OfferService(OfferRepository offerRepository,
                        NegotiationRepository negotiationRepository,
                        UserRepository userRepository,
                        NegotiationService negotiationService) {
        this.offerRepository = offerRepository;
        this.negotiationRepository = negotiationRepository;
        this.userRepository = userRepository;
        this.negotiationService = negotiationService;
    }

    public List<OfferDTO> findByNegotiation(Long negotiationId) {
        ensureNegotiationExists(negotiationId);
        return offerRepository.findByNegotiationIdOrderByRoundNumberAsc(negotiationId)
                .stream().map(negotiationService::offerToDTO).toList();
    }

    @Transactional
    public OfferDTO propose(Long negotiationId, OfferDTO dto) {
        Negotiation negotiation = getNegotiationOrThrow(negotiationId);
        ensureNegotiating(negotiation);

        User sender = userRepository.findById(dto.getSenderId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Utilisateur introuvable : " + dto.getSenderId()));

        ensureSenderIsParticipant(negotiation, sender);

        // Protocole alternant : on vérifie que ce n'est pas au même expéditeur de jouer deux fois
        Optional<Offer> lastOffer = offerRepository.findTopByNegotiationIdOrderByRoundNumberDesc(negotiationId);
        lastOffer.ifPresent(last -> {
            if (last.getSender().getId().equals(sender.getId())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "C'est à l'autre participant de faire une offre (protocole alternant)");
            }
            // La dernière offre PENDING est maintenant remplacée — on la passe à REJECTED
            if (last.getStatus() == OfferStatus.PENDING) {
                last.setStatus(OfferStatus.REJECTED);
                offerRepository.save(last);
            }
        });

        int nextRound = lastOffer.map(o -> o.getRoundNumber() + 1).orElse(1);

        Offer offer = new Offer(negotiation, sender, dto.getProposedPrice(), nextRound);
        offer.setProposedQuantity(dto.getProposedQuantity() != null ? dto.getProposedQuantity() : 1);

        return negotiationService.offerToDTO(offerRepository.save(offer));
    }

    @Transactional
    public OfferDTO accept(Long negotiationId, Long offerId) {
        Negotiation negotiation = getNegotiationOrThrow(negotiationId);
        ensureNegotiating(negotiation);

        Offer offer = getOfferOrThrow(offerId, negotiationId);
        ensurePending(offer);

        offer.setStatus(OfferStatus.ACCEPTED);
        offerRepository.save(offer);

        // Clôture de la négociation
        negotiation.setStatus(NegotiationStatus.AGREED);
        negotiation.setFinalPrice(offer.getProposedPrice());
        negotiation.setFinalQuantity(offer.getProposedQuantity());
        negotiation.setEndedAt(LocalDateTime.now());
        negotiationRepository.save(negotiation);

        return negotiationService.offerToDTO(offer);
    }

    @Transactional
    public OfferDTO reject(Long negotiationId, Long offerId) {
        Negotiation negotiation = getNegotiationOrThrow(negotiationId);
        ensureNegotiating(negotiation);

        Offer offer = getOfferOrThrow(offerId, negotiationId);
        ensurePending(offer);

        offer.setStatus(OfferStatus.REJECTED);
        offerRepository.save(offer);

        // Rejet définitif = négociation échouée
        negotiation.setStatus(NegotiationStatus.FAILED);
        negotiation.setEndedAt(LocalDateTime.now());
        negotiationRepository.save(negotiation);

        return negotiationService.offerToDTO(offer);
    }

    // ---------- Helpers de validation ----------

    private Negotiation getNegotiationOrThrow(Long negotiationId) {
        return negotiationRepository.findById(negotiationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Négociation introuvable : " + negotiationId));
    }

    private void ensureNegotiationExists(Long negotiationId) {
        if (!negotiationRepository.existsById(negotiationId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Négociation introuvable : " + negotiationId);
        }
    }

    private void ensureNegotiating(Negotiation negotiation) {
        if (negotiation.getStatus() != NegotiationStatus.NEGOTIATING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "La négociation n'est pas active (statut : " + negotiation.getStatus() + ")");
        }
    }

    private void ensureSenderIsParticipant(Negotiation negotiation, User sender) {
        boolean isBuyer = negotiation.getBuyer().getId().equals(sender.getId());
        boolean isSeller = negotiation.getSeller().getId().equals(sender.getId());
        if (!isBuyer && !isSeller) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Cet utilisateur ne participe pas à cette négociation");
        }
    }

    private Offer getOfferOrThrow(Long offerId, Long negotiationId) {
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Offre introuvable : " + offerId));
        if (!offer.getNegotiation().getId().equals(negotiationId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Cette offre n'appartient pas à la négociation " + negotiationId);
        }
        return offer;
    }

    private void ensurePending(Offer offer) {
        if (offer.getStatus() != OfferStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Cette offre a déjà été traitée (statut : " + offer.getStatus() + ")");
        }
    }
}
