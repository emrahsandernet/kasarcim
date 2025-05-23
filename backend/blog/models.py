from django.db import models
from django.utils.text import slugify
from django.utils import timezone
from django.utils.html import mark_safe
from django.contrib.auth.models import User
from ckeditor_uploader.fields import RichTextUploadingField
import re

class BlogCategory(models.Model):
    name = models.CharField(max_length=100, verbose_name="Kategori Adı")
    slug = models.SlugField(max_length=120, unique=True, verbose_name="URL Slug")
    description = models.TextField(blank=True, null=True, verbose_name="Açıklama")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Oluşturulma Tarihi")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Güncellenme Tarihi")
    
    class Meta:
        verbose_name = "Blog Kategorisi"
        verbose_name_plural = "Blog Kategorileri"
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class BlogTag(models.Model):
    name = models.CharField(max_length=50, verbose_name="Etiket Adı")
    slug = models.SlugField(max_length=60, unique=True, verbose_name="URL Slug")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Oluşturulma Tarihi")
    
    class Meta:
        verbose_name = "Blog Etiketi"
        verbose_name_plural = "Blog Etiketleri"
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Blog(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Taslak'),
        ('published', 'Yayınlandı'),
    ]
    
    title = models.CharField(max_length=200, verbose_name="Başlık")
    slug = models.SlugField(max_length=220, unique=True, verbose_name="URL Slug")
    excerpt = models.TextField(verbose_name="Özet", help_text="Blog yazısının kısa özeti")
    content = RichTextUploadingField(verbose_name="İçerik")
    author = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name="blog_posts",
        verbose_name="Yazar"
    )
    featured_image = models.URLField(
        max_length=500, 
        verbose_name="Kapak Görseli URL",
        help_text="CDN üzerindeki görsel URL'si (1200x630px önerilen boyut)"
    )
    categories = models.ManyToManyField(
        BlogCategory, 
        related_name="blogs",
        verbose_name="Kategoriler"
    )
    tags = models.ManyToManyField(
        BlogTag, 
        blank=True, 
        related_name="blogs",
        verbose_name="Etiketler"
    )
    status = models.CharField(
        max_length=10, 
        choices=STATUS_CHOICES, 
        default='draft',
        verbose_name="Durum"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Oluşturulma Tarihi")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Güncellenme Tarihi")
    published_at = models.DateTimeField(blank=True, null=True, verbose_name="Yayınlanma Tarihi")
    is_featured = models.BooleanField(default=False, verbose_name="Öne Çıkan")
    meta_description = models.CharField(
        max_length=160, 
        blank=True, 
        verbose_name="Meta Açıklama",
        help_text="SEO için 160 karakterden az olmalı"
    )
    view_count = models.PositiveIntegerField(default=0, verbose_name="Görüntülenme Sayısı")
    
    class Meta:
        verbose_name = "Blog Yazısı"
        verbose_name_plural = "Blog Yazıları"
        ordering = ['-published_at']
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        
        if self.status == 'published' and not self.published_at:
            self.published_at = timezone.now()
            
        # Sadece belirli alanların güncellenmesi durumunda
        is_update_fields = 'update_fields' in kwargs and kwargs['update_fields'] is not None
        # Eğer content değişmediyse veya sadece belirli alanlar güncelleniyorsa ve content dahil değilse
        if is_update_fields and 'content' not in kwargs['update_fields']:
            super().save(*args, **kwargs)
            return
            
        super().save(*args, **kwargs)
        
        # İçerikten başlıkları çıkarıp BlogSection modelinde sakla
        if self.content:
            # Bölümleri tamamen temizle ve yeniden oluştur - en güvenli yol
            BlogSection.objects.filter(blog=self).delete()
            
            # H2 başlıklarını bul
            h2_pattern = r'<h2[^>]*>(.*?)</h2>'
            
            # İçeriği bölümlere ayır
            h2_positions = [(m.start(), m.group(1)) for m in re.finditer(h2_pattern, self.content)]
            
            if not h2_positions:
                # H2 başlığı yoksa işlem yapma
                return
                
            # Başlıkları benzersiz yap ve sırayla ekle
            processed_titles = set()
            
            # Her H2 başlığı arasındaki içeriği bir bölüm olarak sakla
            for i, (pos, title) in enumerate(h2_positions):
                # Eğer aynı başlık daha önce işlendiyse, benzersiz yap
                original_title = title
                count = 1
                
                while title in processed_titles:
                    title = f"{original_title} {count}"
                    count += 1
                
                processed_titles.add(title)
                slug = slugify(title)
                start_pos = pos
                
                # Sonraki H2 başlığının pozisyonu veya içeriğin sonu
                if i < len(h2_positions) - 1:
                    end_pos = h2_positions[i+1][0]
                else:
                    end_pos = len(self.content)
                    
                # Bu bölümün içeriğini çıkar
                section_content = self.content[start_pos:end_pos]
                
                # Yeni bölüm oluştur
                BlogSection.objects.create(
                    blog=self,
                    title=title,
                    slug=slug,
                    level=2,
                    order=i + 1,
                    parent=None,
                    content=section_content
                )
    
    def get_absolute_url(self):
        return f"/blog/{self.slug}/"
    
    def get_reading_time(self):
        """Yazının tahmini okuma süresini dakika cinsinden hesapla"""
        word_count = len(re.findall(r'\w+', self.content))
        reading_time = word_count / 200  # Ortalama dakikada 200 kelime
        return max(1, round(reading_time))  # En az 1 dakika
    
    def increment_view_count(self):
        """Görüntülenme sayısını artır"""
        self.view_count += 1
        self.save(update_fields=['view_count'])
    
    def get_related_posts(self):
        """Benzer yazıları getir (aynı kategoride ve etiketlerde)"""
        # Önce kategori uyumunu kontrol et, sonra etiketlere bak
        related_by_category = Blog.objects.filter(
            status='published',
            categories__in=self.categories.all()
        ).exclude(id=self.id).distinct()
        
        # Zaten yeterince kategori bazlı benzer içerik varsa onları döndür
        if related_by_category.count() >= 3:
            return related_by_category[:3]
            
        # Yeterli kategori bazlı içerik yoksa, etiketlere göre de bak
        related_by_tags = Blog.objects.filter(
            status='published',
            tags__in=self.tags.all()
        ).exclude(id=self.id).exclude(
            id__in=related_by_category.values_list('id', flat=True)
        ).distinct()
        
        # İki sorgunun sonuçlarını birleştir
        combined = list(related_by_category)
        remaining_slots = 3 - len(combined)
        
        if remaining_slots > 0 and related_by_tags.exists():
            combined.extend(list(related_by_tags[:remaining_slots]))
            
        # Hala 3'ten az ise, en yeni yazılardan ekle
        if len(combined) < 3:
            remaining_slots = 3 - len(combined)
            recent_posts = Blog.objects.filter(
                status='published'
            ).exclude(
                id=self.id
            ).exclude(
                id__in=[post.id for post in combined]
            ).order_by('-published_at')[:remaining_slots]
            
            combined.extend(list(recent_posts))
            
        return combined


class BlogSection(models.Model):
    """Blog içeriğindeki başlıkları temsil eden model (İçindekiler tablosu için)"""
    blog = models.ForeignKey(
        Blog, 
        on_delete=models.CASCADE, 
        related_name="sections",
        verbose_name="Blog Yazısı"
    )
    title = models.CharField(max_length=200, verbose_name="Başlık")
    slug = models.SlugField(max_length=220, verbose_name="URL Slug")
    level = models.IntegerField(default=2, verbose_name="Seviye", help_text="2: H2, 3: H3")
    order = models.IntegerField(default=0, verbose_name="Sıra")
    parent = models.ForeignKey(
        'self', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name="children",
        verbose_name="Üst Başlık"
    )
    content = models.TextField(blank=True, null=True, verbose_name="Bölüm İçeriği")
    
    class Meta:
        verbose_name = "Blog Bölümü"
        verbose_name_plural = "Blog Bölümleri"
        ordering = ['blog', 'order']
    
    def __str__(self):
        return f"{self.blog.title} - {self.title}"
    
    def get_anchor_link(self):
        """HTML içindeki başlık için anchor link döndür"""
        return f"#{self.slug}"
