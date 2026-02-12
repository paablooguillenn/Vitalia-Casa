# Etapa 1: Build con Maven
FROM maven:3.9.9-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml .
# Cache de dependencias para builds más rápidos
RUN mvn dependency:go-offline -B
COPY src ./src
COPY mvnw ./mvnw
COPY .mvn .mvn
RUN ./mvnw clean package -DskipTests -B

# Etapa 2: Runtime ligera
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
