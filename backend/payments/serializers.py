from rest_framework import serializers
from .models import Payment
from orders.serializers import OrderSerializer

class PaymentSerializer(serializers.ModelSerializer):
    order_detail = OrderSerializer(source='order', read_only=True)
    
    class Meta:
        model = Payment
        fields = ['id', 'order', 'order_detail', 'amount', 'payment_method', 
                  'status', 'transaction_id', 'payment_date', 'notes']
        read_only_fields = ['payment_date']
        
class PaymentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['order', 'amount', 'payment_method', 'notes']
        
    def validate(self, data):
        order = data.get('order')
        if not order:
            raise serializers.ValidationError("Sipariş bilgisi gereklidir.")
            
        if order.status != 'created':
            raise serializers.ValidationError("Bu sipariş için zaten ödeme işlemi başlatılmış.")
            
        if data.get('amount') != order.final_price:
            raise serializers.ValidationError("Ödeme tutarı sipariş tutarı ile eşleşmiyor.")
            
        return data 