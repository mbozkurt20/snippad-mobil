#!/usr/bin/env node
/**
 * Snippad Tasarım Lint — tasarım sistemi ihlallerini koddan yakalar.
 * Kullanım: node scripts/design-lint.js
 * Çıkış kodu 0 = temiz, 1 = ihlal var (Claude Code düzeltmeden duramaz).
 */
const fs = require('fs');
const path = require('path');

const SRC = path.join(process.cwd(), 'src');
// Tema dosyaları hex tanımlayabilir; diğer her yer ihlaldir
const THEME_ALLOW = [/theme[\\/]/, /constants[\\/]keyboard/, /luxuryKeyboard/];
// position:absolute'a izin verilen dosyalar (modal/sheet/toast/overlay)
const ABS_ALLOW = [/Modal/, /Sheet/, /Toast/, /Alert/, /Drawer/, /Overlay/, /Splash/];

const violations = [];

function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (/\.(tsx?|jsx?)$/.test(f)) check(p);
  }
}

function check(file) {
  const rel = path.relative(process.cwd(), file);
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  const isTheme = THEME_ALLOW.some(r => r.test(rel));
  const absOk = ABS_ALLOW.some(r => r.test(rel));

  lines.forEach((line, i) => {
    const loc = `${rel}:${i + 1}`;
    if (line.trimStart().startsWith('//') || line.trimStart().startsWith('*')) return;

    // 1) Piksel-altı lineHeight (RN'de lineHeight pikseldir, çarpan DEĞİL)
    const lh = line.match(/lineHeight:\s*(\d+(\.\d+)?)/);
    if (lh && parseFloat(lh[1]) < 10)
      violations.push(`${loc} — lineHeight: ${lh[1]} → RN'de piksel olmalı (örn. fontSize*1.4)`);

    // 2) Tema dışında hardcoded hex renk
    if (!isTheme && /['"]#[0-9A-Fa-f]{3,8}['"]/.test(line))
      violations.push(`${loc} — hardcoded renk → theme'den import et`);

    // 3) İzinsiz position absolute
    if (!absOk && /position:\s*['"]absolute['"]/.test(line))
      violations.push(`${loc} — position:absolute içerik yerleşiminde yasak`);

    // 4) Serif font
    if (/fontFamily:\s*['"].*(serif|Georgia|Times)/i.test(line))
      violations.push(`${loc} — serif font yasak (sistem fontu kullan)`);

    // 5) Kod içinde emoji (ikon yerine)
    if (/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(line) && /<Text|label|title|text:/.test(line))
      violations.push(`${loc} — emoji yasak → lucide ikonu kullan`);

    // 6) 44px altı dokunma hedefi ipucu
    const h = line.match(/height:\s*(\d+)/);
    if (h && /[Bb]utton/.test(rel) && parseInt(h[1]) < 44 && parseInt(h[1]) > 10)
      violations.push(`${loc} — buton yüksekliği ${h[1]}px < 44px minimum`);
  });

  // 7) Dosya başına birden fazla PrimaryButton
  const src = lines.join('\n');
  const pbCount = (src.match(/<PrimaryButton/g) || []).length;
  if (pbCount > 1 && /screens[\\/]/.test(rel))
    violations.push(`${rel} — ${pbCount} adet PrimaryButton (ekran başına max 1)`);
}

walk(SRC);

if (violations.length) {
  console.log(`\n✗ ${violations.length} tasarım ihlali:\n`);
  violations.forEach(v => console.log('  ' + v));
  console.log('\nDüzeltmeden commit etme.\n');
  process.exit(1);
} else {
  console.log('✓ Tasarım lint temiz');
}
