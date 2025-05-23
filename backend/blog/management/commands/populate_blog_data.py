from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from blog.models import BlogCategory, BlogTag, Blog
from django.utils.text import slugify
from django.utils import timezone
from django.core.files.base import ContentFile
import os
import random
import urllib.request
from datetime import timedelta

class Command(BaseCommand):
    help = 'Örnek blog içerikleri oluşturur - kategoriler, etiketler ve blog yazıları'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Örnek blog verileri oluşturuluyor...'))

        # Kullanıcı kontrolü
        try:
            user = User.objects.get(id=1)
            self.stdout.write(self.style.SUCCESS(f'Yazar olarak {user.username} kullanılacak'))
        except User.DoesNotExist:
            self.stderr.write(self.style.ERROR('ID 1 olan kullanıcı bulunamadı. Önce bir kullanıcı oluşturun.'))
            return

        # Ana veri oluşturma fonksiyonlarını çağıracağız
        self.create_categories()
        self.create_tags()
        self.create_blog_posts(user)

        self.stdout.write(self.style.SUCCESS('Örnek blog verileri başarıyla oluşturuldu!'))

    def create_categories(self):
        # Kategorileri oluşturma fonksiyonu
        categories = [
            {
                'name': 'Peynir Kültürü',
                'description': 'Dünya ve Türkiye\'deki peynir kültürü, tarihi ve gelenekleri hakkında yazılar'
            },
            {
                'name': 'Sağlıklı Yaşam',
                'description': 'Sağlıklı beslenme, peynirin besin değeri ve sağlık faydaları hakkında bilgiler'
            },
            {
                'name': 'Tarifler',
                'description': 'Peynir kullanılan lezzetli yemek ve atıştırmalık tarifleri'
            },
            {
                'name': 'Gastronomi',
                'description': 'Yemek kültürü, tadım teknikleri ve gastronomi dünyasından haberler'
            },
            {
                'name': 'Yöresel Lezzetler',
                'description': 'Türkiye\'nin farklı bölgelerindeki yöresel peynirler ve özel tatlar'
            },
            {
                'name': 'Sürdürülebilirlik',
                'description': 'Sürdürülebilir tarım, çevre dostu peynir üretimi ve yerel üreticiler'
            }
        ]
        
        created_count = 0
        for category_data in categories:
            category, created = BlogCategory.objects.get_or_create(
                name=category_data['name'],
                defaults={
                    'description': category_data['description'],
                    'slug': slugify(category_data['name'])
                }
            )
            
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'Kategori oluşturuldu: {category.name}'))
            else:
                self.stdout.write(f'Kategori zaten mevcut: {category.name}')
        
        self.stdout.write(self.style.SUCCESS(f'Toplam {created_count} kategori oluşturuldu'))

    def create_tags(self):
        # Etiketleri oluşturma fonksiyonu
        tags = [
            'peynir', 'kaşar', 'beyaz peynir', 'ezine', 'tulum', 'lor', 'örgü peynir',
            'sağlıklı beslenme', 'protein', 'kalsiyum', 'probiyotik', 'laktoz intoleransı',
            'kahvaltı', 'akşam yemeği', 'atıştırmalık', 'ara öğün', 'salata',
            'yemek tarifi', 'malzemeler', 'pişirme teknikleri', 'sunum',
            'sürdürülebilirlik', 'yerel üretici', 'çiftlikten sofraya', 'organik',
            'türk mutfağı', 'dünya mutfakları', 'akdeniz mutfağı', 'gastronomi',
            'kültür', 'gelenek', 'tarih', 'tadım', 'peynir-şarap eşleştirme'
        ]
        
        created_count = 0
        for tag_name in tags:
            tag, created = BlogTag.objects.get_or_create(
                name=tag_name,
                defaults={'slug': slugify(tag_name)}
            )
            
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'Etiket oluşturuldu: {tag.name}'))
            else:
                self.stdout.write(f'Etiket zaten mevcut: {tag.name}')
        
        self.stdout.write(self.style.SUCCESS(f'Toplam {created_count} etiket oluşturuldu'))

    def create_blog_posts(self, user):
        # Blog yazılarını oluşturma fonksiyonu
        
        # Önceden oluşturulan kategorileri ve etiketleri al
        categories = list(BlogCategory.objects.all())
        tags = list(BlogTag.objects.all())
        
        if not categories or not tags:
            self.stderr.write(self.style.ERROR('Kategoriler veya etiketler bulunamadı! Önce onları oluşturun.'))
            return
        
        # Örnek blog görselleri
        sample_images = [
            "https://cdn.pixabay.com/photo/2016/02/22/17/05/food-1216048_1280.jpg", # Peynir çeşitleri
            "https://cdn.pixabay.com/photo/2016/02/22/17/05/food-1216048_1280.jpg",   # Peynir tabağı
            "https://cdn.pixabay.com/photo/2016/02/22/17/05/food-1216048_1280.jpg" # Peynir imalatı
        ]
            
        # Örnek blog içerikleri - başlıklar ve içerikler
        blog_posts = [
            {
                "title": "Kaşar Peynirinin Tarihi ve Türkiye'deki Yolculuğu",
                "excerpt": "Kaşar peynirinin yüzyıllar öncesinden günümüze kadar olan hikayesi ve Türk mutfağındaki önemi hakkında detaylı bir inceleme.",
                "content": """
                <p>Kaşar peyniri, Türk mutfağının en sevilen ve tanınan peynirlerinden biridir. Yüzyıllar boyunca sofraları süsleyen bu peynir, sadece lezzetiyle değil, aynı zamanda tarihi ve kültürel önemiyle de dikkat çekiyor.</p>
                
                <h2>Tarihsel Kökeni</h2>
                <p>Kaşar peynirinin kökeni Balkan Yarımadası'na dayanmaktadır. Osmanlı İmparatorluğu döneminde, özellikle 16. yüzyıldan itibaren Anadolu'da yaygınlaşmaya başladı. "Kaşar" kelimesinin etimolojik kökeni tartışmalı olmakla birlikte, İtalyanca "cacio" (peynir) kelimesinden türediği düşünülmektedir.</p>
                
                <p>Doğu Avrupa ve Balkanlar'daki benzer peynirlerle (kaşkaval, kasseri) akraba olan kaşar peyniri, zaman içinde Türk damak tadına uygun bir form kazanmıştır. Özellikle Kars, Trakya ve Balıkesir bölgelerinde kendine özgü üretim teknikleri geliştirilmiştir.</p>
                
                <h2>Üretim Yöntemi</h2>
                <p>Geleneksel kaşar peyniri üretimi, koyun sütünden yapılmaktadır. Ancak günümüzde inek sütü veya karışık sütler de kullanılmaktadır. Üretim süreci şu aşamalardan oluşur:</p>
                
                <ol>
                    <li>Sütün mayalanması ve pıhtılaştırılması</li>
                    <li>Pıhtının kesilmesi ve peyniraltı suyunun ayrılması</li>
                    <li>Teleme haline gelen pıhtının fermente edilmesi</li>
                    <li>Haşlama işlemi (Bu aşama kaşar peynirinin karakteristik özelliğini kazandırır)</li>
                    <li>Kalıplama ve olgunlaştırma</li>
                </ol>
                
                <h2>Türk Mutfağındaki Yeri</h2>
                <p>Kaşar peyniri, Türk mutfağında çok yönlü kullanımıyla öne çıkar. Kahvaltıdan meze sofralarına, tost ve sandviçlerden makarna ve böreklere kadar pek çok yemekte kullanılır.</p>
                """,
                "category_names": ["Peynir Kültürü", "Yöresel Lezzetler"],
                "tag_names": ["kaşar", "türk mutfağı", "peynir", "kültür", "tarih"],
                "is_featured": True,
                "image_url": sample_images[0]
            },
            {
                "title": "Peynir ve Sağlık: Bilinmesi Gerekenler",
                "excerpt": "Peynirin sağlık üzerindeki etkileri, beslenmedeki yeri ve doğru tüketim miktarları hakkında uzman görüşleri.",
                "content": """
                <p>Peynir, binlerce yıldır insan beslenmesinin önemli bir parçası olmuştur. Protein, kalsiyum ve çeşitli vitaminler açısından zengin olan peynir, dengeli bir diyetin parçası olarak sağlığa birçok fayda sağlayabilir.</p>
                
                <h2>Peynirin Besin Değeri</h2>
                <p>Peynir, sütten yapılan ve konsantre besin değerlerine sahip bir süt ürünüdür. Besin değeri, peynirin çeşidine göre değişmekle birlikte, genel olarak şunları içerir:</p>
                
                <ul>
                    <li><strong>Protein:</strong> Yüksek kaliteli protein kaynağıdır ve tüm temel amino asitleri içerir.</li>
                    <li><strong>Kalsiyum:</strong> Kemik ve diş sağlığı için önemli bir mineraldir.</li>
                    <li><strong>Fosfor:</strong> Kemik sağlığı ve hücre fonksiyonları için gereklidir.</li>
                    <li><strong>B Vitaminleri:</strong> Özellikle B12 vitamini, sinir sistemi sağlığı için önemlidir.</li>
                </ul>
                
                <h2>Peynirin Sağlık Faydaları</h2>
                
                <h3>Kemik Sağlığı</h3>
                <p>Peynir, kalsiyum ve fosfor gibi kemik sağlığı için önemli minerallerin zengin bir kaynağıdır. Düzenli peynir tüketimi, özellikle yaşlanmayla birlikte artan osteoporoz riskini azaltmaya yardımcı olabilir.</p>
                
                <h2>Dikkat Edilmesi Gereken Hususlar</h2>
                <p>Peynirin faydaları yanında dikkat edilmesi gereken hususlar da vardır.</p>
                """,
                "category_names": ["Sağlıklı Yaşam"],
                "tag_names": ["sağlıklı beslenme", "protein", "kalsiyum", "peynir"],
                "is_featured": True,
                "image_url": sample_images[1]
            },
            {
                "title": "Ev Yapımı Peynir Tarifleri",
                "excerpt": "Evde kolayca hazırlayabileceğiniz çeşitli peynir tarifleri ve püf noktaları. Kendi peynirinizi yapmaya başlamak için adım adım rehber.",
                "content": """
                <p>Ev yapımı peynir, hem lezzetli hem de sağlıklı bir alternatiftir. Üstelik sandığınızdan çok daha kolay hazırlanabilir!</p>
                
                <h2>Ev Yapımı Labne Peyniri</h2>
                <p>Labne peyniri, Orta Doğu kökenli, yoğurttan yapılan kremalı bir peynir çeşididir. İşte adım adım yapılışı:</p>
                
                <h3>Malzemeler</h3>
                <ul>
                    <li>1 kg tam yağlı yoğurt</li>
                    <li>1 çay kaşığı tuz</li>
                    <li>İsteğe bağlı: Kuru nane, kekik, zeytinyağı</li>
                </ul>
                
                <h3>Hazırlanışı</h3>
                <ol>
                    <li>Yoğurt ve tuzu bir kasede iyice karıştırın.</li>
                    <li>Temiz bir tülbent ya da mutfak bezini iki kat yapıp bir süzgeç üzerine yerleştirin.</li>
                    <li>Yoğurdu bezin üzerine dökün ve kenarlarını kapatın.</li>
                    <li>Süzgeci, altına bir kase yerleştirerek buzdolabına koyun.</li>
                    <li>12-24 saat kadar süzdükten sonra labneniz hazır!</li>
                </ol>
                
                <h2>Ev Yapımı Lor Peyniri</h2>
                <p>Lor peyniri, süt proteininin pıhtılaştırılmasıyla elde edilen yumuşak bir peynir türüdür.</p>
                """,
                "category_names": ["Tarifler"],
                "tag_names": ["yemek tarifi", "peynir", "ev yapımı", "malzemeler"],
                "is_featured": False,
                "image_url": sample_images[2]
            }
        ]
        
        created_count = 0
        
        # Her blog yazısını veritabanına ekle
        for post_data in blog_posts:
            # Slug oluştur
            slug = slugify(post_data["title"])
            
            # Aynı başlıklı blog var mı kontrolü
            if Blog.objects.filter(slug=slug).exists():
                self.stdout.write(f'Blog yazısı zaten mevcut, atlanıyor: {post_data["title"]}')
                continue
            
            # Blog nesnesini oluştur
            blog_post = Blog(
                title=post_data["title"],
                slug=slug,
                excerpt=post_data["excerpt"],
                content=post_data["content"],
                author=user,
                status="published",
                published_at=timezone.now() - timedelta(days=random.randint(1, 30)),  # Rastgele bir geçmiş tarih
                is_featured=post_data["is_featured"],
                meta_description=post_data["excerpt"][:160]
            )
            
            # Görsel indir ve ekle
            if "image_url" in post_data and post_data["image_url"]:
                image_name = f"{slug}.jpg"
                image_content = self.download_image(post_data["image_url"], image_name)
                if image_content:
                    blog_post.featured_image.save(image_name, image_content, save=False)
                else:
                    # Görsel indirilemezse varsayılan olarak example.jpg kullan
                    blog_post.featured_image = "blog/images/2023/10/example.jpg"
            else:
                # Görsel URL'si verilmemişse varsayılan olarak example.jpg kullan
                blog_post.featured_image = "blog/images/2023/10/example.jpg"
            
            # Kaydet
            blog_post.save()
            
            # Kategorileri ekle
            for category_name in post_data["category_names"]:
                category = BlogCategory.objects.filter(name=category_name).first()
                if category:
                    blog_post.categories.add(category)
            
            # Etiketleri ekle
            for tag_name in post_data["tag_names"]:
                tag = BlogTag.objects.filter(name=tag_name).first()
                if tag:
                    blog_post.tags.add(tag)
            
            created_count += 1
            self.stdout.write(self.style.SUCCESS(f'Blog yazısı oluşturuldu: {post_data["title"]}'))
        
        self.stdout.write(self.style.SUCCESS(f'Toplam {created_count} blog yazısı oluşturuldu'))

    def download_image(self, url, filename):
        """Verilen URL'den görsel indir ve ContentFile olarak döndür"""
        try:
            image_content = urllib.request.urlopen(url).read()
            return ContentFile(image_content, name=filename)
        except Exception as e:
            self.stderr.write(self.style.ERROR(f'Görsel indirme hatası: {e}'))
            return None

       