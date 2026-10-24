FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

ENV DB_URL="jdbc:mysql://mysql-368cdfc7-pos-sytem.h.aivencloud.com:21321/defaultdb?sslMode=REQUIRED"
ENV DB_USER="avnadmin"
ENV FRONTEND_URL="https://saas-pos-syste.netlify.app"
ENV JAVA_TOOL_OPTIONS="-Xmx300m -XX:TieredStopAtLevel=1 -XX:+UseSerialGC"

EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]