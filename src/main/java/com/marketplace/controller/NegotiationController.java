package com.marketplace.controller;

import com.marketplace.agent.NegotiationEngine;
import com.marketplace.dto.NegotiationDTO;
import com.marketplace.service.NegotiationService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
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

    // Historique des négociations d'un acheteur (paginé)
    @GetMapping("/buyer/{buyerId}")
    public Page<NegotiationDTO> getByBuyer(@PathVariable Long buyerId,
            @PageableDefault(size = 20, sort = "startedAt") Pageable pageable) {
        return negotiationService.findByBuyer(buyerId, pageable);
    }

    // Historique des négociations d'un vendeur (paginé)
    @GetMapping("/seller/{sellerId}")
    public Page<NegotiationDTO> getBySeller(@PathVariable Long sellerId,
            @PageableDefault(size = 20, sort = "startedAt") Pageable pageable) {
        return negotiationService.findBySeller(sellerId, pageable);
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
