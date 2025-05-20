from django.contrib import admin
from .models import Category, Product, Discount, ProductReview, ProductRating

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'created_at']
    search_fields = ['name']
    prepopulated_fields = {'slug': ('name',)}

class DiscountInline(admin.TabularInline):
    model = Discount
    extra = 0
    fields = ['discount_percentage', 'start_date', 'end_date', 'is_active']
    
class ProductReviewInline(admin.TabularInline):
    model = ProductReview
    extra = 0
    readonly_fields = ['user', 'review', 'created_at']
    can_delete = False
    
class ProductRatingInline(admin.TabularInline):
    model = ProductRating
    extra = 0
    readonly_fields = ['user', 'rating', 'created_at']
    can_delete = False

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price', 'stock', 'available', 'created_at', 'has_active_discount', 'average_rating']
    list_filter = ['category', 'available', 'created_at']
    list_editable = ['price', 'stock', 'available']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    raw_id_fields = ['category']
    inlines = [DiscountInline, ProductReviewInline, ProductRatingInline]
    
    def has_active_discount(self, obj):
        from django.utils import timezone
        today = timezone.now().date()
        has_discount = obj.discounts.filter(is_active=True, start_date__lte=today, end_date__gte=today).exists()
        return has_discount
    
    has_active_discount.boolean = True
    has_active_discount.short_description = 'İndirimli'
    
    def average_rating(self, obj):
        from django.db.models import Avg
        avg_rating = obj.ratings.aggregate(Avg('rating'))['rating__avg']
        if avg_rating:
            return round(avg_rating, 1)
        return 0
        
    average_rating.short_description = 'Puan'

@admin.register(Discount)
class DiscountAdmin(admin.ModelAdmin):
    list_display = ['product', 'discount_percentage', 'start_date', 'end_date', 'is_active']
    list_filter = ['is_active', 'start_date', 'end_date']
    search_fields = ['product__name']
    raw_id_fields = ['product']

@admin.register(ProductReview)
class ProductReviewAdmin(admin.ModelAdmin):
    list_display = ['product', 'user', 'short_review', 'created_at']
    list_filter = ['created_at']
    search_fields = ['product__name', 'user__username', 'review']
    raw_id_fields = ['product', 'user']
    readonly_fields = ['created_at', 'updated_at']
    
    def short_review(self, obj):
        if len(obj.review) > 50:
            return obj.review[:50] + '...'
        return obj.review
    
    short_review.short_description = 'Yorum'

@admin.register(ProductRating)
class ProductRatingAdmin(admin.ModelAdmin):
    list_display = ['product', 'user', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['product__name', 'user__username']
    raw_id_fields = ['product', 'user']
    readonly_fields = ['created_at', 'updated_at']
