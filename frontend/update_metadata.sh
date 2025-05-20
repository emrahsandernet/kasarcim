#!/bin/bash

# Metadata dosyalarını güncelleyecek script
# Bu script themeColor ve viewport özelliklerini metadata export'undan çıkarıp 
# ayrı bir viewport export'u olarak tanımlayacak

update_metadata_file() {
  local file=$1
  echo "Güncelleniyor: $file"
  
  # Eğer dosyada zaten viewport export tanımı varsa, işlem yapma
  if grep -q "export const viewport" "$file"; then
    echo "  Bu dosya zaten güncellenmiş."
    return 0
  fi
  
  # Viewport export'u ekle
  cat >> "$file" << 'EOF'

// Viewport export'u ayrı olarak tanımlanmalı
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#FF6B00", // turuncu-500
};
EOF

  echo "  Dosya güncellendi."
}

# Tüm metadata.js dosyalarını bul ve güncelle
find src/app -name "metadata.js" | while read -r file; do
  update_metadata_file "$file"
done

# Page.js dosyalarında tanımlanmış metadata'ları bul
grep -l "export const metadata" src/app/**/page.js | while read -r file; do
  if grep -q "themeColor\|viewport" "$file"; then
    echo "Kontrol edilmeli: $file"
  fi
done

echo "Güncelleme tamamlandı!" 