from django.contrib import admin
from .models import Announcement

@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ('message', 'link', 'is_active', 'order', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('message', 'link')
    ordering = ('order', '-created_at') 