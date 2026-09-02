#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Seed Key Vault secrets for FlashID
# Run once per environment after deploying the Bicep templates.
# Usage: ./seed-secrets.sh dev   or   ./seed-secrets.sh prod
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

ENV="${1:?Usage: ./seed-secrets.sh <dev|prod>}"
VAULT_NAME="kv-flashid-${ENV}"

echo "Seeding secrets into ${VAULT_NAME}..."
echo "You will be prompted for each secret value."
echo ""

prompt_and_set() {
  local SECRET_NAME="$1"
  local DESCRIPTION="$2"
  echo "─── ${DESCRIPTION} ───"
  read -rsp "  ${SECRET_NAME}: " VALUE
  echo ""
  az keyvault secret set --vault-name "${VAULT_NAME}" --name "${SECRET_NAME}" --value "${VALUE}" --output none
  echo "  ✓ Set ${SECRET_NAME}"
  echo ""
}

# api-flashid secrets 
prompt_and_set "BlobStorage--ConnectionString"    "Azure Storage connection string (from portal > Storage Account > Access Keys)"
prompt_and_set "Cosmos--ConnectionString"          "Cosmos DB connection string (from portal > Cosmos DB > Keys)"
prompt_and_set "Cosmos--CredentialIdHmacKey"       "Cosmos credential ID HMAC key"
prompt_and_set "Email--AppPassword"                "Gmail app password for t3chtitansgo@gmail.com"
prompt_and_set "GovernmentRegistry--ApiKeyGov"     "API key for Government Registry (must match Security--ApiKeyGov in gov registry)"
prompt_and_set "Jwt--Key"                          "JWT signing key (min 32 chars)"
prompt_and_set "Qr--Ed25519PrivateKey"             "Ed25519 private key for QR code signing"
prompt_and_set "SmsPortal--ApiKey"                 "SMS Portal API key"
prompt_and_set "SmsPortal--ApiSecret"              "SMS Portal API secret"

# api-government-registry secrets 
prompt_and_set "Security--ApiKeyGov"               "Gov Registry's own API key (must match GovernmentRegistry--ApiKeyGov above)"

# web-flashid secrets 
prompt_and_set "JWT-SECRET"                        "JWT secret for the Next.js web app"
prompt_and_set "DOCKER-REGISTRY-SERVER-PASSWORD"   "ACR password (from portal > Container Registry > Access Keys, or leave empty for managed identity)"

# DB Connection strings
prompt_and_set "ConnectionStrings--DefaultConnection-Flashid" "SQL connection string for sqldb-flashid-${ENV} (Server=tcp:sql-flashid.database.windows.net,1433;...)"
prompt_and_set "ConnectionStrings--DefaultConnection-GovRegistry" "SQL connection string for sqldb-gov-registry (shared dev+prod. Same value both times)"

echo "─────────────────────────────────────────────"
echo "✓ All secrets seeded into ${VAULT_NAME}"
echo ""
echo "Verify with: az keyvault secret list --vault-name ${VAULT_NAME} --output table"
