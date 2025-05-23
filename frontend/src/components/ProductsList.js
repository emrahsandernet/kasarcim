"use client";

import { useState, useEffect, useCallback } from 'react';
import ProductCard from './ProductCard';
import { FaFilter, FaSort, FaSearch } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { CgSpinner } from 'react-icons/cg';
import { ProductService } from '@/services';
import PageLoader from './PageLoader';

// Örnek ağırlık değerleri - API'den gelen verilere eklemek için kullanılacak
const sampleWeights = [250, 500, 750, 1000, 1500, 2000];

// Örnek açıklamalar - Eğer API'den açıklama gelmezse kullanılacak
const sampleDescriptions = [
  "Doğal yöntemlerle üretilen taze peynir",
  "Geleneksel tariflerle hazırlanan lezzetli peynir",
  "Özel olarak seçilmiş sütlerden üretilen peynir çeşidi",
  "Kahvaltıların vazgeçilmezi, ekşimsi aromalı peynir",
  "Özel fermantasyon sürecinden geçirilen enfes lezzet",
  "Tam olgunlaşmış, zengin aromalı peynir"
];

// Sayı inputlarının yukarı/aşağı butonlarını (spin buttons) kaldıran CSS
const noSpinnerStyle = {
  // Chrome, Safari, Edge, Opera için
  WebkitAppearance: 'none',
  // Firefox için
  MozAppearance: 'textfield',
  // Mozilla için
  appearance: 'textfield',
  // Bir şekilde ok butonları görünürse margin ekleyerek gizleriz
  margin: 0
};

export default function ProductsList() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([
    { id: 0, name: "Tüm Ürünler", slug: "tum-urunler" }
  ]);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Filtre ve sıralama durumları
  const [selectedCategory, setSelectedCategory] = useState("tum-urunler");
  const [sortBy, setSortBy] = useState("name-asc");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [debouncedMinPrice, setDebouncedMinPrice] = useState("");
  const [debouncedMaxPrice, setDebouncedMaxPrice] = useState("");
  const [inStock, setInStock] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  
  // Filtreleme paneli durumu
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  
  // Debounce zamanlayıcıları
  const [searchDebounceTimer, setSearchDebounceTimer] = useState(null);
  const [minPriceDebounceTimer, setMinPriceDebounceTimer] = useState(null);
  const [maxPriceDebounceTimer, setMaxPriceDebounceTimer] = useState(null);

  // Component mount olduğunda
  useEffect(() => {
    setMounted(true);
  }, []);

  // Arama terimini debounce et (gecikmeli uygula)
  useEffect(() => {
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
    }
    
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 700); // 700ms gecikme
    
    setSearchDebounceTimer(timer);
    
    return () => {
      if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
      }
    };
  }, [searchTerm]);
  
  // Minimum fiyat debounce
  useEffect(() => {
    if (minPriceDebounceTimer) {
      clearTimeout(minPriceDebounceTimer);
    }
    
    const timer = setTimeout(() => {
      setDebouncedMinPrice(minPrice);
    }, 700); // 700ms gecikme
    
    setMinPriceDebounceTimer(timer);
    
    return () => {
      if (minPriceDebounceTimer) {
        clearTimeout(minPriceDebounceTimer);
      }
    };
  }, [minPrice]);
  
  // Maksimum fiyat debounce
  useEffect(() => {
    if (maxPriceDebounceTimer) {
      clearTimeout(maxPriceDebounceTimer);
    }
    
    const timer = setTimeout(() => {
      setDebouncedMaxPrice(maxPrice);
    }, 700); // 700ms gecikme
    
    setMaxPriceDebounceTimer(timer);
    
    return () => {
      if (maxPriceDebounceTimer) {
        clearTimeout(maxPriceDebounceTimer);
      }
    };
  }, [maxPrice]);

  // Ürünleri çek
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // ProductService kullanarak kategorileri getir
        const categoriesData = await ProductService.getCategories();
        
        setCategories([
          { id: 0, name: "Tüm Ürünler", slug: "tum-urunler" },
          ...(categoriesData || []).map(cat => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug
          }))
        ]);
        
        await fetchFilteredProducts();
      } catch (error) {
        setError("Veriler yüklenemedi. Lütfen daha sonra tekrar deneyin.");
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  // Filtreleme değiştiğinde ürünleri yeniden çek (gecikme eklenmiş değerler hariç)
  useEffect(() => {
    if (categories.length > 1) { // Kategoriler yüklendiyse
      fetchFilteredProducts();
    }
  }, [selectedCategory, inStock]);
  
  // Fiyat aralığı değiştiğinde
  useEffect(() => {
    if (categories.length > 1) { // Kategoriler yüklendiyse
      fetchFilteredProducts();
    }
  }, [debouncedMinPrice, debouncedMaxPrice]);
  
  // Arama terimi değiştiğinde ürünleri yeniden çek (debounce uygulandı)
  useEffect(() => {
    if (categories.length > 1) { // Kategoriler yüklendiyse
      fetchFilteredProducts();
    }
  }, [debouncedSearchTerm]);

  // Sıralama değiştiğinde
  useEffect(() => {
    if (products.length > 0) {
      sortProducts();
    }
  }, [sortBy]);
  
  // API'den filtrelenmiş ürünleri çek
  const fetchFilteredProducts = async () => {
    if (loading) {
      // İlk yükleme ise normal loading durumunu koruyoruz
    } else {
      // Sonraki filtrelemelerde filterLoading kullanıyoruz
      setFilterLoading(true);
    }
    
    try {
      // Filtreleme parametrelerini oluştur
      const params = {};
      
      // Kategori filtresi
      if (selectedCategory !== "tum-urunler") {
        params.category_slug = selectedCategory;
      }
      
      // Stok filtresi
      if (inStock) {
        params.in_stock = true;
      }
      
      // Fiyat aralığı filtresi
      if (debouncedMinPrice) {
        params.min_price = debouncedMinPrice;
      }
      
      if (debouncedMaxPrice) {
        params.max_price = debouncedMaxPrice;
      }
      
      // Arama terimi
      if (debouncedSearchTerm.trim()) {
        params.search = debouncedSearchTerm;
      }
      
      // ProductService kullanarak ürünleri getir
      const data = await ProductService.getProducts(params);
      
      // Ürün bilgilerini zenginleştir
      const enhancedProducts = data.map(product => {
        const enhancedProduct = { ...product };
        
        // Ağırlık bilgisi kontrolü
        if (!product.weight || product.weight === 0) {
          const randomIndex = Math.floor(Math.random() * sampleWeights.length);
          enhancedProduct.weight = sampleWeights[randomIndex];
        }
        
        // Açıklama bilgisi kontrolü
        if (!product.description || product.description.trim() === '') {
          const randomIndex = Math.floor(Math.random() * sampleDescriptions.length);
          enhancedProduct.description = sampleDescriptions[randomIndex];
        }
        
        return enhancedProduct;
      });
      
      setProducts(enhancedProducts);
      sortProducts(enhancedProducts);
      setLoading(false);
      setFilterLoading(false);
    } catch (error) {
      setError("Ürünler yüklenemedi. Lütfen daha sonra tekrar deneyin.");
      setLoading(false);
      setFilterLoading(false);
    }
  };
  
  // Ürünleri sırala - bu artık API'den yüklenen ürünleri yerel olarak sıralar
  const sortProducts = (productList = products) => {
    const sorted = [...productList].sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "price-asc":
          return (a.discounted_price || a.price) - (b.discounted_price || b.price);
        case "price-desc":
          return (b.discounted_price || b.price) - (a.discounted_price || a.price);
        default:
          return 0;
      }
    });
    
    setProducts(sorted);
  };
  
  // Filtreleri temizle
  const clearFilters = () => {
    setSelectedCategory("tum-urunler");
    setMinPrice("");
    setMaxPrice("");
    setDebouncedMinPrice("");
    setDebouncedMaxPrice("");
    setInStock(false);
    setSearchTerm("");
    setDebouncedSearchTerm("");
  };

  // Skeleton bileşenleri
  const FilterSkeleton = () => (
    <div className="bg-white shadow-sm rounded-lg p-4 mb-6 animate-pulse">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <div className="flex items-center">
          <div className="h-4 w-4 bg-gray-200 rounded mr-2"></div>
          <div className="h-4 w-20 bg-gray-200 rounded mr-4"></div>
          <div className="h-8 w-32 bg-gray-200 rounded"></div>
        </div>
        <div className="flex items-center">
          <div className="h-4 w-4 bg-gray-200 rounded mr-2"></div>
          <div className="h-4 w-16 bg-gray-200 rounded mr-4"></div>
          <div className="h-8 w-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );

  const ProductSkeleton = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 animate-pulse">
      <div className="relative overflow-hidden">
        <div className="aspect-square bg-gray-200 rounded"></div>
        <div className="absolute bottom-2 left-2 bg-gray-200 h-6 w-20 rounded-md"></div>
      </div>
      <div className="p-4">
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="flex justify-between items-end mt-4">
          <div>
            <div className="h-7 bg-gray-200 rounded w-24 mb-1"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {loading ? (
        <>
          <FilterSkeleton />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Arama çubuğu */}
          <div className="relative mb-6">
            <div className="flex">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Ürün adı veya kategori ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border border-gray-300 rounded-l-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {searchTerm && (
                    searchTerm !== debouncedSearchTerm ? (
                      <CgSpinner className="animate-spin h-5 w-5 text-orange-500" />
                    ) : (
                      <button 
                        onClick={() => {
                          setSearchTerm("");
                          setDebouncedSearchTerm("");
                        }}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <IoClose size={18} />
                      </button>
                    )
                  )}
                </div>
              </div>
              <button 
                className={`flex items-center justify-center min-w-[42px] bg-orange-500 text-white px-4 py-2 rounded-r-md hover:bg-orange-600 transition-colors ${filterLoading && 'opacity-75'}`}
                onClick={fetchFilteredProducts}
                disabled={filterLoading}
              >
                {filterLoading ? 
                  <CgSpinner className="animate-spin h-5 w-5" /> : 
                  <FaSearch />
                }
              </button>
            </div>
          
          </div>
          
          {/* Filtre ve sıralama bileşeni */}
          <div className="bg-white shadow-sm rounded-lg p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div className="flex items-center">
                <button 
                  onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                  className="flex items-center bg-orange-100 text-orange-700 px-3 py-1 rounded-md hover:bg-orange-200 transition-colors"
                >
                  <FaFilter className="mr-2" />
                  <span className="font-medium">Filtrele</span>
                </button>
                
                {/* Aktif filtre göstergesi */}
                {(selectedCategory !== "tum-urunler" || minPrice || maxPrice || inStock || debouncedSearchTerm) && (
                  <div className="ml-3 flex items-center">
                    <span className="bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                      {Object.values({ 
                        kategori: selectedCategory !== "tum-urunler", 
                        fiyat: minPrice || maxPrice,
                        stok: inStock,
                        arama: debouncedSearchTerm
                      }).filter(Boolean).length} filtre aktif
                    </span>
                    <button
                      onClick={clearFilters}
                      className="ml-2 text-xs text-gray-500 hover:text-gray-700 underline"
                    >
                      Temizle
                    </button>
                  </div>
                )}
              </div>
              
              <div className="flex items-center">
                <FaSort className="text-orange-500 mr-2" />
                <span className="font-medium mr-4">Sırala:</span>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="name-asc">İsim (A-Z)</option>
                  <option value="name-desc">İsim (Z-A)</option>
                  <option value="price-asc">Fiyat (Düşükten Yükseğe)</option>
                  <option value="price-desc">Fiyat (Yüksekten Düşüğe)</option>
                </select>
              </div>
            </div>
            
            {/* Genişletilebilir filtre paneli */}
            {isFilterPanelOpen && (
              <div className="mt-4 border-t pt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {/* Kategori filtresi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                  <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {categories.map(category => (
                      <option key={category.slug} value={category.slug}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Fiyat aralığı filtresi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fiyat Aralığı</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        placeholder="Min ₺"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="no-spin w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        style={noSpinnerStyle}
                      />
                      {minPrice !== debouncedMinPrice && minPrice && (
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <CgSpinner className="animate-spin h-4 w-4 text-orange-500" />
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        placeholder="Max ₺"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="no-spin w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        style={noSpinnerStyle}
                      />
                      {maxPrice !== debouncedMaxPrice && maxPrice && (
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <CgSpinner className="animate-spin h-4 w-4 text-orange-500" />
                        </span>
                      )}
                    </div>
                  </div>
                  
                </div>
                
                {/* Stok durumu filtresi */}
                <div className="flex items-center">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inStock}
                      onChange={(e) => setInStock(e.target.checked)}
                      className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Sadece stokta olanlar</span>
                  </label>
                </div>
              </div>
            )}
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg text-center mb-4">
              {error}
            </div>
          )}
          
          {/* Filtreleme sırasında overlay ile loading göstergesi */}
          <div className="relative">
            {filterLoading && (
              <div className="absolute inset-0 bg-white bg-opacity-50 flex justify-center items-start pt-20 z-10 backdrop-blur-sm">
                <div className="bg-white p-4 rounded-lg shadow-lg flex items-center space-x-3">
                  <CgSpinner className="animate-spin h-6 w-6 text-orange-500" />
                  <span className="text-gray-700">Ürünler yükleniyor...</span>
                </div>
              </div>
            )}
            
            <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ${filterLoading ? 'opacity-50' : ''}`}>
              {products.length > 0 ? (
                products.map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={{
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      img_url: product.img_url,
                      slug: product.slug || `product-${product.id}`,
                      weight: product.weight || 0,
                      description: product.description || '',
                      category_name: product.category_name || '',
                      category_slug: product.category?.slug || '',
                      stock: product.stock || 0,
                      is_in_stock: product.is_in_stock !== undefined ? product.is_in_stock : (product.stock > 0),
                      active_discount: product.active_discount,
                      discounted_price: product.discounted_price
                    }} 
                  />
                ))
              ) : (
                <div className="col-span-full bg-orange-50 text-orange-700 p-4 rounded-lg text-center">
                  Bu kriterlere uygun ürün bulunamadı.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
} 