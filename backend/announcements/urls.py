from django.urls import path
from .views import AnnouncementListAPIView

urlpatterns = [
    path('api/announcements/', AnnouncementListAPIView.as_view(), name='announcement-list'),
] 