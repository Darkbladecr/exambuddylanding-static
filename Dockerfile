FROM nginx:1.19.8-alpine
COPY ./html /var/www/html
COPY ./nginx-conf /etc/nginx/conf.d