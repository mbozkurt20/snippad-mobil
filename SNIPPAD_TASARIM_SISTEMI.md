# Snippad — Tasarım Sistemi ve Ekran Yenileme Planı (React Native)

Bu doküman projenin TEK tasarım kaynağıdır. Tüm ekranlar buradaki tema ve
bileşenlerle yeniden yazılacak. Kurallar kesindir; "daha iyi olur" diye sapma.

## ÇALIŞMA KURALI (önce oku)

- Fazları SIRAYLA yap. Bir faz bitmeden sonrakine geçme.
- Her fazdan sonra dur ve değişen ekranların listesini raporla.
- Ekran içinde inline renk/boyut YAZMA. Tüm değerler theme.ts'ten gelir.
  `#` ile başlayan renk literali ekran dosyasında görülürse o kod hatalıdır.
- Mevcut iş mantığını (state, API çağrıları, navigasyon) DEĞİŞTİRME;
  sadece görsel katmanı yeniden yaz.
- Layout'ta position:absolute yasak (modal/toast hariç). Her ekran:
  SafeAreaView > ScrollView/View (flex:1) > alt sabit CTA bloğu düzeninde.

---

## FAZ 0 — Tema + Çekirdek Bileşenler (her şeyden önce)

### src/theme/theme.ts — birebir bu dosyayı oluştur:

```ts
export const colors = {
  primary: '#FF5C00',
  primarySoft: '#FFF0E8',
  primaryDark: '#C24600',
  ink: '#0A0A0A',
  surface: '#FFFFFF',
  surfaceAlt: '#F5F5F5',
  border: '#EBEBEB',
  textPrimary: '#0A0A0A',
  textSecondary: '#8A8A8A',
  textHint: '#B5B5B5',
  white: '#FFFFFF',
  danger: '#E5484D', // sadece hata metni/ikonu; buton zemini olamaz
} as const;

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.6, lineHeight: 33 },
  h2: { fontSize: 20, fontWeight: '700' as const, letterSpacing: -0.3, lineHeight: 25 },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  bodyMedium: { fontSize: 15, fontWeight: '600' as const, lineHeight: 22 },
  caption: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  hint: { fontSize: 12, fontWeight: '400' as const, lineHeight: 17 },
  button: { fontSize: 15, fontWeight: '600' as const },
};

export const layout = {
  screenPadding: 22,
  radiusSm: 11,
  radiusMd: 16,
  radiusLg: 20,
  radiusPill: 28,
  buttonHeight: 56,
  inputHeight: 52,
  iconBox: 36,
  gap: { xs: 4, sm: 8, md: 12, lg: 18, xl: 24, xxl: 32 },
};
```

Font: sistem fontu kalır (iOS SF Pro / Android Roboto). Özel font ekleme.
Serif hiçbir yerde kullanılmaz.

### src/components/ui/ — şu bileşenleri oluştur:

1. **ScreenContainer**: SafeAreaView + opsiyonel ScrollView, yatay padding 22,
   zemin colors.surface. Prop: `scroll?: boolean`, `footer?: ReactNode`
   (footer alta sabitlenir, üstüne 16px iç boşluk + safe area).
2. **AppText**: variant prop'lu Text sarmalayıcı (h1|h2|body|bodyMedium|caption|hint),
   color prop'u theme anahtarı alır. Projede çıplak `<Text>` kullanımı yasak.
3. **PrimaryButton**: yükseklik 56, radius 28 (pill), bg primary, metin beyaz.
   Pressed: opacity 0.9 + scale 0.97 (150ms). Disabled: bg surfaceAlt + metin textHint.
   Prop: `loading` (spinner beyaz, metin gizlenir). Bir ekranda en fazla 1 adet.
4. **SecondaryButton**: aynı boyutlar, bg ink, metin beyaz.
5. **GhostButton**: zeminsiz, metin primary 15/600, yükseklik 48.
6. **ListRow**: 36x36 radius-11 primarySoft ikon kutusu (içinde 18px primary ikon) +
   bodyMedium tek satır metin + opsiyonel sağ eleman (chevron/switch/badge).
   Dikey padding 13, satırlar arası 1px border ayraç. Settings ve onboarding
   listelerinin tamamı bu bileşenle yazılır.
7. **Card**: bg surface, border 1.5 colors.border, radius 20, padding 16-18.
   Gölge YOK. Varyant `hero`: bg ink, radius 16 (içinde vurgu sadece primary,
   ikincil metin #999999).
8. **SelectionCard**: radius 18, border 1.5 border. Seçili: border 2 primary,
   bg #FFF7F2, sağda check ikonu primary, 200ms geçiş + Haptics.light.
   Min yükseklik 56.
9. **AppInput**: yükseklik 52, radius 16, bg surfaceAlt, border yok; focus'ta
   border 1.5 primary + bg surface (200ms). Label üstte caption/textSecondary.
   Hata durumu: border 1.5 danger + altında hint boyutunda danger mesaj
   (ikonlu değil, sade metin). Hata mesajı alan ALTINDA durur, layout'u iter
   (absolute değil) — üst üste binme buradan çıkıyordu.
10. **ScreenHeader**: solda 40x40 dokunma alanlı geri oku (chevron-left, ink),
    ortada h2 başlık (opsiyonel), sağda opsiyonel aksiyon. Yükseklik 56.
    Alt çizgi yok; scroll'da içerik altından akar.
11. **Badge**: caption/600, padding 4x10, radius pill. Varyantlar:
    primary (bg primarySoft, metin primaryDark), ink (bg ink, metin beyaz).
12. **EmptyState**: ortalanmış 56px primarySoft daire içinde ikon + h2 +
    body/textSecondary açıklama (1 cümle) + GhostButton aksiyon.
    Boş liste gösteren HER ekran bunu kullanır.
13. **Toggle**: RN Switch, trackColor açık: {false: '#EBEBEB', true: '#FF5C00'}.
14. **SectionTitle**: caption/600, textSecondary, letterSpacing 1,
    BÜYÜK HARF, üstünde 24 altında 8 boşluk. (Settings gruplama için.)

Faz 0 çıktısı: theme.ts + 14 bileşen + örnek olarak SettingsScreen'in
bu bileşenlerle yeniden yazılmış hali. DUR ve raporla.

---

## FAZ 1 — İlk izlenim: Onboarding + Auth

**OnboardingScreen / OnboardingFlowScreen**: Daha önce verilen onboarding
talimatı geçerli (5 ekran: dil → değer → güven → klavye → hazır). İkisinden
tek bir akış kalsın; kullanılmayan dosyayı sil. Progress: aktif 24px primary /
pasif 8px border çubuklar. Başlıkta "Adım X" yasak. Stagger animasyonu yok.

**LoginScreen / WebSignInScreen**: h1 "Tekrar hoş geldin" + AppInput'lar +
PrimaryButton "Giriş yap" + GhostButton "Şifremi unuttum". Sosyal girişler
varsa SecondaryButton görünümünde, ikonlu, "Apple ile devam et" formatında.
Kayıt linki en altta: body/textSecondary + "Kayıt ol" kısmı ink/600.

**Register (LoginScreen içindeyse ayrıştır)**: Hata mesajları alan altında
AppInput'un hata durumuyla gösterilir — toast/alert ile DEĞİL. Şifre alanında
canlı kural listesi: 3 satır hint boyutunda, sağlanan kural textSecondary →
primary'e döner (check ikonu ile). Form gönderiminde ilk hatalı alana scroll.

**ForgotPasswordScreen**: tek input + tek CTA. Başarı durumu ayrı ekran
değil, aynı ekranda EmptyState benzeri onay görünümü (ikon + "E-postanı
kontrol et" + açıklama).

**ChangePasswordScreen**: 3 AppInput + canlı kural listesi (Register ile aynı
bileşen). Başarıda toast + geri dön.

DUR, ekran görüntüsü alınabilsin diye raporla.

---

## FAZ 2 — Çekirdek: Dashboard + Şablonlar + Klavye

**DashboardScreen**: Üstte selamlama bloğu (h1 "Merhaba" + caption tarih,
sağda 40px profil dairesi). Bir adet hero Card: bu haftanın kullanım sayısı
(28px/700 beyaz sayı) + mini bar grafik (en yüksek bar primary, diğerleri
#2E2E2E). Altında 2'li grid hızlı aksiyon kartları (Card + 20px primary ikon +
bodyMedium başlık, min yükseklik 96). Altında SectionTitle "SON ŞABLONLAR" +
ListRow listesi. Dashboard'da 2'den fazla renk vurgusu olamaz.

**TemplateManagerScreen**: arama çubuğu (AppInput, radius pill, sol içinde
search ikonu) + yatay kategori chip'leri (Badge boyutunda, seçili ink, normal
surfaceAlt) + şablon kartları: Card içinde başlık bodyMedium + 2 satır
clamp'li body/textSecondary önizleme + altta caption tarih ve tip Badge'i.
Boşsa EmptyState ("İlk şablonunu oluştur").

**TemplateImportScreen / BusinessImportScreen**: adım adım yapı —
üstte ne yapılacağını anlatan h2 + body, ortada büyük dokunulabilir
yükleme alanı (Card, kesikli border 1.5 primary, 28px ikon, "Dosya seç"),
içe aktarım listesi ListRow + sağda durum Badge'i. İlerleme: ince 4px
primary bar, yüzde metni caption.

**KeyboardPreviewScreen**: gerçek klavye görünümü ekranın alt yarısında,
üst yarıda h1 + ayar ListRow'ları. Önizleme alanı surfaceAlt zemin radius 20
içinde durur.

**DeletedCategoriesScreen**: ListRow listesi + sağda GhostButton "Geri al".
Boşsa EmptyState ("Silinmiş öğe yok"). Kalıcı silme onayı: alttan açılan
sheet (radius üst 20), danger metinli GhostButton — kırmızı zeminli buton yok.

DUR ve raporla.

---

## FAZ 3 — Gelir: Paywall + Referans + Paketler

**PaywallScreen**: Sağ üstte X (24px, textHint, 44px dokunma alanı, gecikmesiz
görünür). h1 fayda odaklı ("Sınırsız şablon, tüm cihazlarda"). 4 ListRow fayda
(primary check ikonları). Plan kartları SelectionCard: yıllık olan önseçili +
üstünde "%40 tasarruf" Badge (primary varyant), kart içinde solda plan adı
bodyMedium + altında caption aylık kırılım ("₺74,99/ay olarak yansır"), sağda
fiyat 17/700. CTA üstünde hint satırı: "İstediğin zaman iptal et · Bitmeden
hatırlatırız". CTA metni "3 gün ücretsiz dene" (fiyat butonda yazmaz).
Altında GhostButton "Satın alımları geri yükle". Sahte sayaç, sahte indirim,
gizli X YASAK.

**ReferralProgramScreen**: hero Card içinde davet kodu (20/700 beyaz,
harf aralığı 2) + yanında kopyala ikonu, altında "kodu paylaş" PrimaryButton
(Share API). Kazanım durumu: 2'li metrik kart (surfaceAlt, caption etiket +
24/700 sayı). Nasıl çalışır: 3 numaralı ListRow (28px primarySoft daire
içinde rakam).

**SectorPacksScreen**: 2'li grid Card — 36px primarySoft ikon kutusu +
bodyMedium paket adı + caption şablon sayısı + alt köşede mini Badge
("Hukuk", "Sağlık"...). Yüklü olan: border 2 primary + check. Paket detayı
alttan sheet ile açılır, içinde şablon ListRow önizlemeleri + CTA "Paketi ekle".

DUR ve raporla.

---

## FAZ 4 — Ayarlar kümesi

**SettingsScreen**: SectionTitle ile gruplanmış ListRow'lar
(HESAP / KLAVYE / VERİ / DESTEK). Her satır: ikon + ad + sağda chevron veya
Toggle. Tehlikeli işlemler (çıkış, hesabı sil) en altta ayrı grupta, metin
danger, zemin yok. Versiyon numarası en altta ortalı hint.

**ProfileScreen**: üstte 72px daire avatar (yoksa baş harfler, primarySoft
zemin + primaryDark harf) + h2 isim + caption e-posta, altında düzenlenebilir
alanlar ListRow formatında (dokununca AppInput'lu sheet).

**EmailPreferencesScreen**: ListRow + Toggle listesi. Her toggle değişimi
ANINDA API'ye gider (kaydet butonu yok); istek sürerken toggle disabled,
hata olursa eski konuma döner + hint boyutunda satır altı hata. En üstte
"Tümünü duraklat" master toggle.

**PermissionsScreen**: her izin bir Card — ikon + bodyMedium ad + body
açıklaması (NEDEN gerektiği tek cümle) + sağda durum Badge'i
(verildi: primary varyant / verilmedi: surfaceAlt) + dokununca sistem
ayarına gider. İzin reddedilmişse suçlayıcı dil yok: "Ayarlardan açabilirsin".

**HelpSupportScreen**: üstte arama AppInput, SSS accordion'ları Card içinde
(başlık bodyMedium + chevron döner, açılınca body/textSecondary), en altta
hero Card "Hâlâ takıldın mı?" + GhostButton "Bize yaz".

**TeamScreen / TeamInviteScreen**: üye ListRow'ları (avatar daire + isim +
rol Badge'i), sağ üstte ScreenHeader aksiyonu "+ Davet". Davet ekranı:
tek AppInput (e-posta) + rol SelectionCard'ları + PrimaryButton.

**SignatureManager / SignatureDrawer**: imza listesi Card'lar (imza
önizlemesi surfaceAlt zemin radius 16 içinde) + EmptyState. Çizim ekranı:
tam genişlik beyaz tuval Card, altında araç çubuğu (kalem kalınlığı 3 nokta,
temizle GhostButton), CTA "Kaydet".

---

## GENEL YASAKLAR (her fazda geçerli)

- Serif font, gradient, gölge, emoji
- Ekran dosyasında hex renk literali
- Bir ekranda 2+ primary buton
- Kırmızı zeminli buton (danger sadece metin/ikon rengi)
- Toast ile form hatası göstermek (hata alanın altında yazar)
- position:absolute ile içerik yerleşimi (modal/sheet/toast hariç)
- "Hoş geldiniz", "Adım 1" gibi başlıklar
- Türkçe karakter hatası — tüm metinleri yazım açısından kontrol et

## HER FAZ SONU KONTROL

[ ] Ekranda hardcoded renk yok (grep '#' ile doğrula)
[ ] Tüm dokunulabilir öğeler min 44px
[ ] Metinler üst üste binmiyor, kırpılmıyor
[ ] CTA alta sabit, klavye açılınca üstüne çıkıyor (KeyboardAvoidingView)
[ ] Boş durumlar EmptyState ile gösteriliyor
[ ] Loading durumlarında buton spinner'ı çalışıyor
