package com.marketplace.agent;

import java.math.BigDecimal;

public class StrategyDecision {

    public enum Action { ACCEPT, COUNTER, REJECT }

    private final Action action;
    private final BigDecimal counterPrice;

    private StrategyDecision(Action action, BigDecimal counterPrice) {
        this.action = action;
        this.counterPrice = counterPrice;
    }

    public static StrategyDecision accept() {
        return new StrategyDecision(Action.ACCEPT, null);
    }

    public static StrategyDecision counter(BigDecimal price) {
        return new StrategyDecision(Action.COUNTER, price);
    }

    public static StrategyDecision reject() {
        return new StrategyDecision(Action.REJECT, null);
    }

    public Action getAction() { return action; }
    public BigDecimal getCounterPrice() { return counterPrice; }

    @Override
    public String toString() {
        return action + (counterPrice != null ? " @ " + counterPrice : "");
    }
}
