#!/usr/bin/env node
/**
 * Expo web'den 390x844 viewport'ta screenshot al
 * Kullanım: node scripts/screenshot-web.js <url> <filename>
 * Örnek: node scripts/screenshot-web.js http://localhost:8081 onboarding-1
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function takeScreenshot(url, filename) {
  if (!url || !filename) {
    console.error('Kullanım: node scripts/screenshot-web.js <url> <filename>');
    console.error('Örnek: node scripts/screenshot-web.js http://localhost:8081 onboarding-1');
    process.exit(1);
  }

  const screenshotsDir = '.screenshots';
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();

    // iPhone 12 Pro Max viewport (390x844)
    await page.setViewportSize({ width: 390, height: 844 });

    console.log(`📸 Opening ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle' });

    // Hard refresh (clear cache)
    await page.evaluate(() => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          registrations.forEach(reg => reg.unregister());
        });
      }
    });

    // Small delay to render
    await page.waitForTimeout(500);

    const filepath = path.join(screenshotsDir, `${filename}.png`);
    await page.screenshot({ path: filepath, fullPage: false });

    console.log(`✅ Kaydedildi: ${filepath}`);
    console.log(`   Boyut: 390x844`);
    await page.close();
  } catch (error) {
    console.error(`❌ Hata: ${error.message}`);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

// Argümanları al
const url = process.argv[2];
const filename = process.argv[3];

takeScreenshot(url, filename).catch(err => {
  console.error(err);
  process.exit(1);
});
