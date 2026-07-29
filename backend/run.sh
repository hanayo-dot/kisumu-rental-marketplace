#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

# Use a writable Go module cache and GOPATH in the user's home directory.
export GOPATH="$HOME/go"
export GOMODCACHE="$GOPATH/pkg/mod"
export GOENV="$HOME/.config/go/env"

mkdir -p "$GOMODCACHE"
mkdir -p "$(dirname "$GOENV")"

# Persist the Go paths so go can use them consistently.
go env -w GOPATH="$GOPATH" GOMODCACHE="$GOMODCACHE"

# Run the backend with the correct environment.
env -u GOMODCACHE GOPATH="$GOPATH" GOENV="$GOENV" GOMODCACHE="$GOMODCACHE" go run cmd/main.go
