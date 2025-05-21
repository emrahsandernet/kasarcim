from django.shortcuts import render
from rest_framework import viewsets, generics, permissions, status, throttling
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.views import APIView
import rest_framework.throttling
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from .models import UserProfile, Address, ContactMessage, PasswordResetToken
from .serializers import (
    UserSerializer, RegisterSerializer, AddressSerializer, 
    UserProfileSerializer, ContactMessageSerializer,
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer
)
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from .tasks import send_password_reset_email, send_welcome_email

# Create your views here.

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]
    
    def get_permissions(self):
        if self.action in ['me', 'update_profile', 'current_user']:
            return [permissions.IsAuthenticated()]
        elif self.action in ['retrieve', 'update', 'partial_update']:
            return [permissions.IsAuthenticated()]
        return super().get_permissions()
    
    def retrieve(self, request, *args, **kwargs):
        # Kullanıcı sadece kendi bilgilerini görebilir, admin ise herkesi görebilir
        instance = self.get_object()
        if instance.id != request.user.id and not request.user.is_staff:
            return Response(
                {"detail": "Bu bilgileri görüntüleme yetkiniz bulunmuyor."},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    def update(self, request, *args, **kwargs):
        # Kullanıcı sadece kendi bilgilerini güncelleyebilir, admin ise herkesi güncelleyebilir
        instance = self.get_object()
        if instance.id != request.user.id and not request.user.is_staff:
            return Response(
                {"detail": "Bu bilgileri güncelleme yetkiniz bulunmuyor."},
                status=status.HTTP_403_FORBIDDEN
            )
        partial = kwargs.pop('partial', False)
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    
    @action(detail=False, methods=['get', 'put', 'patch'])
    def me(self, request):
        user = request.user
        if request.method == 'GET':
            serializer = self.get_serializer(user)
            return Response(serializer.data)
        elif request.method in ['PUT', 'PATCH']:
            partial = request.method == 'PATCH'
            serializer = self.get_serializer(user, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
    
    @action(detail=False, methods=['get', 'put', 'patch'], url_path='current-user')
    def current_user(self, request):
        """
        Kullanıcının kendi profilini görüntülemesi ve güncellemesi için endpoint.
        Bu endpoint /api/users/current-user/ URL'i üzerinden erişilebilir.
        """
        user = request.user
        if request.method == 'GET':
            serializer = self.get_serializer(user)
            return Response(serializer.data)
        elif request.method in ['PUT', 'PATCH']:
            partial = request.method == 'PATCH'
            try:
                # Eğer profil alanı gelmemişse, boş bir profil verisi oluşturalım
                data = request.data.copy()
                if 'profile' not in data:
                    data['profile'] = {}
                
                serializer = self.get_serializer(user, data=data, partial=partial)
                serializer.is_valid(raise_exception=True)
                serializer.save()
                return Response(serializer.data)
            except Exception as e:
                # Hata ayrıntıları için log tutma
                print(f"Profil güncelleme hatası: {str(e)}")
                return Response(
                    {"detail": f"Profil güncellenirken bir hata oluştu: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

# Kullanıcı bilgisi doğrulama API endpoint'i
class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        return Response({
            'user_id': user.pk,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_staff': user.is_staff,
        })

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 201:  # Kullanıcı başarıyla oluşturuldu
            # Kullanıcıyı al (oluşturulan)
            user = User.objects.get(username=request.data.get('username', '').strip() or response.data.get('username'))
            # Token oluştur
            token, created = Token.objects.get_or_create(user=user)
            # Yanıta token ekle
            response.data['token'] = token.key
            
            # Profil bilgilerini yanıta ekle
            try:
                profile = user.userprofile
                response.data['profile'] = {
                    'phone_number': profile.phone_number,
                }
            except:
                # Profil oluşturulmadıysa boş ekle
                response.data['profile'] = {
                    'phone_number': '',
                }
            
            # Hoş geldiniz e-postası gönder (Celery ile arka planda)
            if user.email:
                send_welcome_email.delay(user.id)
                
        return response



class LoginView(ObtainAuthToken):
    permission_classes = [permissions.AllowAny]
    # Giriş istekleri için istek sınırlandırması
    
    throttle_scope = 'auth_api'
    
    def post(self, request, *args, **kwargs):
        # E-posta ile giriş işlemi
        email = request.data.get('email')
        password = request.data.get('password')
        
        # Geçersiz bilgiler
        if not email or not password:
            return Response(
                {'non_field_errors': ['E-posta ve şifre gereklidir.']},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Önce e-posta ile kullanıcıyı bul
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'non_field_errors': ['Bu e-posta adresine sahip bir kullanıcı bulunamadı.']},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Şifre kontrolü yap
        if not user.check_password(password):
            return Response(
                {'non_field_errors': ['Hatalı e-posta veya şifre girdiniz.']},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Token oluştur veya al
        token, created = Token.objects.get_or_create(user=user)
        
        # Profil bilgilerini de ekle
        user_serializer = UserSerializer(user)
        
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_staff': user.is_staff,
        })

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        # Kullanıcının token'ını sil
        try:
            request.user.auth_token.delete()
            return Response({'message': 'Başarıyla çıkış yapıldı.'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PasswordResetRequestView(generics.GenericAPIView):
    serializer_class = PasswordResetRequestSerializer
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        user = User.objects.get(email=email)
        
        # Eski kullanılmamış tokenları temizle
        PasswordResetToken.objects.filter(
            user=user, 
            is_used=False, 
            expires_at__lt=timezone.now()
        ).delete()
        
        # Yeni token oluştur
        reset_token = PasswordResetToken.objects.create(user=user)
        
        # E-posta URL'ini hazırla ve Celery task'ını gönder
        reset_url = f"{settings.FRONTEND_URL}/sifre-sifirlama?token={reset_token.token}"
        
        # Celery görevini çağır
        send_password_reset_email.delay(email, reset_url)
        
        return Response({
            'message': 'Şifre sıfırlama e-postası gönderildi. Lütfen e-posta kutunuzu kontrol edin.'
        })

class PasswordResetConfirmView(generics.GenericAPIView):
    serializer_class = PasswordResetConfirmSerializer
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        token_str = serializer.validated_data['token']
        password = serializer.validated_data['password']
        
        try:
            token = PasswordResetToken.objects.get(token=token_str, is_used=False)
            
            # Token geçerli mi kontrol et
            if token.expires_at < timezone.now():
                return Response({
                    'error': 'Şifre sıfırlama bağlantısının süresi dolmuş.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Şifreyi güncelle
            user = token.user
            user.set_password(password)
            user.save()
            
            # Token'ı kullanılmış olarak işaretle
            token.is_used = True
            token.save()
            
            # Kullanıcının eski tokenlarını geçersiz kıl (çıkış yap)
            Token.objects.filter(user=user).delete()
            
            return Response({
                'message': 'Şifreniz başarıyla sıfırlandı. Yeni şifrenizle giriş yapabilirsiniz.'
            })
            
        except PasswordResetToken.DoesNotExist:
            return Response({
                'error': 'Geçersiz veya kullanılmış şifre sıfırlama bağlantısı.'
            }, status=status.HTTP_400_BAD_REQUEST)

class AddressViewSet(viewsets.ModelViewSet):
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def shipping(self, request):
        addresses = Address.objects.filter(user=request.user, address_type='shipping')
        serializer = self.get_serializer(addresses, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def billing(self, request):
        addresses = Address.objects.filter(user=request.user, address_type='billing')
        serializer = self.get_serializer(addresses, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def set_default(self, request, pk=None):
        address = self.get_object()
        address.is_default = True
        address.save()
        return Response({'status': 'Varsayılan adres olarak ayarlandı'})

class ContactMessageCreateView(generics.CreateAPIView):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [permissions.AllowAny]
