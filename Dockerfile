FROM nginx:1.21.0-alpine
COPY ./html /var/www/html
COPY ./nginx-conf /etc/nginx/conf.d