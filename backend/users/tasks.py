from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.models import User
from .models import PasswordResetToken
from django.template.loader import render_to_string
from django.utils.html import strip_tags

base_image_url = "https://sandernet.sirv.com/Images/"
@shared_task
def send_password_reset_email(email, reset_url):
    """Kullanıcıya şifre sıfırlama e-postası gönderir."""
    try:
        user = User.objects.get(email=email)
        
        # HTML içeriği hazırla
        html_message = render_to_string('email_templates/password_reset.html', {
            'user': user,
            'reset_url': reset_url,
            'email': user.email,
        })
        
        # Düz metin alternatifi
        plain_message = strip_tags(html_message)
        
        subject = 'Şifre Sıfırlama Talebi'
        
        send_mail(
            subject,
            plain_message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except User.DoesNotExist:
        return False
    except Exception as e:
        print(f"E-posta gönderirken hata oluştu: {e}")
        return False

@shared_task
def clean_expired_tokens():
    """Süresi geçmiş veya kullanılmış olan şifre sıfırlama tokenlarını temizler."""
    from django.utils import timezone
    deleted, _ = PasswordResetToken.objects.filter(
        expires_at__lt=timezone.now()
    ).delete()
    return f"{deleted} adet süresi dolmuş token silindi."

@shared_task
def send_welcome_email(user_id):
    """Yeni kayıt olan kullanıcılara hoş geldiniz e-postası gönderir."""
    try:
        user = User.objects.get(id=user_id)
        
        # HTML içeriği hazırla
        html_message = render_to_string('email_templates/welcome_email.html', {
            'user': user,
            'frontend_url': settings.FRONTEND_URL,
            'email': user.email,
        })
        
        # Düz metin alternatifi
        plain_message = strip_tags(html_message)
        
        subject = 'Kaşarcım\'a Hoş Geldiniz!'
        
        send_mail(
            subject,
            plain_message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except User.DoesNotExist:
        return False
    except Exception as e:
        print(f"Hoş geldiniz e-postası gönderirken hata oluştu: {e}")
        return False

@shared_task
def send_order_created_email(order_id, user_id):
    """Sipariş oluşturulduğunda bilgilendirme e-postası gönderir."""
    from orders.models import Order
    from django.utils import timezone
    try:
        order = Order.objects.get(id=order_id)
        
        # Misafir sipariş kontrolü (user_id=0)
        if user_id == 0:
            # Misafir siparişi için sipariş bilgilerini kullan
            user_email = order.email
            user_name = f"{order.first_name} {order.last_name}"
            is_guest = True
        else:
            # Kayıtlı kullanıcı siparişi
            try:
                user = User.objects.get(id=user_id)
                user_email = user.email
                user_name = f"{user.first_name} {user.last_name}"
                if not user_name.strip():
                    user_name = user.username
                is_guest = False
            except User.DoesNotExist:
                print(f"Kullanıcı bulunamadı (ID: {user_id})")
                return False
        
        payment_url = f"{settings.FRONTEND_URL}/siparis/{order.id}"
        
        # Her sipariş öğesi için indirim bilgilerini hazırla
        order_items = []
        for item in order.items.all():
            product = item.product
            today = timezone.now().date()
            discount = product.discounts.filter(
                is_active=True,
                start_date__lte=today,
                end_date__gte=today
            ).first()
            
            has_discount = False
            discount_percentage = 0
            original_price = float(item.product.price)
            discounted_price = original_price

            if discount:
                has_discount = True
                discount_percentage = float(discount.discount_percentage)
                discounted_price = float(item.price)
            
            order_items.append({
                'item': item,
                'has_discount': has_discount,
                'discount_percentage': discount_percentage,
                'original_price': original_price,
                'discounted_price': discounted_price,
                'total_price': discounted_price * item.quantity,
                'product': product,
            })
        
        # HTML içeriği hazırla
        html_message = render_to_string('email_templates/order_created.html', {
            'user_name': user_name,
            'is_guest': is_guest,
            'order': order,
            'order_items': order_items,
            'payment_url': payment_url,
            'email': user_email,
            'order_id': order.id + 91185,
            'base_image_url': base_image_url,
        })
        
        # Düz metin alternatifi
        plain_message = strip_tags(html_message)
        
        subject = f'Siparişiniz Oluşturuldu (#SP{order.id + 91185})'
        
        # E-posta gönderme işlemini UTF-8 kodlaması ile gerçekleştir
        from django.core.mail.message import EmailMultiAlternatives
        msg = EmailMultiAlternatives(
            subject=subject,
            body=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user_email]
        )
        msg.attach_alternative(html_message, "text/html")
        msg.encoding = 'utf-8'
        msg.send()
        
        return True
    except Exception as e:
        print(f"Sipariş e-postası gönderirken hata oluştu: {e}")
        return False

@shared_task
def send_payment_confirmed_email(order_id, user_id):
    """Ödeme onaylandığında bilgilendirme e-postası gönderir."""
    from orders.models import Order
    from django.utils import timezone
    try:
        order = Order.objects.get(id=order_id)
        
        # Misafir sipariş kontrolü (user_id=0)
        if user_id == 0:
            # Misafir siparişi için sipariş bilgilerini kullan
            user_email = order.email
            user_name = f"{order.first_name} {order.last_name}"
            is_guest = True
        else:
            # Kayıtlı kullanıcı siparişi
            try:
                user = User.objects.get(id=user_id)
                user_email = user.email
                user_name = f"{user.first_name} {user.last_name}"
                if not user_name.strip():
                    user_name = user.username
                is_guest = False
            except User.DoesNotExist:
                print(f"Kullanıcı bulunamadı (ID: {user_id})")
                return False
        
        order_detail_url = f"{settings.FRONTEND_URL}/orders/{order.id}"
        
        # Her sipariş öğesi için indirim bilgilerini hazırla
        order_items = []
        for item in order.items.all():
            product = item.product
            today = timezone.now().date()
            discount = product.discounts.filter(
                is_active=True,
                start_date__lte=today,
                end_date__gte=today
            ).first()
            
            has_discount = False
            discount_percentage = 0
            original_price = float(item.product.price)
            discounted_price = original_price
            
            if discount:
                has_discount = True
                discount_percentage = float(discount.discount_percentage)
                discounted_price = float(item.price)
            
            order_items.append({
                'item': item,
                'has_discount': has_discount,
                'discount_percentage': discount_percentage,
                'original_price': original_price,
                'discounted_price': discounted_price,
                'total_price': discounted_price * item.quantity,
                'product': product,
            })
        
        # HTML içeriği hazırla
        html_message = render_to_string('email_templates/payment_confirmed.html', {
            'user_name': user_name,
            'is_guest': is_guest,
            'order': order,
            'order_items': order_items,
            'order_detail_url': order_detail_url,
            'email': user_email,
            'base_image_url': base_image_url,
            'order_id': order.id + 91185,
        })
        
        # Düz metin alternatifi
        plain_message = strip_tags(html_message)
        
        subject = f'Ödemeniz Onaylandı (#{order.id + 91185})'
        
        # E-posta gönderme işlemini UTF-8 kodlaması ile gerçekleştir
        from django.core.mail.message import EmailMultiAlternatives
        msg = EmailMultiAlternatives(
            subject=subject,
            body=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user_email]
        )
        msg.attach_alternative(html_message, "text/html")
        msg.encoding = 'utf-8'
        msg.send()
        
        return True
    except Exception as e:
        print(f"Ödeme onay e-postası gönderirken hata oluştu: {e}")
        return False

@shared_task
def send_order_shipped_email(order_id, user_id):
    """Sipariş kargoya verildiğinde bilgilendirme e-postası gönderir."""
    from orders.models import Order, Shipment
    from django.utils import timezone
    try:
        order = Order.objects.get(id=order_id)
        
        # Misafir sipariş kontrolü (user_id=0)
        if user_id == 0:
            # Misafir siparişi için sipariş bilgilerini kullan
            user_email = order.email
            user_name = f"{order.first_name} {order.last_name}"
            is_guest = True
        else:
            # Kayıtlı kullanıcı siparişi
            try:
                user = User.objects.get(id=user_id)
                user_email = user.email
                user_name = f"{user.first_name} {user.last_name}"
                if not user_name.strip():
                    user_name = user.username
                is_guest = False
            except User.DoesNotExist:
                print(f"Kullanıcı bulunamadı (ID: {user_id})")
                return False
        
        try:
            shipment = Shipment.objects.get(order=order)
            tracking_number = shipment.tracking_number
            tracking_url = shipment.get_tracking_url() or f"{settings.FRONTEND_URL}/orders/{order.id}/track"
            shipping_company = dict(Shipment.SHIPPING_COMPANIES).get(shipment.shipping_company)
            estimated_delivery = shipment.estimated_delivery.strftime('%d.%m.%Y') if shipment.estimated_delivery else "Belirtilmedi"
        except Shipment.DoesNotExist:
            tracking_number = "Belirtilmedi"
            tracking_url = f"{settings.FRONTEND_URL}/orders/{order.id}/track"
            shipping_company = "Belirtilmedi"
            estimated_delivery = "Belirtilmedi"
        
        # Her sipariş öğesi için indirim bilgilerini hazırla
        order_items = []
        for item in order.items.all():
            product = item.product
            today = timezone.now().date()
            discount = product.discounts.filter(
                is_active=True,
                start_date__lte=today,
                end_date__gte=today
            ).first()
            
            has_discount = False
            discount_percentage = 0
            original_price = float(item.product.price)
            discounted_price = original_price
            
            if discount:
                has_discount = True
                discount_percentage = float(discount.discount_percentage)
                discounted_price = float(item.price)
            
            order_items.append({
                'item': item,
                'has_discount': has_discount,
                'discount_percentage': discount_percentage,
                'original_price': original_price,
                'discounted_price': discounted_price,
                'total_price': discounted_price * item.quantity,
                'product': product,
            })
        
        # HTML içeriği hazırla
        html_message = render_to_string('email_templates/order_shipped.html', {
            'user_name': user_name,
            'is_guest': is_guest,
            'order': order,
            'order_items': order_items,
            'tracking_number': tracking_number,
            'tracking_url': tracking_url,
            'shipping_company': shipping_company,
            'estimated_delivery': estimated_delivery,
            'email': user_email,
            'order_id': order.id + 91185,
            'base_image_url': base_image_url,
        })
        
        # Düz metin alternatifi
        plain_message = strip_tags(html_message)
        
        subject = f'Siparişiniz Kargoya Verildi (#SP{order.id + 91185})'
        
        # E-posta gönderme işlemini UTF-8 kodlaması ile gerçekleştir
        from django.core.mail.message import EmailMultiAlternatives
        msg = EmailMultiAlternatives(
            subject=subject,
            body=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user_email]
        )
        msg.attach_alternative(html_message, "text/html")
        msg.encoding = 'utf-8'
        msg.send()
        
        return True
    except Exception as e:
        print(f"Kargo bilgilendirme e-postası gönderirken hata oluştu: {e}")
        return False

@shared_task
def send_review_request_email(order_id, user_id):
    """Siparişten 3 gün sonra değerlendirme isteği e-postası gönderir."""
    from orders.models import Order
    try:
        order = Order.objects.get(id=order_id)
        user = User.objects.get(id=user_id)
        
        review_url = f"{settings.FRONTEND_URL}/orders/{order.id}/review"
        contact_url = f"{settings.FRONTEND_URL}/contact"
        
        # HTML içeriği hazırla
        html_message = render_to_string('email_templates/review_request.html', {
            'user': user,
            'order': order,
            'review_url': review_url,
            'contact_url': contact_url,
            'email': user.email,
        })
        
        # Düz metin alternatifi
        plain_message = strip_tags(html_message)
        
        subject = f'Siparişinizi Değerlendirmeye Ne Dersiniz? (#{order.id})'
        
        send_mail(
            subject,
            plain_message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Değerlendirme isteği e-postası gönderirken hata oluştu: {e}")
        return False 