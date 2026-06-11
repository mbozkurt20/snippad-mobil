# CLAUDE.md — Snippad Proje Anayasası

Bu dosya her oturumda geçerlidir. Kullanıcı tekrar etmek zorunda değildir.

## KİMLİK
Snippad: abonelik tabanlı klavye/şablon uygulaması (React Native + TypeScript).
Tasarım hedefi: App Store zirvesindeki uygulamalar (Revolut, Duolingo, Calm) seviyesi.
Tasarım kaynağı: SNIPPAD_TASARIM_SISTEMI.md (proje kökünde). Çelişkide o dosya kazanır.

## DEĞİŞMEZ KURALLAR
1. TEK tema kaynağı: `src/theme/theme.ts` + `src/theme/designTokens.ts`.
   ASLA yeni tema/renk/token dosyası oluşturma. Eksik token varsa mevcuta ekle.
2. Renkler: #FF5C00 / #0A0A0A / #FFFFFF + tanımlı nötrler. Ekran dosyasında
   hex literal YASAK — theme'den import et.
3. `lineHeight` React Native'de PİKSELDİR. 1.4 gibi çarpan yazmak metinleri
   üst üste bindirir. Her zaman: lineHeight ≈ fontSize × 1.4 (piksel, tam sayı).
4. Layout: tek dikey akış (flex column). position:absolute sadece
   Modal/Sheet/Toast/Overlay dosyalarında.
5. Sistem fontu. Serif, gradient, gölge, emoji YASAK.
6. Ekran başına 1 PrimaryButton. Butonlar min 44px.
7. UI bileşeni gerekiyorsa önce `src/components/ui/` ve
   `src/components/onboarding/` içindekini kullan; yoksa oraya ekle,
   ekran içinde inline tasarım yazma.
8. İş mantığına (store, API, navigation) görsel görevlerde dokunma.

## ZORUNLU İŞ AKIŞI — her UI değişikliğinde
1. Değişikliği yap.
2. `node scripts/design-lint.js` çalıştır. İhlal varsa DÜZELT, tekrar çalıştır.
   Lint geçmeden adım 3'e geçemezsin.
3. Emülatör açıksa görsel doğrulama döngüsü:
   a. `./scripts/screenshot.sh <ekran-adi>` ile görüntü al.
   b. Çıkan PNG'yi Read tool ile AÇ ve BAK.
   c. Şu kontrol listesini görüntü üzerinde doğrula:
      - [ ] Hiçbir metin üst üste binmiyor / kırpılmıyor / taşmıyor
      - [ ] Başlık sola yaslı, büyük ve kalın; alt metin gri
      - [ ] Turuncu ekranda en fazla 3 noktada
      - [ ] CTA altta sabit, tam genişlik, pill
      - [ ] Boşluklar dengeli (dev boş alan ya da sıkışıklık yok)
      - [ ] Dokunma hedefleri yeterli büyüklükte görünüyor
   d. Sorun gördüysen düzelt ve (a)'ya dön. Maksimum 3 tur; 3 turda
      çözülmediyse durumu ve denediklerini raporla, kullanıcıya sor.
4. Emülatör kapalıysa kullanıcıdan açmasını iste; "muhtemelen doğrudur"
   deyip geçme.
5. Raporunda şunu belirt: hangi dosyalar değişti, lint sonucu,
   görsel kontrol yapıldı mı.

## OTURUM BAŞI KONTROL
Her oturum başında `node scripts/design-lint.js` çalıştır; önceki oturumdan
kalan ihlal varsa önce onları temizle, sonra yeni göreve başla.

## YASAK DAVRANIŞLAR
- "Tasarımı iyileştirdim" deyip görsel doğrulama yapmadan bitirmek
- Yeni tema/stil dosyası açmak
- Kullanılmayan eski ekran dosyalarını referans almak
- Bir ekranı düzeltirken diğerlerinde kullanılan ortak bileşeni
  o ekrana özel davranışla bozmak (ortak bileşene prop ekle, davranışı kırma)
