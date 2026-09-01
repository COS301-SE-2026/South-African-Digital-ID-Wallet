# FlashID Infrastructure as Code

Azure infrastructure for the FlashID Digital ID Wallet platform, defined in [Bicep](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/overview) (Azure's native IaC language). These templates replace manual portal provisioning with reproducible, version-controlled deployments.

## Project details

| Item | Value |
|---|---|
| Subscription | `84b58bef-eed1-40b2-810f-88f5d5f394b2` |
| Resource group | `rg-capstone-techtitans` |
| Region | `southafricanorth` |
| Environments | `dev`, `prod` |

## Structure

```
infra/
  main.bicep                  # Orchestrator - calls all modules
  main.dev.bicepparam         # Dev environment values
  main.prod.bicepparam        # Prod environment values
  AI_AGENT.md                 # Instructions for AI agents (setup & validation)
  modules/
    appservice.bicep           # App Service (reused for all 3 web apps)
    appserviceplan.bicep       # App Service Plan (shared across environments)
    communicationservices.bicep # Azure Communication Services
    cosmos.bicep               # Cosmos DB account, databases, containers
    faceapi.bicep              # Cognitive Services Face API
    keyvault.bicep             # Key Vault (RBAC-only, no secrets in code)
    sql.bicep                  # SQL Server + databases (serverless Gen5)
    storage.bicep              # Storage account + blob containers
```

## Resources per environment

| Resource | Dev name | Prod name |
|---|---|---|
| App Service Plan | `asp-flashid` (shared) | `asp-flashid` (shared) |
| API - FlashID | `api-flashid-dev` | `api-flashid-prod` |
| API - Gov Registry | `api-government-registry-dev` | `api-government-registry-prod` |
| Web App (Docker) | `web-flashid-dev` | `web-flashid-prod` |
| Communication Services | `acs-flashid-dev` | `acs-flashid-prod` |
| Cosmos DB | `flashid-qr-cosmos-dev` | `flashid-qr-cosmos-prod` |
| Face API | `face-digitalwallet-dev` | `face-digitalwallet-prod` |
| Key Vault | `kv-flashid-dev` | `kv-flashid-prod` |
| SQL Server | `sql-flashid` (shared) | `sql-flashid` (shared) |
| SQL Database(s) | `sqldb-flashid-dev`, `sqldb-gov-registry` | `sqldb-flashid-prod` |
| Storage Account | `stflashiddev` | `stflashidprod` |

## Prerequisites

- [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli) (v2.50+)
- Bicep CLI (bundled with Azure CLI, or run `az bicep install`)
- An Azure account with Contributor access to the resource group

## Quick start

### 1. Log in and set subscription

```bash
az login
az account set --subscription "84b58bef-eed1-40b2-810f-88f5d5f394b2"
```

### 2. Set the SQL password environment variable

PowerShell:
```powershell
$env:SQL_ADMIN_PASSWORD = "YourPasswordHere"
```

Bash:
```bash
export SQL_ADMIN_PASSWORD="YourPasswordHere"
```

### 3. Validate with what-if (dry run)

```bash
az deployment group what-if \
  --resource-group rg-capstone-techtitans \
  --template-file main.bicep \
  --parameters main.dev.bicepparam
```

This shows what would change without touching any resources. Review the output:
- **Green (+)** = create
- **Orange (~)** = modify
- **Red (-)** = delete
- **Purple (*)** = no change / ignored

### 4. Deploy (when ready)

```bash
az deployment group create \
  --resource-group rg-capstone-techtitans \
  --template-file main.bicep \
  --parameters main.dev.bicepparam
```

Replace `main.dev.bicepparam` with `main.prod.bicepparam` for production.

## Design decisions

- **No secrets in code.** Key Vault uses RBAC auth (`enableRbacAuthorization: true`). SQL password is read from an environment variable at deploy time. App-level secrets are set via Key Vault references, not Bicep.
- **Managed identities** (`SystemAssigned`) on all App Services for passwordless auth to Azure services.
- **Security hardened.** FTP disabled, TLS 1.2 minimum, HTTP/2 enabled, SCM credentials enabled (for CI/CD).
- **Shared resources.** App Service Plan and SQL Server are shared across dev/prod (no env suffix). Each environment gets its own databases, app services, and supporting resources.
- **Container Registry** (`acrflashid`) exists but is not managed by these templates.
- **Prod custom domain** (`flashid.co.za`) and SSL certificate are managed outside Bicep as a post-deploy step.

## AI agents

See [AI_AGENT.md](AI_AGENT.md) for machine-readable instructions that AI coding agents can follow to validate or provision the infrastructure.
