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

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public NegotiationDTO start(@Valid @RequestBody NegotiationDTO dto) {
        return negotiationService.start(dto);
    }

    @GetMapping("/{id}")
    public NegotiationDTO getById(@PathVariable Long id) {
        return negotiationService.findById(id);
    }

    @GetMapping("/buyer/{buyerId}")
    public Page<NegotiationDTO> getByBuyer(@PathVariable Long buyerId,
            @PageableDefault(size = 20, sort = "startedAt") Pageable pageable) {
        return negotiationService.findByBuyer(buyerId, pageable);
    }

    @GetMapping("/seller/{sellerId}")
    public Page<NegotiationDTO> getBySeller(@PathVariable Long sellerId,
            @PageableDefault(size = 20, sort = "startedAt") Pageable pageable) {
        return negotiationService.findBySeller(sellerId, pageable);
    }

    @PatchMapping("/{id}/cancel")
    public NegotiationDTO cancel(@PathVariable Long id) {
        return negotiationService.cancel(id);
    }

    // Déclenche un round automatique côté vendeur (ou acheteur) selon la stratégie choisie.
    // Le frontend appelle cet endpoint après chaque offre manuelle pour obtenir la réponse agent.
    @PostMapping("/{id}/auto-respond")
    public NegotiationDTO autoRespond(@PathVariable Long id,
                                      @RequestParam Long responderId,
                                      @RequestParam String strategy,
                                      @RequestParam(defaultValue = "10") int maxRounds) {
        return negotiationEngine.autoRespond(id, responderId, strategy, maxRounds);
    }
}
