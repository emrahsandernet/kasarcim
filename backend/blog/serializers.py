from rest_framework import serializers
from .models import Blog, BlogCategory, BlogTag, BlogSection


class BlogTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogTag
        fields = ['id', 'name', 'slug']


class BlogCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogCategory
        fields = ['id', 'name', 'slug', 'description']


class BlogSectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogSection
        fields = ['id', 'title', 'slug', 'level', 'order', 'parent', 'content']


class BlogListSerializer(serializers.ModelSerializer):
    categories = BlogCategorySerializer(many=True, read_only=True)
    tags = BlogTagSerializer(many=True, read_only=True)
    author_name = serializers.SerializerMethodField()
    reading_time = serializers.SerializerMethodField()
    
    class Meta:
        model = Blog
        fields = [
            'id', 'title', 'slug', 'excerpt', 'featured_image', 
            'categories', 'tags', 'author_name', 'published_at', 
            'reading_time', 'view_count'
        ]
    
    def get_author_name(self, obj):
        if obj.author:
            return obj.author.get_full_name() or obj.author.username
        return None
    
    def get_reading_time(self, obj):
        return obj.get_reading_time()


class BlogDetailSerializer(serializers.ModelSerializer):
    categories = BlogCategorySerializer(many=True, read_only=True)
    tags = BlogTagSerializer(many=True, read_only=True)
    sections = BlogSectionSerializer(many=True, read_only=True)
    author_name = serializers.SerializerMethodField()
    reading_time = serializers.SerializerMethodField()
    related_posts = serializers.SerializerMethodField()
    
    class Meta:
        model = Blog
        fields = [
            'id', 'title', 'slug', 'excerpt', 'content', 'featured_image', 
            'categories', 'tags', 'sections', 'author_name', 'published_at', 
            'reading_time', 'view_count', 'meta_description', 'related_posts'
        ]
    
    def get_author_name(self, obj):
        if obj.author:
            return obj.author.get_full_name() or obj.author.username
        return None
    
    def get_reading_time(self, obj):
        return obj.get_reading_time()
    
    def get_related_posts(self, obj):
        related = obj.get_related_posts()
        return BlogListSerializer(related, many=True, context=self.context).data 