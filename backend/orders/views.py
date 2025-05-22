from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from django.shortcuts import get_object_or_404
from .models import Order, OrderItem, Shipment
from products.models import Product
from coupons.models import Coupon
from users.models import Address
from .serializers import OrderSerializer, OrderItemSerializer, OrderItemCreateSerializer, ShipmentSerializer
from django.utils import timezone


class IsAuthenticatedOrCreateOnly(permissions.BasePermission):
    """
    Kullanıcı giriş yapmışsa tam erişim sağlar.
    Giriş yapmamış kullanıcılar sadece sipariş oluşturabilir.
    """
    def has_permission(self, request, view):
        # POST isteği için herhangi bir kullanıcıya izin ver
        if request.method == 'POST' and view.action == 'create':
            return True
        # Diğer tüm işlemler için kimlik doğrulama gerektirir
        return request.user and request.user.is_authenticated

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticatedOrCreateOnly]
    # Sipariş API'si için istek sınırlandırması

    throttle_scope = 'order_api'
    
    def get_queryset(self):
        user = self.request.user
        
        return Order.objects.filter(user=user)
    
    def list(self, request):
        # Kullanıcı bazlı filtreleme
        queryset = self.get_queryset()
        
        # Prefetch related items and coupon for better performance
        queryset = queryset.prefetch_related('items', 'items__product').select_related('coupon')
        
        # Serileştir ve siparişlerin detaylarını içerecek şekilde ayarla
        serializer = OrderSerializer(queryset, many=True, context={'request': request})
        
        # Detaylı yanıt
        return Response({
            'count': queryset.count(),
            'results': serializer.data
        })
    
    def retrieve(self, request, pk=None):
        # Özel sipariş detayı görüntüleme
        try:
            order = self.get_queryset().prefetch_related('items', 'items__product').select_related('coupon', 'shipment').get(pk=pk)
        except Order.DoesNotExist:
            return Response({'error': 'Sipariş bulunamadı.'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = OrderSerializer(order, context={'request': request})
        return Response(serializer.data)
    
    def create(self, request, *args, **kwargs):
        data = request.data
        items_data = data.get('items', [])
        coupon_code = data.get('coupon_code')
        notes = data.get('notes', '')
        payment_method = data.get('payment_method', 'online')
        if payment_method not in ['online', 'cash_on_delivery']:
            payment_method = 'online'

        user = request.user if request.user.is_authenticated else None
        from decimal import Decimal

        # Ürünleri getir ve toplam tutarı hesapla
        total_price = Decimal('0')
        products = {}
        for item in items_data:
            product_id = item.get('product_id')
            quantity = item.get('quantity', 1)
            try:
                product = Product.objects.get(id=product_id)
                products[product_id] = product
                total_price += product.price * Decimal(quantity)
            except Product.DoesNotExist:
                return Response({'error': f'Ürün bulunamadı: {product_id}'}, status=status.HTTP_400_BAD_REQUEST)

        # İndirim hesapla
        discount = Decimal('0')
        applied_coupon = None
        if coupon_code:
            try:
                coupon = Coupon.objects.get(code=coupon_code)
                if coupon.is_valid and total_price >= coupon.min_purchase_amount:
                    if coupon.discount_type == 'percentage':
                        discount = total_price * (Decimal(str(coupon.discount_value)) / Decimal('100'))
                    else:
                        discount = min(Decimal(str(coupon.discount_value)), total_price)
                    applied_coupon = coupon
            except Coupon.DoesNotExist:
                pass  # Geçersiz kupon varsa yoksay

        final_price = total_price - discount

        # Kayıtlı kullanıcı
        if user:
            address_id = data.get('address_id')
            try:
                address = Address.objects.get(id=address_id, user=user)
            except Address.DoesNotExist:
                return Response({'error': 'Geçersiz adres.'}, status=status.HTTP_400_BAD_REQUEST)

            order_data = {
                'user': user,
                'first_name': address.first_name,
                'last_name': address.last_name,
                'email': user.email,
                'address': address.address,
                'city': address.city,
                'postal_code': address.postal_code or '',
                'country': address.country,
                'phone_number': address.phone_number,
                'payment_method': payment_method,
                'total_price': total_price,
                'discount': discount,
                'final_price': final_price,
                'notes': notes,
                'is_guest_order': False,
            }

        else:
            # Misafir kullanıcı
            guest_info = data.get('guest_info', {})
            if not guest_info:
                return Response({'error': 'Misafir kullanıcı bilgileri eksik.'}, status=status.HTTP_400_BAD_REQUEST)

            full_name = guest_info.get('full_name', '')
            name_parts = full_name.split(' ', 1)
            first_name = name_parts[0]
            last_name = name_parts[1] if len(name_parts) > 1 else ''

            required_fields = ['full_name', 'email', 'phone', 'address', 'city', 'district']
            missing_fields = [field for field in required_fields if not guest_info.get(field)]
            if missing_fields:
                return Response({
                    'error': 'Eksik bilgiler mevcut.',
                    'missing_fields': missing_fields
                }, status=status.HTTP_400_BAD_REQUEST)

            order_data = {
                'user': None,
                'first_name': first_name,
                'last_name': last_name,
                'email': guest_info.get('email', ''),
                'address': guest_info.get('address', ''),
                'city': guest_info.get('city', ''),
                'postal_code': guest_info.get('postal_code', ''),
                'country': 'Türkiye',
                'phone_number': guest_info.get('phone', ''),
                'payment_method': payment_method,
                'total_price': total_price,
                'discount': discount,
                'final_price': final_price,
                'notes': notes,
                'is_guest_order': True,
                'guest_email': guest_info.get('email', ''),
            }

        # Sipariş ve sipariş ürünlerini oluştur
        try:
            with transaction.atomic():
                order = Order.objects.create(**order_data)
                for item in items_data:
                    product_id = item.get('product_id')
                    quantity = item.get('quantity', 1)
                    product = products.get(product_id)
                    if not product:
                        raise ValueError("Ürün daha önce alınamamış.")

                    OrderItem.objects.create(
                        order=order,
                        product=product,
                        price=product.price,
                        quantity=quantity
                    )

                # Kuponu uygula
                if applied_coupon:
                    order.coupon = applied_coupon
                    applied_coupon.usage_count += 1
                    applied_coupon.save()
                    order.save()

                serializer = OrderSerializer(order)
                return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'error': f'Sipariş oluşturulurken bir hata oluştu: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    @action(detail=True, methods=['post'])
    def add_item(self, request, pk=None):
        order = self.get_object()
        
        # Sipariş tamamlandıysa yeni ürün eklenemez
        if order.status != 'created':
            return Response({'error': 'Bu siparişe artık ürün eklenemez.'}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = OrderItemCreateSerializer(data=request.data)
        if serializer.is_valid():
            product = serializer.validated_data['product']
            quantity = serializer.validated_data['quantity']
            
            if not product.is_in_stock or product.stock < quantity:
                return Response({'error': 'Yeterli stok yok.'}, status=status.HTTP_400_BAD_REQUEST)
            
            with transaction.atomic():
                # Ürün stoğunu güncelle
                product.stock -= quantity
                product.save()
                
                # Sipariş öğesini oluştur
                order_item = OrderItem.objects.create(
                    order=order,
                    product=product,
                    price=product.price,
                    quantity=quantity
                )
                
                from decimal import Decimal
                # Sipariş toplam tutarını güncelle
                order.total_price += (product.price * Decimal(quantity))
                
                # Kupon varsa indirim hesapla
                if order.coupon:
                    if order.coupon.discount_type == 'percentage':
                        order.discount = order.total_price * (Decimal(str(order.coupon.discount_value)) / Decimal('100'))
                    else:
                        order.discount = Decimal(str(order.coupon.discount_value))
                
                order.final_price = order.total_price - order.discount
                order.save()
                
            item_serializer = OrderItemSerializer(order_item)
            return Response(item_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def apply_coupon(self, request, pk=None):
        order = self.get_object()
        
        if order.status != 'created':
            return Response({'error': 'Bu siparişe artık kupon uygulanamaz.'}, status=status.HTTP_400_BAD_REQUEST)
        
        coupon_code = request.data.get('code')
        if not coupon_code:
            return Response({'error': 'Kupon kodu gereklidir.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            coupon = Coupon.objects.get(code=coupon_code)
            
            if not coupon.is_valid:
                return Response({'error': 'Kupon geçerli değil.'}, status=status.HTTP_400_BAD_REQUEST)
                
            if order.total_price < coupon.min_purchase_amount:
                return Response({'error': f'Bu kuponu kullanmak için minimum {coupon.min_purchase_amount} TL tutarında alışveriş yapmalısınız.'}, 
                                status=status.HTTP_400_BAD_REQUEST)
            
            order.coupon = coupon
            
            from decimal import Decimal
            # İndirim tutarını hesapla
            if coupon.discount_type == 'percentage':
                order.discount = order.total_price * (Decimal(str(coupon.discount_value)) / Decimal('100'))
            else:
                order.discount = min(Decimal(str(coupon.discount_value)), order.total_price)
            
            order.final_price = order.total_price - order.discount
            order.save()
            
            # Kupon kullanım sayısını artır
            coupon.usage_count += 1
            coupon.save()
            
            return Response(OrderSerializer(order).data)
        except Coupon.DoesNotExist:
            return Response({'error': 'Geçersiz kupon kodu.'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post'])
    def mark_as_paid(self, request, pk=None):
        """Siparişi ödenmiş olarak işaretler"""
        order = self.get_object()
        
        # Siparişi yalnızca admin işaretleyebilir
        if not request.user.is_staff:
            return Response({
                'error': 'Bu işlemi gerçekleştirmeye yetkiniz yok.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Sipariş zaten ödenmiş, kargoya verilmiş veya teslim edilmişse
        if order.status in ['paid', 'shipped', 'delivered']:
            return Response({
                'error': f'Bu sipariş zaten {order.get_status_display()} durumunda.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Sipariş iptal edilmişse ödenemez
        if order.status == 'cancelled':
            return Response({
                'error': 'İptal edilmiş sipariş ödenemez.'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            with transaction.atomic():
                # Siparişi ödendi olarak işaretle
                order.status = 'paid'
                order.paid_at = timezone.now()
                order.save()
                
            return Response({
                'success': 'Ödeme başarıyla onaylandı.',
                'order': OrderSerializer(order).data
            })
            
        except Exception as e:
            return Response({
                'error': f'Ödeme onaylanırken bir hata oluştu: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def cancel_order(self, request, pk=None):
        """Siparişi iptal eder (kargoya verilmemiş ise)"""
        order = self.get_object()
        
        # Siparişi yalnızca sahibi veya admin iptal edebilir
        if order.user != request.user and not request.user.is_staff:
            return Response({
                'error': 'Bu siparişi iptal etmeye yetkiniz yok.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Sipariş kargoya verildiyse veya teslim edildiyse iptal edilemez
        if order.status in ['shipped', 'delivered']:
            return Response({
                'error': 'Bu sipariş kargoya verildiği veya teslim edildiği için iptal edilemez.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Sipariş zaten iptal edildiyse hata verir
        if order.status == 'cancelled':
            return Response({
                'error': 'Bu sipariş zaten iptal edilmiş.'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            with transaction.atomic():
                # Siparişi iptal et
                order.status = 'cancelled'
                order.save()
                
                # Stokları geri iade et
                order_items = order.items.all()
                for item in order_items:
                    product = item.product
                    product.stock += item.quantity
                    product.save()
                
                # Eğer sipariş ödeme bilgisi varsa, ödeme durumunu güncelle
                try:
                    payment = order.payment
                    if payment:
                        payment.status = 'refunded'
                        payment.save()
                except Exception:
                    pass
                
            return Response({
                'success': 'Siparişiniz başarıyla iptal edildi.',
                'order': OrderSerializer(order).data
            })
            
        except Exception as e:
            return Response({
                'error': f'Sipariş iptal edilirken bir hata oluştu: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ShipmentViewSet(viewsets.ModelViewSet):
    serializer_class = ShipmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Shipment.objects.all()
        return Shipment.objects.filter(order__user=user)
    
    def create(self, request, *args, **kwargs):
        """Kargo oluştur (yalnızca admin)"""
        if not request.user.is_staff:
            return Response({'error': 'Bu işlem için yetkiniz yok.'}, status=status.HTTP_403_FORBIDDEN)
        
        data = request.data
        order_id = data.get('order_id')
        
        try:
            order = Order.objects.get(id=order_id)
        except Order.DoesNotExist:
            return Response({'error': 'Sipariş bulunamadı.'}, status=status.HTTP_404_NOT_FOUND)
        
        # Order status kontrolü
        if order.status not in ['paid', 'created']:
            return Response({'error': f'Sipariş uygun durumda değil. Mevcut durum: {order.get_status_display()}'}, 
                            status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Mevcut kargo var mı diye kontrol et
            if hasattr(order, 'shipment'):
                return Response({'error': 'Bu sipariş için zaten bir kargo oluşturulmuş.'}, 
                                status=status.HTTP_400_BAD_REQUEST)
            
            # Kargo verileri oluştur
            shipment_data = {
                'order': order,
                'status': data.get('status', 'preparing'),
                'shipping_company': data.get('shipping_company', 'aras'),
                'tracking_number': data.get('tracking_number'),
                'tracking_url': data.get('tracking_url'),
                'estimated_delivery': data.get('estimated_delivery'),
                'notes': data.get('notes', '')
            }
            
            with transaction.atomic():
                shipment = Shipment.objects.create(**shipment_data)
                
                return Response(ShipmentSerializer(shipment).data, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            return Response({'error': f'Kargo oluşturulurken bir hata oluştu: {str(e)}'}, 
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def update(self, request, *args, **kwargs):
        """Kargo bilgilerini güncelle (yalnızca admin)"""
        if not request.user.is_staff:
            return Response({'error': 'Bu işlem için yetkiniz yok.'}, status=status.HTTP_403_FORBIDDEN)
        
        shipment = self.get_object()
        
        serializer = self.get_serializer(shipment, data=request.data, partial=True)
        if serializer.is_valid():
            with transaction.atomic():
                serializer.save()
            
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def mark_as_shipped(self, request, pk=None):
        """Kargoyu gönderildi olarak işaretle"""
        if not request.user.is_staff:
            return Response({'error': 'Bu işlem için yetkiniz yok.'}, status=status.HTTP_403_FORBIDDEN)
        
        shipment = self.get_object()
        
        if shipment.status == 'shipped':
            return Response({'error': 'Kargo zaten gönderildi olarak işaretlenmiş.'}, 
                            status=status.HTTP_400_BAD_REQUEST)
        
        # Diğer bilgileri güncelle
        tracking_number = request.data.get('tracking_number')
        shipping_company = request.data.get('shipping_company')
        estimated_delivery = request.data.get('estimated_delivery')
        
        with transaction.atomic():
            # Alanları güncelle
            shipment.status = 'shipped'
            
            if tracking_number:
                shipment.tracking_number = tracking_number
            
            if shipping_company:
                shipment.shipping_company = shipping_company
            
            if estimated_delivery:
                shipment.estimated_delivery = estimated_delivery
                
            shipment.save()
        
        return Response(ShipmentSerializer(shipment).data)
    
    @action(detail=True, methods=['post'])
    def mark_as_delivered(self, request, pk=None):
        """Kargoyu teslim edildi olarak işaretle"""
        if not request.user.is_staff:
            return Response({'error': 'Bu işlem için yetkiniz yok.'}, status=status.HTTP_403_FORBIDDEN)
        
        shipment = self.get_object()
        
        if shipment.status == 'delivered':
            return Response({'error': 'Kargo zaten teslim edildi olarak işaretlenmiş.'}, 
                            status=status.HTTP_400_BAD_REQUEST)
        
        with transaction.atomic():
            shipment.status = 'delivered'
            shipment.delivered_at = timezone.now()
            shipment.save()
        
        return Response(ShipmentSerializer(shipment).data)
