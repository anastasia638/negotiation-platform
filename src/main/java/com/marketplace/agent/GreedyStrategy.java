package com.marketplace.agent;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Vendeur qui cherche à maximiser son prix de vente.
 * Il cède très peu à chaque round (5% de la plage), et son seuil
 * d'acceptation descend progressivement — l'urgence de vendre augmente
 * à mesure que la deadline approche.
 */
public class GreedyStrategy implements NegotiationStrategy {

    private static final double CONCESSION_RATE = 0.05;

    @Override
    public StrategyDecision evaluate(BigDecimal offeredPrice,
                                     BigDecimal minPrice,
                                     BigDecimal maxPrice,
                                     int round,
                                     int maxRounds) {

        BigDecimal range = maxPrice.subtract(minPrice);

        // Au dernier round, on accepte si l'acheteur couvre au moins 30% de la plage
        if (round >= maxRounds) {
            double utility = offeredPrice.subtract(minPrice)
                    .divide(range, 10, RoundingMode.HALF_UP)
                    .doubleValue();
            return utility >= 0.3 ? StrategyDecision.accept() : StrategyDecision.reject();
        }

        // Le seuil part de 90% et descend de 5% par round — le vendeur devient moins exigeant
        double acceptanceThreshold = 0.90 - (round - 1) * CONCESSION_RATE;
        BigDecimal threshold = minPrice.add(
                range.multiply(BigDecimal.valueOf(acceptanceThreshold))
        ).setScale(2, RoundingMode.HALF_UP);

        if (offeredPrice.compareTo(threshold) >= 0) {
            return StrategyDecision.accept();
        }

        // La contre-offre descend depuis le haut ; plancher à 30% pour éviter de brader
        double counterRatio = 1.0 - (round * CONCESSION_RATE);
        counterRatio = Math.max(counterRatio, 0.3);
        BigDecimal counterPrice = minPrice.add(
                range.multiply(BigDecimal.valueOf(counterRatio))
        ).setScale(2, RoundingMode.HALF_UP);

        return StrategyDecision.counter(counterPrice);
    }
}
