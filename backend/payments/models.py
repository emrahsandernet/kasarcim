from django.db import models
from orders.models import Order

class Payment(models.Model):
    PAYMENT_STATUS = (
        ('pending', 'Beklemede'),
        ('processing', 'İşleniyor'),
        ('completed', 'Tamamlandı'),
        ('failed', 'Başarısız'),
        ('refunded', 'İade Edildi'),
    )
    
    PAYMENT_METHOD = (
        ('credit_card', 'Kredi Kartı'),
        ('bank_transfer', 'Banka Transferi'),
        ('paypal', 'PayPal'),
        ('cash_on_delivery', 'Kapıda Ödeme'),
    )
    
    order = models.OneToOneField(Order, related_name='payment', on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD)
    status = models.CharField(max_length=10, choices=PAYMENT_STATUS, default='pending')
    transaction_id = models.CharField(max_length=100, blank=True, null=True)
    payment_date = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True, null=True)
    
    class Meta:
        verbose_name_plural = 'Ödemeler'
        
    def __str__(self):
        return f"Ödeme {self.id} - Sipariş {self.order.id}"
