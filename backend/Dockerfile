# ===== שלב 1: Build =====
# משתמש ב-Maven עם Java 17 כדי לבנות את ה-JAR
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# העתקת קבצי ה-Maven (כדי לנצל Layer Caching)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# העתקת קוד המקור ובנייה
COPY src ./src
RUN mvn clean package -DskipTests

# ===== שלב 2: Runtime =====
# תמונה קטנה יותר להרצה בלבד
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# העתקת ה-JAR שנבנה בשלב הקודם
COPY --from=build /app/target/*.jar app.jar

# פורט ה-Backend
EXPOSE 8080

# משתני סביבה ברירת מחדל (ניתן לדרוס ב-docker-compose)
ENV SPRING_PROFILES_ACTIVE=docker

ENTRYPOINT ["java", "-jar", "app.jar"]
