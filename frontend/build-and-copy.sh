#!/bin/bash

# Next.js uygulamasını build et
echo "Next.js uygulaması build ediliyor..."
npm run build

# Backend klasörünün içinde frontend klasörünü oluştur (yoksa)
echo "Frontend dosyaları kopyalanıyor..."
mkdir -p ../backend/frontend

# Build çıktılarını backend/frontend klasörüne kopyala
cp -r ./.next ../backend/frontend/
cp -r ./public ../backend/frontend/

echo "Frontend dosyaları başarıyla backend klasörüne kopyalandı." 