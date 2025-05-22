from django.db import models

class Announcement(models.Model):
    message = models.CharField(max_length=255, verbose_name="Duyuru Metni")
    link = models.CharField(max_length=255, blank=True, null=True, verbose_name="Bağlantı URL")
    link_text = models.CharField(max_length=50, blank=True, null=True, verbose_name="Bağlantı Metni")
    background_color = models.CharField(max_length=20, default="bg-orange-500", verbose_name="Arka Plan Rengi")
    text_color = models.CharField(max_length=20, default="text-white", verbose_name="Yazı Rengi")
    is_active = models.BooleanField(default=True, verbose_name="Aktif")
    order = models.PositiveIntegerField(default=0, verbose_name="Sıralama")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Oluşturulma Tarihi")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Güncellenme Tarihi")

    class Meta:
        verbose_name = "Duyuru"
        verbose_name_plural = "Duyurular"
        ordering = ['order', '-created_at']

    def __str__(self):
        return self.message 