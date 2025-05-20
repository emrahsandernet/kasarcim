from rest_framework import serializers
from .models import Order, OrderItem, Shipment
from products.serializers import ProductSerializer, ProductDetailSerializer
from coupons.serializers import CouponSerializer
from payments.models import Payment

class OrderItemSerializer(serializers.ModelSerializer):
    product_detail = ProductDetailSerializer(source='product', read_only=True)
    total = serializers.ReadOnlyField(source='total_price')
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_detail', 'price', 'quantity', 'total']
        read_only_fields = ['price']
        
    def create(self, validated_data):
        product = validated_data.get('product')
        validated_data['price'] = product.price
        return super().create(validated_data)

class ShipmentSerializer(serializers.ModelSerializer):
    formatted_status = serializers.SerializerMethodField()
    formatted_shipping_company = serializers.SerializerMethodField()
    formatted_shipped_at = serializers.SerializerMethodField()
    formatted_delivered_at = serializers.SerializerMethodField()
    formatted_estimated_delivery = serializers.SerializerMethodField()
    tracking_url = serializers.SerializerMethodField()
    status_description = serializers.SerializerMethodField()
    
    class Meta:
        model = Shipment
        fields = [
            'id', 'order', 'status', 'formatted_status', 'status_description', 'shipping_company', 
            'formatted_shipping_company', 'tracking_number', 'tracking_url',
            'shipped_at', 'formatted_shipped_at', 'estimated_delivery', 
            'formatted_estimated_delivery', 'delivered_at', 
            'formatted_delivered_at', 'notes'
        ]
        read_only_fields = ['order', 'shipped_at', 'delivered_at']
        
    def get_formatted_status(self, obj):
        status_mapping = dict(Shipment.SHIPMENT_STATUS)
        return status_mapping.get(obj.status, obj.status)
    
    def get_status_description(self, obj):
        """Kargo durumu için kullanıcı dostu açıklama döndürür"""
        status_descriptions = {
            'preparing': 'Siparişiniz hazırlanıyor. Yakında kargoya verilecek.',
            'shipped': 'Siparişiniz kargoya verildi. Takip numarası ile paketinizi izleyebilirsiniz.',
            'in_transit': 'Siparişiniz taşınma aşamasında. Kargo firması paketinizi teslim adresine götürüyor.',
            'out_for_delivery': 'Siparişiniz bugün teslim edilmek üzere dağıtıma çıktı.',
            'delivered': 'Siparişiniz teslim edildi. Ürünlerimizi beğendiğinizi umuyoruz!',
            'failed': 'Teslimat başarısız oldu. Lütfen adres bilgilerinizi kontrol edin veya müşteri hizmetleriyle iletişime geçin.',
            'returned': 'Siparişiniz iade edildi. Ayrıntılar için müşteri hizmetleriyle iletişime geçebilirsiniz.'
        }
        return status_descriptions.get(obj.status, 'Sipariş durumu hakkında bilgi alınamadı.')
        
    def get_formatted_shipping_company(self, obj):
        company_mapping = dict(Shipment.SHIPPING_COMPANIES)
        return company_mapping.get(obj.shipping_company, obj.shipping_company)
        
    def get_formatted_shipped_at(self, obj):
        if obj.shipped_at:
            return obj.shipped_at.strftime('%d.%m.%Y %H:%M')
        return None
        
    def get_formatted_delivered_at(self, obj):
        if obj.delivered_at:
            return obj.delivered_at.strftime('%d.%m.%Y %H:%M')
        return None
        
    def get_formatted_estimated_delivery(self, obj):
        if obj.estimated_delivery:
            return obj.estimated_delivery.strftime('%d.%m.%Y')
        return None
        
    def get_tracking_url(self, obj):
        # Tracking URL'yi al veya oluştur
        if obj.tracking_url:
            return obj.tracking_url
        return obj.get_tracking_url()

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    coupon_detail = CouponSerializer(source='coupon', read_only=True)
    user_username = serializers.ReadOnlyField(source='user.username')
    formatted_created_at = serializers.SerializerMethodField()
    formatted_status = serializers.SerializerMethodField()
    formatted_payment_method = serializers.SerializerMethodField()
    payment_info = serializers.SerializerMethodField()
    shipment_info = serializers.SerializerMethodField()
    shipment_tracking_info = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = ['id', 'user', 'user_username', 'first_name', 'last_name', 'email', 
                  'address', 'city', 'postal_code', 'country', 'phone_number', 
                  'status', 'formatted_status', 'payment_method', 'formatted_payment_method', 
                  'coupon', 'coupon_detail', 'total_price', 'discount', 
                  'shipping_cost', 'cod_fee', 'final_price', 'items', 'created_at', 
                  'formatted_created_at', 'notes', 'payment_info', 'shipment_info',
                  'shipment_tracking_info']
        read_only_fields = ['user', 'discount', 'shipping_cost', 'cod_fee', 'final_price']
        
    def get_formatted_payment_method(self, obj):
        payment_mapping = dict(Order.PAYMENT_METHODS)
        return payment_mapping.get(obj.payment_method, obj.payment_method)
    
    def get_formatted_created_at(self, obj):
        return obj.created_at.strftime('%d.%m.%Y %H:%M')
    
    def get_formatted_status(self, obj):
        # Türkçe durum açıklamaları için
        status_mapping = dict(Order.ORDER_STATUS)
        return status_mapping.get(obj.status, obj.status)
    
    def get_payment_info(self, obj):
        """Sipariş için ödeme bilgisini döndürür."""
        try:
            payment = Payment.objects.filter(order=obj).first()
            if payment:
                return {
                    'id': payment.id,
                    'method': payment.payment_method,
                    'status': payment.status,
                    'amount': payment.amount,
                    'transaction_id': payment.transaction_id,
                    'date': payment.payment_date.strftime('%d.%m.%Y %H:%M') if payment.payment_date else None,
                }
            return None
        except Exception:
            return None
        
    def get_shipment_info(self, obj):
        """Sipariş için kargo bilgisini döndürür."""
        try:
            shipment = obj.shipment
            if shipment:
                return ShipmentSerializer(shipment).data
            return None
        except Shipment.DoesNotExist:
            return None
        except Exception:
            return None
    
    def get_shipment_tracking_info(self, obj):
        """Kargo takip bilgilerini basitleştirilmiş formatta döndürür."""
        try:
            shipment = obj.shipment
            if not shipment:
                return None
                
            # Kargo firması haritası
            company_mapping = dict(Shipment.SHIPPING_COMPANIES)
            
            # Kargo durum haritası
            status_descriptions = {
                'preparing': 'Siparişiniz hazırlanıyor. Yakında kargoya verilecek.',
                'shipped': 'Siparişiniz kargoya verildi. Takip numarası ile paketinizi izleyebilirsiniz.',
                'in_transit': 'Siparişiniz taşınma aşamasında. Kargo firması paketinizi teslim adresine götürüyor.',
                'out_for_delivery': 'Siparişiniz bugün teslim edilmek üzere dağıtıma çıktı.',
                'delivered': 'Siparişiniz teslim edildi. Ürünlerimizi beğendiğinizi umuyoruz!',
                'failed': 'Teslimat başarısız oldu. Lütfen adres bilgilerinizi kontrol edin veya müşteri hizmetleriyle iletişime geçin.',
                'returned': 'Siparişiniz iade edildi. Ayrıntılar için müşteri hizmetleriyle iletişime geçebilirsiniz.'
            }
            
            return {
                'shipping_company': company_mapping.get(shipment.shipping_company, shipment.shipping_company),
                'tracking_number': shipment.tracking_number or "Henüz atanmadı",
                'status': shipment.status,
                'status_text': dict(Shipment.SHIPMENT_STATUS).get(shipment.status, shipment.status),
                'status_description': status_descriptions.get(shipment.status, 'Sipariş durumu hakkında bilgi alınamadı.'),
                'tracking_url': shipment.tracking_url or shipment.get_tracking_url(),
                'shipped_date': shipment.shipped_at.strftime('%d.%m.%Y %H:%M') if shipment.shipped_at else None,
                'estimated_delivery': shipment.estimated_delivery.strftime('%d.%m.%Y') if shipment.estimated_delivery else None,
                'delivered_date': shipment.delivered_at.strftime('%d.%m.%Y %H:%M') if shipment.delivered_at else None,
            }
        except Exception as e:
            print(f"Kargo takip bilgisi alınırken hata: {str(e)}")
            return None
        
    def create(self, validated_data):
        from decimal import Decimal
        user = self.context['request'].user
        validated_data['user'] = user
        
        # Kargo ücretini hesapla
        total_price = validated_data.get('total_price', Decimal('0'))
        
        # 1500 TL'den az ise kargo ücreti 250 TL, değilse ücretsiz
        if total_price < Decimal('1500'):
            shipping_cost = Decimal('250.00')
        else:
            shipping_cost = Decimal('0.00')
            
        # Kapıda ödeme ücreti hesapla
        payment_method = validated_data.get('payment_method', 'online')
        if payment_method == 'cash_on_delivery':
            cod_fee = Decimal('50.00')
        else:
            cod_fee = Decimal('0.00')
            
        # Ücretleri ayarla
        validated_data['shipping_cost'] = shipping_cost
        validated_data['cod_fee'] = cod_fee
        
        # Final fiyatı hesapla (kargo ve kapıda ödeme dahil)
        validated_data['final_price'] = (
            total_price 
            - validated_data.get('discount', Decimal('0')) 
            + shipping_cost 
            + cod_fee
        )
            
        return super().create(validated_data)
        
    def update(self, instance, validated_data):
        from decimal import Decimal
        # Fiyat hesaplamaları
        total_price = validated_data.get('total_price', instance.total_price)
        
        # 1500 TL'den az ise kargo ücreti 250 TL, değilse ücretsiz
        if total_price < Decimal('1500'):
            shipping_cost = Decimal('250.00')
        else:
            shipping_cost = Decimal('0.00')
            
        # Kapıda ödeme ücreti hesapla
        payment_method = validated_data.get('payment_method', instance.payment_method)
        if payment_method == 'cash_on_delivery':
            cod_fee = Decimal('50.00')
        else:
            cod_fee = Decimal('0.00')
            
        instance.shipping_cost = shipping_cost
        instance.cod_fee = cod_fee
        
        # Discount varsa onu kullan, yoksa mevcut değeri koru
        discount = validated_data.get('discount', instance.discount)
        
        # Final fiyatı hesapla (kargo ve kapıda ödeme dahil)
        instance.final_price = total_price - discount + shipping_cost + cod_fee
        
        return super().update(instance, validated_data)

class OrderItemCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['product', 'quantity'] 