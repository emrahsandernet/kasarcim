"use client";

import { FaCheck } from 'react-icons/fa';

const productionSteps = [
  {
    id: 1,
    title: "Hammadde Seçimi",
    description: "Anlaşmalı çiftliklerimizden temin ettiğimiz taze ve doğal sütleri, sıkı kalite kontrollerinden geçiriyoruz."
  },
  {
    id: 2,
    title: "Mayalama",
    description: "Geleneksel yöntemlerle hazırlanan doğal mayalarımızla sütü mayalıyor ve teleme haline getiriyoruz."
  },
  {
    id: 3,
    title: "Haşlama ve Şekillendirme",
    description: "Telemeyi özel kazanlarda haşlıyor, elastik kıvama gelen peyniri el işçiliğiyle şekillendiriyoruz."
  },
  {
    id: 4,
    title: "Olgunlaştırma",
    description: "Peynirlerimizi ideal sıcaklık ve nem koşullarında, ürün çeşidine göre değişen sürelerde olgunlaştırıyoruz."
  },
  {
    id: 5,
    title: "Paketleme ve Sevkiyat",
    description: "Olgunlaşan peynirlerimizi hijyenik koşullarda paketliyor ve soğuk zincir bozulmadan müşterilerimize ulaştırıyoruz."
  }
];

export default function ProductionProcess() {
  return (
    <div className="py-12">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900">Üretim Sürecimiz</h2>
        <div className="h-1 w-24 bg-orange-500 mx-auto mt-2"></div>
      </div>
      
      <div className="relative">
        {/* Timeline dikey çizgi */}
        <div className="absolute left-24 transform -translate-x-1/2 h-full w-1 bg-orange-200"></div>
        
        <div className="space-y-16">
          {productionSteps.map((step) => (
            <div key={step.id} className="relative flex gap-8">
              {/* Numara */}
              <div className="z-10">
                <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-xl">
                  {step.id}
                </div>
              </div>
              
              {/* İçerik */}
              <div className="flex-1 bg-gray-50 p-5 rounded-lg">
                <h3 className="font-bold text-slate-700 text-xl mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 