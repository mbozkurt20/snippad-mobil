#!/bin/bash
# Emülatörden ekran görüntüsü alır: ./scripts/screenshot.sh ekran-adi
# Claude Code bu PNG'yi Read tool ile AÇIP BAKABİLİR.
NAME=${1:-screen}
mkdir -p .screenshots
if command -v adb &> /dev/null && adb devices | grep -q device$; then
  adb exec-out screencap -p > ".screenshots/${NAME}.png" && echo ".screenshots/${NAME}.png"
elif command -v xcrun &> /dev/null; then
  xcrun simctl io booted screenshot ".screenshots/${NAME}.png" && echo ".screenshots/${NAME}.png"
else
  echo "HATA: çalışan emülatör/simülatör bulunamadı" && exit 1
fi
