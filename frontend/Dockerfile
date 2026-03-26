# Étape de build
FROM node:22 AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG VITE_SECRET_SALT
ENV VITE_SECRET_SALT=$VITE_SECRET_SALT
RUN npm run build

# Étape de production (Nginx)
FROM nginx:stable-alpine
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]