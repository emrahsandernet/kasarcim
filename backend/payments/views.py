from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from .models import Payment
from orders.models import Order
from .serializers import PaymentSerializer, PaymentCreateSerializer

# Create your views here.

class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    # Ödeme API'si için istek sınırlandırması
  
    
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Payment.objects.all()
        return Payment.objects.filter(order__user=user)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return PaymentCreateSerializer
        return PaymentSerializer
    
    def create(self, request, *args, **kwargs):
        user = request.user
        data = request.data
        order_id = data.get('order_id')
        payment_method = data.get('payment_method')
        amount = data.get('amount')
        notes = data.get('notes', '')
        
        try:
            # Siparişi bul
            order = Order.objects.get(id=order_id)
            
            # Kullanıcı sadece kendi siparişleri için ödeme yapabilir
            if order.user != user and not user.is_staff:
                return Response({'error': 'Bu sipariş için ödeme yapamazsınız.'}, status=status.HTTP_403_FORBIDDEN)
            
            # Ödeme durumunu kontrol et
            if order.status != 'created':
                return Response({'error': 'Bu sipariş için zaten ödeme işlemi başlatılmış.'}, status=status.HTTP_400_BAD_REQUEST)
            
            from decimal import Decimal
            # Kapıda ödeme için ekstra ücret
            if payment_method == 'cash_on_delivery':
                cod_fee = Decimal('15.00')  # Kapıda ödeme ücreti
                final_amount = order.final_price + cod_fee
            else:
                final_amount = order.final_price
            
            with transaction.atomic():
                # Ödeme kaydı oluştur
                payment = Payment.objects.create(
                    order=order,
                    amount=final_amount,
                    payment_method=payment_method,
                    notes=notes
                )
                
                # Banka havalesi ve kapıda ödeme durumları
                if payment_method in ['bank_transfer', 'cash_on_delivery']:
                    payment.status = 'pending'
                else:
                    # Kredi kartı ödemesi gibi anında işleme alınan ödemeler (gerçek entegrasyon durumunda)
                    payment.status = 'completed'
                
                payment.transaction_id = f"TRX-{payment.id}"
                payment.save()
                
                # Sipariş durumunu güncelle
                if payment_method == 'cash_on_delivery':
                    order.status = 'paid'  # Kapıda ödeme için de direkt ödendi olarak işaretle
                    payment.status = 'completed'  # Ödeme tamamlandı olarak işaretle
                elif payment_method == 'bank_transfer':
                    order.status = 'created'  # Banka havalesi için oluşturuldu olarak kal
                else:
                    order.status = 'paid'  # Kredi kartı gibi anında ödeme için doğrudan ödendi olarak işaretle
                
                payment.save()
                order.save()
                
            return Response(PaymentSerializer(payment).data, status=status.HTTP_201_CREATED)
        
        except Order.DoesNotExist:
            return Response({'error': 'Sipariş bulunamadı.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': f'Ödeme işlemi sırasında bir hata oluştu: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def process_payment(self, request, pk=None):
        payment = self.get_object()
        
        # Ödeme işlemi zaten tamamlanmış mı kontrol et
        if payment.status in ['completed', 'refunded']:
            return Response({'error': 'Bu ödeme zaten işlenmiş.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Burada gerçek ödeme işlemi simülasyonu yapılabilir
        payment.status = request.data.get('status', 'completed')
        payment.transaction_id = request.data.get('transaction_id', f"TRX-{payment.id}")
        payment.save()
        
        # Ödeme başarılı ise siparişi güncelle
        if payment.status == 'completed':
            payment.order.status = 'paid'
            payment.order.save()
        
        return Response(PaymentSerializer(payment).data)
