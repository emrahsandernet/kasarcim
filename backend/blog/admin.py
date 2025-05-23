from django.contrib import admin
from django.utils.html import format_html
from .models import Blog, BlogCategory, BlogTag, BlogSection

class BlogSectionInline(admin.TabularInline):
    model = BlogSection
    extra = 0
    fields = ('title', 'slug', 'level', 'order', 'parent')
    readonly_fields = ('slug',)

@admin.register(BlogCategory)
class BlogCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'created_at')
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}
    list_filter = ('created_at',)

@admin.register(BlogTag)
class BlogTagAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'created_at')
    search_fields = ('name',)
    prepopulated_fields = {'slug': ('name',)}
    list_filter = ('created_at',)

@admin.register(Blog)
class BlogAdmin(admin.ModelAdmin):
    list_display = ('title', 'status', 'author', 'published_at', 'is_featured', 'view_count')
    list_filter = ('status', 'is_featured', 'categories', 'created_at', 'published_at')
    search_fields = ('title', 'excerpt', 'content')
    prepopulated_fields = {'slug': ('title',)}
    filter_horizontal = ('categories', 'tags')
    readonly_fields = ('view_count', 'created_at', 'updated_at')
    date_hierarchy = 'published_at'
    inlines = [BlogSectionInline]
    
    fieldsets = (
        ('İçerik Bilgileri', {
            'fields': ('title', 'slug', 'excerpt', 'content')
        }),
        ('Görsel', {
            'fields': ('featured_image',),
            'description': 'CDN üzerindeki görsel URL\'sini girin. Önizleme otomatik olarak gösterilecektir.'
        }),
        ('Kategori ve Etiketler', {
            'fields': ('categories', 'tags'),
            'classes': ('collapse',),
        }),
        ('Yayın Bilgileri', {
            'fields': ('status', 'author', 'published_at', 'is_featured'),
        }),
        ('Meta Bilgiler', {
            'fields': ('meta_description', 'view_count', 'created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
    
    def get_readonly_fields(self, request, obj=None):
        if obj:  # Düzenleme durumunda
            return self.readonly_fields
        return ('view_count', 'created_at', 'updated_at')
    
    def save_model(self, request, obj, form, change):
        if not change:  # Yeni oluşturulan nesne
            obj.author = request.user
        super().save_model(request, obj, form, change)
    
   

@admin.register(BlogSection)
class BlogSectionAdmin(admin.ModelAdmin):
    list_display = ['title', 'blog', 'level', 'order', 'parent']
    list_filter = ['level', 'blog']
    search_fields = ['title', 'blog__title']
    readonly_fields = ['slug']
    autocomplete_fields = ['blog', 'parent']
    fieldsets = (
        (None, {
            'fields': ('blog', 'title', 'slug', 'level', 'order', 'parent')
        }),
    )
