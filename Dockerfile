# Etapa 1: Build con Maven

FROM maven:3.9.9-eclipse-temurin-21-alpine AS build
ENV JAVA_HOME=/opt/java/openjdk
ENV PATH="$JAVA_HOME/bin:$PATH"
WORKDIR /app
COPY pom.xml .
# Cache de dependencias para builds más rápidos
RUN mvn dependency:go-offline -B
COPY src ./src
COPY mvnw ./mvnw
COPY .mvn .mvn
RUN chmod +x ./mvnw
RUN ./mvnw clean package -DskipTests -B

# Etapa 2: Runtime ligera

FROM eclipse-temurin:21-jre-alpine
ENV JAVA_HOME=/opt/java/openjdk
ENV PATH="$JAVA_HOME/bin:$PATH"
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
