FROM python:3.10-slim

# Gerekli bağımlılıkları kur
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc libpq-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Çalışma dizinini ayarla
WORKDIR /app

# Ortam değişkenlerini ayarla
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Log dizinlerini oluştur
RUN mkdir -p /var/log/gunicorn \
    && chmod -R 777 /var/log/gunicorn

# Statik dosyalar için gerekli dizinleri oluştur
RUN mkdir -p /app/static /app/media \
    && chmod -R 755 /app

# Gereksinimleri kopyala ve yükle
COPY requirements.txt .
RUN pip install --upgrade pip \
    && pip install -r requirements.txt \
    && pip install gunicorn

# Proje dosyalarını kopyala
COPY . .

# Port belirt
EXPOSE 8000

# Gunicorn ile Django uygulamasını başlat
CMD ["bash", "-c", "python manage.py migrate && python manage.py collectstatic --noinput && gunicorn ecommerce.wsgi:application --bind 0.0.0.0:8000 --workers 3"] 