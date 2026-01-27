# SA7 Marketplace — Negotiation System 

## Objectif
Ce projet implémente un mini “marketplace” où des agents acheteurs et vendeurs négocient le prix d’un produit via des stratégies de négociation.
L’application expose une API REST pour démarrer une négociation et suivre son état, et persiste les produits/offres.

## Choix techniques
- Java 17, Spring Boot
- Spring Web (API REST)
- Spring Data JPA + H2 (dev)

## Lancer en local
Prérequis : Java 17 + Maven.

```bash
mvn clean test
mvn spring-boot:run
