package com.marketplace.agent;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Stratégie COOL-HEADED — utilisée par acheteurs ou vendeurs équilibrés.
 *
 * Comportement : converge rapidement vers le milieu de la plage (10% par round).
 * Accepte dès que l'offre est raisonnablement proche de la valeur médiane.
 * Préfère conclure rapidement plutôt que maximiser le gain.
 */
public class CoolHeadedStrategy implements NegotiationStrategy {

    private static final double CONCESSION_RATE = 0.10;

    @Override
    public StrategyDecision evaluate(BigDecimal offeredPrice,
                                     BigDecimal minPrice,
                                     BigDecimal maxPrice,
                                     int round,
                                     int maxRounds) {

        BigDecimal range = maxPrice.subtract(minPrice);
        BigDecimal midPrice = minPrice.add(range.divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP));

        // Accepte si l'offre est dans les 8% autour du milieu
        BigDecimal lowerBound = midPrice.subtract(range.multiply(BigDecimal.valueOf(0.08))).setScale(2, RoundingMode.HALF_UP);
        BigDecimal upperBound = midPrice.add(range.multiply(BigDecimal.valueOf(0.08))).setScale(2, RoundingMode.HALF_UP);

        if (offeredPrice.compareTo(lowerBound) >= 0 && offeredPrice.compareTo(upperBound) <= 0) {
            return StrategyDecision.accept();
        }

        // Deadline : accepte si l'offre est dans la moitié centrale
        if (round >= maxRounds) {
            if (offeredPrice.compareTo(lowerBound.subtract(range.multiply(BigDecimal.valueOf(0.1)))) >= 0) {
                return StrategyDecision.accept();
            }
            return StrategyDecision.reject();
        }

        // Contre-offre : converge vers le milieu de 10% par round
        double distanceRatio = 0.5 - (round * CONCESSION_RATE / 2);
        distanceRatio = Math.max(distanceRatio, 0.05);

        BigDecimal counterPrice;
        if (offeredPrice.compareTo(midPrice) < 0) {
            // L'offre est trop basse — on répond au-dessus du milieu
            counterPrice = midPrice.add(range.multiply(BigDecimal.valueOf(distanceRatio)))
                    .setScale(2, RoundingMode.HALF_UP);
        } else {
            // L'offre est au-dessus du milieu — on répond en-dessous du milieu
            counterPrice = midPrice.subtract(range.multiply(BigDecimal.valueOf(distanceRatio)))
                    .setScale(2, RoundingMode.HALF_UP);
        }

        // Si la contre-offre est <= au prix proposé, accepter directement
        if (counterPrice.compareTo(offeredPrice) <= 0) {
            return StrategyDecision.accept();
        }

        return StrategyDecision.counter(counterPrice);
    }
}
