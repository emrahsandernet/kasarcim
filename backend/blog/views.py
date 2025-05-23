from django.shortcuts import render
from rest_framework import viewsets, filters, generics, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count
from rest_framework.pagination import PageNumberPagination

from .models import Blog, BlogCategory, BlogTag, BlogSection
from .serializers import (
    BlogListSerializer, 
    BlogDetailSerializer, 
    BlogCategorySerializer, 
    BlogTagSerializer, 
    BlogSectionSerializer
)

# Blog için özel pagination sınıfı
class BlogPagination(PageNumberPagination):
    page_size = 3  # Sayfa boyutunu 3'e düşürdük
    page_size_query_param = 'page_size'
    max_page_size = 100

class BlogCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """Blog kategorilerini listeler ve detay görüntüler"""
    queryset = BlogCategory.objects.all()
    serializer_class = BlogCategorySerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']
    
    @action(detail=True, methods=['get'])
    def blogs(self, request, slug=None):
        """Belirli bir kategorideki blogları listeler"""
        category = self.get_object()
        blogs = Blog.objects.filter(
            categories=category, 
            status='published'
        ).order_by('-published_at')
        
        page = self.paginate_queryset(blogs)
        if page is not None:
            serializer = BlogListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = BlogListSerializer(blogs, many=True)
        return Response(serializer.data)


class BlogTagViewSet(viewsets.ReadOnlyModelViewSet):
    """Blog etiketlerini listeler ve detay görüntüler"""
    queryset = BlogTag.objects.all()
    serializer_class = BlogTagSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']
    
    @action(detail=True, methods=['get'])
    def blogs(self, request, slug=None):
        """Belirli bir etiketteki blogları listeler"""
        tag = self.get_object()
        blogs = Blog.objects.filter(
            tags=tag, 
            status='published'
        ).order_by('-published_at')
        
        page = self.paginate_queryset(blogs)
        if page is not None:
            serializer = BlogListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = BlogListSerializer(blogs, many=True)
        return Response(serializer.data)


class BlogViewSet(viewsets.ReadOnlyModelViewSet):
    """Blog yazılarını listeler ve detay görüntüler"""
    queryset = Blog.objects.filter(status='published').order_by('-published_at')
    permission_classes = [AllowAny]
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['categories__slug', 'tags__slug', 'author__username', 'is_featured']
    search_fields = ['title', 'excerpt', 'content']
    ordering_fields = ['published_at', 'view_count', 'title']
    pagination_class = BlogPagination
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return BlogDetailSerializer
        return BlogListSerializer
    
    def retrieve(self, request, *args, **kwargs):
        """Blog detayı görüntülendiğinde görüntülenme sayısını artırır"""
        instance = self.get_object()
        instance.increment_view_count()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Öne çıkan blog yazılarını listeler"""
        blogs = Blog.objects.filter(
            status='published', 
            is_featured=True
        ).order_by('-published_at')[:5]
        
        serializer = BlogListSerializer(blogs, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def single_featured(self, request):
        """Sadece tek bir öne çıkan blog yazısı getirir"""
        blog = Blog.objects.filter(
            status='published', 
            is_featured=True
        ).order_by('-published_at').first()
        
        if not blog:
            return Response({"detail": "Öne çıkan yazı bulunamadı"}, status=status.HTTP_404_NOT_FOUND)
            
        serializer = BlogListSerializer(blog)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def popular(self, request):
        """En çok okunan blog yazılarını listeler"""
        blogs = Blog.objects.filter(
            status='published'
        ).order_by('-view_count')[:5]
        
        serializer = BlogListSerializer(blogs, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def archive(self, request):
        """Blog arşivini ay/yıl bazında getirir"""
        from django.db.models.functions import TruncMonth
        
        archive = Blog.objects.filter(
            status='published'
        ).annotate(
            month=TruncMonth('published_at')
        ).values('month').annotate(
            count=Count('id')
        ).order_by('-month')
        
        return Response(archive)


# Admin Panelde Kullanılabilecek Ek API'ler (İhtiyaç halinde)
class AdminBlogViewSet(viewsets.ModelViewSet):
    """Admin kullanıcıları için tam yetkili blog yönetimi"""
    queryset = Blog.objects.all()
    permission_classes = [IsAuthenticated, IsAdminUser]
    lookup_field = 'slug'
    pagination_class = BlogPagination
    
    def get_serializer_class(self):
        if self.action in ['retrieve', 'update', 'partial_update', 'create']:
            return BlogDetailSerializer
        return BlogListSerializer
