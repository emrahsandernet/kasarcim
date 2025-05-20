FROM nginx:1.21

# Nginx yapılandırmasını kopyala
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Port 80'i dışarı aç
EXPOSE 80

# Nginx'i çalıştır
CMD ["nginx", "-g", "daemon off;"] 