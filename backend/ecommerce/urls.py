"""
URL configuration for ecommerce project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken import views as token_views
from users.views import LoginView, RegisterView, LogoutView, PasswordResetRequestView, PasswordResetConfirmView, ContactMessageCreateView
from django.views.decorators.csrf import csrf_exempt

from products.views import CategoryViewSet, ProductViewSet, ProductReviewViewSet, ProductRatingViewSet
from users.views import (
    UserViewSet, AddressViewSet, CurrentUserView
)
from coupons.views import CouponViewSet, check_coupon
from orders.views import OrderViewSet, ShipmentViewSet
from payments.views import PaymentViewSet

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'products', ProductViewSet)
router.register(r'reviews', ProductReviewViewSet)
router.register(r'ratings', ProductRatingViewSet)
router.register(r'users', UserViewSet)
router.register(r'addresses', AddressViewSet, basename='addresses')
router.register(r'coupons', CouponViewSet)
router.register(r'orders', OrderViewSet, basename='orders')
router.register(r'payments', PaymentViewSet, basename='payments')
router.register(r'shipments', ShipmentViewSet, basename='shipments')

urlpatterns = [
    path('km-admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/auth/', include('rest_framework.urls')),
    path('api/token/', token_views.obtain_auth_token, name='api-token'),
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/login/', csrf_exempt(LoginView.as_view()), name='login'),
    path('api/logout/', LogoutView.as_view(), name='logout'),
    path('api/user/', CurrentUserView.as_view(), name='current-user'),
    path('api/contact/', ContactMessageCreateView.as_view(), name='contact'),
    path('api/coupons/check/', check_coupon, name='check-coupon'),
    path('api/password-reset/', csrf_exempt(PasswordResetRequestView.as_view()), name='password-reset'),
    path('api/password-reset-confirm/', csrf_exempt(PasswordResetConfirmView.as_view()), name='password-reset-confirm'),
    path('', include('announcements.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
