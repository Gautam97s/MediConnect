# ── Stage 1: Build ─────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-17-alpine AS builder

WORKDIR /app

# Cache dependencies first
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Build the JAR (skip tests for faster Docker builds)
COPY src ./src
RUN mvn package -DskipTests -B

# ── Stage 2: Runtime ───────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

RUN addgroup -S mediconnect && adduser -S mediconnect -G mediconnect

COPY --from=builder /app/target/*.jar app.jar

RUN mkdir -p /app/logs && chown -R mediconnect:mediconnect /app

USER mediconnect

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
