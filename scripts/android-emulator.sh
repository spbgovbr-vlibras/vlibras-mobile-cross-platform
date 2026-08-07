#!/usr/bin/env bash
# Sobe o AVD pelo terminal (sem Android Studio), igual ao Simulator do Xcode.
set -euo pipefail

SDK="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-$HOME/Library/Android/sdk}}"
EMULATOR="$SDK/emulator/emulator"
ADB="$SDK/platform-tools/adb"

AVD_NAME="${1:-meu_emulador}"

if [[ ! -x "$EMULATOR" ]]; then
  echo "Emulador não encontrado em: $EMULATOR"
  echo "Instale Android SDK / Emulator ou defina ANDROID_HOME."
  exit 1
fi

if "$ADB" devices 2>/dev/null | grep -qE 'emulator-[0-9]+\s+device'; then
  echo "Já existe um emulador rodando:"
  "$ADB" devices -l
  exit 0
fi

echo "Iniciando AVD: $AVD_NAME"
echo "(Janela do emulador Android — não é o Android Studio.)"

nohup "$EMULATOR" -avd "$AVD_NAME" -no-snapshot-load >/tmp/vlibras-android-emulator.log 2>&1 &
EMU_PID=$!

echo "PID $EMU_PID — log: /tmp/vlibras-android-emulator.log"
echo "Aguardando boot..."

"$ADB" wait-for-device
boot_completed=""
for _ in $(seq 1 120); do
  boot_completed=$("$ADB" shell getprop sys.boot_completed 2>/dev/null | tr -d '\r' || true)
  if [[ "$boot_completed" == "1" ]]; then
    break
  fi
  sleep 2
done

if [[ "$boot_completed" != "1" ]]; then
  echo "Emulador demorou; tente adb devices manualmente."
  exit 1
fi

echo "Emulador pronto."
"$ADB" devices -l
