from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import UserProfile, Address, ContactMessage, PasswordResetToken

class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Kullanıcı Profili'

class UserAdmin(BaseUserAdmin):
    inlines = (UserProfileInline,)
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'is_active')

# Mevcut UserAdmin'i unregister edip kendi özelleştirilmiş admin'imizi register edin
admin.site.unregister(User)
admin.site.register(User, UserAdmin)

@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ['user', 'title', 'address_type', 'city', 'is_default', 'created_at']
    list_filter = ['address_type', 'city', 'is_default', 'created_at']
    search_fields = ['user__username', 'title', 'first_name', 'last_name', 'address', 'city']
    raw_id_fields = ['user']

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "subject", "created_at", "is_read")
    list_filter = ("is_read", "created_at")
    search_fields = ("name", "email", "subject", "message")
    readonly_fields = ("name", "email", "phone", "subject", "message", "created_at")
    ordering = ("-created_at",)

@admin.register(PasswordResetToken)
class PasswordResetTokenAdmin(admin.ModelAdmin):
    list_display = ("user", "token", "created_at", "expires_at", "is_used")
    list_filter = ("is_used", "created_at")
    search_fields = ("user__username", "token")
    readonly_fields = ("user", "token", "created_at", "expires_at", "is_used")
