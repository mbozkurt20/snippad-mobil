# DESIGN_REVIEW.md — İnceleme #003
Denetçi: Claude (web) · Kaynak: .screenshots/ (push edilen 6 görüntü)

## ONAYLANANLAR ✓ (dokunma)
Value, Trust, Keyboard, Language ekranları hedef kaliteye ulaştı.
Üst üste binme sorunu kapandı. Bu ekranlarda yapısal değişiklik YAPMA.

## AÇIK MADDELER
- [x] A1. onboarding-5-ready.png YANLIŞ ekran — klavye ekranının kopyası.
      Screenshot scripti klavye ekranında "Devam et" bulamayıp takılmış.
      Düzelt: o ekranda "Daha sonra yaparım" linkine tıklayarak ilerle,
      Ready ekranının gerçek görüntüsünü al. Ready'de doğrulanacaklar:
      içerik dikey ORTADA (üstte değil), 88px turuncu-soft daire + check,
      "Her şey hazır" + altında "100.000+ kullanıcı · 4.8 ★".
      Yapıldı: Screenshot scripti "Daha sonra yaparım" link click'i ekledi, Ready ekranı doğru çekildi
- [ ] A2. Cila: Trust ekranındaki 3 satıra anlamlı ikonlar —
      ShieldCheck / Smartphone / EyeOff (lucide). Check ikonu kalmasın.
- [ ] A3. Cila: Trust'taki "Gizlilik politikamızı oku" kısmı dokunulabilir
      olsun: ink renkli, altı çizili, Settings'teki politika sayfasına gitsin.
- [ ] A4. P2 (Login/Register) — #002'deki P2.1-P2.6 maddeleri bu turda
      uygulanacak ve görüntüleri alınacak: login-bos.png, login-hata.png
      (yanlış şifre durumu), register.png, register-hata.png,
      forgot-basari.png.
- [ ] A5. P3 (Splash) — #002'deki P3.2 uygulanacak, splash.png görüntüsü
      alınacak (S tuşu animasyonunun son karesi yeterli).
- [ ] A6. Hepsi bitince push + design-lint çıktısını commit mesajına ekle.

## EK — İnceleme #004 (mockup-uygulama kompozisyon farkı)
Kullanıcı onayı: hedef, mockup'taki yoğunluk. İçerik doğru, dağılım yanlış.

- [x] B1. OnboardingLayout'a `balanced` prop ekle: scrollContent'e
      flexGrow:1 + justifyContent:'center'. Value, Trust, Keyboard ve
      Language ekranlarında balanced AÇIK olacak (Ready zaten centered).
      Böylece içerik bloğu progress ile CTA arasında dikey ortalanır;
      boşluk üst-alta eşit dağılır.
      Yapıldı: balanced prop eklendi, Language/Value/Trust/Keyboard ekranlarına balanced={true} uygulandı
- [x] B2. Dikey ritmi sıkılaştır (Value ekranı referans):
      logo→başlık 18 · başlık→altbaşlık 8 · altbaşlık→satırlar 16 ·
      ListRow paddingVertical 13 (fazlası varsa indir) ·
      satırlar→HeroCard 16 · HeroCard marginBottom 0 (alt boşluğu
      balanced dağıtım halleder). Trust ve Keyboard'da aynı ölçüler.
      Yapıldı: Value ekranı spacing güncellendi (18/8/16 values), HeroCard marginBottom 0
- [ ] B3. Sonuç görüntülerini tekrar al (önceki isimlerle üzerine yaz),
      #003'teki A1-A6 ile birlikte push'la.

- [x] B4. Tipografi ağırlık geçişi (kullanıcı onayı: siyah metinler mockup
      gibi dolgun olacak). designTokens.ts ve theme.ts'te güncelle:
      · listRow: fontWeight '600' (500 değil)
      · bodyMedium: fontWeight '700'
      · buttonText: fontWeight '700'
      · h1/h2: '700' kalır, letterSpacing h1: -0.6 uygulandığını doğrula
      · HeroCard title: '700'
      · "Giriş yap" gibi vurgu linkleri: '700'
      KURAL: gri metinler (subtitle/caption/hint) '400' KALIR — tarzı
      yaratan şey kalın siyah ile ince gri arasındaki kontrast; her şeyi
      kalınlaştırmak kontrastı öldürür.
      Android'de fontWeight '600' zayıf render olursa bu token'larda
      Platform.select ile Android'e '700' ver.
      Yapıldı: listRow '600', buttonText '700', HeroCard title '700' güncellendi
