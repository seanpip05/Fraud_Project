# ===== שלב 1: Build =====
FROM node:20-slim AS build
WORKDIR /app

# שדרוג ה-NPM הפנימי לגרסה האחרונה שפותרת את באג הקריסה
RUN npm install -g npm@latest

# העתקה *רק* של ה-package.json (בלי ה-lock של ווינדוס!)
COPY package.json ./

# התקנה בלי לוגים מיותרים ובלי לבקש תרומות
RUN npm install --no-audit --no-fund --loglevel=error

# העתקת שאר הקוד ובנייה (כעת ה-dockerignore ימנע דריסה של node_modules)
COPY . .
RUN npm run build

# ===== שלב 2: Serve =====
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# קופיגורציה של Nginx לתמיכה ב-React Router (SPA)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]