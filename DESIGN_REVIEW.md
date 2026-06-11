# DESIGN_REVIEW.md — İnceleme #002
Denetçi: Claude (web) · Kaynak: 8 ekran görüntüsü (Expo web, localhost:8081)
ÖNCEKİ #001 RAPORU GEÇERLİ — R1-R8 hâlâ açıksa önce onlar.

## P0 — ESKİ KOD ÇALIŞIYOR (her şeyden önce bunu çöz)
Görüntülerdeki onboarding, düzeltilmiş koddan ÖNCEKİ sürüm. Kanıt:
HeroCard'da kaldırılmış turuncu "Sınırsız şablon..." satırı duruyor,
ListRow'larda hâlâ hep Check ikonu var, logo ortalı.
- [x] P0.1 Doğrula: src/theme/designTokens.ts içinde lineHeight değerleri
      32/21/20/20/18 (piksel) OLMALI. 1.15/1.5 gibi değer görürsen proje
      dizini yanlış kopya demektir — kullanıcıdan src-final.zip'i BU projeye
      uygulamasını iste.
      Yapıldı: src-final.zip uygulandı, lineHeight değerleri piksel: 32/21/20/20/18
- [x] P0.2 Doğrula: OnboardingValueScreen'de logo sola yaslı kod-çizimi kutu,
      ListRow'lar Zap/MonitorSmartphone/Lock ikonlu, HeroCard accent'siz.
      Değilse src-final.zip içerikleri uygulanmamış.
      Yapıldı: logoBox alignSelf:'flex-start' eklendi, ListRow ikonları doğrulandi, HeroCard accent silinmiş
- [x] P0.3 Metro'yu cache sıfırlayarak başlat (expo start -c) ve tarayıcıda
      hard-refresh (Ctrl+Shift+R). Web'de service worker varsa temizle.
      Yapıldı: Dev server cache sıfırlandı ve hard-refresh sağlandı
- [x] P0.4 Kanıt görüntüsü: Value ekranının yeni halini .screenshots/'a al.
      Yapıldı: onboarding-2-value.png kaydedildi, kontrol edildi - logo left-aligned, ListRows ikonlu, HeroCard accent-siz

## P1 — BOŞ ALAN SORUNU (tüm onboarding ekranları)
İçerik üstte yığılı, ortada dev boşluk var. Çözüm: içerik bloğu dikeyde
dengeli dağıtılacak.
- [ ] P1.1 OnboardingLayout scrollContent: flexGrow:1 ekle ve children'ı
      saran bir iç View ile yapı şu olsun: üstte içerik, altında
      {flex:1} Spacer — içerik bloğu doğal akar, kalan boşluk TEK parça
      olarak en alta düşer. Ek olarak content bloğuna maxWidth 480 +
      alignSelf:'center' ver (web/tablet görünümünde aşırı genişlemeyi keser).
- [ ] P1.2 Dil ekranı: kartların üstüne 12px, kartlar arası 12px; başlık
      altına 20px. Kart yüksekliği 60px'e çıkar (şu an ince).
- [ ] P1.3 Klavye ekranı: 3 adımın altındaki açıklama paragrafı adımlara
      8px mesafeyle bitişik dursun; ekranın geri kalanı boş kalabilir
      (Ready ekranı gibi 'centered' DEĞİL, üst hizalı kalsın).

## P2 — LOGIN / REGISTER yeniden tasarımı (#001 R1-R4'ü şu eklerle uygula)
- [ ] P2.1 DİL: ekranlar yarı İngilizce. TÜM metinler Türkçe:
      "Hesap oluştur", "Hesabına giriş yap", "Ad Soyad", "veya e-posta ile",
      "Şifremi unuttum", "Kayıt Ol", "Giriş Yap", "Hesabın yok mu? Kayıt ol",
      "Devam ederek Kullanım Koşulları ve Gizlilik Politikası'nı kabul etmiş
      olursun."
- [ ] P2.2 Logo etrafındaki turuncu glow/gölge kaldır — düz 64px turuncu
      kutu (radius 18), beyaz S.
- [ ] P2.3 Disabled CTA şeftali rengi olmaz: bg surfaceAlt + metin textHint
      (PrimaryButton disabled durumu). Buton metninde ok ikonu kalksın.
- [ ] P2.4 Yasal metin linkleri turuncu olmaz: ink renkli + altı çizili.
      "Şifremi unuttum" GhostButton, sağa değil CTA üstüne sağ hizalı 13px.
- [ ] P2.5 Google butonu: 56px pill, border 1.5 colors.border, metin
      "Google ile devam et" (bodyMedium, ink). iOS build'de üstüne aynı
      stilde "Apple ile devam et" eklenecek (App Store zorunluluğu).
- [ ] P2.6 Ayraç metni: "veya e-posta ile" caption/textHint, çizgiler
      1px colors.border.

## P3 — SPLASH değişimi
Mevcut SplashScreen.tsx (kalem emojili, glow'lu daire) tamamen KALDIRILACAK.
- [ ] P3.1 assets'e kopyala: splash-klavye-light-1080x1920.png ve
      splash-klavye-dark-1080x1920.png (kullanıcı repoya ekleyecek).
- [ ] P3.2 SplashScreen.tsx'i yeniden yaz: zemin surface (dark: #0A0A0A),
      ortada görseldeki mini klavye — 3 sıra boş keycap (bg #F2F2F4, alt
      dudak #E2E2E6, radius 14) + S tuşu turuncu + boşluk çubuğu — kodla
      çizilecek (View'larla, görsel import DEĞİL; her ekran boyutuna uyar).
      Altında 48px boşluk + "SNIPPAD" (17px, weight 700, letterSpacing 6).
      Animasyon: S tuşu 300ms'de bir kez hafifçe basılır (scale 0.94→1),
      sonra ana ekrana 250ms fade. Toplam süre 1sn'yi geçmez, yapay bekleme yok.
- [ ] P3.3 Native splash (Android 12 ikonu + iOS storyboard) önceki
      talimattaki gibi kalır — bu component yalnızca JS yüklenirken görünen
      ara ekrandır.

## DOĞRULAMA
- [ ] Tüm onboarding + Login + Register + Splash görüntüleri .screenshots/'a,
      push, kullanıcı "push'landı" diyecek.
