from django.contrib import admin
from .models import Order, OrderItem, Shipment

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    raw_id_fields = ['product']
    extra = 0

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'first_name', 'last_name', 'email', 'status', 'total_price', 'discount', 'final_price','cod_fee','shipping_cost', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['user__username', 'first_name', 'last_name', 'email']
    raw_id_fields = ['user', 'coupon']
    inlines = [OrderItemInline]
    fieldsets = (
        ('Müşteri Bilgileri', {
            'fields': ('user', 'first_name', 'last_name', 'email', 'phone_number')
        }),
        ('Adres Bilgileri', {
            'fields': ('address', 'city', 'postal_code', 'country')
        }),
        ('Sipariş Bilgileri', {
            'fields': ('status', 'coupon', 'total_price', 'discount', 'final_price', 'cod_fee','shipping_cost')
        }),
    )

@admin.register(Shipment)
class ShipmentAdmin(admin.ModelAdmin):
    list_display = ['id', 'order', 'status', 'shipping_company', 'tracking_number', 'shipped_at', 'estimated_delivery', 'delivered_at']
    list_filter = ['status', 'shipping_company', 'shipped_at', 'delivered_at']
    search_fields = ['order__id', 'tracking_number']
    raw_id_fields = ['order']
    fieldsets = (
        ('Kargo Bilgileri', {
            'fields': ('order', 'status', 'shipping_company', 'tracking_number', 'tracking_url')
        }),
        ('Tarih Bilgileri', {
            'fields': ('shipped_at', 'estimated_delivery', 'delivered_at')
        }),
        ('Notlar', {
            'fields': ('notes',)
        }),
    )
