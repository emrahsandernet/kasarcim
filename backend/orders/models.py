from django.db import models
from django.contrib.auth.models import User
from products.models import Product
from coupons.models import Coupon
from django.utils import timezone

class Order(models.Model):
    ORDER_STATUS = (
        ('created', 'Oluşturuldu'),
        ('paid', 'Ödendi'),
        ('shipped', 'Kargoya Verildi'),
        ('delivered', 'Teslim Edildi'),
        ('cancelled', 'İptal Edildi'),
    )
    
    PAYMENT_METHODS = (
        ('online', 'Online Ödeme'),
        ('cash_on_delivery', 'Kapıda Ödeme'),
    )
    
    user = models.ForeignKey(User, related_name='orders', on_delete=models.CASCADE)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    address = models.TextField()
    city = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=15)
    status = models.CharField(max_length=10, choices=ORDER_STATUS, default='created')
    coupon = models.ForeignKey(Coupon, on_delete=models.SET_NULL, blank=True, null=True, related_name='orders')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS, default='online')
    cod_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)  # Kapıda ödeme ücreti
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    shipping_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    final_price = models.DecimalField(max_digits=10, decimal_places=2)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = 'Siparişler'
        ordering = ('-created_at',)
        
    def __str__(self):
        return f"Sipariş {self.id} - {self.user.username}"
        
    @property
    def shipping_address(self):
        """Tam teslimat adresi bilgisini döndürür"""
        return f"{self.address}, {self.city} {self.postal_code}, {self.country}"
    
    @property
    def get_subtotal_price(self):
        """Ara toplam fiyatı hesaplar (ürünlerin toplam fiyatı, indirim hariç, kargo ücreti hariç)"""
        return self.total_price
    
    @property
    def get_total_price(self):
        """Toplam fiyatı hesaplar (indirim, kargo ücreti ve kapıda ödeme ücreti dahil)"""
        return self.final_price
    
    @property
    def get_discount(self):
        """İndirim miktarını döndürür"""
        return self.discount
    
    @property
    def is_paid(self):
        """Siparişin ödenip ödenmediğini kontrol eder"""
        return self.status == 'paid'
        
    def save(self, *args, **kwargs):
        from decimal import Decimal
        # Kargo ücreti kontrolü
        if self.total_price < Decimal('1500'):
            self.shipping_cost = Decimal('250.00')
        else:
            self.shipping_cost = Decimal('0.00')
        
        # Kapıda ödeme ücreti
        if self.payment_method == 'cash_on_delivery':
            self.cod_fee = Decimal('50.00')
        else:
            self.cod_fee = Decimal('0.00')
            
        # Her zaman final_price hesapla (kargo ve kapıda ödeme ücreti dahil)
        self.final_price = self.total_price - self.discount + self.shipping_cost + self.cod_fee
        super().save(*args, **kwargs)
        
class Shipment(models.Model):
    """Sipariş kargo takibi için model"""
    
    SHIPMENT_STATUS = (
        ('preparing', 'Hazırlanıyor'),
        ('shipped', 'Kargoya Verildi'),
        ('in_transit', 'Yolda'),
        ('out_for_delivery', 'Dağıtıma Çıktı'),
        ('delivered', 'Teslim Edildi'),
        ('failed', 'Teslim Başarısız'),
        ('returned', 'İade Edildi'),
    )
    
    SHIPPING_COMPANIES = (
        ('aras', 'Aras Kargo'),
        ('yurtici', 'Yurtiçi Kargo'),
        ('mng', 'MNG Kargo'),
        ('ptt', 'PTT Kargo'),
        ('ups', 'UPS'),
        ('surat', 'Sürat Kargo'),
        ('other', 'Diğer'),
    )
    
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='shipment')
    status = models.CharField(max_length=20, choices=SHIPMENT_STATUS, default='preparing')
    shipping_company = models.CharField(max_length=20, choices=SHIPPING_COMPANIES, default='aras')
    tracking_number = models.CharField(max_length=50, blank=True, null=True)
    tracking_url = models.URLField(blank=True, null=True)
    shipped_at = models.DateTimeField(blank=True, null=True)
    estimated_delivery = models.DateField(blank=True, null=True)
    delivered_at = models.DateTimeField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Kargo'
        verbose_name_plural = 'Kargolar'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Kargo #{self.id} - Sipariş #{self.order.id}"
    
    def save(self, *args, **kwargs):
        # Kargoya verildiğinde shipped_at alanını otomatik doldur
        if self.status == 'shipped' and not self.shipped_at:
            self.shipped_at = timezone.now()
            
            # Siparişin durumunu da güncelle
            if self.order.status != 'shipped':
                self.order.status = 'shipped'
                self.order.save(update_fields=['status'])
                
        # Teslim edildiğinde delivered_at alanını otomatik doldur
        if self.status == 'delivered' and not self.delivered_at:
            self.delivered_at = timezone.now()
            
            # Siparişin durumunu da güncelle
            if self.order.status != 'delivered':
                self.order.status = 'delivered'
                self.order.save(update_fields=['status'])
                
        super().save(*args, **kwargs)
    
    @property
    def is_delivered(self):
        """Kargonun teslim edilip edilmediğini kontrol eder"""
        return self.status == 'delivered'
    
    @property
    def is_in_transit(self):
        """Kargonun yolda olup olmadığını kontrol eder"""
        return self.status in ['shipped', 'in_transit', 'out_for_delivery']
        
    def get_tracking_url(self):
        """Takip URL'si yoksa kargo şirketine göre otomatik oluşturur"""
        if self.tracking_url:
            return self.tracking_url
            
        if not self.tracking_number:
            return None
            
        # Kargo şirketine göre takip URL'si oluştur
        if self.shipping_company == 'aras':
            return f"https://kargotakip.araskargo.com.tr/trace/{self.tracking_number}"
        elif self.shipping_company == 'yurtici':
            return f"https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code={self.tracking_number}"
        elif self.shipping_company == 'mng':
            return f"https://service.mngkargo.com.tr/track/{self.tracking_number}"
        elif self.shipping_company == 'ptt':
            return f"https://gonderitakip.ptt.gov.tr/Track/Verify?q={self.tracking_number}"
        elif self.shipping_company == 'ups':
            return f"https://www.ups.com/track?tracknum={self.tracking_number}"
        elif self.shipping_company == 'surat':
            return f"https://suratkargo.com.tr/track/{self.tracking_number}"
        
        return None
        
class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, related_name='order_items', on_delete=models.CASCADE)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)
    
    class Meta:
        verbose_name_plural = 'Sipariş Öğeleri'
        
    def __str__(self):
        return f"{self.quantity}x {self.product.name} - Sipariş {self.order.id}"
        
    @property
    def total_price(self):
        return self.price * self.quantity


