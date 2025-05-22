"use client";

import ProductsList from '@/components/ProductsList';
import { FaBoxOpen, FaLeaf, FaAward, FaTruck } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function ProductsContent() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
      <div className="flex flex-col sm:flex-col-reverse">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-4 sm:mt-8"
        >
          <ProductsList />
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-4 sm:mb-16 pt-4 sm:pt-8"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 relative">
            <span className="relative inline-block">
              Ürünlerimiz
              <span className="absolute -bottom-3 left-0 right-0 h-1.5 bg-orange-400 rounded-full"></span>
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Organik ve geleneksel yöntemlerle üretilen peynirlerimizin tadını çıkarın.
          </p>
        </motion.div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8"
      >
        <motion.div 
          whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-8 flex items-start shadow-sm"
        >
          <div className="bg-orange-400 p-4 rounded-full mr-5 shadow-md">
            <FaLeaf className="text-white h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-xl text-gray-900">Doğal İçerik</h3>
            <p className="text-gray-600 mt-2">%100 doğal süt ve geleneksel yöntemler kullanarak hazırlanmış lezzetler</p>
          </div>
        </motion.div>
        
        <motion.div 
          whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-8 flex items-start shadow-sm"
        >
          <div className="bg-orange-400 p-4 rounded-full mr-5 shadow-md">
            <FaAward className="text-white h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-xl text-gray-900">Kalite Garantisi</h3>
            <p className="text-gray-600 mt-2">En yüksek kalite standartlarında üretim ve sürekli kontroller</p>
          </div>
        </motion.div>
        
        <motion.div 
          whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-8 flex items-start shadow-sm"
        >
          <div className="bg-orange-400 p-4 rounded-full mr-5 shadow-md">
            <FaTruck className="text-white h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-xl text-gray-900">Taze Teslimat</h3>
            <p className="text-gray-600 mt-2">Soğuk zincir korunarak hızlı teslimat ve tazelik garantisi</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
} 