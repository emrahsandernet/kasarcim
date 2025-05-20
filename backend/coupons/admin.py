from django.contrib import admin
from .models import Coupon

@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ['code', 'discount_type', 'discount_value', 'valid_from', 'valid_to', 'active', 'usage_count', 'max_usage', 'is_valid']
    list_filter = ['active', 'discount_type', 'valid_from', 'valid_to']
    search_fields = ['code', 'description']
    list_editable = ['active']
    readonly_fields = ['usage_count', 'is_valid']
    fieldsets = (
        ('Kupon Bilgileri', {
            'fields': ('code', 'description', 'discount_type', 'discount_value', 'min_purchase_amount')
        }),
        ('Geçerlilik', {
            'fields': ('valid_from', 'valid_to', 'active', 'max_usage', 'usage_count')
        }),
    )
