from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from .models import Announcement
from .serializers import AnnouncementSerializer

class AnnouncementListAPIView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        announcements = Announcement.objects.filter(is_active=True)
        serializer = AnnouncementSerializer(announcements, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK) 