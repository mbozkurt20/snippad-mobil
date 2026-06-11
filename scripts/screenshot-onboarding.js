#!/usr/bin/env node
/**
 * Expo web'de onboarding tüm 5 adımının screenshot'ını al
 * Her adımdan sonra "Devam et" butonuna bas ve sonraki ekrana geç
 * Kullanım: node scripts/screenshot-onboarding.js
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function captureOnboarding() {
  const screenshotsDir = '.screenshots';
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 390, height: 844 });

    console.log('📸 Onboarding başlanıyor (localhost:8081)...');
    await page.goto('http://localhost:8081', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    // 5 onboarding adımı
    const stepNames = [
      'onboarding-1-language',
      'onboarding-2-value',
      'onboarding-3-trust',
      'onboarding-4-keyboard',
      'onboarding-5-ready'
    ];

    for (let i = 0; i < 5; i++) {
      const filename = stepNames[i];
      const filepath = path.join(screenshotsDir, `${filename}.png`);

      console.log(`  [${i + 1}/5] ${filename}...`);

      // Screenshot al
      await page.screenshot({ path: filepath, fullPage: false });
      console.log(`    ✓ ${filepath}`);

      // Sonraki adıma geç
      if (i === 3) {
        // Keyboard ekranında: "Daha sonra yaparım" linkine tıkla (Ready ekranına geç)
        const skipLink = await page.$('text="Daha sonra yaparım"');
        if (skipLink) {
          await skipLink.click();
          await page.waitForTimeout(300);
        }
      } else if (i < 3) {
        // Diğer ekranlarda: "Devam et" butonuna tıkla
        const continueBtn = await page.$('text="Devam et"');
        if (continueBtn) {
          await continueBtn.click();
          await page.waitForTimeout(300);
        }
      }
    }

    console.log('✅ Tüm onboarding ekranları kaydedildi!');
    console.log('   .screenshots/onboarding-*.png dosyaları oluşturuldu');

    await page.close();
  } catch (error) {
    console.error(`❌ Hata: ${error.message}`);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

captureOnboarding().catch(err => {
  console.error(err);
  process.exit(1);
});
