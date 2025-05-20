from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.models import User
from .models import UserProfile, Address, ContactMessage

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['phone_number', 'address', 'city', 'postal_code', 'country']

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = [
            'id', 'title', 'address_type', 'first_name', 'last_name', 
            'phone_number', 'address', 'city', 'district', 'postal_code', 
            'country', 'is_default'
        ]
        read_only_fields = ['user']
        
    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['user'] = user
        return super().create(validated_data)

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(required=False)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile']
        
    def update(self, instance, validated_data):
        try:
            # Profile verisi geldi mi kontrol et
            profile_data = validated_data.pop('profile', None)
            
            # Kullanıcı bilgilerini güncelle
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()
            
            # Profil bilgilerini güncelle
            if profile_data:
                # Profil nesnesini al veya oluştur
                profile, created = UserProfile.objects.get_or_create(user=instance)
                
                # Profil alanlarını güncelle
                for attr, value in profile_data.items():
                    setattr(profile, attr, value)
                profile.save()
            
            return instance
        except Exception as e:
            # Hata günlüğü
            print(f"UserSerializer update error: {str(e)}")
            raise serializers.ValidationError(f"Kullanıcı bilgileri güncellenirken bir hata oluştu: {str(e)}")

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    username = serializers.CharField(required=False)
    user_profile = UserProfileSerializer(required=False)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'first_name', 'last_name', 'user_profile']
        
    def validate_email(self, value):
        # Email benzersiz mi kontrol et
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Bu email adresi zaten kullanılıyor.")
        return value
        
    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Şifreler eşleşmiyor.")
        return data
        
    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        user_profile_data = validated_data.pop('user_profile', None)
        
        # Username verilmemişse email'den oluştur
        if not validated_data.get('username'):
            # Email adresindeki @ işaretinden önceki kısmı al
            email_username = validated_data['email'].split('@')[0]
            # Benzersiz olacak şekilde username oluştur
            base_username = email_username
            username = base_username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1
            validated_data['username'] = username
        
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        
        # Profil bilgileri gönderildiyse, signal ile oluşturulan profili güncelle
        if user_profile_data:
            # Modelimizde post_save signal ile profil zaten oluşturulmuş olacak
            # Bu yüzden sadece update yapıyoruz
            user_profile = user.profile
            for attr, value in user_profile_data.items():
                setattr(user_profile, attr, value)
            user_profile.save()
            
        return user

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    
    def validate_email(self, value):
        # E-posta ile kullanıcı var mı kontrol et
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Bu e-posta adresi ile kayıtlı bir kullanıcı bulunamadı.")
        return value

class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    
    def validate(self, data):
        # Şifrelerin eşleşip eşleşmediğini kontrol et
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"password": "Şifreler eşleşmiyor."})
        
        # Django'nun şifre validasyonunu kullan
        try:
            validate_password(data['password'])
        except Exception as e:
            raise serializers.ValidationError({"password": list(e)})
            
        return data

class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ["id", "name", "email", "phone", "subject", "message", "created_at"]
        read_only_fields = ["id", "created_at"] 