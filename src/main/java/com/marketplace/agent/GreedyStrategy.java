package com.marketplace.agent;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Stratégie GREEDY — utilisée par les VENDEURS.
 *
 * Comportement : vise le prix maximum, cède très peu par round (5%).
 * N'accepte une offre que si elle dépasse son seuil d'utilité courant.
 * Plus le round avance, plus le seuil descend (urgence de vendre).
 */
public class GreedyStrategy implements NegotiationStrategy {

    // Concession de 5% de la plage par round
    private static final double CONCESSION_RATE = 0.05;

    @Override
    public StrategyDecision evaluate(BigDecimal offeredPrice,
                                     BigDecimal minPrice,
                                     BigDecimal maxPrice,
                                     int round,
                                     int maxRounds) {

        BigDecimal range = maxPrice.subtract(minPrice);

        // Deadline : rejet si dernier round et offre insuffisante
        if (round >= maxRounds) {
            double utility = offeredPrice.subtract(minPrice)
                    .divide(range, 10, RoundingMode.HALF_UP)
                    .doubleValue();
            return utility >= 0.3 ? StrategyDecision.accept() : StrategyDecision.reject();
        }

        // Seuil d'acceptation : commence à 90% du max, descend de 5% par round
        double acceptanceThreshold = 0.90 - (round - 1) * CONCESSION_RATE;
        BigDecimal threshold = minPrice.add(
                range.multiply(BigDecimal.valueOf(acceptanceThreshold))
        ).setScale(2, RoundingMode.HALF_UP);

        if (offeredPrice.compareTo(threshold) >= 0) {
            return StrategyDecision.accept();
        }

        // Contre-offre : descend de 5% de la plage par round
        double counterRatio = 1.0 - (round * CONCESSION_RATE);
        counterRatio = Math.max(counterRatio, 0.3); // plancher à 30% de la plage
        BigDecimal counterPrice = minPrice.add(
                range.multiply(BigDecimal.valueOf(counterRatio))
        ).setScale(2, RoundingMode.HALF_UP);

        return StrategyDecision.counter(counterPrice);
    }
}
