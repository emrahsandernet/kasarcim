from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db import transaction
from .models import Order, Shipment
from users.tasks import send_order_created_email, send_order_shipped_email, send_payment_confirmed_email

@receiver(post_save, sender=Order)
def handle_order_status_change(sender, instance, created, **kwargs):
    """
    Sipariş durum değişikliklerini izler ve gerekli e-postaları gönderir
    """
    # Yeni sipariş oluşturulduğunda
    if created:
        # Kullanıcı varsa user_id, yoksa 0 (misafir sipariş olduğunu belirtmek için)
        user_id = instance.user.id if instance.user else 0
        transaction.on_commit(lambda: send_order_created_email.delay(instance.id, user_id))
        return
    
    # Daha önce var olan siparişler için statüs değişikliklerini izle
    try:
        # Önbellekten değil, veritabanından mevcut durumu al
        if 'update_fields' in kwargs and kwargs['update_fields'] is not None and 'status' not in kwargs['update_fields']:
            # Eğer status alanı güncellenmediyse, hiçbir şey yapma
            return
            
        # Sipariş ödendi olarak işaretlendiyse
        if instance.status == 'paid':
            # Kullanıcı varsa user_id, yoksa 0 (misafir sipariş olduğunu belirtmek için)
            user_id = instance.user.id if instance.user else 0
            transaction.on_commit(lambda: send_payment_confirmed_email.delay(instance.id, user_id))
            
    except Exception as e:
        # Hata durumunda loglama yapmak için
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Sipariş durum değişikliği sinyali işlenirken hata: {str(e)}")

@receiver(post_save, sender=Shipment)
def handle_shipment_status_change(sender, instance, created, **kwargs):
    """
    Kargo durum değişikliklerini izler ve gerekli e-postaları gönderir
    """
    try:
        # Yeni kargo oluşturulduğunda veya güncellenmesinde, durumu 'shipped' ise
        if instance.status == 'shipped':
            # Kargoyla ilişkili siparişin durumunu güncelle
            order = instance.order
            # Sipariş durumu zaten shipped değilse güncelle
            if order.status != 'shipped':
                order.status = 'shipped'
                order.save(update_fields=['status'])
                
            # E-posta gönderimi - kullanıcı varsa user_id, yoksa 0
            user_id = order.user.id if order.user else 0
            transaction.on_commit(lambda: send_order_shipped_email.delay(order.id, user_id))
            
        # Kargo teslim edildi olarak işaretlendiyse
        elif instance.status == 'delivered':
            # Siparişin durumunu güncelle
            order = instance.order
            if order.status != 'delivered':
                order.status = 'delivered'
                order.save(update_fields=['status'])
            
    except Exception as e:
        # Hata durumunda loglama yapmak için
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Kargo durum değişikliği sinyali işlenirken hata: {str(e)}") 