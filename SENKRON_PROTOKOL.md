# SENKRON_PROTOKOL.md — Claude (web) ↔ Claude Code görsel kalite döngüsü

Bu protokol CLAUDE.md'deki iş akışına EK'tir. Claude Code her oturumda buna uyar.

## Roller
- Claude Code (lokal): kodu değiştirir, lint'i geçirir, ekran görüntüsü alır,
  kendi ön kontrolünü yapar, repoya push'lar.
- Claude (web, "Baş Tasarım Denetçisi"): push'lanan görüntüleri inceler,
  DESIGN_REVIEW.md raporunu üretir. Bu rapordaki kararlar TARTIŞMASIZ uygulanır.
- Kullanıcı: sadece taşıyıcı. Teknik açıklama yapmak zorunda değildir.

## Claude Code'un görevleri (her UI görevinde, sırayla)
1. Repo kökünde DESIGN_REVIEW.md var mı bak. İçinde `[ ]` işaretli açık madde
   varsa, YENİ GÖREVE BAŞLAMADAN ÖNCE bunları uygula. Tamamladığını `[x]`
   yapıp maddenin altına tek satır "Yapıldı: <ne yapıldı>" notu ekle.
2. Kod değişikliğini yap → `node scripts/design-lint.js` geçir.
3. Emülatörde değişen HER ekran için görüntü al:
   `./scripts/screenshot.sh <EkranAdi>` → `.screenshots/<EkranAdi>.png`
   Görüntüyü Read ile açıp CLAUDE.md'deki kontrol listesinden geçir, bariz
   hataları kendin düzelt (maks 3 tur).
4. Push'la:
   git add -A && git commit -m "ui: <ekranlar> + screenshots" && git push
5. Rapor ver: "İnceleme hazır — şu ekranlar push'landı: ..." Kullanıcı bunu
   web Claude'a iletecek.

## Kurallar
- .screenshots/ klasörü .gitignore'da OLMAYACAK (denetçi oradan okuyor).
- Ekran görüntüsü almadan "tamamlandı" deme. Emülatör kapalıysa kullanıcıdan
  açmasını iste ve bekle.
- DESIGN_REVIEW.md'deki bir maddeye katılmıyorsan bile uygula; itirazını
  maddenin altına "Not:" olarak yaz, karar denetçinindir.
- DESIGN_REVIEW.md'yi asla silme; sadece işaretle ve not düş.

## Kullanıcının görevleri (toplam ~30 saniye)
1. Claude Code "push'landı" deyince web Claude'a yaz: "push'landı, incele"
   (repo public ve adresi web Claude'da kayıtlı olmalı).
2. Web Claude'un verdiği yeni DESIGN_REVIEW.md dosyasını repo köküne koy
   (eskisinin üzerine yaz), Claude Code'a "review geldi" de.
