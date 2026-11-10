#!/usr/bin/env bash
# -e: exit on first failing command
# -u: error on unset variables
# -o pipefail: fail a pipeline if any command in it fails
set -euo pipefail
cd "$(dirname "$0")"

mkdir -p plugins

# compile shared interfaces + main
javac WordsPlugin.java FrequenciesPlugin.java WordCount.java Main.java

# compile plugins-src → plugins 
rm -f plugins/*.class
javac -cp . -d plugins plugins-src/*.java

echo "Build complete."
echo "Run from exercise6/: java Main <text-file>"
