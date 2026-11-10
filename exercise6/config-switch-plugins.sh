#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

words=$(grep -E '^words=' config.properties | cut -d= -f2-)
frequencies=$(grep -E '^frequencies=' config.properties | cut -d= -f2-)
echo "=============================="
echo " Current config"
echo "=============================="
printf "  %-12s %s\n" "words:" "$words"
printf "  %-12s %s\n" "frequencies:" "$frequencies"
echo "=============================="
echo

echo "Choose a words plugin:"
echo "  1) normal  -> plugins/NormalWords.class"
echo "  2) z       -> plugins/ZWords.class"
read -p "Enter 1 or 2: " words_choice

case "$words_choice" in
  1) words_plugin="plugins/NormalWords.class" ;;
  2) words_plugin="plugins/ZWords.class" ;;
  *)
    echo "Invalid words choice: $words_choice"
    exit 1
    ;;
esac

echo
echo "Choose a frequencies plugin:"
echo "  1) normal       -> plugins/NormalFrequencies.class"
echo "  2) first-letter -> plugins/FirstLetterFrequencies.class"
read -p "Enter 1 or 2: " frequencies_choice

case "$frequencies_choice" in
  1) frequencies_plugin="plugins/NormalFrequencies.class" ;;
  2) frequencies_plugin="plugins/FirstLetterFrequencies.class" ;;
  *)
    echo "Invalid frequencies choice: $frequencies_choice"
    exit 1
    ;;
esac

if [[ "$words_plugin" == "$words" && "$frequencies_plugin" == "$frequencies" ]]; then
  echo
  echo "No change — those plugins are already selected."
  echo "Re-run the program to see output:"
  echo "  java Main \"../exercise3/working folder/pride-and-prejudice.txt\""
  exit 0
fi

cat > config.properties <<EOF
words=${words_plugin}
frequencies=${frequencies_plugin}
EOF

echo
echo "=============================="
echo " Updated config"
echo "=============================="
printf "  %-12s %s\n" "words:" "$words_plugin"
printf "  %-12s %s\n" "frequencies:" "$frequencies_plugin"
echo "=============================="
echo
echo "Config saved. No need to recompile — just run:"
echo "  java Main \"../exercise3/working folder/pride-and-prejudice.txt\""
