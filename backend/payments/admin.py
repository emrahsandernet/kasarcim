from django.contrib import admin
from .models import Payment

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['id', 'order', 'amount', 'payment_method', 'status', 'transaction_id', 'payment_date']
    list_filter = ['status', 'payment_method', 'payment_date']
    search_fields = ['order__id', 'transaction_id', 'order__user__username']
    raw_id_fields = ['order']
    readonly_fields = ['payment_date']
    fieldsets = (
        ('Ödeme Bilgileri', {
            'fields': ('order', 'amount', 'payment_method', 'status')
        }),
        ('İşlem Detayları', {
            'fields': ('transaction_id', 'payment_date', 'notes')
        }),
    )
