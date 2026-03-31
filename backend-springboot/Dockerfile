# Build stage
FROM maven:3.8.4-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline

COPY src ./src
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
# Use shell form to resolve environment variables
ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT} -jar app.jar"]