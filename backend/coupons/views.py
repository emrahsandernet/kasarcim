from django.shortcuts import render
from django.utils import timezone
from rest_framework import viewsets, permissions, status, throttling
from rest_framework.decorators import action, api_view, permission_classes, authentication_classes
import rest_framework.throttling
from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication
from .models import Coupon
from .serializers import CouponSerializer, CouponApplySerializer
from decimal import Decimal

# Create your views here.

class CouponViewSet(viewsets.ModelViewSet):
    queryset = Coupon.objects.all()
    serializer_class = CouponSerializer
    permission_classes = [permissions.IsAdminUser]
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def apply(self, request):
        serializer = CouponApplySerializer(data=request.data)
        if serializer.is_valid():
            code = serializer.validated_data['code']
            cart_total = Decimal(request.data.get('cart_total', '0'))
            
            try:
                coupon = Coupon.objects.get(code=code)
                if coupon.is_valid:
                    # İndirim tutarını hesapla
                    discount_amount = Decimal('0.0')
                    if coupon.discount_type == 'percentage':
                        discount_amount = (cart_total * coupon.discount_value) / Decimal('100.0')
                    else:  # fixed
                        discount_amount = coupon.discount_value
                        
                    # İndirim tutarı sepet toplamından büyük olamaz
                    discount_amount = min(discount_amount, cart_total)
                    
                    return Response({
                        'code': coupon.code,
                        'discount_type': coupon.discount_type,
                        'discount_value': float(coupon.discount_value),
                        'discount_amount': float(discount_amount),
                        'message': f'Kupon başarıyla uygulandı! {discount_amount} TL indirim kazandınız.'
                    })
                else:
                    return Response({'error': 'Kupon geçerli değil.'}, status=status.HTTP_400_BAD_REQUEST)
            except Coupon.DoesNotExist:
                return Response({'error': 'Geçersiz kupon kodu.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])  # Sadece giriş yapmış kullanıcılar için
@authentication_classes([TokenAuthentication])  # Açıkça TokenAuthentication kullanıyoruz
def check_coupon(request):
    # Artık sadece giriş yapmış kullanıcılar kupon kodu doğrulayabilir
    
    # Hata ayıklama için
    print("Token:", request.auth)
    print("Kullanıcı:", request.user)
    print("Auth Header:", request.META.get('HTTP_AUTHORIZATION', 'Yok'))
    
    code = request.data.get('code')
    cart_total = Decimal(request.data.get('cart_total', '0'))
    
    if not code:
        return Response({'error': 'Kupon kodu gerekli.'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        coupon = Coupon.objects.get(code=code)
        now = timezone.now()
        
        # Kupon geçerlilik kontrolü
        if not coupon.active:
            return Response({'error': 'Bu kupon aktif değil.'}, status=status.HTTP_400_BAD_REQUEST)
        
        if now < coupon.valid_from:
            return Response({'error': 'Bu kupon henüz geçerli değil.'}, status=status.HTTP_400_BAD_REQUEST)
        
        if now > coupon.valid_to:
            return Response({'error': 'Bu kuponun süresi dolmuş.'}, status=status.HTTP_400_BAD_REQUEST)
        
        if coupon.usage_count >= coupon.max_usage:
            return Response({'error': 'Bu kupon maksimum kullanım sayısına ulaşmış.'}, status=status.HTTP_400_BAD_REQUEST)
        
        if cart_total < coupon.min_purchase_amount:
            min_amount = coupon.min_purchase_amount
            return Response(
                {'error': f'Bu kuponu kullanmak için minimum {min_amount} TL tutarında alışveriş yapmalısınız.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # İndirim tutarını hesapla
        discount_amount = Decimal('0.0')
        if coupon.discount_type == 'percentage':
            discount_amount = (cart_total * coupon.discount_value) / Decimal('100.0')
        else:  # fixed
            discount_amount = coupon.discount_value
            
        # İndirim tutarı sepet toplamından büyük olamaz
        discount_amount = min(discount_amount, cart_total)
        
        return Response({
            'code': coupon.code,
            'discount_type': coupon.discount_type,
            'discount_value': float(coupon.discount_value),
            'discount_amount': float(discount_amount),
            'message': f'Kupon başarıyla uygulandı! {discount_amount} TL indirim kazandınız.'
        })
        
    except Coupon.DoesNotExist:
        return Response({'error': 'Geçersiz kupon kodu.'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
