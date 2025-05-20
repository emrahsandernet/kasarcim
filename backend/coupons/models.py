from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

class Coupon(models.Model):
    code = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True, null=True)
    discount_type = models.CharField(max_length=10, choices=[
        ('percentage', 'Yüzde'),
        ('fixed', 'Sabit Miktar')
    ], default='percentage')
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    min_purchase_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    valid_from = models.DateTimeField()
    valid_to = models.DateTimeField()
    active = models.BooleanField(default=True)
    max_usage = models.PositiveIntegerField(default=1)
    usage_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = 'Kuponlar'
        
    def __str__(self):
        return self.code
        
    @property
    def is_valid(self):
        from django.utils import timezone
        now = timezone.now()
        return self.active and self.valid_from <= now <= self.valid_to and self.usage_count < self.max_usage
