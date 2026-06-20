FROM maven:3.9.11-eclipse-temurin-24 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -q -DskipTests dependency:go-offline
COPY src ./src
RUN mvn -q -DskipTests package

FROM eclipse-temurin:24-jre
WORKDIR /app
COPY --from=build /app/target/api-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080

# Build the JDBC URL from individual env vars before starting Spring
CMD ["sh", "-c", "export SPRING_DATASOURCE_URL=\"jdbc:mysql://${DB_HOST}:${DB_PORT}/futureos?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC\" && java -jar app.jar"]