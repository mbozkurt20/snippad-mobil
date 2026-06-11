// Sektörel hazır şablon paketleri
// Her sektör: icon, renk, kategoriler, şablonlar

export interface SectorTemplate {
  title: string;
  content: string;
  shortcut?: string;
}
export interface SectorCategory {
  name: string;
  type: 'text' | 'iban' | 'address' | 'email' | 'phone' | 'link';
  icon: string;
  color: string;
  templates: SectorTemplate[];
}
export interface SectorPack {
  id: string;
  name: string;
  emoji: string;
  description: string;
  categories: SectorCategory[];
}

export const SECTOR_PACKS: SectorPack[] = [
  {
    id: 'accountant',
    name: 'Mali Müşavir / Muhasebeci',
    emoji: '📊',
    description: 'Müşteri bildirimleri, beyan hatırlatmaları, ödeme talepleri',
    categories: [
      {
        name: 'Müşteri Bildirimleri', type: 'text', icon: 'file-text', color: '#3B82F6',
        templates: [
          { title: 'Beyan Hatırlatma', content: 'Sayın {müşteri}, {ay} ayına ait KDV beyannamenizin son teslim tarihi {tarih}\'dir. Ekstre ve belgelerinizi lütfen {gün} gün içinde iletiniz.', shortcut: 'bey' },
          { title: 'Ödeme Hatırlatma', content: '{dönem} dönemine ait muhasebe hizmet bedelimiz olan {tutar} TL\'nin hesabımıza aktarılmasını rica ederiz. IBAN: {iban}', shortcut: 'odh' },
          { title: 'Evrak Talebi', content: 'Sayın {müşteri}, {konu} için aşağıdaki evrakların tarafımıza iletilmesi gerekmektedir:\n- Nüfus cüzdanı fotokopisi\n- İmza sirküleri\n- Son 3 aylık banka ekstresi' },
          { title: 'SGK Bildirimi', content: '{ay} ayı SGK bildirgesi hazırlanmıştır. Prim tutarı: {tutar} TL. Son ödeme tarihi: {tarih}. Gecikme halinde faiz uygulanacaktır.' },
          { title: 'Vergi Danışmanlığı', content: '{konu} konusunda vergiye ilişkin bir soru varsa, lütfen {telefon} numarasından bize ulaşınız. Uzman danışmanlarımız size yardımcı olmaya hazırdır.' },
          { title: 'Raporlama', content: '{dönemi} mali tablolarınız hazırlanmıştır. Detaylı muhasebe raporuna erişmek için CRM hesabınızı ziyaret edebilirsiniz.' },
        ],
      },
      {
        name: 'Standart Mesajlar', type: 'text', icon: 'mail', color: '#6B7280',
        templates: [
          { title: 'Hoşgeldin', content: 'Muhasebe hizmetlerimizi seçtiğiniz için teşekkürler. Sorularınız için her zaman buradayız.' },
          { title: 'Başarılı Tamamlama', content: '{işlem} başarılı bir şekilde tamamlanmıştır. Bilgiler hesabınızda güncellenmiştir.' },
          { title: 'Randevu Talebi', content: 'Mali işleriniz hakkında konuşmak için ne zaman müsaitsiniz? Takvimimizde yer ayırabiliriz.' },
        ],
      },
    ],
  },
  {
    id: 'realtor',
    name: 'Emlakçı / Gayrimenkul',
    emoji: '🏠',
    description: 'İlan açıklamaları, müşteri bilgilendirme, sözleşme notları',
    categories: [
      {
        name: 'İlan Şablonları', type: 'text', icon: 'file-text', color: '#10B981',
        templates: [
          { title: 'Satılık Daire', content: '🏠 {oda} ODALI {m2}m² {konum}\n✅ {kat}. Kat | Asansör: {asansör} | Isıtma: {ısıtma}\n💰 {fiyat} TL | {tapu} Tapulu\n📞 Bilgi için: {telefon}', shortcut: 'sda' },
          { title: 'Kiralık Daire', content: '🏠 KİRALIK {oda}+1 | {m2}m² | {konum}\n💰 Kira: {kira} TL/ay | Aidat: {aidat} TL\n🔑 Depozito: {depozito} TL\n📞 {telefon}' },
          { title: 'Satılık Villa', content: '🏡 SATILIK VİLLA | {m2}m² | {oda} ODALI\n🏞️ Bahçe: {bahçe}m² | Garaj: {garaj}\n💰 {fiyat} TL | Tapulu\n📞 {telefon}' },
          { title: 'Görüşme Onayı', content: 'Merhaba {müşteri}, {mülk} için {tarih} {saat}\'te görüşmemizi onaylıyorum. Adres: {adres}. Sorularınız için: {telefon}' },
        ],
      },
      {
        name: 'Müşteri Bildirimleri', type: 'text', icon: 'bell', color: '#F59E0B',
        templates: [
          { title: 'Yeni İlan Hatırlatma', content: '{kriterlere} uygun yeni bir mülk buldum! Görmek ister misiniz? Detaylar: {link}' },
          { title: 'Tapu Bilgisi', content: '{mülk} için tapu işlemleri başlatılmıştır. Tapu harcı: {tutar} TL. Randevu: {tarih} {saat}.' },
          { title: 'Değerleme Raporu', content: '{mülk}nin bağımsız değerleme raporu hazırdır. Detaylar için ofisimizi arayabilirsiniz.' },
        ],
      },
    ],
  },
  {
    id: 'lawyer',
    name: 'Avukat / Hukuk Bürosu',
    emoji: '⚖️',
    description: 'Müvekkil bildirimleri, duruşma hatırlatmaları, hukuki notlar',
    categories: [
      {
        name: 'Müvekkil Bildirimleri', type: 'text', icon: 'file-text', color: '#8B5CF6',
        templates: [
          { title: 'Duruşma Hatırlatma', content: 'Sayın {müvekkil}, {dava} dosyanıza ilişkin duruşma {mahkeme}\'de {tarih} günü saat {saat}\'te yapılacaktır.', shortcut: 'dur' },
          { title: 'Karar Bildirimi', content: '{dava} davasında {tarih}\'de {mahkeme} tarafından karar açıklanmıştır. Detaylar için lütfen ofisimizi aramanız ricası.' },
          { title: 'Avukatlık Ücreti', content: '{konu} hukuki hizmeti için {tutar} TL avukatlık ücreti tahakkuk etmiştir. IBAN: {iban}' },
          { title: 'Evrak Talebi', content: 'Dosyanızın ilerleyebilmesi için {belgeler} belgelerini en kısa sürede büromuzae teslim etmenizi rica ederiz.' },
          { title: 'İtirazen Apel', content: '{tarih} tarihli kararın ithraz için son tarih {itraz_tarihi}\'dir. Detaylı plan yapmak için randevu alınız.' },
        ],
      },
      {
        name: 'Standart Mesajlar', type: 'text', icon: 'mail', color: '#6B7280',
        templates: [
          { title: 'İlk İş Görüşme', content: 'Davanız hakkında danışmak için toplantımız için teşekkürler. Tüm detayları inceledim.' },
          { title: 'İlerleme Raporu', content: 'Davanız ile ilgili son gelişmeler: {gelişmeler}. Bir sonraki adım {sonraki_adım}. Çok yakında yeniden bize yazacağım.' },
        ],
      },
    ],
  },
  {
    id: 'esnaf',
    name: 'Esnaf / Dükkan Sahibi',
    emoji: '🛍️',
    description: 'Sipariş bildirimleri, ödeme bilgileri, müşteri mesajları',
    categories: [
      {
        name: 'Müşteri Mesajları', type: 'text', icon: 'file-text', color: '#F59E0B',
        templates: [
          { title: 'Sipariş Hazır', content: 'Merhaba {müşteri}, {ürün} siparişiniz hazır! Çalışma saatlerimiz: {saat}. Adres: {adres}' },
          { title: 'Ödeme Bilgisi', content: 'Toplam tutar: {tutar} TL\n💳 Havale/EFT: {iban}\n💵 Nakit veya kart ile de ödeme yapabilirsiniz.' },
          { title: 'Stok Durumu', content: '{ürün} şu an stokta bulunmamaktadır. {tarih}\'de tekrar gelecektir. Haber vermemi ister misiniz?' },
          { title: 'Müşteri Teşekkürü', content: 'Merhaba {müşteri}, alışverişiniz için teşekkürler! 😊 Geri dönüşünüzü bekliyoruz.' },
          { title: 'Yeni Ürün Bilgilendirme', content: 'Yeni gelen {ürün} artık mağazamızda! {özellikler}. Çalışma saatlerimizde ziyaret etmeyi unutmayın.' },
        ],
      },
      {
        name: 'İndirim & Kampanya', type: 'text', icon: 'tag', color: '#EC4899',
        templates: [
          { title: 'Özel İndirim', content: '🎉 Sadece bugün! {ürün} için %{indirim} indirim. Son {saat} saat kaldı! Buraya tıklayın: {link}' },
          { title: 'Üye Avantajı', content: 'Üye ol ve ilk alışverişinde %10 indirim kazan! Ayrıca her satın almada puan biriktirebilirsin.' },
          { title: 'Sınırlı Stok', content: '⚠️ Sınırlı stok! {ürün} çok hızlı bitmek üzere. Acele et! 🏃‍♂️' },
        ],
      },
    ],
  },
  {
    id: 'health',
    name: 'Sağlık / Klinik',
    emoji: '🏥',
    description: 'Randevu bildirimleri, hasta bilgilendirme, reçete notları',
    categories: [
      {
        name: 'Hasta Mesajları', type: 'text', icon: 'file-text', color: '#EF4444',
        templates: [
          { title: 'Randevu Onayı', content: 'Sayın {hasta}, {tarih} {saat} randevunuz onaylanmıştır. Adres: {adres}. İptal için 24 saat önceden bildiriniz.', shortcut: 'ran' },
          { title: 'Randevu Hatırlatma', content: 'Sayın {hasta}, yarın saat {saat}\'te randevunuz var. Aç karnına gelmek ve {belgeler} getirmeyi unutmayın.' },
          { title: 'Tahlil Sonucu', content: '{tarih} tarihli tahlil sonuçlarınız hazır. Değerlendirmek için randevu alınız. Tel: {telefon}' },
          { title: 'İlaç Hatırlatma', content: '{ilaç} ilacınızı günde {doz} kez, {zaman} kullanınız. {süre} gün sonra kontrol için gelin.' },
          { title: 'Diş Temizliği Randevusu', content: 'Periyodik diş temizliğinizin zamanı gelmiştir. {aylar} aylık kontrol randevusu almak için {telefon} arayanız.' },
        ],
      },
      {
        name: 'Hasta Eğitimi', type: 'text', icon: 'book', color: '#06B6D4',
        templates: [
          { title: 'Sağlık Ipuçları', content: '💡 Sağlık İpucu: {konu} hakkında önemli bilgiler:\n{bilgiler}' },
          { title: 'Beslenme Önerisi', content: '{hastalık} için beslenme önerileri:\n✅ {beslenme_listesi}\n❌ Kaçınılması gerekenler:\n{kaçınılması_gereken}' },
          { title: 'Egzersiz Programı', content: '{amaç} için egzersiz programı:\n{program}. Başlamadan önce doktorunuza danışın.' },
        ],
      },
    ],
  },
  {
    id: 'restaurant',
    name: 'Restoran / Kafe',
    emoji: '🍽️',
    description: 'Rezervasyon, menü önerileri, promosyonlar',
    categories: [
      {
        name: 'Müşteri Mesajları', type: 'text', icon: 'file-text', color: '#F97316',
        templates: [
          { title: 'Rezervasyon Onayı', content: 'Sayın {müşteri}, {kişi} kişi için {tarih} {saat}\'te masanız hazır. Restoran: {adres}. Teşekkürler! 🍽️' },
          { title: 'Menü Önerisi', content: '⭐ Bu haftanın özel menüsü:\n🥘 {yemek1}: {fiyat} TL\n🍲 {yemek2}: {fiyat} TL\n🍝 {yemek3}: {fiyat} TL\nRezervasyon: {telefon}' },
          { title: 'Doğum Günü Paketi', content: 'Doğum gününüzü bizde kutlayın! Özel paket: {paket} + {dessert} TL. Grup rezervasyonunda %{indirim} indirim.' },
        ],
      },
      {
        name: 'Promosyon', type: 'text', icon: 'tag', color: '#EC4899',
        templates: [
          { title: 'Happy Hour', content: '🎉 Happy Hour! {saat} - {saat_bitis} saatleri arasında tüm içeceklerde %{indirim} indirim! Bizi ziyaret etmeyi unutmayın.' },
          { title: 'Paket Menü', content: '{gün} özel günü! {kişi} kişi paket menü: {menü} + {meze} = {fiyat} TL. Sınırlı stok! ⏰' },
        ],
      },
    ],
  },
  {
    id: 'hr',
    name: 'İnsan Kaynakları / HR',
    emoji: '👔',
    description: 'Personel bildirimleri, özlük işleri, şirket duyuruları',
    categories: [
      {
        name: 'Personel Bildirimleri', type: 'text', icon: 'file-text', color: '#06B6D4',
        templates: [
          { title: 'İzin Onayı', content: '{çalışan}, {tarih} - {tarih_bitis} arasındaki {gün} günlük {izin_türü} izniniz onaylanmıştır. Vekiliniz: {vekil}.' },
          { title: 'Bordro Bildirimi', content: '{ay} ayına ait maaş bordronuz hazır. Net: {net} TL. IBAN\'ınıza {tarih}\'de aktarılacaktır.' },
          { title: 'Sağlık Kontrolü', content: '{çalışan}, yıllık sağlık kontrolünüzün süresi gelmiştir. Kontrol gün aralığı: {gün_aralığı}. Bize ulaşın.' },
          { title: 'Sertifika Hatırlatma', content: 'Sayın {çalışan}, {sertifika} sertifikanızın son geçerlilik tarihi {tarih}\'dir. Güncellenmesi gerekmektedir.' },
          { title: 'Kurumsal Eğitim', content: 'Yeni eğitim başlıyor! {başlık}: {tarih}. Katılım şartı: {şart}. Teyit için {telefon}.' },
        ],
      },
      {
        name: 'Şirket Duyuruları', type: 'text', icon: 'megaphone', color: '#F59E0B',
        templates: [
          { title: 'Ofis Kapanış', content: '📢 {tarih}\'de {neden} nedeniyle ofisimiz kapıdır. Acil durumlar için: {telefon}' },
          { title: 'Yeni Politika', content: '📋 Yeni {politika_adı} politikası yürürlüğe girmektedir. Detayları paylaşan dökümanı inceleyiniz.' },
          { title: 'Başarı Hikayesi', content: '🌟 Tebrikler {çalışan}! {başarı} başarısı sağladığınız için bizi gururlandırdınız. Takım olarak başarılı!' },
        ],
      },
    ],
  },
  {
    id: 'bayram',
    name: 'Bayram / Özel Günler',
    emoji: '🎉',
    description: 'Bayram tebrik mesajları, özel gün kampanyaları',
    categories: [
      {
        name: 'Bayram Mesajları', type: 'text', icon: 'gift', color: '#EC4899',
        templates: [
          { title: 'Ramazan Bayramı', content: 'Ramazan Bayramınız Mubarek! Sevdiklerinizle huzur dolu günler geçirmeniz dileğiyle... 🌙✨' },
          { title: 'Kurban Bayramı', content: 'Kurban Bayramınız Mübarek! Bayramınızda sağlık, huzur ve mutluluk dileriz. 🐑🎉' },
          { title: 'Yeni Yıl Dilekleri', content: 'Yeni yıl vesilesiyle, {yıl} yılının tüm dileriniz gerçekleşmesini dileriz. Mutlu, sağlıklı günler en dileklerimizdir! 🎆' },
          { title: 'Sevgililer Günü', content: 'Sevgililer Günü kutlu olsun! Sevdiklerinizi biraz daha sıkı sarın. ❤️💕' },
          { title: 'Mütercim Tercümanlar Günü', content: 'Mütercim Tercümanlar Günü kutlu olsun! Dilimizi dünyadaki dillere taşıyan tüm mütercim ve tercümanlara selam... 🌍' },
        ],
      },
      {
        name: 'Özel Gün Kampanyaları', type: 'text', icon: 'sale', color: '#10B981',
        templates: [
          { title: 'Anneler Günü Kampanyası', content: '💐 Anneler Günü Kampanyası! Tüm {kategori} ürünlerinde %{indirim} indirim. Sevgisini göster: {link}' },
          { title: 'Baba Günü Indirimi', content: '👨 Baba Günü Özel İndirim! {ürün} kategorisinde %{indirim} + Ücretsiz Kargo! {saat} saat kaldı! ⏰' },
          { title: 'Öğretmenler Günü', content: '🎓 Öğretmenler Günü Hediyesi! Öğretmeninize özel {hediye} paketi. %{indirim} indirim! Siparişiniz {tarih}\'de ulaşır.' },
          { title: 'Teknoloji Günü', content: '💻 Teknoloji Günü Özel İndirim! Tüm elektronik ürünlerde %{indirim} indirim. Stok sınırlı! {link}' },
        ],
      },
    ],
  },
  {
    id: 'teacher',
    name: 'Öğretmen / Eğitim',
    emoji: '🎓',
    description: 'Öğrenci ve veli bildirimleri, sınıf yönetimi, ödevi hatırlatmaları',
    categories: [
      {
        name: 'Öğrenci Mesajları', type: 'text', icon: 'file-text', color: '#06B6D4',
        templates: [
          { title: 'Ödevi Hatırlatma', content: 'Merhaba {öğrenci}, {tarih}\'e kadar tamamlaması gereken ödev: {ödev_adı}. Başarılar! 📚' },
          { title: 'Sınav Duyurusu', content: '{tarih}\'de {ders} sınavı yapılacaktır. Konular: {konular}. Sınıf notu: 3/B Sınav saati: {saat}' },
          { title: 'Başarı Tebrik', content: 'Çok başarılı bir sınav yapmışsın {öğrenci}! Böyle devam et. 🌟' },
          { title: 'Devamsızlık Uyarısı', content: 'Sevgili {veli}, {öğrenci} adlı öğrencinin {ay} ayında {gün} gün devamsızlığı bulunmaktadır.' },
          { title: 'Proje Sunumu', content: '{tarih}\'de {ders} dersi proje sunumları yapılacaktır. Projeniz hazırsa lütfen USB/Cloud\'a yükleyiniz.' },
        ],
      },
      {
        name: 'Veli Bildirimleri', type: 'text', icon: 'mail', color: '#8B5CF6',
        templates: [
          { title: 'Not Bildiri', content: '{ay} ayına ait not ortalaması: {not}. Maddeler: {maddeler}. Danışmak istiyorsanız: {telefon}' },
          { title: 'Ders Parası Hatırlatma', content: 'Sayın Veli, {ay} aylık ders ücreti olan {tutar} TL\'nin ödenmesi beklenmektedir.' },
          { title: 'Okul Etkinliği', content: '{tarih}\'de okul etkinliği düzenlenecektir. Etkinlik adı: {etkinlik}. Katılım talep edilmektedir.' },
          { title: 'Gelişim Raporu', content: '{öğrenci}\'in {dönem} dönemindeki gelişim raporu ektedir. Tebrikler, çok iyi gidiyor! 👏' },
        ],
      },
      {
        name: 'Sınıf Yönetimi', type: 'text', icon: 'hash', color: '#F59E0B',
        templates: [
          { title: 'Sınıf Kuralları', content: 'Sevgili öğrenciler, {kural}. Hepimizin uyması gereken önemli kurallar bunlar. 📋' },
          { title: 'Sınıf Temizliği', content: '{tarih}\'de sınıf temizliği yapılacaktır. Sırayla: {grup}. Teşekkürler! 🧹' },
          { title: 'Ders Materyali', content: '{ders} dersi için gereken materyal listesi: {list}. Lütfen {tarih}\'ye kadar getirin.' },
          { title: 'Kitap Listesi', content: '{ay} ayında okuyacağımız kitap: {kitap}, Yazar: {yazar}. {tarih}\'de tartışacağız.' },
        ],
      },
    ],
  },
];
