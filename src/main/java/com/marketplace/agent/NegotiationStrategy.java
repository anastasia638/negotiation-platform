package com.marketplace.agent;

import java.math.BigDecimal;

/**
 * Stratégie de négociation.
 * Chaque implémentation décide d'accepter, contre-proposer ou rejeter
 * une offre en fonction du prix, de la plage cible et du round en cours.
 */
public interface NegotiationStrategy {

    /**
     * Évalue une offre reçue et retourne une décision.
     *
     * @param offeredPrice  prix proposé par l'adversaire
     * @param minPrice      prix minimum acceptable (plancher)
     * @param maxPrice      prix maximum souhaité (plafond)
     * @param round         numéro du round actuel (commence à 1)
     * @param maxRounds     nombre maximum de rounds avant rejet automatique
     * @return              décision : ACCEPT, COUNTER ou REJECT
     */
    StrategyDecision evaluate(BigDecimal offeredPrice,
                               BigDecimal minPrice,
                               BigDecimal maxPrice,
                               int round,
                               int maxRounds);
}
