# Generated by Django 4.2.21 on 2025-05-20 00:41

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0006_product_img_url'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='product',
            name='image',
        ),
    ]
