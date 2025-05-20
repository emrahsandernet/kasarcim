from rest_framework import serializers
from .models import Coupon

class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = ['id', 'code', 'description', 'discount_type', 'discount_value', 
                  'min_purchase_amount', 'valid_from', 'valid_to', 'active', 
                  'max_usage', 'usage_count', 'is_valid']
        read_only_fields = ['usage_count', 'is_valid']

class CouponApplySerializer(serializers.Serializer):
    code = serializers.CharField(max_length=50)
    
    def validate_code(self, value):
        try:
            coupon = Coupon.objects.get(code=value)
            if not coupon.is_valid:
                raise serializers.ValidationError("Kupon geçerli değil.")
            return value
        except Coupon.DoesNotExist:
            raise serializers.ValidationError("Geçersiz kupon kodu.") 