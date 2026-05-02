# ===== שלב 1: Build =====
# Node.js לבניית ה-React App
FROM node:20-alpine AS build
WORKDIR /app

# התקנת dependencies (נפרד מה-COPY כדי לנצל Cache)
COPY package*.json ./
RUN npm ci

# בניית ה-production bundle
COPY . .
RUN npm run build

# ===== שלב 2: Serve =====
# Nginx כשרת סטטי מהיר לשרת את ה-React
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# קופיגורציה של Nginx לתמיכה ב-React Router (SPA)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
