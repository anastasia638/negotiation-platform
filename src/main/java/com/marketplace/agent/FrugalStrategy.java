package com.marketplace.agent;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Vendeur coopératif qui préfère conclure une vente rapidement.
 * Sa contre-offre part du prix minimum et monte doucement (+3% par round).
 * Il n'est pas là pour maximiser — dès que l'acheteur atteint sa cible,
 * il accepte sans hésiter.
 */
public class FrugalStrategy implements NegotiationStrategy {

    private static final double CONCESSION_RATE = 0.03;

    @Override
    public StrategyDecision evaluate(BigDecimal offeredPrice,
                                     BigDecimal minPrice,
                                     BigDecimal maxPrice,
                                     int round,
                                     int maxRounds) {

        BigDecimal range = maxPrice.subtract(minPrice);

        if (round >= maxRounds) {
            double utility = maxPrice.subtract(offeredPrice)
                    .divide(range, 10, RoundingMode.HALF_UP)
                    .doubleValue();
            return utility >= 0.3 ? StrategyDecision.accept() : StrategyDecision.reject();
        }

        // Fenêtre d'acceptation : 20% + 3% par round au-dessus du plancher
        double acceptanceThreshold = 0.20 + (round - 1) * CONCESSION_RATE;
        BigDecimal threshold = minPrice.add(
                range.multiply(BigDecimal.valueOf(acceptanceThreshold))
        ).setScale(2, RoundingMode.HALF_UP);

        if (offeredPrice.compareTo(threshold) >= 0) {
            return StrategyDecision.accept();
        }

        // Monte progressivement depuis le plancher ; plafond à 60% pour rester compétitif
        double counterRatio = round * CONCESSION_RATE;
        counterRatio = Math.min(counterRatio, 0.6);
        BigDecimal counterPrice = minPrice.add(
                range.multiply(BigDecimal.valueOf(counterRatio))
        ).setScale(2, RoundingMode.HALF_UP);

        // L'acheteur a dépassé ma cible — inutile d'insister, j'accepte
        if (offeredPrice.compareTo(counterPrice) >= 0) {
            return StrategyDecision.accept();
        }

        return StrategyDecision.counter(counterPrice);
    }
}
