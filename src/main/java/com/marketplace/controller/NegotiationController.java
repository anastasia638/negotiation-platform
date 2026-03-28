package com.marketplace.controller;

import com.marketplace.agent.NegotiationEngine;
import com.marketplace.dto.NegotiationDTO;
import com.marketplace.service.NegotiationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/negotiations")
public class NegotiationController {

    private final NegotiationService negotiationService;
    private final NegotiationEngine negotiationEngine;

    public NegotiationController(NegotiationService negotiationService,
                                 NegotiationEngine negotiationEngine) {
        this.negotiationService = negotiationService;
        this.negotiationEngine = negotiationEngine;
    }

    // Démarrer une négociation
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public NegotiationDTO start(@Valid @RequestBody NegotiationDTO dto) {
        return negotiationService.start(dto);
    }

    // Détail d'une négociation + historique des offres
    @GetMapping("/{id}")
    public NegotiationDTO getById(@PathVariable Long id) {
        return negotiationService.findById(id);
    }

    // Historique des négociations d'un acheteur
    @GetMapping("/buyer/{buyerId}")
    public List<NegotiationDTO> getByBuyer(@PathVariable Long buyerId) {
        return negotiationService.findByBuyer(buyerId);
    }

    // Historique des négociations d'un vendeur
    @GetMapping("/seller/{sellerId}")
    public List<NegotiationDTO> getBySeller(@PathVariable Long sellerId) {
        return negotiationService.findBySeller(sellerId);
    }

    // Annuler une négociation
    @PatchMapping("/{id}/cancel")
    public NegotiationDTO cancel(@PathVariable Long id) {
        return negotiationService.cancel(id);
    }

    // Réponse automatique par un agent avec une stratégie
    // POST /api/negotiations/{id}/auto-respond?responderId=2&strategy=GREEDY
    @PostMapping("/{id}/auto-respond")
    public NegotiationDTO autoRespond(@PathVariable Long id,
                                      @RequestParam Long responderId,
                                      @RequestParam String strategy) {
        return negotiationEngine.autoRespond(id, responderId, strategy);
    }
}
