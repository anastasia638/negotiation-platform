# =====================================================
# STAGE 1 — Build (Maven + JDK)
# =====================================================
FROM maven:3.9-eclipse-temurin-17 AS builder

WORKDIR /app

# Copier les fichiers Maven en premier (cache des dépendances)
COPY pom.xml .
RUN --mount=type=cache,target=/root/.m2 \
    mvn dependency:go-offline -B 2>/dev/null || true

# Copier le code source et compiler
COPY src ./src
RUN --mount=type=cache,target=/root/.m2 \
    mvn clean package -DskipTests -B -q

# =====================================================
# STAGE 2 — Run (JRE uniquement, image légère)
# =====================================================
FROM eclipse-temurin:17-jre-jammy AS runtime

WORKDIR /app

# Utilisateur non-root pour la sécurité
RUN groupadd -r appgroup && useradd -r -g appgroup appuser
USER appuser

# Copier uniquement le JAR depuis le stage builder
COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
