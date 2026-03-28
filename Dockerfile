# =====================================================
# STAGE 1 — Build (Maven + JDK)
# =====================================================
FROM eclipse-temurin:17-jdk-alpine AS builder

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
FROM eclipse-temurin:17-jre-alpine AS runtime

WORKDIR /app

# Utilisateur non-root pour la sécurité
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Copier uniquement le JAR depuis le stage builder
COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
