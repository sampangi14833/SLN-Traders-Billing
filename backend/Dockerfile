FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

COPY . .

RUN chmod +x mvnw
RUN ./mvnw clean package -DskipTests=true

EXPOSE 8080

CMD ["sh", "-c", "java -jar target/*.jar"]