from rest_framework import serializers
from .models import Category, Product, Discount, ProductReview, ProductRating
from django.utils import timezone
from django.db.models import Avg
from django.contrib.auth.models import User
from rest_framework.exceptions import PermissionDenied

# OrderItem modeline erişim için import 
from orders.models import OrderItem

class UserSerializer(serializers.ModelSerializer):
    # Kullanıcı ismini maskeleyen özel alan
    masked_username = serializers.SerializerMethodField()
    masked_first_name = serializers.SerializerMethodField()
    masked_last_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'masked_username', 'masked_first_name', 'masked_last_name']
    
    def get_masked_username(self, obj):
        if not obj.username:
            return "****"
        return obj.username[0] + "*" * (len(obj.username) - 1)
    
    def get_masked_first_name(self, obj):
        if not obj.first_name:
            return "**"
        return obj.first_name[0] + "*" * (len(obj.first_name) - 1)
        
    def get_masked_last_name(self, obj):
        if not obj.last_name:
            return "**"
        return obj.last_name[0] + "*" * (len(obj.last_name) - 1)

class DiscountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Discount
        fields = ['id', 'discount_percentage', 'start_date', 'end_date', 'is_active']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description']

class ProductRatingSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = ProductRating
        fields = ['id', 'user', 'rating', 'created_at']
        
class ProductReviewSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = ProductReview
        fields = ['id', 'user', 'review', 'like', 'dislike', 'created_at']

# Yorumlar ve Puanları birleştiren serializer
class ProductFeedbackSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_rating = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = ProductReview
        fields = ['id', 'user', 'review', 'like', 'dislike', 'user_rating', 'created_at']
        
class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')
    active_discount = serializers.SerializerMethodField()
    discounted_price = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = ['id', 'category', 'category_name', 'name', 'slug', 'description', 'img_url',
                  'price', 'stock', 'weight', 'available', 'is_in_stock', 
                  'created_at', 'active_discount', 'discounted_price', 'rating', 'review_count']
                  
    def get_active_discount(self, obj):
        today = timezone.now().date()
        discount = obj.discounts.filter(
            is_active=True,
            start_date__lte=today,
            end_date__gte=today
        ).first()
        
        if discount:
            return DiscountSerializer(discount).data
        return None
    
    def get_discounted_price(self, obj):
        active_discount = self.get_active_discount(obj)
        if active_discount:
            discount_percentage = active_discount['discount_percentage']
            return float(obj.price) * (1 - float(discount_percentage) / 100)
        return None
        
    def get_rating(self, obj):
        avg_rating = obj.ratings.aggregate(Avg('rating'))['rating__avg']
        return avg_rating if avg_rating else 4.0  # Default puanı 4 olarak ayarlıyoruz
        
    def get_review_count(self, obj):
        return obj.reviews.count() or 0  # En az 0 değeri döndürür

class ProductDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    active_discount = serializers.SerializerMethodField()
    discounted_price = serializers.SerializerMethodField()
    reviews = ProductReviewSerializer(many=True, read_only=True)
    rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = ['id', 'category', 'name', 'slug', 'description', 'img_url',
                  'price', 'stock', 'weight', 'available', 'is_in_stock', 
                  'created_at', 'active_discount', 'discounted_price', 'reviews', 'rating', 'review_count']
    
    def get_active_discount(self, obj):
        today = timezone.now().date()
        discount = obj.discounts.filter(
            is_active=True,
            start_date__lte=today,
            end_date__gte=today
        ).first()
        
        if discount:
            return DiscountSerializer(discount).data
        return None
    
    def get_discounted_price(self, obj):
        active_discount = self.get_active_discount(obj)
        if active_discount:
            discount_percentage = active_discount['discount_percentage']
            return float(obj.price) * (1 - float(discount_percentage) / 100)
        return None
        
    def get_rating(self, obj):
        avg_rating = obj.ratings.aggregate(Avg('rating'))['rating__avg']
        return avg_rating if avg_rating else 4.0  # Default puanı 4 olarak ayarlıyoruz
        
    def get_review_count(self, obj):
        return obj.reviews.count() or 0  # En az 0 değeri döndürür

# Ürün puanlaması için create serializer
class ProductRatingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductRating
        fields = ['rating', 'product']
        
    def validate(self, attrs):
        user = self.context['request'].user
        product = attrs['product']
        
        # Kullanıcının ürünü satın alıp almadığını kontrol et
        # Ödeme durumu 'paid', 'shipped' veya 'delivered' ise sipariş tamamlanmıştır
        has_purchased = OrderItem.objects.filter(
            product=product,
            order__user=user,
            order__status__in=['paid', 'shipped', 'delivered']
        ).exists()
        
        if not has_purchased:
            raise PermissionDenied(
                "Bu ürünü puanlayabilmek için satın almış ve siparişinizi tamamlamış olmalısınız."
            )
        
        return attrs
        
    def create(self, validated_data):
        user = self.context['request'].user
        product = validated_data['product']
        
        # Kullanıcının bu ürün için önceki puanlamasını kontrol et
        existing_rating = ProductRating.objects.filter(user=user, product=product).first()
        if existing_rating:
            # Varsa güncelle
            existing_rating.rating = validated_data['rating']
            existing_rating.save()
            return existing_rating
        
        # Yoksa yeni oluştur
        validated_data['user'] = user
        return super().create(validated_data)

# Ürün yorumu için create serializer
class ProductReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductReview
        fields = ['review', 'product']
    
    def validate(self, attrs):
        user = self.context['request'].user
        product = attrs['product']
        
        # Kullanıcının ürünü satın alıp almadığını kontrol et
        # Ödeme durumu 'paid', 'shipped' veya 'delivered' ise sipariş tamamlanmıştır
        has_purchased = OrderItem.objects.filter(
            product=product,
            order__user=user,
            order__status__in=['paid', 'shipped', 'delivered']
        ).exists()
        
        if not has_purchased:
            raise PermissionDenied(
                "Bu ürüne yorum yapabilmek için satın almış ve siparişinizi tamamlamış olmalısınız."
            )
            
        # Kullanıcının bu ürün için önceki yorumunu kontrol et
        existing_review = ProductReview.objects.filter(user=user, product=product).first()
        if existing_review:
            raise PermissionDenied(
                "Bu ürüne zaten bir yorum yapmışsınız. Aynı ürüne birden fazla yorum yapamazsınız."
            )
        
        return attrs
        
    def create(self, validated_data):
        user = self.context['request'].user
        product = validated_data['product']
        
        # Kullanıcının bu ürün için önceki yorumunu kontrol et
        existing_review = ProductReview.objects.filter(user=user, product=product).first()
        if existing_review:
            # Hata ver - aynı ürüne birden fazla yorum yapılamaz
            raise PermissionDenied(
                "Bu ürüne zaten bir yorum yapmışsınız. Aynı ürüne birden fazla yorum yapamazsınız."
            )
        
        # Yoksa yeni oluştur
        validated_data['user'] = user
        return super().create(validated_data) 