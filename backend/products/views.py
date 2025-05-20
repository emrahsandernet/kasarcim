from django.shortcuts import render, get_object_or_404
from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend, FilterSet
import django_filters
from django.db.models import Prefetch
from .models import Category, Product, ProductReview, ProductRating
from .serializers import (
    CategorySerializer, ProductSerializer, ProductDetailSerializer,
    ProductReviewSerializer, ProductRatingSerializer,
    ProductReviewCreateSerializer, ProductRatingCreateSerializer,
    ProductFeedbackSerializer
)
from orders.models import OrderItem

# Custom Pagination Class
class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

# Create your views here.

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAdminUser]
    lookup_field = 'slug'
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return super().get_permissions()
    
    @action(detail=True, methods=['get'])
    def products(self, request, slug=None):
        category = self.get_object()
        products = Product.objects.filter(category=category, available=True)
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)

class ProductFilter(FilterSet):
    category_slug = django_filters.CharFilter(field_name='category__slug')
    min_price = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='price', lookup_expr='lte')
    in_stock = django_filters.BooleanFilter(field_name='stock', method='filter_in_stock')
    
    def filter_in_stock(self, queryset, name, value):
        if value:
            return queryset.filter(stock__gt=0)
        return queryset
    
    class Meta:
        model = Product
        fields = ['category', 'category_slug', 'available', 'min_price', 'max_price', 'in_stock']

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAdminUser]
    lookup_field = 'slug'
    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    search_fields = ['name', 'description', 'category__name']
    ordering_fields = ['name', 'price', 'created_at']
    filterset_class = ProductFilter
    
    def get_queryset(self):
        queryset = Product.objects.all()
        
        # Default olarak sadece available=True olan ürünleri göster
        # is_admin durumuna göre available kontrolü yapalım
        is_admin = self.request.user.is_staff or self.request.user.is_superuser
        
        # Eğer Admin değilse sadece available=True olanları göster
        if not is_admin:
            queryset = queryset.filter(available=True)
            
        return queryset
    
    def get_permissions(self):
        # Özel durum: OPTIONS istekleri için her zaman izin verilir
        if self.request.method == 'OPTIONS':
            return [permissions.AllowAny()]
            
        if self.action in ['list', 'retrieve', 'reviews', 'ratings', 'feedback', 'has_reviewed', 'get_by_slug']:
            return [permissions.AllowAny()]
        elif self.action in ['add_review', 'add_rating']:
            return [IsAuthenticated()]
        return super().get_permissions()
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProductDetailSerializer
        elif self.action == 'add_review':
            return ProductReviewCreateSerializer
        elif self.action == 'add_rating':
            return ProductRatingCreateSerializer
        return ProductSerializer
    
    @action(detail=True, methods=['get'])
    def reviews(self, request, slug=None):
        """Ürüne ait tüm yorumları getir"""
        product = self.get_object()
        reviews = ProductReview.objects.filter(product=product)
        serializer = ProductReviewSerializer(reviews, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post', 'options'])
    def add_review(self, request, slug=None):
        """Ürüne yorum ekle"""
        # OPTIONS metodu için özel işlem
        if request.method == 'OPTIONS':
            return Response(status=status.HTTP_200_OK)
        product = self.get_object()
        user = request.user
        
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
        
        request.data['product'] = product.id
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Yorumunuz başarıyla eklendi."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def ratings(self, request, slug=None):
        """Ürüne ait tüm puanlamaları getir"""
        product = self.get_object()
        ratings = ProductRating.objects.filter(product=product)
        serializer = ProductRatingSerializer(ratings, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post', 'options'])
    def add_rating(self, request, slug=None):
        """Ürüne puan ver"""
        # OPTIONS metodu için özel işlem
        if request.method == 'OPTIONS':
            return Response(status=status.HTTP_200_OK)
        product = self.get_object()
        user = request.user
        
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
        
        request.data['product'] = product.id
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Puanınız başarıyla kaydedildi."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    @action(detail=True, methods=['get'])
    def feedback(self, request, slug=None):
        """Ürüne ait tüm yorumları ve puanlamaları sayfalı olarak getir"""
        product = self.get_object()
        paginator = StandardResultsSetPagination()
        
        # Yorumları al
        reviews = ProductReview.objects.filter(product=product).order_by('-created_at')
        # Kullanıcı ID'lerine göre puanlamaları alın
        ratings = {rating.user_id: rating.rating for rating in ProductRating.objects.filter(product=product)}
        
        # Sayfalama
        page = paginator.paginate_queryset(reviews, request)
        
        # Serileştiriciye göndermeden önce, her yoruma ait puanlamayı ekle
        for review in page:
            review.user_rating = ratings.get(review.user_id, None)
        
        serializer = ProductFeedbackSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    @action(detail=True, methods=['get'], url_path='has-reviewed')
    def has_reviewed(self, request, slug=None):
        """Kullanıcının bu ürüne yorum yapıp yapmadığını kontrol et"""
        product = self.get_object()
        user = request.user
        
        has_review = ProductReview.objects.filter(product=product, user=user).exists()
        
        if has_review:
            # Kullanıcının yorumu varsa, yorumu da döndür
            review = ProductReview.objects.get(product=product, user=user)
            review_data = ProductReviewSerializer(review).data
            
            return Response({
                "has_reviewed": True,
                "review": review_data
            })
        
        return Response({"has_reviewed": False})

    @action(detail=False, methods=['get'], url_path='by-slug/(?P<slug>[^/.]+)')
    def get_by_slug(self, request, slug=None):
        """Ürünü slug ile getir (Public endpoint, herkes tarafından erişilebilir)"""
        try:
            product = get_object_or_404(Product, slug=slug)
            serializer = ProductDetailSerializer(product)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)

class ProductReviewViewSet(viewsets.ModelViewSet):
    queryset = ProductReview.objects.all()
    serializer_class = ProductReviewSerializer
    permission_classes = [permissions.IsAdminUser]
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        elif self.action in ['like', 'dislike']:
            return [IsAuthenticated()]
        return super().get_permissions()
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ProductReviewCreateSerializer
        return ProductReviewSerializer
    
    def perform_create(self, serializer):
        user = self.request.user
        product = serializer.validated_data['product']
        
        # Kullanıcının ürünü satın alıp almadığını kontrol et
        has_purchased = OrderItem.objects.filter(
            product=product,
            order__user=user,
            order__status__in=['paid', 'shipped', 'delivered']
        ).exists()
        
        if not has_purchased:
            raise PermissionDenied(
                "Bu ürüne yorum yapabilmek için satın almış ve siparişinizi tamamlamış olmalısınız."
            )
            
        serializer.save(user=user)

    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        """Yorumu beğen"""
        review = self.get_object()
        
        # Kullanıcı kendi yorumunu beğenemez
        if review.user == request.user:
            return Response(
                {"detail": "Kendi yorumunuzu beğenemezsiniz."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Like sayısını artır
        review.like += 1
        review.save()
        
        return Response({"message": "Yorum beğenildi.", "likes": review.like})
    
    @action(detail=True, methods=['post'])
    def dislike(self, request, pk=None):
        """Yorumu beğenme"""
        review = self.get_object()
        
        # Kullanıcı kendi yorumunu beğenmeyemez
        if review.user == request.user:
            return Response(
                {"detail": "Kendi yorumunuzu beğenmeyemezsiniz."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Dislike sayısını artır
        review.dislike += 1
        review.save()
        
        return Response({"message": "Yorum beğenilmedi.", "dislikes": review.dislike})

class ProductRatingViewSet(viewsets.ModelViewSet):
    queryset = ProductRating.objects.all()
    serializer_class = ProductRatingSerializer
    permission_classes = [permissions.IsAdminUser]
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return super().get_permissions()
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ProductRatingCreateSerializer
        return ProductRatingSerializer
    
    def perform_create(self, serializer):
        user = self.request.user
        product = serializer.validated_data['product']
        
        # Kullanıcının ürünü satın alıp almadığını kontrol et
        has_purchased = OrderItem.objects.filter(
            product=product,
            order__user=user,
            order__status__in=['paid', 'shipped', 'delivered']
        ).exists()
        
        if not has_purchased:
            raise PermissionDenied(
                "Bu ürünü puanlayabilmek için satın almış ve siparişinizi tamamlamış olmalısınız."
            )
            
        serializer.save(user=user)
