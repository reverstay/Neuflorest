#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
JWT_DIR="$ROOT_DIR/secrets/jwt"

mkdir -p "$JWT_DIR"
umask 077

openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:4096 -out "$JWT_DIR/private.pem"
openssl rsa -pubout -in "$JWT_DIR/private.pem" -out "$JWT_DIR/public.pem"

chmod 600 "$JWT_DIR/private.pem"
chmod 644 "$JWT_DIR/public.pem"

echo "Generated RS256 keys:"
echo "  $JWT_DIR/private.pem"
echo "  $JWT_DIR/public.pem"
