# Generated by Django 5.1.3 on 2025-05-15 23:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0002_address"),
    ]

    operations = [
        migrations.CreateModel(
            name="ContactMessage",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name", models.CharField(max_length=150)),
                ("email", models.EmailField(max_length=254)),
                ("phone", models.CharField(blank=True, max_length=30)),
                ("subject", models.CharField(max_length=100)),
                ("message", models.TextField()),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("is_read", models.BooleanField(default=False)),
            ],
            options={
                "verbose_name": "İletişim Mesajı",
                "verbose_name_plural": "İletişim Mesajları",
                "ordering": ["-created_at"],
            },
        ),
    ]
