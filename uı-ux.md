KLAVYEM - UI/UX TASARIM SİSTEMİ (VISUAL GUIDE)
1. TASARIM FELSEFESİ
Uygulama, "Modern High-End Utility" estetiğine sahip olacaktır. Çok yumuşak geçişler, derinlik hissi veren gölgeler ve devasa (pill-shaped) yuvarlatılmış köşeler kullanılacaktır. Karmaşadan uzak, her elementin nefes aldığı (white-space) bir yapı kurulacaktır.

2. RENK PALETİ VE TİPOGRAFİ
Ana Arka Plan: #FFFFFF (Saf Beyaz).

Kart Arka Planları: #F3F4F6 (Çok açık gri) veya #F5F3FF (Çok hafif lavanta).

Vurgu Rengi (Accent): #6366F1 (Canlı İndigo/Mor) - Butonlar ve aktif durumlar için.

Ana Metin: #1E1B4B (Çok koyu lacivert/siyah) - Başlıklar ve okunabilirlik için.

Tipografi: Modern Sans-Serif (Inter veya Poppins). Başlıklar "Semi-Bold", gövde metinleri "Regular" olacaktır.

3. EKRAN BİLEŞENLERİ VE YERLEŞİM (GÖRSEL ODAKLI)
A. Dashboard (Kategori Yönetimi)
Kart Yapısı: Kategoriler yan yana 2'li grid (izgara) yapısında olacaktır.

Köşe Yumuşatma: Tüm kartlar border-radius: 32px değerine sahip olacaktır (Görseldeki devasa yuvarlaklık).

İkonlar: Her kategorinin kendine ait, pastel renkli bir arka plan dairesi içinde minimalist bir ikonu olacaktır.

İstatistik Kartı: En üstte "Tasarruf Edilen Süre" kartı, geniş ve üzerinde hafif bir gradyan (#6366F1 -> #A5B4FC) ile gösterilecektir.

B. Profil ve Hesap Ekranı (Görseldeki "Account" Sayfası)
Header (Başlık): En üstte büyük bir profil fotoğrafı (Yuvarlak) ve yanında kullanıcı ismi yer alacaktır.

Ana Aksiyon Izgarası (Pill Buttons): Profilin hemen altında 2x2 düzeninde 4 adet devasa "Pill" (hap şeklinde) buton yer alacaktır. (Görseldeki: View preference, Download options vb. gibi).

Bu butonlar IBAN ekleme, Adres ekleme gibi ana fonksiyonlar için kullanılacaktır.

Bu butonların köşeleri tam yuvarlaktır (rounded-full).

Alt Menü Listesi: Bu butonların altında "Hesap Ayarları", "Yardım ve Destek" gibi seçenekler, ince ayırıcı çizgiler ve sağda minik ok ikonları (chevron-right) ile liste şeklinde dizilecektir.

C. Navigasyon (Bottom Bar)
Floating Navigation: Alt menü çubuğu ekranın en altına yapışık değil, hafifçe havada duran (floating), beyaz ve yumuşak gölgeli bir "kapsül" içinde olacaktır.

İkonlar: Aktif olan ikon Indigo renginde parlayacak, altında küçük bir nokta (dot) veya isim yer alacaktır.

4. ETKİLEŞİM VE UX KURALLARI
Haptic Feedback: Kullanıcı bir şablona tıkladığında veya bir kartı kaydırdığında hafif bir titreşim (haptic) hissetmelidir.

Smooth Transitions: Sayfa geçişleri "Fade in/out" yerine sağdan sola "Slide" şeklinde çok akıcı olacaktır.

Empty State: Eğer kategori yoksa, ekranda çok estetik, hafif bir illüstrasyon ve "İlk kategorini oluştur" yazan büyük Indigo bir buton gösterilecektir.

5. ABONELİK (PAYWALL) TASARIMI
Abonelik ekranı tam sayfa (Full Screen) Indigo gradyanlı bir arka plana sahip olacaktır.

Fiyat kartları beyaz, çok yüksek köşe yuvarlaklığına sahip ve üzerinde "Popüler" gibi küçük etiketler (badges) barındıracaktır.

"Satın Al" butonu ekranın en altında, her zaman görünür ve büyük olacaktır.

AI Prompt Notu: "Lütfen tasarımı kodlarken Tailwind CSS sınıflarını kullan ve görsele sadık kalarak rounded-3xl ve rounded-full değerlerini cesurca kullan. Tasarımın ferah, lüks ve kullanıcı dostu olduğundan emin ol."