from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
import uuid
from datetime import datetime, timedelta

# CustomUser ve CustomUserManager sınıfları kaldırıldı

# UserProfile modeli
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    postal_code = models.CharField(max_length=10, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} Profili"

class PasswordResetToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='password_reset_tokens')
    token = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Password Reset Token for {self.user.email}"
    
    def save(self, *args, **kwargs):
        if not self.token:
            self.token = str(uuid.uuid4())
        
        if not self.expires_at:
            # Token 24 saat geçerli olsun
            self.expires_at = datetime.now() + timedelta(hours=24)
            
        return super().save(*args, **kwargs)
    
    @property
    def is_valid(self):
        return not self.is_used and self.expires_at > datetime.now()

class Address(models.Model):
    ADDRESS_TYPE = (
        ('billing', 'Fatura Adresi'),
        ('shipping', 'Teslimat Adresi'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    title = models.CharField(max_length=100)
    address_type = models.CharField(max_length=10, choices=ADDRESS_TYPE, default='shipping')
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=15)
    address = models.TextField()
    city = models.CharField(max_length=100)
    district = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=10, blank=True, null=True)
    country = models.CharField(max_length=100, default='Türkiye')
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = 'Adresler'
        ordering = ['-is_default', '-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.title}"
    
    def save(self, *args, **kwargs):
        # Eğer bu adres varsayılan olarak işaretlendiyse, kullanıcının aynı tipteki diğer varsayılan adreslerini güncelleyin
        if self.is_default:
            Address.objects.filter(user=self.user, address_type=self.address_type, is_default=True).update(is_default=False)
        super().save(*args, **kwargs)

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()

class ContactMessage(models.Model):
    name = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=30, blank=True)
    subject = models.CharField(max_length=100)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        verbose_name = 'İletişim Mesajı'
        verbose_name_plural = 'İletişim Mesajları'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.subject}"
