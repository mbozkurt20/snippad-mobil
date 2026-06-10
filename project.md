KLAVYEM PROJESİ - ADIM ADIM GELİŞTİRME VE EKRAN PLANLAMA DÖKÜMANI
1. PROJE ÖZETİ VE ÇALIŞMA MANTIĞI
Uygulamanın adı "Klavyem" olacaktır. Bu proje, kullanıcıların (esnaf, freelancer, çalışan) sık kullandıkları metin şablonlarını, IBAN numaralarını, adresleri ve fiyat listelerini kendi oluşturdukları dinamik kategoriler altında sakladıkları bir mobil uygulamadır. Sistem, işletim sisteminin orijinal klavye düzeninin üzerine şık bir araç çubuğu (dock) ekler. Kullanıcı herhangi bir mesajlaşma uygulamasındayken (WhatsApp, Instagram vb.) bu araç çubuğundan ilgili şablona tek dokunuşla basarak metni doğrudan mesaj kutusuna yapıştırır.

2. UYGULAMA İÇİNDE YAPILACAK EKRANLAR (MOBİL ARAYÜZ)
Mobil uygulama React Native ile kodlanacak ve toplam 4 ana ekrandan oluşacaktır:

Ekran 1: Onboarding (Karşılama ve Kurulum Rehberi)

Kullanıcı uygulamayı ilk açtığında Apple veya Google Login ile giriş yapar.

Ekranda kullanıcının sistem ayarlarına gidip klavyeyi nasıl aktif hale getireceğini ve "Tam Erişim (Full Access)" iznini nasıl vereceğini adım adım anlatan interaktif, görsel bir rehber yer alır.

Ayarlar sayfasına doğrudan yönlendiren bir buton bulunur.

Ekran 2: Dashboard (Kategori ve Şablon Yönetim Paneli)

Uygulamanın ana yönetim merkezidir.

Kullanıcıların kendi işlerine göre dinamik olarak yeni kategoriler (Örn: "Şirket IBAN'ları", "Depo Adresleri", "Fiyat Listeleri") ekleyebileceği bir buton yer alır. Kategori eklerken simge (ikon) ve kategori türü (metin, iban, adres) seçtirilir.

Eklenen kategoriler listelenir. Bir kategoriye tıklandığında, altına yeni şablon metinleri ve başlıkları eklenebilecek bir alt form açılır.

Kategorilerin klavyede hangi sıra ile görüneceğini belirlemek için sürükle-bırak (sorting) özelliği bulunur.

Ekran 3: Paywall (Abonelik / Ödeme Ekranı)

Ücretsiz kullanım sınırlarına takılan kullanıcıların karşısına çıkan satın alma ekranıdır.

Premium sürümün avantajları (sınırsız kategori, bulut yedekleme, akıllı değişkenler) maddeler halinde listelenir.

Aylık ve Yıllık abonelik paket seçim kartları bulunur ve doğrudan cihazın yerel ödeme sistemini (In-App Purchase) tetikler.

Ekran 4: Ayarlar ve Verimlilik İstatistikleri

Kullanıcının profil bilgileri ve bulut senkronizasyon durumu yer alır.

Esnafın motivasyonunu artırmak için "Bu ay Klavyem sayesinde mesajlaşırken tasarruf ettiğiniz toplam süre" şeklinde dinamik bir zaman sayacı (istatistik) gösterilir.

Hesabı silme ve çıkış yapma butonları bulunur.

3. SİSTEM KLAVYESİ EKLENTİSİ (KEYBOARD EXTENSION)
Kullanıcı WhatsApp veya Instagram'da yazı yazarken açılan yerel klavye eklentisidir (iOS için SwiftUI, Android için Kotlin Jetpack Compose ile yazılacaktır):

Harflerin hemen üzerinde 45px yüksekliğinde, yatayda kaydırılabilen (horizontal scroll) şık bir araç çubuğu (Dock) yer alır.

Bu çubukta kullanıcının ana uygulamada oluşturduğu dinamik kategoriler ikonları ve isimleriyle yan yana dizilir.

Kullanıcı bir kategoriye (Örn: 🏦 IBAN) dokunduğu an, harflerin üzerinde şık kartlar halinde o kategoriye ait şablonlar (Örn: [Garanti Bankası - TR73...]) listelenir.

Şablona dokunulduğu an, metin sıfır gecikmeyle mesaj kutusuna yapışır.

Araç çubuğunun en sağında bir çark (Ayarlar) simgesi bulunur. Buna basıldığında kullanıcı mesajlaşma uygulamasından çıkmadan direkt ana uygulamanın Dashboard ekranına yönlendirilir (Deep Linking).

4. ÜCRETSİZ SÜRÜM SINIRLARI (FREEMIUM LIMITS)
Kullanıcıların premium aboneliğe geçmesini tetikleyecek kısıtlamalar şunlardır:

Kategori Sınırı: Ücretsiz kullanıcı en fazla 2 adet dinamik kategori oluşturabilir. Üçüncü kategoriyi eklemek istediğinde ödeme ekranı açılır.

Şablon Sınırı: Her kategorinin altında en fazla 3 adet hazır şablon metni eklenebilir.

Dinamik Değişken Engeli: Şablonun içine {isim}, {saat} gibi otomatik doldurmalı akıllı alanlar ekleme ve bunları klavyede kullanma özelliği sadece premium üyelere açıktır.

Yedekleme Sınırı: Ücretsiz kullanıcıların verileri sadece telefonda saklanır (sunucuya yedeklenmez). Premium üyelerin verileri anında buluta senkronize edilir.

5. GELİŞTİRME ADIMLARI VE SIRA PLANLAMASI
AI modeli projeyi yazarken şu sırayı takip etmelidir:

1. Adım: React Native projesinin çıplak (bare workflow) olarak başlatılması ve yerel ortak hafıza kütüphanesinin (MMKV) kurulması.

2. Adım: iOS tarafında Xcode üzerinden "Custom Keyboard Extension" target'ının eklenmesi ve ana uygulama ile eklentinin aynı veriyi okuyabilmesi için "App Groups" konfigürasyonunun yapılması. Android tarafında "InputMethodService" yapısının kurulması.

3. Adım: Ana uygulamadaki 4 ekranın (Onboarding, Dashboard, Paywall, Ayarlar) arayüz kodlarının yazılması ve Zustand ile state yönetiminin yerel ortak hafızaya (App Group) bağlanması.

4. Adım: Sistem klavyesinin yerel arayüzünün (SwiftUI ve Jetpack Compose) kodlanması. Ortak hafızadan kategorileri çekip yukarıdaki araç çubuğuna basma ve metin kutusuna yazdırma mantığının kurulması.

5. Adım: RevenueCat entegrasyonunun tamamlanarak abonelik duvarının (Paywall) aktif edilmesi ve ücretsiz sınırların kodla kısıtlanması.
