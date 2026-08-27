# Build stage: compile the jar
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app

# Copy the pom first so dependency resolution is cached when only sources change.
COPY pom.xml ./
RUN mvn dependency:go-offline -B

COPY src src
RUN mvn clean package -DskipTests -B

# Runtime stage: smaller image with just a JRE
FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /app/target/bjbites-springboot-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
