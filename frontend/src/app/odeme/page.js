"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useLoader } from "@/context/LoaderContext";
import { useRouter } from "next/navigation";
import CustomLink from "@/components/CustomLink";
import Loader from "@/components/Loader";
import PageLoader from "@/components/PageLoader";
import {
  FaTruck,
  FaCheck,
  FaPlus,
  FaCreditCard,
  FaMoneyBillAlt,
  FaShippingFast,
  FaCopy,
} from "react-icons/fa";
import { UserService, OrderService } from "@/services";

const PaymentPage = () => {
  const { user, authLoading, token } = useAuth();
  const {
    cartItems,
    cartTotal,
    discount,
    couponCode,
    discountedTotal,
    clearCart,
    applyCoupon,
    removeCoupon,
    couponLoading,
  } = useCart();
  const { showLoader } = useLoader();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [processing, setProcessing] = useState(false);

  // Form states
  const [discountCodeInput, setDiscountCodeInput] = useState("");
  const [billingAddressSame, setBillingAddressSame] = useState(true);
  const [corporateInvoice, setCorporateInvoice] = useState(false);

  // User addresses
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);

  // Shipping and payment
  const [selectedShipping, setSelectedShipping] = useState("free");
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer"); // Changed default to bank transfer
  const [orderNotes, setOrderNotes] = useState("");
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  // Card info
  const [cardInfo, setCardInfo] = useState({
    number: "",
    name: "",
    expiry: "",
    cvc: "",
  });

  // Guest info
  const [guestInfo, setGuestInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    postalCode: "",
  });

  // Mobile summary dropdown
  const [isOrderSummaryOpen, setIsOrderSummaryOpen] = useState(false);

  // Form validation errors
  const [errors, setErrors] = useState({
    email: "",
    fullName: "",
    address: "",
    city: "",
    district: "",
    phone: "",
    cardNumber: "",
    cardName: "",
    cardExpiry: "",
    cardCvc: "",
  });

  // IBAN kopyalama durumu
  const [ibanCopied, setIbanCopied] = useState(false);

  // Input refs for focus management
  const emailRef = useRef(null);
  const fullNameRef = useRef(null);
  const addressRef = useRef(null);
  const cityRef = useRef(null);
  const districtRef = useRef(null);
  const phoneRef = useRef(null);
  const cardNumberRef = useRef(null);
  const cardNameRef = useRef(null);
  const cardExpiryRef = useRef(null);
  const cardCvcRef = useRef(null);

  // Validasyon kontrolü fonksiyonu (herhangi bir guestInfo objesi için)
  const validateGuestInfo = (info) => {
    if (!info) return false;

    // E-posta kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!info.email || !emailRegex.test(info.email)) return false;

    // Ad Soyad kontrolü
    if (!info.fullName || info.fullName.trim().length < 2) return false;
    const nameRegex = /^[a-zA-ZçğıöşüÇĞIİÖŞÜ\s]+$/;
    const trimmedName = info.fullName.trim();
    const words = trimmedName.split(/\s+/).filter((word) => word.length > 0);
    if (
      !nameRegex.test(trimmedName) ||
      words.length < 2 ||
      !words.every((word) => word.length >= 2)
    )
      return false;

    // Adres kontrolü
    if (!info.address || info.address.trim().length < 10) return false;
    const hasNumber = /\d/.test(info.address);
    const addressWords = info.address.trim().split(/\s+/);
    const hasValidWords = addressWords.some((word) => word.length >= 3);
    if (!hasNumber || !hasValidWords) return false;

    // İl kontrolü
    if (!info.city || info.city.trim().length < 3) return false;
    const cityRegex = /^[a-zA-ZçğıöşüÇĞIİÖŞÜ\s]+$/;
    if (!cityRegex.test(info.city.trim()) || info.city.trim().length > 50)
      return false;

    // İlçe kontrolü
    if (!info.district || info.district.trim().length < 3) return false;
    const districtRegex = /^[a-zA-ZçğıöşüÇĞIİÖŞÜ\s]+$/;
    if (
      !districtRegex.test(info.district.trim()) ||
      info.district.trim().length > 50
    )
      return false;

    // Telefon kontrolü
    if (!info.phone || info.phone.trim().length < 10) return false;
    const phoneRegex = /^[0-9\s\-\(\)\+]+$/;
    const cleanPhone = info.phone.replace(/[\s\-\(\)\+]/g, "");
    if (
      !phoneRegex.test(info.phone) ||
      cleanPhone.length < 10 ||
      cleanPhone.length > 15 ||
      !/^\d+$/.test(cleanPhone)
    )
      return false;

    return true;
  };

  // Field success validation helper
  const isFieldValid = (fieldName) => {
    if (!guestInfo && !cardInfo) return false;

    switch (fieldName) {
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return guestInfo.email && emailRegex.test(guestInfo.email);
      case "fullName":
        if (!guestInfo.fullName || guestInfo.fullName.trim().length < 2)
          return false;
        // Sadece harfler, boşluk ve Türkçe karakterler
        const nameRegex = /^[a-zA-ZçğıöşüÇĞIİÖŞÜ\s]+$/;
        const trimmedName = guestInfo.fullName.trim();
        // En az 2 kelime olmalı (ad + soyad)
        const words = trimmedName
          .split(/\s+/)
          .filter((word) => word.length > 0);
        return (
          nameRegex.test(trimmedName) &&
          words.length >= 2 &&
          words.every((word) => word.length >= 2)
        );
      case "address":
        if (!guestInfo.address || guestInfo.address.trim().length < 10)
          return false;
        // Adres en az rakam içermeli (sokak no, daire no vb.)
        const hasNumber = /\d/.test(guestInfo.address);
        // Çok kısa kelimeler (aa, bb gibi) engelle
        const addressWords = guestInfo.address.trim().split(/\s+/);
        const hasValidWords = addressWords.some((word) => word.length >= 3);
        return hasNumber && hasValidWords;
      case "city":
        if (!guestInfo.city || guestInfo.city.trim().length < 3) return false;
        // Sadece harfler, boşluk ve Türkçe karakterler
        const cityRegex = /^[a-zA-ZçğıöşüÇĞIİÖŞÜ\s]+$/;
        return (
          cityRegex.test(guestInfo.city.trim()) &&
          guestInfo.city.trim().length <= 50
        );
      case "district":
        if (!guestInfo.district || guestInfo.district.trim().length < 3)
          return false;
        // Sadece harfler, boşluk ve Türkçe karakterler
        const districtRegex = /^[a-zA-ZçğıöşüÇĞIİÖŞÜ\s]+$/;
        return (
          districtRegex.test(guestInfo.district.trim()) &&
          guestInfo.district.trim().length <= 50
        );
      case "phone":
        if (!guestInfo.phone || guestInfo.phone.trim().length < 10)
          return false;
        // Sadece rakam ve boşluk, tire, parantez
        const phoneRegex = /^[0-9\s\-\(\)\+]+$/;
        const cleanPhone = guestInfo.phone.replace(/[\s\-\(\)\+]/g, "");
        // Temizlenmiş telefon 10-15 karakter arası olmalı ve sadece rakam
        return (
          phoneRegex.test(guestInfo.phone) &&
          cleanPhone.length >= 10 &&
          cleanPhone.length <= 15 &&
          /^\d+$/.test(cleanPhone)
        );
      case "cardNumber":
        if (!cardInfo.number) return false;
        const cardNumber = cardInfo.number.replace(/\s/g, "");
        // Sadece rakam ve 13-19 karakter arası
        return /^\d{13,19}$/.test(cardNumber);
      case "cardName":
        if (!cardInfo.name || cardInfo.name.trim().length < 2) return false;
        // Sadece harfler, boşluk ve Türkçe karakterler
        const cardNameRegex = /^[a-zA-ZçğıöşüÇĞIİÖŞÜ\s]+$/;
        return cardNameRegex.test(cardInfo.name.trim());
      case "cardExpiry":
        if (!cardInfo.expiry || cardInfo.expiry.trim().length < 4) return false;
        // MM/YY veya MM/YYYY formatı
        const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2}|[0-9]{4})$/;
        return expiryRegex.test(cardInfo.expiry.trim());
      case "cardCvc":
        if (!cardInfo.cvc) return false;
        // Sadece rakam ve 3-4 karakter
        return /^\d{3,4}$/.test(cardInfo.cvc);
      default:
        return false;
    }
  };

  // Get field CSS classes based on validation state
  const getFieldClasses = (fieldName) => {
    const baseClasses =
      "w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors";
    const phoneBaseClasses =
      "flex-1 px-4 py-3 border rounded-r-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors";

    const classes = fieldName === "phone" ? phoneBaseClasses : baseClasses;

    if (errors[fieldName]) {
      return `${classes} border-red-500 bg-red-50 focus:ring-red-500`;
    } else if (isFieldValid(fieldName)) {
      return `${classes} border-green-500 bg-green-50 focus:ring-green-500`;
    } else {
      return `${classes} border-gray-300 focus:ring-orange-500`;
    }
  };

  // Google Analytics tracking for payment info
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.dataLayer &&
      cartItems.length > 0 &&
      paymentMethod
    ) {
      window.dataLayer.push({
        event: "add_payment_info",
        ecommerce: {
          currency: "TRY",
          payment_type:
            paymentMethod === "bank_transfer"
              ? "bank_transfer"
              : paymentMethod === "credit_card"
              ? "credit_card"
              : "cash_on_delivery",
          items: cartItems.map((item) => ({
            item_id: item.id,
            item_name: item.name,
            item_brand: "Kaşarcım",
            item_category:
              item.category_name || item.category?.name || "Peynir",
            price: item.currentPrice || item.price,
            quantity: item.quantity,
          })),
        },
      });
    }
  }, [paymentMethod, cartItems]);

  useEffect(() => {
    setMounted(true);

    // Sync discount code input with current coupon
    if (couponCode) {
      setDiscountCodeInput(couponCode);
    }

    // LocalStorage'dan misafir bilgilerini yükle
    if (typeof window !== "undefined") {
      const savedGuestInfo = localStorage.getItem("guestInfo");
      if (savedGuestInfo) {
        try {
          const parsedInfo = JSON.parse(savedGuestInfo);
          setGuestInfo((prev) => ({ ...prev, ...parsedInfo }));

          // Validasyon kontrolü yap, hepsi geçerliyse ödeme adımına geç
          if (validateGuestInfo(parsedInfo)) {
            setCurrentStep(3);
            setSelectedShipping("free");
          } else {
            // Validasyon hatası varsa adres adımında kal
            setCurrentStep(1);
          }
        } catch (error) {
          console.error("Guest info parsing error:", error);
        }
      }
    }
  }, [cartItems, couponCode]);

  // Sepet boşsa ürünler sayfasına yönlendir
  useEffect(() => {
    if (mounted && cartItems.length === 0) {
      showLoader();
      router.push("/urunler");
    }
  }, [mounted, cartItems, router, showLoader]);

  // Load user addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!user) return;

      try {
        const addresses = await UserService.getAddresses();
        setAddresses(addresses);

        // Varsayılan adresi seç ya da ilk adresi seç
        const defaultAddress = addresses.find((addr) => addr.is_default);
        if (defaultAddress) {
          setSelectedAddress(defaultAddress.id);
          // Set guest info with default address data
          setGuestInfo({
            fullName: `${defaultAddress.first_name || ""} ${
              defaultAddress.last_name || ""
            }`.trim(),
            email: user.email || "",
            phone: defaultAddress.phone_number || "",
            address: defaultAddress.address || "",
            city: defaultAddress.city || "",
            district: defaultAddress.district || "",
            postalCode: defaultAddress.postal_code || "",
          });

          // Validasyon kontrolü ile adım belirleme
          if (currentStep === 1 && !isEditingAddress) {
            const addressInfo = {
              fullName: `${defaultAddress.first_name || ""} ${
                defaultAddress.last_name || ""
              }`.trim(),
              email: user.email || "",
              phone: defaultAddress.phone_number || "",
              address: defaultAddress.address || "",
              city: defaultAddress.city || "",
              district: defaultAddress.district || "",
              postalCode: defaultAddress.postal_code || "",
            };

            setTimeout(() => {
              if (validateGuestInfo(addressInfo)) {
                setCurrentStep(3);
                setSelectedShipping("free");
              }
            }, 100);
          }
        } else if (addresses.length > 0) {
          setSelectedAddress(addresses[0].id);
          // Set guest info with first address data
          const firstAddress = addresses[0];
          setGuestInfo({
            fullName: `${firstAddress.first_name || ""} ${
              firstAddress.last_name || ""
            }`.trim(),
            email: user.email || "",
            phone: firstAddress.phone_number || "",
            address: firstAddress.address || "",
            city: firstAddress.city || "",
            district: firstAddress.district || "",
            postalCode: firstAddress.postal_code || "",
          });

          // Validasyon kontrolü ile adım belirleme
          if (currentStep === 1 && !isEditingAddress) {
            const addressInfo = {
              fullName: `${firstAddress.first_name || ""} ${
                firstAddress.last_name || ""
              }`.trim(),
              email: user.email || "",
              phone: firstAddress.phone_number || "",
              address: firstAddress.address || "",
              city: firstAddress.city || "",
              district: firstAddress.district || "",
              postalCode: firstAddress.postal_code || "",
            };

            setTimeout(() => {
              if (validateGuestInfo(addressInfo)) {
                setCurrentStep(3);
                setSelectedShipping("free");
              }
            }, 100);
          }
        }
      } catch (error) {
        console.error("Adres yüklenirken hata:", error);
      }
    };

    if (mounted && user) {
      fetchAddresses();
    }
  }, [mounted, user, isEditingAddress]);

  // Update guest info when selected address changes
  useEffect(() => {
    if (user && addresses.length > 0 && selectedAddress) {
      const address = addresses.find((addr) => addr.id === selectedAddress);
      if (address) {
        setGuestInfo({
          fullName: `${address.first_name || ""} ${
            address.last_name || ""
          }`.trim(),
          email: user.email || "",
          phone: address.phone_number || "",
          address: address.address || "",
          city: address.city || "",
          district: address.district || "",
          postalCode: address.postal_code || "",
        });
        // Eğer şu anda 1. adımda değilse, adım değiştirme
        if (currentStep === 1 && !isEditingAddress) {
          setCurrentStep(3);
          setSelectedShipping("free");
        }
      }
    }
  }, [selectedAddress, addresses, user, currentStep, isEditingAddress]);

  // E-posta yazım hatalarını düzeltme fonksiyonu
  const correctEmailTypos = (email) => {
    if (!email || !email.includes("@")) return email;

    const [username, domain] = email.split("@");

    // Yaygın domain yazım hatalarını düzeltme
    const commonDomains = {
      // Gmail varyasyonları
      "gmail.co": "gmail.com",
      "gmail.cm": "gmail.com",
      "gmail.comm": "gmail.com",
      "gmail.con": "gmail.com",
      "gmail.ocm": "gmail.com",
      "gmail.om": "gmail.com",
      "gmai.com": "gmail.com",
      "gmial.com": "gmail.com",
      "gmil.com": "gmail.com",
      "gmall.com": "gmail.com",
      "gamil.com": "gmail.com",
      "gemail.com": "gmail.com",

      // Hotmail varyasyonları
      "hotmail.co": "hotmail.com",
      "hotmail.cm": "hotmail.com",
      "hotmail.comm": "hotmail.com",
      "hotmail.con": "hotmail.com",
      "hotmail.om": "hotmail.com",
      "hotmal.com": "hotmail.com",
      "hotmai.com": "hotmail.com",
      "hotmail.coml": "hotmail.com",
      "hotmial.com": "hotmail.com",
      "homtail.com": "hotmail.com",

      // Yahoo varyasyonları
      "yahoo.co": "yahoo.com",
      "yahoo.cm": "yahoo.com",
      "yahoo.comm": "yahoo.com",
      "yahoo.con": "yahoo.com",
      "yaho.com": "yahoo.com",
      "yahooo.com": "yahoo.com",
      "yaoo.com": "yahoo.com",

      // Outlook varyasyonları
      "outlook.co": "outlook.com",
      "outlook.cm": "outlook.com",
      "outlook.con": "outlook.com",
      "outlook.comm": "outlook.com",
      "outloo.com": "outlook.com",
      "outlok.com": "outlook.com",

      // Diğer yaygın domainler
      "yandex.co": "yandex.com",
      "iclod.com": "icloud.com",
      "icoud.com": "icloud.com",
      "icloud.co": "icloud.com",
    };

    if (commonDomains[domain]) {
      return `${username}@${commonDomains[domain]}`;
    }

    return email;
  };

  // IBAN kopyalama fonksiyonu
  const copyIbanToClipboard = async () => {
    const iban = "TR72 0011 1000 0000 0070 5463 42";
    try {
      await navigator.clipboard.writeText(iban);
      setIbanCopied(true);
      setTimeout(() => setIbanCopied(false), 2000);
    } catch (err) {
      // Fallback için manuel kopyalama
      const textArea = document.createElement("textarea");
      textArea.value = iban;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setIbanCopied(true);
      setTimeout(() => setIbanCopied(false), 2000);
    }
  };

  if (!mounted || authLoading) {
    return <PageLoader />;
  }

  if (cartItems.length === 0) {
    return <PageLoader />;
  }

  const handleGuestInfoChange = (e) => {
    const { name, value } = e.target;

    // Hata mesajını temizle
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // E-posta düzeltme işlemi
    let correctedValue = value;
    if (name === "email") {
      correctedValue = correctEmailTypos(value);
    }

    const updatedInfo = {
      ...guestInfo,
      [name]: correctedValue,
    };

    setGuestInfo(updatedInfo);

    // LocalStorage'a kaydet
    if (typeof window !== "undefined") {
      localStorage.setItem("guestInfo", JSON.stringify(updatedInfo));
    }
  };

  const handleApplyDiscount = () => {
    if (discountCodeInput.trim()) {
      applyCoupon(discountCodeInput.trim());
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      // Error state'ini temizle
      setErrors({
        email: "",
        fullName: "",
        address: "",
        city: "",
        district: "",
        phone: "",
        cardNumber: "",
        cardName: "",
        cardExpiry: "",
        cardCvc: "",
      });

      // Misafir kullanıcı için form validasyonu
      if (!user) {
        const newErrors = {};
        let hasError = false;

        // E-posta kontrolü
        if (!guestInfo.email || guestInfo.email.trim() === "") {
          newErrors.email = "E-posta adresi gereklidir";
          hasError = true;
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(guestInfo.email)) {
            newErrors.email = "Geçerli bir e-posta adresi girin";
            hasError = true;
          }
        }

        // Ad Soyad kontrolü
        if (!guestInfo.fullName || guestInfo.fullName.trim() === "") {
          newErrors.fullName = "Ad Soyad gereklidir";
          hasError = true;
        } else {
          const nameRegex = /^[a-zA-ZçğıöşüÇĞIİÖŞÜ\s]+$/;
          const trimmedName = guestInfo.fullName.trim();
          const words = trimmedName
            .split(/\s+/)
            .filter((word) => word.length > 0);

          if (trimmedName.length < 2) {
            newErrors.fullName = "Ad Soyad en az 2 karakter olmalıdır";
            hasError = true;
          } else if (!nameRegex.test(trimmedName)) {
            newErrors.fullName = "Ad Soyad sadece harf içermelidir";
            hasError = true;
          } else if (words.length < 2) {
            newErrors.fullName = "Ad ve soyadınızı girin";
            hasError = true;
          } else if (!words.every((word) => word.length >= 2)) {
            newErrors.fullName = "Ad ve soyad en az 2 harfli olmalıdır";
            hasError = true;
          }
        }

        // Adres kontrolü
        if (!guestInfo.address || guestInfo.address.trim() === "") {
          newErrors.address = "Adres gereklidir";
          hasError = true;
        } else {
          const address = guestInfo.address.trim();
          const hasNumber = /\d/.test(address);
          const addressWords = address.split(/\s+/);
          const hasValidWords = addressWords.some((word) => word.length >= 3);

          if (address.length < 10) {
            newErrors.address = "Adres en az 10 karakter olmalıdır";
            hasError = true;
          } else if (!hasNumber) {
            newErrors.address =
              "Adres bir numara içermelidir (sokak no, daire no vb.)";
            hasError = true;
          } else if (!hasValidWords) {
            newErrors.address = "Geçerli bir adres girin";
            hasError = true;
          }
        }

        // İl kontrolü
        if (!guestInfo.city || guestInfo.city.trim() === "") {
          newErrors.city = "İl gereklidir";
          hasError = true;
        } else {
          const cityRegex = /^[a-zA-ZçğıöşüÇĞIİÖŞÜ\s]+$/;
          const city = guestInfo.city.trim();

          if (city.length < 3) {
            newErrors.city = "İl en az 3 karakter olmalıdır";
            hasError = true;
          } else if (!cityRegex.test(city)) {
            newErrors.city = "İl sadece harf içermelidir";
            hasError = true;
          } else if (city.length > 50) {
            newErrors.city = "İl en fazla 50 karakter olmalıdır";
            hasError = true;
          }
        }

        // İlçe kontrolü
        if (!guestInfo.district || guestInfo.district.trim() === "") {
          newErrors.district = "İlçe gereklidir";
          hasError = true;
        } else {
          const districtRegex = /^[a-zA-ZçğıöşüÇĞIİÖŞÜ\s]+$/;
          const district = guestInfo.district.trim();

          if (district.length < 3) {
            newErrors.district = "İlçe en az 3 karakter olmalıdır";
            hasError = true;
          } else if (!districtRegex.test(district)) {
            newErrors.district = "İlçe sadece harf içermelidir";
            hasError = true;
          } else if (district.length > 50) {
            newErrors.district = "İlçe en fazla 50 karakter olmalıdır";
            hasError = true;
          }
        }

        // Telefon kontrolü
        if (!guestInfo.phone || guestInfo.phone.trim() === "") {
          newErrors.phone = "Telefon numarası gereklidir";
          hasError = true;
        } else {
          const phoneRegex = /^[0-9\s\-\(\)\+]+$/;
          const cleanPhone = guestInfo.phone.replace(/[\s\-\(\)\+]/g, "");

          if (guestInfo.phone.length < 10) {
            newErrors.phone = "Telefon numarası en az 10 karakter olmalıdır";
            hasError = true;
          } else if (!phoneRegex.test(guestInfo.phone)) {
            newErrors.phone = "Telefon numarası sadece rakam içermelidir";
            hasError = true;
          } else if (cleanPhone.length < 10 || cleanPhone.length > 15) {
            newErrors.phone =
              "Geçerli bir telefon numarası girin (10-15 rakam)";
            hasError = true;
          } else if (!/^\d+$/.test(cleanPhone)) {
            newErrors.phone = "Telefon numarası sadece rakam içermelidir";
            hasError = true;
          }
        }

        if (hasError) {
          setErrors((prev) => ({ ...prev, ...newErrors }));

          // İlk hatalı alana focus yap
          setTimeout(() => {
            if (newErrors.email && emailRef.current) {
              emailRef.current.focus();
            } else if (newErrors.fullName && fullNameRef.current) {
              fullNameRef.current.focus();
            } else if (newErrors.address && addressRef.current) {
              addressRef.current.focus();
            } else if (newErrors.city && cityRef.current) {
              cityRef.current.focus();
            } else if (newErrors.district && districtRef.current) {
              districtRef.current.focus();
            } else if (newErrors.phone && phoneRef.current) {
              phoneRef.current.focus();
            }
          }, 100);

          return;
        }
      }

      // Kayıtlı kullanıcı için adres seçimi kontrolü
      if (user && !selectedAddress) {
        console.error("Lütfen bir adres seçin");
        return;
      }

      setIsEditingAddress(false); // Reset editing mode
      setCurrentStep(3); // Skip cargo step, go directly to payment
      setSelectedShipping("free");
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 3) {
      setCurrentStep(1); // Go back to address step
    }
  };

  const handleCardInfoChange = (e) => {
    const { name, value } = e.target;

    // Kart hata mesajlarını temizle
    const cardErrorMap = {
      number: "cardNumber",
      name: "cardName",
      expiry: "cardExpiry",
      cvc: "cardCvc",
    };

    const errorKey = cardErrorMap[name];
    if (errorKey && errors[errorKey]) {
      setErrors((prev) => ({ ...prev, [errorKey]: "" }));
    }

    setCardInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFinalPayment = async () => {
    // Kullanıcı giriş yapmışsa adres kontrolü yap
    if (user && !selectedAddress) {
      console.error("Lütfen bir adres seçin");
      return;
    }

    // Misafir kullanıcı ise form kontrolü yap
    if (!user) {
      if (
        !guestInfo.fullName ||
        !guestInfo.email ||
        !guestInfo.phone ||
        !guestInfo.address ||
        !guestInfo.city ||
        !guestInfo.district
      ) {
        console.error("Lütfen tüm gerekli alanları doldurun");
        return;
      }

      // E-posta doğrulaması
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(guestInfo.email)) {
        console.error("Lütfen geçerli bir e-posta adresi girin");
        return;
      }

      // Telefon doğrulaması (basit)
      if (guestInfo.phone.length < 8) {
        console.error("Lütfen geçerli bir telefon numarası girin");
        return;
      }
    }

    // Kredi kartı ödeme yöntemi seçilmişse kart bilgilerini kontrol et
    if (paymentMethod === "credit_card") {
      const newErrors = {};
      let hasError = false;

      // Kart numarası kontrolü
      if (!cardInfo.number || cardInfo.number.trim() === "") {
        newErrors.cardNumber = "Kart numarası gereklidir";
        hasError = true;
      } else {
        const cardNumber = cardInfo.number.replace(/\s/g, "");
        if (!/^\d{13,19}$/.test(cardNumber)) {
          newErrors.cardNumber =
            "Geçerli bir kart numarası girin (13-19 rakam)";
          hasError = true;
        }
      }

      // Kart üzerindeki isim kontrolü
      if (!cardInfo.name || cardInfo.name.trim() === "") {
        newErrors.cardName = "Kart üzerindeki isim gereklidir";
        hasError = true;
      } else {
        const cardNameRegex = /^[a-zA-ZçğıöşüÇĞIİÖŞÜ\s]+$/;
        const cardName = cardInfo.name.trim();

        if (cardName.length < 2) {
          newErrors.cardName =
            "Kart üzerindeki isim en az 2 karakter olmalıdır";
          hasError = true;
        } else if (!cardNameRegex.test(cardName)) {
          newErrors.cardName = "Kart üzerindeki isim sadece harf içermelidir";
          hasError = true;
        }
      }

      // Son kullanma tarihi kontrolü
      if (!cardInfo.expiry || cardInfo.expiry.trim() === "") {
        newErrors.cardExpiry = "Son kullanma tarihi gereklidir";
        hasError = true;
      } else {
        const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2}|[0-9]{4})$/;
        if (!expiryRegex.test(cardInfo.expiry.trim())) {
          newErrors.cardExpiry = "Geçerli bir tarih girin (MM/YY formatında)";
          hasError = true;
        }
      }

      // CVC kontrolü
      if (!cardInfo.cvc || cardInfo.cvc.trim() === "") {
        newErrors.cardCvc = "CVC kodu gereklidir";
        hasError = true;
      } else if (!/^\d{3,4}$/.test(cardInfo.cvc)) {
        newErrors.cardCvc = "CVC kodu 3-4 rakam olmalıdır";
        hasError = true;
      }

      if (hasError) {
        setErrors((prev) => ({ ...prev, ...newErrors }));

        // İlk hatalı kart alanına focus yap
        setTimeout(() => {
          if (newErrors.cardNumber && cardNumberRef.current) {
            cardNumberRef.current.focus();
          } else if (newErrors.cardName && cardNameRef.current) {
            cardNameRef.current.focus();
          } else if (newErrors.cardExpiry && cardExpiryRef.current) {
            cardExpiryRef.current.focus();
          } else if (newErrors.cardCvc && cardCvcRef.current) {
            cardCvcRef.current.focus();
          }
        }, 100);

        return;
      }
    }

    setProcessing(true);

    try {
      // Kargo ücreti hesaplama
      const shippingCost = (discountedTotal || cartTotal) < 1500 ? 100 : 0;

      // Final toplam
      const finalTotal = (discountedTotal || cartTotal) + shippingCost;

      // Sipariş verileri hazırla
      let orderData = {
        items: cartItems.map((item) => {
          // İndirim kontrolü ve fiyat hesaplamaları
          const hasDiscount =
            item.active_discount !== null && item.active_discount !== undefined;
          const originalPrice = parseFloat(item.price) || 0;
          const currentPrice =
            item.currentPrice !== undefined
              ? parseFloat(item.currentPrice)
              : parseFloat(item.price) || 0;
          const discountAmount = hasDiscount ? originalPrice - currentPrice : 0;
          const discountPercentage =
            hasDiscount && item.active_discount?.discount_percentage
              ? item.active_discount.discount_percentage
              : hasDiscount
              ? Math.round(
                  ((originalPrice - currentPrice) / originalPrice) * 100
                )
              : 0;

          return {
            product_id: parseInt(item.id), // ID'yi integer'a çevirelim
            quantity: parseInt(item.quantity), // Quantity'yi integer'a çevirelim
            price: currentPrice.toFixed(2), // String olarak fiyat
          };
        }),
        coupon_code: couponCode || null,
        payment_method:
          paymentMethod === "cash_on_delivery"
            ? "cash_on_delivery"
            : paymentMethod === "bank_transfer"
            ? "bank_transfer"
            : "online",
        total_price: cartTotal,
        discount: discount || 0,
        shipping_cost: shippingCost,
        final_price: finalTotal,
        notes: orderNotes || "",
      };

      // Kullanıcı giriş yapmışsa adres ID'sini ekle
      if (user) {
        orderData.address_id = selectedAddress;
      } else {
        // Misafir kullanıcı için adres bilgileri ekle
        orderData.guest_info = {
          full_name: guestInfo.fullName,
          email: guestInfo.email,
          phone: guestInfo.phone,
          address: `${guestInfo.address}, ${guestInfo.district}`,
          city: guestInfo.city,
          district: guestInfo.district,
          postal_code: guestInfo.postalCode || "",
        };
      }

      // API isteği için try-catch bloğu
      try {
        // OrderService ile sipariş oluştur
        const order = await OrderService.createOrder(orderData);

        // Purchase event'ini gönder
        if (typeof window !== "undefined" && window.dataLayer) {
          window.dataLayer.push({
            event: "purchase",
            ecommerce: {
              transaction_id: order.id.toString(),
              value: parseFloat(finalTotal),
              currency: "TRY",
              shipping: parseFloat(shippingCost),
             
              items: cartItems.map((item) => ({
                item_id: item.id,
                item_name: item.name,
                price: parseFloat(item.currentPrice || item.price),
                quantity: item.quantity,
              })),
            },
          });
        }

        // Sipariş tamamlandı sayfasına yönlendir
        const redirectUrl = `/siparis-basarili?orderId=${order.id}&total=${finalTotal}&paymentMethod=${paymentMethod}`;

        // Loader'ı göster
        showLoader();

        // Yönlendirme
        window.location.href = redirectUrl;
      } catch (error) {
        // API hata yanıtını ele al
        console.error("API hatası:", error);

        let errorMessage = "Bir hata oluştu";

        // Hata yanıtını kontrol et
        if (error.response && error.response.data) {
          if (error.response.data.error) {
            errorMessage = error.response.data.error;
          } else if (typeof error.response.data === "string") {
            errorMessage = error.response.data;
          } else {
            errorMessage = JSON.stringify(error.response.data);
          }
        } else if (error.message) {
          errorMessage = error.message;
        }

        console.error(errorMessage);
      }
    } catch (error) {
      console.error("Ödeme hatası:", error);
      console.error("İşlem sırasında bir hata oluştu");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div id="Checkout" className="min-h-screen bg-white">
      {/* Mobile Header - Before Summary */}
      <div className="lg:hidden px-4 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CustomLink href="/" className="inline-block">
            <Image
              src="/images/kasarcim-logo.svg"
              alt="Kars'tan Töresel"
              width={120}
              height={40}
              className="object-contain"
            />
          </CustomLink>

          <div className="text-sm text-gray-600">
            {user ? (
              <span className="text-black font-medium">
                Hoş geldiniz, {user.firstName || user.email}
              </span>
            ) : (
              <CustomLink
                href="/login"
                className="text-black font-medium hover:underline"
              >
                Giriş Yap
              </CustomLink>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Summary Header */}
      <div className="lg:hidden">
        <div
          className="bg-gray-50 px-4 py-3 border-b border-gray-200 cursor-pointer"
          onClick={() => setIsOrderSummaryOpen(!isOrderSummaryOpen)}
        >
          <div className="flex items-center justify-between">
            <span className="text-gray-700 font-medium">Özet</span>
            <div className="flex items-center">
              <span className="text-lg font-bold mr-2">
                ₺{" "}
                {(
                  parseFloat(discountedTotal || cartTotal || 0) +
                  ((discountedTotal || cartTotal || 0) >= 1500 ? 0 : 100)
                ).toFixed(2)}{" "}
                ({cartItems.length} ürün)
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                className={`transform transition-transform ${
                  isOrderSummaryOpen ? "rotate-180" : ""
                }`}
              >
                <path fill="none" d="M0 0h24v24H0z"></path>
                <path
                  fill="currentColor"
                  d="M12 13.172l4.95-4.95 1.414 1.414L12 16 5.636 9.636 7.05 8.222z"
                ></path>
              </svg>
            </div>
          </div>
        </div>

        {/* Enhanced Mobile Summary */}
        {isOrderSummaryOpen && (
          <div className="bg-white border-b border-gray-200">
            <div className="px-4 py-4">
              {/* Product List */}
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => {
                  // İndirim kontrolü ve fiyat hesaplamaları
                  const hasDiscount =
                    item.active_discount !== null &&
                    item.active_discount !== undefined;
                  const originalPrice = parseFloat(item.price) || 0;
                  const currentPrice =
                    item.currentPrice !== undefined
                      ? parseFloat(item.currentPrice)
                      : parseFloat(item.price) || 0;
                  const discountAmount = hasDiscount
                    ? originalPrice - currentPrice
                    : 0;
                  const discountPercentage =
                    hasDiscount && item.active_discount?.discount_percentage
                      ? item.active_discount.discount_percentage
                      : hasDiscount
                      ? Math.round(
                          ((originalPrice - currentPrice) / originalPrice) * 100
                        )
                      : 0;

                  return (
                    <div key={item.id} className="flex items-start gap-3">
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                          <Image
                            src={item.img_url || "/images/placeholder.png"}
                            alt={item.name}
                            width={48}
                            height={48}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="absolute -top-2 -right-2 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">
                            {item.quantity}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-800 leading-tight mb-1">
                          {item.name}
                        </h4>
                        <div className="text-right">
                          <div className="font-medium text-gray-800">
                            ₺ {(currentPrice * item.quantity).toFixed(2)}
                          </div>
                          {hasDiscount && (
                            <div className="text-xs text-gray-500 line-through">
                              ₺{(originalPrice * item.quantity).toFixed(2)}
                            </div>
                          )}
                          {hasDiscount && (
                            <div className="text-xs text-red-600 font-medium">
                              %{discountPercentage} indirim
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <hr className="border-gray-200 mb-4" />

              {/* Subtotal */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 text-sm">Ara Toplam</span>
                    <div
                      className="w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center cursor-help"
                      title="Ara toplam, tüm geçerli indirimlerden önce siparişinizin toplam fiyatını yansıtır."
                    >
                      <span className="text-gray-600 text-xs">?</span>
                    </div>
                  </div>
                  <span className="font-medium text-gray-800 text-sm">
                    ₺ {parseFloat(cartTotal || 0).toFixed(2)}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm">
                      İndirim ({couponCode})
                    </span>
                    <span className="font-medium text-green-500 text-sm">
                      -₺ {parseFloat(discount).toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">
                    Teslimat / Kargo
                  </span>
                  {(discountedTotal || cartTotal || 0) >= 1500 ? (
                    <span className="text-green-600 text-sm font-medium">
                      Ücretsiz
                    </span>
                  ) : (
                    <span className="text-gray-600 text-sm">₺ 100,00</span>
                  )}
                </div>
              </div>

              <hr className="border-gray-200 mb-4" />

              {/* Discount Code */}
              <div className="mb-4 ">
                {couponCode ? (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex justify-between items-center">
                    <div>
                      <span className="text-orange-700 font-medium flex items-center text-sm">
                        🏷️ {couponCode}
                      </span>
                      <p className="text-xs text-orange-600 mt-1">
                        -
                        {new Intl.NumberFormat("tr-TR", {
                          style: "currency",
                          currency: "TRY",
                        }).format(discount)}{" "}
                        indirim uygulandı
                      </p>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-orange-700 hover:text-orange-900 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={discountCodeInput}
                      onChange={(e) => setDiscountCodeInput(e.target.value)}
                      placeholder="İndirim kodu ekle"
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleApplyDiscount}
                      disabled={couponLoading || !discountCodeInput.trim()}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {couponLoading ? "Uygula..." : "Uygula"}
                    </button>
                  </div>
                )}
              </div>

              <hr className="border-gray-200 mb-4" />

              {/* Total */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-lg font-bold">
                  <span className="text-gray-800">Toplam</span>
                  <span className="text-gray-800">
                    ₺{" "}
                    {(
                      parseFloat(discountedTotal || cartTotal || 0) +
                      ((discountedTotal || cartTotal || 0) >= 1500 ? 0 : 100)
                    ).toFixed(2)}
                  </span>
                </div>
                <div className="text-right text-xs text-gray-500 mt-1">
                  Vergi ₺{" "}
                  {(
                    (parseFloat(discountedTotal || cartTotal || 0) +
                      ((discountedTotal || cartTotal || 0) >= 1500 ? 0 : 100)) *
                    0.01
                  ).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)]">
        {/* Left Side - Form */}
        <div className="w-full lg:w-3/5 bg-white">
          <div className="h-full overflow-y-auto px-2 py-2 lg:px-4 lg:py-2">
            <div className="max-w-2xl mx-auto space-y-8">
              {/* Header - Desktop Only */}
              <div className="hidden lg:flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 lg:mt-6 space-y-4 sm:space-y-0">
                <CustomLink href="/" className="inline-block">
                  <Image
                    src="/images/kasarcim-logo.svg"
                    alt="Kars'tan Töresel"
                    width={120}
                    height={40}
                    className="object-contain"
                  />
                </CustomLink>

                <div className="text-sm text-gray-600">
                  {user ? (
                    <span className="text-black  font-bold">
                      Hoş geldiniz, {user.firstName || user.email}
                    </span>
                  ) : (
                    <CustomLink
                      href="/login"
                      className="text-black font-medium hover:underline"
                    >
                      Giriş Yap
                    </CustomLink>
                  )}
                </div>
              </div>

              {/* Discount Code - Only show during address step */}
              {currentStep === 1 && (
                <div className="hidden lg:block">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    İndirim Kodu
                  </h3>
                  {couponCode ? (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex justify-between items-center">
                      <div>
                        <span className="text-orange-700 font-medium flex items-center">
                          🏷️ {couponCode}
                        </span>
                        <p className="text-sm text-orange-600 mt-1">
                          -
                          {new Intl.NumberFormat("tr-TR", {
                            style: "currency",
                            currency: "TRY",
                          }).format(discount)}{" "}
                          indirim uygulandı
                        </p>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-orange-700 hover:text-orange-900"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={discountCodeInput}
                        onChange={(e) => setDiscountCodeInput(e.target.value)}
                        placeholder="İndirim kodu ekle"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                      <button
                        onClick={handleApplyDiscount}
                        disabled={couponLoading || !discountCodeInput.trim()}
                        className="px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ width: "33%" }}
                      >
                        {couponLoading ? "Uygula..." : "Uygula"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Step 1 - Address */}
              {currentStep === 1 && (
                <div>
                  <div className="flex items-center mb-6">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                      1
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Adres
                    </h3>
                  </div>

                  {user && addresses.length > 0 ? (
                    <div className="space-y-4">
                      {addresses.map((address) => (
                        <div
                          key={address.id}
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                            selectedAddress === address.id
                              ? "border-orange-500 bg-orange-50"
                              : "border-gray-200"
                          }`}
                          onClick={() => {
                            setSelectedAddress(address.id);
                            setIsEditingAddress(false);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium text-lg">
                                {address.title}
                              </h3>
                              <p className="text-gray-600 text-sm mt-1">
                                {`${address.first_name || ""} ${
                                  address.last_name || ""
                                }`.trim()}
                              </p>
                              <p className="text-gray-600 text-sm mt-1">
                                {address.address}, {address.district}/
                                {address.city}
                              </p>
                              <p className="text-gray-500 text-sm mt-1">
                                {address.phone_number}
                              </p>
                            </div>
                            <div className="flex flex-col items-end">
                              {address.is_default && (
                                <span className="text-xs bg-orange-100 text-orange-600 py-1 px-2 rounded mb-2">
                                  Varsayılan
                                </span>
                              )}
                              <div
                                className={`h-5 w-5 border-2 rounded-full ${
                                  selectedAddress === address.id
                                    ? "border-orange-500 bg-orange-500"
                                    : "border-gray-300"
                                }`}
                              >
                                {selectedAddress === address.id && (
                                  <div className="h-full w-full flex items-center justify-center">
                                    <FaCheck className="text-white text-xs" />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      <CustomLink
                        href="/adreslerim?returnUrl=/odeme"
                        className="block w-full p-3 border border-dashed border-orange-300 rounded-lg text-center text-orange-500 hover:bg-orange-50 transition duration-200"
                      >
                        <div className="flex items-center justify-center">
                          <FaPlus className="mr-2" /> Yeni Adres Ekle
                        </div>
                      </CustomLink>
                    </div>
                  ) : user && addresses.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-gray-500 mb-4">
                        Henüz kayıtlı adresiniz bulunmuyor.
                      </p>
                      <CustomLink
                        href="/adreslerim?returnUrl=/odeme"
                        className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg transition"
                      >
                        Adres Ekle
                      </CustomLink>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {/* Contact Info */}
                      <div>
                        <div className="space-y-4">
                          <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              E-Posta <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="email"
                              value={guestInfo.email}
                              onChange={handleGuestInfoChange}
                              name="email"
                              autoComplete="email"
                              className={getFieldClasses("email")}
                              ref={emailRef}
                            />
                            {errors.email && (
                              <p className="mt-1 text-sm text-red-600">
                                {errors.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Delivery Address */}
                      <div>
                        <div className="space-y-4">
                          {/* Name */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Ad Soyad <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="fullName"
                              value={guestInfo.fullName}
                              onChange={handleGuestInfoChange}
                              autoComplete="given-name"
                              className={getFieldClasses("fullName")}
                              ref={fullNameRef}
                            />
                            {errors.fullName && (
                              <p className="mt-1 text-sm text-red-600">
                                {errors.fullName}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Address */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Adres <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="address"
                            value={guestInfo.address}
                            onChange={handleGuestInfoChange}
                            autoComplete="address-line1"
                            className={getFieldClasses("address")}
                            ref={addressRef}
                          />
                          {errors.address && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.address}
                            </p>
                          )}
                        </div>

                        {/* City District */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              İl <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="city"
                              value={guestInfo.city}
                              onChange={handleGuestInfoChange}
                              className={getFieldClasses("city")}
                              ref={cityRef}
                            />
                            {errors.city && (
                              <p className="mt-1 text-sm text-red-600">
                                {errors.city}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              İlçe <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="district"
                              value={guestInfo.district}
                              onChange={handleGuestInfoChange}
                              className={getFieldClasses("district")}
                              ref={districtRef}
                            />
                            {errors.district && (
                              <p className="mt-1 text-sm text-red-600">
                                {errors.district}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Postal Code */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Posta Kodu (İsteğe bağlı)
                          </label>
                          <input
                            type="text"
                            name="postalCode"
                            value={guestInfo.postalCode}
                            onChange={handleGuestInfoChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        </div>

                        {/* Phone */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Telefon <span className="text-red-500">*</span>
                          </label>
                          <div className="flex">
                            <div
                              className={`flex items-center px-3 py-3 border border-r-0 bg-gray-50 rounded-l-lg ${
                                errors.phone
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                            >
                              <img
                                className="w-4 h-3 mr-2"
                                alt="TR"
                                src="https://cdn.myikas.com/sf/assets/flags/3x2/TR.svg"
                              />
                              <div className="w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-600"></div>
                            </div>
                            <input
                              type="tel"
                              name="phone"
                              value={guestInfo.phone}
                              onChange={handleGuestInfoChange}
                              autoComplete="tel"
                              className={getFieldClasses("phone")}
                              ref={phoneRef}
                            />
                          </div>
                          {errors.phone && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.phone}
                            </p>
                          )}
                        </div>

                        {/* Corporate Invoice */}
                        <div className="mt-3">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <div className="relative">
                              <input
                                type="checkbox"
                                checked={corporateInvoice}
                                onChange={(e) =>
                                  setCorporateInvoice(e.target.checked)
                                }
                                className="sr-only"
                              />
                              <div
                                className={`w-4 h-4 border-2 rounded ${
                                  corporateInvoice
                                    ? "bg-orange-500 border-orange-500"
                                    : "border-gray-300"
                                }`}
                              >
                                {corporateInvoice && (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="10.3"
                                    height="8"
                                    viewBox="8.9 0.3 10.3 8"
                                    className="text-white"
                                  >
                                    <path
                                      fill="currentColor"
                                      d="M12.6 8.1l-3.7-3.8 1-1.1 2.7 2.7 5.5-5.4 1 1z"
                                    ></path>
                                  </svg>
                                )}
                              </div>
                            </div>
                            <span className="text-sm text-gray-700">
                              Kurumsal fatura
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Billing Address Checkbox */}
                  <div className="mt-6">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={billingAddressSame}
                          onChange={(e) =>
                            setBillingAddressSame(e.target.checked)
                          }
                          className="sr-only"
                        />
                        <div
                          className={`w-4 h-4 border-2 rounded ${
                            billingAddressSame
                              ? "bg-orange-500 border-orange-500"
                              : "border-gray-300"
                          }`}
                        >
                          {billingAddressSame && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="10.3"
                              height="8"
                              viewBox="8.9 0.3 10.3 8"
                              className="text-white"
                            >
                              <path
                                fill="currentColor"
                                d="M12.6 8.1l-3.7-3.8 1-1.1 2.7 2.7 5.5-5.4 1 1z"
                              ></path>
                            </svg>
                          )}
                        </div>
                      </div>
                      <span className="text-sm text-gray-700">
                        Fatura adresim teslimat adresimle aynı
                      </span>
                    </label>
                  </div>

                  {/* Continue Button */}
                  <button
                    onClick={handleNextStep}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 px-6 rounded-lg font-medium text-lg transition-colors mt-8"
                  >
                    Ödeme ile Devam Et
                  </button>
                </div>
              )}

              {/* Step 3 - Payment */}
              {currentStep === 3 && (
                <div>
                  {/* Progress Bar - Vertical Steps */}
                  <div className="space-y-6">
                    {/* Step 1 - Address */}
                    <div className="border-b border-gray-200 pb-4">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex flex-col lg:flex-row lg:items-start">
                          <div className="flex items-start mb-3 lg:mb-0">
                            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                              ✓
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800">
                              Adres
                            </h3>
                          </div>
                          <div className="lg:ml-6 ml-11 text-sm text-gray-600 space-y-1">
                            <div>{guestInfo.email}</div>
                            <div>{guestInfo.fullName}</div>
                            <div>+90{guestInfo.phone}</div>
                            <div>
                              {guestInfo.address}, {guestInfo.district},{" "}
                              {guestInfo.city}, Türkiye
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setIsEditingAddress(true);
                            setCurrentStep(1);
                          }}
                          className="text-orange-500 font-medium hover:underline mt-3 lg:mt-0 ml-11 lg:ml-0"
                        >
                          {user && addresses.length > 0
                            ? "Adres Değiştir"
                            : "Düzenle"}
                        </button>
                      </div>
                    </div>

                    {/* Step 2 - Cargo */}
                    <div className="border-b border-gray-200 pb-4">
                      <div className="flex flex-col lg:flex-row lg:items-start">
                        <div className="flex items-start mb-3 lg:mb-0">
                          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                            ✓
                          </div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            Kargo
                          </h3>
                        </div>
                        <div className="lg:ml-6 ml-11 text-sm text-gray-600">
                          {(discountedTotal || cartTotal || 0) >= 1500 ? (
                            <>
                              Ücretsiz Kargo /{" "}
                              <span className="text-green-600 font-medium">
                                Ücretsiz
                              </span>
                            </>
                          ) : (
                            <>
                              Standart Kargo /{" "}
                              <span className="text-orange-600 font-medium">
                                ₺100,00
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Step 3 - Payment */}
                    <div>
                      <div className="flex items-center mb-6">
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                          3
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          Ödeme
                        </h3>
                      </div>

                      <div className="lg:ml-11 ml-2">
                        {/* Payment Method Selection */}
                        <div className="space-y-4 mb-6">
                          {/* Credit Card - Re-enabled */}
                          <div
                            className={`border-2 rounded-lg p-4 transition-all duration-200 ${
                              paymentMethod === "credit_card"
                                ? "border-orange-500 bg-orange-50"
                                : "border-gray-200"
                            } opacity-50 cursor-not-allowed`}
                            onClick={(e) => {
                              e.preventDefault();
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <FaCreditCard className="text-gray-400 mr-3 text-xl" />
                                <div>
                                  <span className="font-medium text-gray-500">
                                    Kredi Kartı
                                  </span>
                                  <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                                    Çok Yakında
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-400 font-bold text-sm">
                                  PAYTR
                                </span>
                                <div
                                  className={`h-5 w-5 border-2 rounded-full border-gray-300 bg-gray-100`}
                                ></div>
                              </div>
                            </div>
                          </div>

                          {/* Bank Transfer */}
                          <div
                            className={` border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                              paymentMethod === "bank_transfer"
                                ? "border-orange-500 bg-orange-50"
                                : "border-gray-200"
                            }`}
                            onClick={() => setPaymentMethod("bank_transfer")}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <FaMoneyBillAlt className="text-orange-500 mr-3 text-xl" />
                                <div>
                                  <span className="font-medium text-gray-800">
                                    Havale / EFT
                                  </span>
                                </div>
                              </div>
                              <div
                                className={`h-5 w-5 border-2 rounded-full ${
                                  paymentMethod === "bank_transfer"
                                    ? "border-orange-500 bg-orange-500"
                                    : "border-gray-300"
                                }`}
                              >
                                {paymentMethod === "bank_transfer" && (
                                  <div className="h-full w-full flex items-center justify-center">
                                    <FaCheck className="text-white text-xs" />
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* IBAN Details - Only show when selected */}
                            {paymentMethod === "bank_transfer" && (
                              <div className="border-t border-orange-200 pt-4 mt-4">
                                <div className="space-y-3 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">
                                      Ad Soyad:
                                    </span>
                                    <span className="font-medium text-gray-800">
                                      Ramazan Deniz SAĞ
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">
                                      Banka:
                                    </span>
                                    <span className="font-medium text-gray-800">
                                      Enpara
                                    </span>
                                  </div>

                                  <div className="flex justify-between">
                                    <span className="text-gray-600">IBAN:</span>
                                    <span className="font-medium text-gray-800">
                                      TR720011100000000070546342
                                    </span>
                                  </div>
                                  <div className="w-full">
                                    <button
                                      onClick={copyIbanToClipboard}
                                      className={`w-full items-center justify-center flex text-center px-3 py-1.5 sm:p-1 rounded transition-colors text-sm sm:text-xs ${
                                        ibanCopied
                                          ? "bg-green-100 text-green-600"
                                          : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                                      }`}
                                      title={
                                        ibanCopied
                                          ? "Kopyalandı!"
                                          : "IBAN'ı Kopyala"
                                      }
                                    >
                                      <span className=" w-full items-center justify-center flex flex-row gap-1">
                                        {ibanCopied ? (
                                          <>
                                            <FaCheck className="w-3 h-3" />
                                            Kopyalandı
                                          </>
                                        ) : (
                                          <>
                                            <FaCopy className="w-3 h-3" />
                                            Kopyala
                                          </>
                                        )}
                                      </span>
                                     
                                    </button>
                                  </div>
                                </div>
                                <div className="mt-4 p-3 bg-white border border-orange-200 rounded-lg">
                                  <p className="text-gray-600 text-sm">
                                    <strong>Not:</strong> Havale açıklama
                                    kısmına sipariş numaranızı yazınız. Sipariş
                                    numarası ödeme onaylandıktan sonra e-posta
                                    adresinize gönderilecektir.
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Order Notes Section */}
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sipariş Notu (İsteğe bağlı)
                          </label>
                          <textarea
                            value={orderNotes}
                            onChange={(e) => setOrderNotes(e.target.value)}
                            placeholder="Siparişinizle ilgili eklemek istediğiniz notlar..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                            rows="2"
                          />
                        </div>
                        {/* Agreements */}
                        <div className="mb-6">
                          <label className="flex items-start gap-3 cursor-pointer">
                            <div className="relative mt-1">
                              <input type="checkbox" className="sr-only" />
                              <div className="w-4 h-4 border-2 rounded border-orange-500 bg-orange-500">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="10.3"
                                  height="8"
                                  viewBox="8.9 0.3 10.3 8"
                                  className="text-white"
                                >
                                  <path
                                    fill="currentColor"
                                    d="M12.6 8.1l-3.7-3.8 1-1.1 2.7 2.7 5.5-5.4 1 1z"
                                  ></path>
                                </svg>
                              </div>
                            </div>
                            <span className="text-sm text-gray-700">
                              <span className="text-orange-500 underline cursor-pointer">
                                Gizlilik Sözleşmesini
                              </span>{" "}
                              ve{" "}
                              <span className="text-orange-500 underline cursor-pointer">
                                Satış Sözleşmesini
                              </span>{" "}
                              okudum, onaylıyorum.
                            </span>
                          </label>
                        </div>

                        {/* Complete Order Button */}
                        <button
                          onClick={handleFinalPayment}
                          disabled={processing}
                          className={`w-full py-4 px-6 rounded-lg font-medium text-lg transition-colors mb-4 ${
                            processing
                              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                              : "bg-orange-500 hover:bg-orange-600 text-white"
                          }`}
                        >
                          {processing ? (
                            <div className="flex items-center justify-center">
                              <Loader size="small" />
                              <span className="ml-2">İşleniyor...</span>
                            </div>
                          ) : (
                            "Siparişi Tamamla"
                          )}
                        </button>

                        {/* Security Info */}
                        <div className="flex items-center justify-center text-gray-500 text-sm">
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 616 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Ödemeler güvenli ve şifrelidir
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Order Summary */}
        <div className="hidden lg:block w-2/5 bg-gray-50 fixed right-0 top-0 h-full overflow-y-auto ">
          <div className="p-4 px-16 mt-10">
            <div className="max-w-2xl mx-auto mt-6">
              {/* Product List */}
              <div className="space-y-6 mb-8">
                {cartItems.map((item) => {
                  // İndirim kontrolü ve fiyat hesaplamaları
                  const hasDiscount =
                    item.active_discount !== null &&
                    item.active_discount !== undefined;
                  const originalPrice = parseFloat(item.price) || 0;
                  const currentPrice =
                    item.currentPrice !== undefined
                      ? parseFloat(item.currentPrice)
                      : parseFloat(item.price) || 0;
                  const discountAmount = hasDiscount
                    ? originalPrice - currentPrice
                    : 0;
                  const discountPercentage =
                    hasDiscount && item.active_discount?.discount_percentage
                      ? item.active_discount.discount_percentage
                      : hasDiscount
                      ? Math.round(
                          ((originalPrice - currentPrice) / originalPrice) * 100
                        )
                      : 0;

                  return (
                    <div key={item.id} className="flex items-start gap-4">
                      <div className="relative flex-shrink-0">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                          <Image
                            src={item.img_url || "/images/placeholder.png"}
                            alt={item.name}
                            width={64}
                            height={64}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-medium">
                            {item.quantity}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-800 text-sm leading-5 mb-2">
                          {item.name}
                        </h4>
                        <div className="text-right">
                          <div className="font-medium text-gray-800">
                            ₺ {(currentPrice * item.quantity).toFixed(2)}
                          </div>
                          {hasDiscount && (
                            <div className="text-xs text-gray-500 line-through">
                              ₺{(originalPrice * item.quantity).toFixed(2)}
                            </div>
                          )}
                          {hasDiscount && (
                            <div className="text-xs text-red-600 font-medium">
                              %{discountPercentage} indirim
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <hr className="border-gray-200 mb-6" />

              {/* Subtotal */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Ara Toplam</span>
                    <div
                      className="w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center cursor-help"
                      title="Ara toplam, tüm geçerli indirimlerden önce siparişinizin toplam fiyatını yansıtır."
                    >
                      <span className="text-gray-600 text-xs">?</span>
                    </div>
                  </div>
                  <span className="font-medium text-gray-800">
                    ₺ {parseFloat(cartTotal || 0).toFixed(2)}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">
                      İndirim ({couponCode})
                    </span>
                    <span className="font-medium text-green-500">
                      -₺ {parseFloat(discount).toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Teslimat / Kargo</span>
                  {(discountedTotal || cartTotal || 0) >= 1500 ? (
                    <span className="text-green-600 text-sm font-medium">
                      Ücretsiz
                    </span>
                  ) : (
                    <span className="text-gray-600 text-sm">₺ 100,00</span>
                  )}
                </div>
              </div>

              <hr className="border-gray-200 mb-6" />

              {/* Total */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xl font-bold">
                  <span className="text-gray-800">Toplam</span>
                  <span className="text-gray-800">
                    ₺{" "}
                    {(
                      parseFloat(discountedTotal || cartTotal || 0) +
                      ((discountedTotal || cartTotal || 0) >= 1500 ? 0 : 100)
                    ).toFixed(2)}
                  </span>
                </div>
                <div className="text-right text-sm text-gray-500 mt-1">
                  Vergi ₺{" "}
                  {(
                    (parseFloat(discountedTotal || cartTotal || 0) +
                      ((discountedTotal || cartTotal || 0) >= 1500 ? 0 : 100)) *
                    0.01
                  ).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - All screens */}
      <div className="bg-white border-t border-gray-200 px-4 py-3 mt-8 lg:w-3/5">
        <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
          <span>Para İade Politikası</span>
          <span>•</span>
          <span>Gizlilik Politikası</span>
          <span>•</span>
          <span>Hizmet Şartları</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
