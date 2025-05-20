"use client";

import Link from 'next/link';
import { FaShoppingBag, FaLaptop, FaHome, FaTshirt, FaBaby, FaUtensils, FaBook, FaBriefcase } from 'react-icons/fa';

// Örnek kategori verileri
const categories = [
  {
    id: 1,
    name: 'Elektronik',
    slug: 'elektronik',
    icon: FaLaptop,
    color: 'bg-blue-500'
  },
  {
    id: 2,
    name: 'Ev & Yaşam',
    slug: 'ev-yasam',
    icon: FaHome,
    color: 'bg-green-500'
  },
  {
    id: 3,
    name: 'Giyim',
    slug: 'giyim',
    icon: FaTshirt,
    color: 'bg-purple-500'
  },
  {
    id: 4,
    name: 'Anne & Bebek',
    slug: 'anne-bebek',
    icon: FaBaby,
    color: 'bg-pink-500'
  },
  {
    id: 5,
    name: 'Süpermarket',
    slug: 'supermarket',
    icon: FaUtensils,
    color: 'bg-yellow-500'
  },
  {
    id: 6,
    name: 'Kitap & Hobi',
    slug: 'kitap-hobi',
    icon: FaBook,
    color: 'bg-red-500'
  },
  {
    id: 7,
    name: 'Ofis & Kırtasiye',
    slug: 'ofis-kirtasiye',
    icon: FaBriefcase,
    color: 'bg-gray-500'
  },
  {
    id: 8,
    name: 'Tüm Kategoriler',
    slug: 'kategoriler',
    icon: FaShoppingBag,
    color: 'bg-orange-500'
  }
];

export default function CategorySection() {
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">Kategorilere Göz Atın</h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link 
              key={category.id} 
              href={`/categories/${category.slug}`}
              className="flex flex-col items-center group"
            >
              <div className={`${category.color} w-16 h-16 rounded-full flex items-center justify-center text-white mb-3 transform transition-transform group-hover:scale-110`}>
                <category.icon className="h-8 w-8" />
              </div>
              <h3 className="text-center font-medium text-gray-800 group-hover:text-orange-500 transition-colors">
                {category.name}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
} 