package com.marketplace.agent;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Stratégie d'équilibre : ni trop agressive, ni trop conciliante.
 * L'agent converge vers la valeur médiane de la plage (±10% par round)
 * et accepte dès que l'offre entre dans la zone centrale à 8%.
 * C'est la stratégie qui produit le plus souvent un accord rapide.
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

        // Zone d'accord : ±8% autour du milieu de la plage
        BigDecimal lowerBound = midPrice.subtract(range.multiply(BigDecimal.valueOf(0.08))).setScale(2, RoundingMode.HALF_UP);
        BigDecimal upperBound = midPrice.add(range.multiply(BigDecimal.valueOf(0.08))).setScale(2, RoundingMode.HALF_UP);

        if (offeredPrice.compareTo(lowerBound) >= 0 && offeredPrice.compareTo(upperBound) <= 0) {
            return StrategyDecision.accept();
        }

        // Dernier round : on élargit la tolérance pour éviter un échec inutile
        if (round >= maxRounds) {
            if (offeredPrice.compareTo(lowerBound.subtract(range.multiply(BigDecimal.valueOf(0.1)))) >= 0) {
                return StrategyDecision.accept();
            }
            return StrategyDecision.reject();
        }

        // Réduction progressive de la distance au milieu (10% par round)
        double distanceRatio = 0.5 - (round * CONCESSION_RATE / 2);
        distanceRatio = Math.max(distanceRatio, 0.05);

        BigDecimal counterPrice;
        if (offeredPrice.compareTo(midPrice) < 0) {
            // Offre basse : on répond légèrement au-dessus du milieu
            counterPrice = midPrice.add(range.multiply(BigDecimal.valueOf(distanceRatio)))
                    .setScale(2, RoundingMode.HALF_UP);
        } else {
            // Offre haute : on répond légèrement en-dessous du milieu
            counterPrice = midPrice.subtract(range.multiply(BigDecimal.valueOf(distanceRatio)))
                    .setScale(2, RoundingMode.HALF_UP);
        }

        // La convergence a rattrapé l'offre — autant accepter
        if (counterPrice.compareTo(offeredPrice) <= 0) {
            return StrategyDecision.accept();
        }

        return StrategyDecision.counter(counterPrice);
    }
}
