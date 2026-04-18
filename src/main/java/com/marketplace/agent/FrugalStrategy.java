package com.marketplace.agent;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Stratégie FRUGAL — utilisée par les VENDEURS coopératifs (Sophie, Meriem).
 *
 * Comportement : accepte rapidement des prix bas, contre-propose depuis le minimum
 * et monte lentement (+3% de la plage par round).
 * Objectif : vendre vite plutôt que maximiser le prix.
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

        // Seuil d'acceptation : n'accepte que si l'offre est < 20% + 3% par round au-dessus du min
        double acceptanceThreshold = 0.20 + (round - 1) * CONCESSION_RATE;
        BigDecimal threshold = minPrice.add(
                range.multiply(BigDecimal.valueOf(acceptanceThreshold))
        ).setScale(2, RoundingMode.HALF_UP);

        if (offeredPrice.compareTo(threshold) >= 0) {
            return StrategyDecision.accept();
        }

        // Contre-offre : monte de 3% de la plage par round depuis le minimum
        double counterRatio = round * CONCESSION_RATE;
        counterRatio = Math.min(counterRatio, 0.6); // plafond à 60% de la plage
        BigDecimal counterPrice = minPrice.add(
                range.multiply(BigDecimal.valueOf(counterRatio))
        ).setScale(2, RoundingMode.HALF_UP);

        // Vendeur frugal : si l'acheteur propose plus que ma contre-offre, j'accepte
        if (offeredPrice.compareTo(counterPrice) >= 0) {
            return StrategyDecision.accept();
        }

        return StrategyDecision.counter(counterPrice);
    }
}
