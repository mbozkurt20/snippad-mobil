# DESIGN_REVIEW.md — İnceleme #001
Denetçi: Claude (web) · Kapsam: Auth ekranları + onboarding doğrulaması
Kaynak: src zip incelemesi (kod seviyesi tespit; görüntü incelemesi push sonrası yapılacak)

## TESPİT
LoginScreen, ForgotPasswordScreen, ChangePasswordScreen (ve Login içindeki
register akışı) tasarım sisteminden TAMAMEN kopuk: src/components/ui
bileşenlerini hiç kullanmıyorlar, eski `Colors` sabitinden besleniyorlar,
shadow kullanıyorlar (yasak), 17px ikonlar ve kendi inline input stilleri var.
Onboarding ile aralarındaki kalite farkının sebebi bu.

## YAPILACAKLAR

- [ ] R1. LoginScreen.tsx'i tasarım sistemine taşı:
      ScreenContainer + ScreenHeader yok ise ekle; tüm Text → AppText;
      tüm TextInput → AppInput (52px, radius 16, bg surfaceAlt, focus'ta
      primary border); giriş CTA → PrimaryButton; "Şifremi unuttum" →
      GhostButton; eski `Colors` importunu kaldır, theme'den al.
      Shadow tamamen kaldırılacak. İkon boyutu 18-20px, renk textSecondary.
- [ ] R2. Login üst bölümü: logo 64px turuncu kutu (radius 18) sola DEĞİL
      ortaya, altında h1 "Tekrar hoş geldin" (sola yaslı DEĞİL — auth
      ekranlarında başlık ve logo ortalı tek istisnadır), altında caption
      textSecondary tek satır. "appName + tagline" ikilisini kaldır.
- [ ] R3. Sosyal giriş butonları (Apple/Google): SecondaryButton görünümü
      (56px, pill) ama bg surface + border 1.5 colors.border, metin ink,
      sol içinde 20px marka ikonu. "Apple ile devam et" / "Google ile devam et".
      Mevcut 18-20px yükseklikli küçük butonlar kaldırılacak.
- [ ] R4. Register hata gösterimi: alert/toast YASAK. AppInput'un error
      prop'u kullanılacak — alan altında 12px danger metin, layout'u iterek
      (absolute değil). Şifre alanı altında canlı kural listesi: 3 satır
      hint, sağlanan kural primary'e döner (Check ikonu 14px).
- [ ] R5. ForgotPasswordScreen: tek AppInput + tek PrimaryButton.
      Başarıda aynı ekranda EmptyState görünümü (Mail ikonu, "E-postanı
      kontrol et", caption açıklama). Ayrı başarı ekranı/alert yok.
- [ ] R6. ChangePasswordScreen: 3 AppInput + R4'teki canlı kural listesi
      bileşeni (ortak bileşen yap: components/ui/PasswordRules.tsx).
- [ ] R7. Lint: bu 4 ekranda `node scripts/design-lint.js` sıfır ihlal.
- [ ] R8. Görsel doğrulama: emülatörde Login (boş + hatalı + dolu durum),
      Register (hata durumu), ForgotPassword (başarı durumu) görüntülerini
      .screenshots/ altına al ve push'la. Onboarding'in 5 ekranını da
      güncel haliyle ekle — istenen kaliteye uymayan noktaları denetçi
      görüntü üzerinden işaretleyecek.

## NOTLAR
- İş mantığına (auth API çağrıları, navigation, store) dokunma; yalnızca
  görsel katman.
- Bu ekranlar bitmeden başka ekrana geçme.
