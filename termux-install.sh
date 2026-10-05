#!/data/data/com.termux/files/usr/bin/bash
set -e
pkg update -y
pkg install nodejs git unzip -y
npm install
if [ ! -f .env ]; then
  cp .env.example .env
fi
echo ""
echo "Installation complete."
echo "Edit .env with: nano .env"
echo "Then start with: npm start"
