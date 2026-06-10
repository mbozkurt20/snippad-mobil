
KLAVYEM PROJESİ - ADIM ADIM YEREL (LOCAL) GELİŞTİRME REHBERİ
1. GELİŞTİRME STRATEJİSİ (ÖNCE MOBİL VE YEREL HAFIZA)
Bu projenin ilk aşamasında hiçbir backend (sunucu/veritabanı) kullanılmayacaktır. Tüm kullanıcı verileri, oluşturulan dinamik kategoriler, şablonlar ve hatta kullanıcının "Premium" olup olmadığı bilgisi cihazın kendi yerel hafızasında (react-native-mmkv / App Groups) tutulacaktır. Sistem klavyesi eklentisi de verileri doğrudan bu yerel hafızadan okuyacaktır. Mobil taraf %100 bittikten sonra backend entegrasyonuna geçilecektir.

2. UYGULAMA İÇİNDE YAPILACAK EKRANLAR VE YEREL MANTIKLARI
Ekran 1: Onboarding (Karşılama ve Kurulum Rehberi)

Kullanıcıyı karşılar. İlk aşamada giriş yapma zorunluluğu simüle edilecektir (Kullanıcı "Giriş Yap" butonuna bastığı an doğrudan yerel hafızaya geçici bir kullanıcı ID'si atanır ve Dashboard'a yönlendirilir).

Ekranda kullanıcının sistem ayarlarına gidip klavyeyi nasıl aktif hale getireceğini ve "Tam Erişim (Full Access)" iznini nasıl vereceğini adım adım anlatan görsel bir rehber yer alır.

Ekran 2: Dashboard (Kategori ve Şablon Yönetim Paneli)

Uygulamanın kalbidir. Kullanıcı + Yeni Kategori Ekle butonuna bastığında bir modal açılır; kategori adı, ikon ve tür (metin, iban, adres) seçilir.

Eklenen her kategori ve altına eklenen her şablon metni, anlık olarak react-native-mmkv (App Groups) içine JSON formatında serialize edilerek kaydedilir.

Zustand store yapısı, her veri eklendiğinde veya silindiğinde yerel hafızayı günceller ve klavyenin bu veriyi anında okumasını sağlar.

Limit Kontrolü: Kullanıcı yeni bir kategori eklemek istediğinde, yerel hafızadaki kategori sayısı kontrol edilir. Eğer sayı 2'ye ulaşmışsa ve yerel hafızadaki is_premium değeri false ise, kategoriyi ekletmez ve doğrudan Paywall ekranını açar.

Ekran 3: Paywall (Abonelik / Ödeme Ekranı)

Premium avantajlar listelenir. Aylık ve Yıllık paket kartları yer alır.

Simülasyon Mantığı: İlk aşamada gerçek bir kredi kartı veya RevenueCat entegrasyonu yerine, kullanıcı "Satın Al" butonuna bastığı an yerel hafızadaki (MMKV) is_premium flag'i true olarak güncellenecek ve Dashboard ekranına başarıyla yönlendirilecektir. Böylece premium limitlerin kalktığı yerelde test edilebilecektir.

Ekran 4: Ayarlar ve Verimlilik İstatistikleri

Kullanıcı bilgileri ve yerel hafıza sıfırlama butonu yer alır.

"Tasarruf Edilen Süre" sayacı, kullanıcının klavyede şablonlara kaç kez bastığı bilgisi üzerinden hesaplanır (Her basım yerel hafızada bir sayacı +1 artırır ve burada ekrana yansıtılır).

3. SİSTEM KLAVYESİ EKLENTİSİ (KEYBOARD EXTENSION)
Kullanıcı WhatsApp veya başka bir uygulamada yazı yazarken açılan yerel klavye eklentisidir:

Harflerin hemen üzerinde 45px yüksekliğinde, yatayda kaydırılabilen şık bir araç çubuğu (Dock) yer alır.

Klavye eklentisi (iOS Swift / Android Kotlin) açıldığı anda hiçbir internet isteği atmaz. Doğrudan ana uygulamanın ortak hafıza alanına (group.com.klavyem.shared) bağlanır ve oradaki kategori JSON'ını okuyarak araç çubuğunu çizer.

Kullanıcı bir kategoriye dokunduğunda yerel hafızadaki şablonlar listelenir ve dokunulduğu an metin kutusuna yazdırılır.

4. YEREL VERİ YAPISI (LOCAL JSON SCHEMA)
Uygulamanın yerel hafızada (MMKV) tutacağı ve diğer tüm katmanların okuyacağı örnek veri mimarisi şu şekilde olmalıdır:

JSON

{
  "user_settings": {
    "is_premium": false,
    "usage_count": 12
  },
  "keyboard_data": [
    {
      "id": "cat_1",
      "name": "Şahsi IBAN'lar",
      "type": "iban",
      "icon": "bank",
      "templates": [
        { "id": "temp_1", "title": "Garanti", "content": "TR73 0006..." },
        { "id": "temp_2", "title": "İş Bankası", "content": "TR12 0006..." }
      ]
    },
    {
      "id": "cat_2",
      "name": "Ev Adresi",
      "type": "address",
      "icon": "map-pin",
      "templates": [
        { "id": "temp_3", "title": "Ev Açık Adres", "content": "Atatürk Mah. ..." }
      ]
    }
  ]
}
5. AI İÇİN ADIM ADIM KODLAMA SIRASI
Projeyi React Native bare workflow olarak başlat ve react-native-mmkv paketini ortak grup kimliğiyle (group.com.klavyem.shared) yapılandır.

Zustand store'u yukarıdaki JSON şemasına göre inşa et. Tüm ekleme, silme ve premium durum güncelleme fonksiyonları doğrudan yerel hafızaya yazsın.

Uygulamanın 4 ekranını (Onboarding, Dashboard, Paywall, Ayarlar) yerel state'leri ve limitleri (2 kategori, 3 şablon kısıtlaması) kontrol edecek şekilde kodla.

iOS ve Android için native klavye eklentilerini oluştur ve bu eklentilerin ortak hafıza alanındaki keyboard_data ve user_settings nesnelerini canlı olarak okumasını sağla.