from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    BlogViewSet, 
    BlogCategoryViewSet, 
    BlogTagViewSet, 
    AdminBlogViewSet
)

router = DefaultRouter()
router.register(r'posts', BlogViewSet)
router.register(r'categories', BlogCategoryViewSet)
router.register(r'tags', BlogTagViewSet)

# Admin API endpoint'leri
admin_router = DefaultRouter()
admin_router.register(r'posts', AdminBlogViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('admin/', include(admin_router.urls)),
] 