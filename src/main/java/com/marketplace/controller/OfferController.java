package com.marketplace.controller;

import com.marketplace.dto.OfferDTO;
import com.marketplace.service.OfferService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/negotiations/{negotiationId}/offers")
public class OfferController {

    private final OfferService offerService;

    public OfferController(OfferService offerService) {
        this.offerService = offerService;
    }

    // Historique de toutes les offres d'une négociation
    @GetMapping
    public List<OfferDTO> getAll(@PathVariable Long negotiationId) {
        return offerService.findByNegotiation(negotiationId);
    }

    // Proposer ou contre-proposer
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OfferDTO propose(@PathVariable Long negotiationId,
                            @Valid @RequestBody OfferDTO dto) {
        return offerService.propose(negotiationId, dto);
    }

    // Accepter une offre → négociation AGREED
    @PatchMapping("/{offerId}/accept")
    public OfferDTO accept(@PathVariable Long negotiationId,
                           @PathVariable Long offerId) {
        return offerService.accept(negotiationId, offerId);
    }

    // Rejeter définitivement une offre → négociation FAILED
    @PatchMapping("/{offerId}/reject")
    public OfferDTO reject(@PathVariable Long negotiationId,
                           @PathVariable Long offerId) {
        return offerService.reject(negotiationId, offerId);
    }
}
