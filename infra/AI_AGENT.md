# AI Agent Instructions — FlashID Infrastructure

These instructions allow an AI agent to validate or provision the FlashID Azure infrastructure using Bicep templates.

## Context

- **Project:** FlashID — South African Digital ID Wallet
- **IaC tool:** Azure Bicep
- **Subscription ID:** `84b58bef-eed1-40b2-810f-88f5d5f394b2`
- **Resource group:** `rg-capstone-techtitans`
- **Region:** `southafricanorth`
- **Environments:** `dev`, `prod`
- **Working directory:** All commands assume the current directory is the `infra/` folder containing `main.bicep`

## File map

| File | Purpose |
|---|---|
| `main.bicep` | Orchestrator — calls all 8 modules, wires cross-module dependencies |
| `main.dev.bicepparam` | Parameter values for the dev environment |
| `main.prod.bicepparam` | Parameter values for the prod environment |
| `modules/appservice.bicep` | App Service (reusable — called 3 times for api-flashid, api-government-registry, web-flashid) |
| `modules/appserviceplan.bicep` | Linux App Service Plan (shared across environments) |
| `modules/communicationservices.bicep` | Azure Communication Services |
| `modules/cosmos.bicep` | Cosmos DB account + 2 SQL databases (FlashIDDb, FlashIdQrDb) + 2 containers |
| `modules/faceapi.bicep` | Cognitive Services Face API |
| `modules/keyvault.bicep` | Key Vault (RBAC-only, no access policies) |
| `modules/sql.bicep` | SQL Server + database loop (serverless Gen5 vCore) |
| `modules/storage.bicep` | Storage account + blob containers (citizen-photos, images) |

## Prerequisites

Before running any commands, ensure:

1. Azure CLI is installed (`az --version` to check)
2. Bicep CLI is available (`az bicep version` — install with `az bicep install` if missing)
3. The operator is authenticated (`az login`)
4. The correct subscription is selected
5. The SQL admin password is available as an environment variable

## Procedure: Validate dev environment

Run these steps in order. Do NOT skip any step. Use `what-if` only — never `create`.

### Step 1 — Authenticate

```bash
az login
```

If already logged in, verify with:

```bash
az account show --query "{name:name, id:id}" --output table
```

### Step 2 — Set subscription

```bash
az account set --subscription "84b58bef-eed1-40b2-810f-88f5d5f394b2"
```

### Step 3 — Verify the resource group exists

```bash
az group show --name rg-capstone-techtitans --query "{name:name, location:location}" --output table
```

If the resource group does not exist, create it:

```bash
az group create --name rg-capstone-techtitans --location southafricanorth
```

### Step 4 — Set the SQL password environment variable

PowerShell:
```powershell
$env:SQL_ADMIN_PASSWORD = "<prompt the user for this value — never hardcode or guess>"
```

Bash:
```bash
export SQL_ADMIN_PASSWORD="<prompt the user for this value — never hardcode or guess>"
```

**Important:** The SQL password is sensitive. Always ask the user to provide it. Never log it, echo it, or store it in a file.

### Step 5 — Run what-if for dev

```bash
az deployment group what-if --resource-group rg-capstone-techtitans --template-file main.bicep --parameters main.dev.bicepparam
```

### Step 6 — Interpret the output

The what-if output uses these symbols:

| Symbol | Meaning | Action required |
|---|---|---|
| `+` (Create) | Resource will be created | Review — expected for first-time setup |
| `~` (Modify) | Resource exists, properties will change | Review each property change |
| `-` (Delete) | Resource will be deleted | **Investigate immediately** — likely a naming mismatch |
| `=` (NoChange) | Resource matches the template | No action needed |
| `*` (Ignore) | Resource exists but is not in this deployment | Expected for resources belonging to the other environment |
| `x` (NoEffect) | Property is sent but Azure will ignore it | Harmless |

**Expected results for a validated dev environment:**
- Zero creates (all resources already exist)
- Zero deletes
- Some modifications (security hardening: FTP disabled, TLS 1.2, HTTP/2)
- Multiple no-change entries
- Prod resources listed as ignored

**Red flags — stop and investigate:**
- Any resource showing as delete (`-`)
- Unexpected creates for resources that should already exist (naming mismatch)
- Errors about missing parameters or invalid property values

### Step 7 — Report the result

Summarise: how many creates, modifies, no-changes, deletes, and ignores. Flag any deletes or unexpected creates.

## Procedure: Validate prod environment

Follow the same steps as dev, but replace Step 5 with:

```bash
az deployment group what-if --resource-group rg-capstone-techtitans --template-file main.bicep --parameters main.prod.bicepparam
```

**Prod-specific notes:**
- Prod has 1 SQL database (`sqldb-flashid-prod`), dev has 2 (`sqldb-flashid-dev`, `sqldb-gov-registry`)
- Prod uses `Geo` backup redundancy, dev uses `Local`
- The web app at `web-flashid-prod` has a custom domain (`flashid.co.za`) with an SSL certificate — this is managed outside Bicep and will appear as an ignored resource

## Procedure: Validate both environments

Run the dev procedure (Steps 1-7), then run the prod what-if (replacing the parameters file). The subscription, authentication, and resource group steps only need to run once.

## Cross-module dependencies

The orchestrator (`main.bicep`) wires these automatically — no manual intervention needed:

- **App Service Plan ID** flows into all 3 App Service modules
- **Web App hostname** flows into the Storage module for CORS configuration
- **`env == 'dev'`** enables Cosmos free tier (only one allowed per subscription)
- **`env == 'dev'`** enables public blob access on the storage account

## Security notes

- **No secrets exist in these templates.** Key Vault uses RBAC authorisation. SQL password comes from an environment variable at deploy time.
- **Never commit** the SQL password, Key Vault secrets, or any connection strings to source control.
- **Managed identities** (`SystemAssigned`) are enabled on all App Services — these should be granted RBAC roles (Key Vault Secrets User, Storage Blob Data Contributor, etc.) as a post-deploy step.
- **FTP is disabled** on all App Services. SCM (Kudu) credentials are enabled for CI/CD.
- **TLS 1.2** is the minimum version on all resources that support it.

## Warnings you can safely ignore

| Warning code | Source | Reason |
|---|---|---|
| BCP081 | `appservice.bicep`, `appserviceplan.bicep` | API version `2024-11-01` types not yet in the local Bicep CLI type cache. Does not affect deployment. Fix by running `az bicep upgrade`. |
| BCP334 | `cosmos.bicep`, `storage.bicep` | Bicep warns the computed name *could* be too short if `baseName` or `env` were 1 character. With `flashid`/`dev`/`prod` this never triggers. |
| "false positive predictions (noise)" | what-if output header | Standard Azure disclaimer — some property diffs are cosmetic. |

## Troubleshooting

| Problem | Solution |
|---|---|
| `az: command not found` | Install Azure CLI: https://learn.microsoft.com/en-us/cli/azure/install-azure-cli |
| `az bicep: command not found` | Run `az bicep install` |
| `The subscription could not be found` | Run `az login` again, then `az account set --subscription "84b58bef-eed1-40b2-810f-88f5d5f394b2"` |
| `Resource group not found` | Run `az group create --name rg-capstone-techtitans --location southafricanorth` |
| `readEnvironmentVariable failed` | The `SQL_ADMIN_PASSWORD` environment variable is not set in the current shell session |
| BCP037 warning about `capacityMode` | Run `az bicep upgrade` to get the latest type definitions |
