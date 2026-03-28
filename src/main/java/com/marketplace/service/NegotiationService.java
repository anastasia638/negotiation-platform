package com.marketplace.service;

import com.marketplace.dto.NegotiationDTO;
import com.marketplace.dto.OfferDTO;
import com.marketplace.model.*;
import com.marketplace.repository.NegotiationRepository;
import com.marketplace.repository.OfferRepository;
import com.marketplace.repository.ProductRepository;
import com.marketplace.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class NegotiationService {

    private final NegotiationRepository negotiationRepository;
    private final OfferRepository offerRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public NegotiationService(NegotiationRepository negotiationRepository,
                              OfferRepository offerRepository,
                              UserRepository userRepository,
                              ProductRepository productRepository) {
        this.negotiationRepository = negotiationRepository;
        this.offerRepository = offerRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public NegotiationDTO start(NegotiationDTO dto) {
        User buyer = userRepository.findById(dto.getBuyerIdRequest())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Acheteur introuvable : " + dto.getBuyerIdRequest()));

        if (buyer.getUserType() != UserType.BUYER) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "L'utilisateur n'est pas un acheteur");
        }

        Product product = productRepository.findById(dto.getProductIdRequest())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Produit introuvable : " + dto.getProductIdRequest()));

        if (product.getSeller() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ce produit n'a pas de vendeur assigné");
        }

        if (product.getSeller().getId().equals(buyer.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Un vendeur ne peut pas négocier son propre produit");
        }

        Negotiation negotiation = new Negotiation(buyer, product.getSeller(), product);
        negotiation.setStatus(NegotiationStatus.NEGOTIATING);
        return toDTO(negotiationRepository.save(negotiation));
    }

    public NegotiationDTO findById(Long id) {
        Negotiation negotiation = negotiationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Négociation introuvable : " + id));

        NegotiationDTO dto = toDTO(negotiation);
        List<OfferDTO> offers = offerRepository
                .findByNegotiationIdOrderByRoundNumberAsc(id)
                .stream().map(this::offerToDTO).toList();
        dto.setOffers(offers);
        return dto;
    }

    public Page<NegotiationDTO> findByBuyer(Long buyerId, Pageable pageable) {
        return negotiationRepository.findByBuyerId(buyerId, pageable).map(this::toDTO);
    }

    public Page<NegotiationDTO> findBySeller(Long sellerId, Pageable pageable) {
        return negotiationRepository.findBySellerId(sellerId, pageable).map(this::toDTO);
    }

    @Transactional
    public NegotiationDTO cancel(Long id) {
        Negotiation negotiation = negotiationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Négociation introuvable : " + id));

        if (negotiation.getStatus() == NegotiationStatus.AGREED
                || negotiation.getStatus() == NegotiationStatus.FAILED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Impossible d'annuler une négociation déjà terminée (statut : " + negotiation.getStatus() + ")");
        }

        negotiation.setStatus(NegotiationStatus.FAILED);
        negotiation.setEndedAt(java.time.LocalDateTime.now());
        return toDTO(negotiationRepository.save(negotiation));
    }

    // ---------- Mappers ----------

    NegotiationDTO toDTO(Negotiation n) {
        NegotiationDTO dto = new NegotiationDTO();
        dto.setId(n.getId());
        dto.setStatus(n.getStatus());
        dto.setFinalPrice(n.getFinalPrice());
        dto.setFinalQuantity(n.getFinalQuantity());
        dto.setStartedAt(n.getStartedAt());
        dto.setEndedAt(n.getEndedAt());
        dto.setBuyerId(n.getBuyer().getId());
        dto.setBuyerName(n.getBuyer().getName());
        dto.setSellerId(n.getSeller().getId());
        dto.setSellerName(n.getSeller().getName());
        dto.setProductId(n.getProduct().getId());
        dto.setProductName(n.getProduct().getName());
        return dto;
    }

    OfferDTO offerToDTO(Offer o) {
        OfferDTO dto = new OfferDTO();
        dto.setId(o.getId());
        dto.setNegotiationId(o.getNegotiation().getId());
        dto.setSenderId(o.getSender().getId());
        dto.setSenderName(o.getSender().getName());
        dto.setProposedPrice(o.getProposedPrice());
        dto.setProposedQuantity(o.getProposedQuantity());
        dto.setRoundNumber(o.getRoundNumber());
        dto.setStatus(o.getStatus());
        dto.setCreatedAt(o.getCreatedAt());
        return dto;
    }
}
