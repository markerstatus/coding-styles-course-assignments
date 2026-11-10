#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

# Root .class files from: javac WordsPlugin.java FrequenciesPlugin.java WordCount.java Main.java
rm -f Main.class WordsPlugin.class FrequenciesPlugin.class WordCount.class

# Compiled plugins from: javac -cp . -d plugins plugins-src/*.java
rm -rf plugins

echo "Clean complete."
echo "Run ./compile.sh before java Main ..."
