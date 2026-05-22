# TeamPulse — Leave & Roster Management
### Claims1 · PI2 2026

## Stack

| Layer       | Technology                        | Azure Service                    |
|-------------|-----------------------------------|----------------------------------|
| Frontend    | React 18 + Webpack 5 + Tailwind   | Azure Static Web Apps            |
| Backend API | .NET Core 8 Web API (C#)          | Azure App Service (Linux, B1)    |
| Database    | PostgreSQL                        | Azure Database for PostgreSQL    |
| CI/CD       | GitHub Actions                    | Auto-deploy on push to `main`    |
| Auth (future)| Azure AD / Entra ID              | Microsoft Entra ID               |

---

## Project structure

```
teampulse-azure/
├── frontend/          React + Webpack app
│   ├── src/
│   │   ├── api/       API client (all fetch calls)
│   │   ├── components/ React components
│   │   ├── hooks/     Custom hooks (useLeaves)
│   │   └── data/      Team roster data
│   ├── webpack.config.js
│   └── package.json
│
├── backend/           .NET Core 8 Web API
│   ├── Controllers/   API controllers
│   ├── Models/        EF Core entity models
│   ├── Data/          DbContext + migrations
│   ├── DTOs/          Request/response shapes
│   └── TeamPulse.API.csproj
│
├── infra/             Azure Bicep IaC (optional)
└── .github/workflows/ CI/CD pipelines
```

---

## Local development

### Prerequisites
- Node.js 20+
- .NET 8 SDK
- PostgreSQL 15+ (local or Docker)

### 1 — PostgreSQL (Docker, easiest)
```bash
docker run -d \
  --name teampulse-db \
  -e POSTGRES_PASSWORD=localpass \
  -e POSTGRES_DB=teampulse \
  -p 5432:5432 \
  postgres:15
```

### 2 — Backend
```bash
cd backend
cp appsettings.Development.json.example appsettings.Development.json
# Edit connection string if needed
dotnet restore
dotnet ef database update   # runs migrations, creates tables
dotnet run                  # http://localhost:5000
```

### 3 — Frontend
```bash
cd frontend
npm install
cp .env.example .env        # REACT_APP_API_URL=http://localhost:5000
npm run dev                 # http://localhost:3000
```

---

## Azure deployment

### Step 1 — Create Azure resources (Azure Portal or CLI)

```bash
# Resource group
az group create --name rg-teampulse --location eastus

# PostgreSQL Flexible Server
az postgres flexible-server create \
  --resource-group rg-teampulse \
  --name teampulse-db \
  --admin-user tpadmin \
  --admin-password "YourStrongPassword123!" \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --storage-size 32 \
  --version 15

# Create database
az postgres flexible-server db create \
  --resource-group rg-teampulse \
  --server-name teampulse-db \
  --database-name teampulse

# App Service Plan + Web App
az appservice plan create \
  --name plan-teampulse \
  --resource-group rg-teampulse \
  --sku B1 \
  --is-linux

az webapp create \
  --resource-group rg-teampulse \
  --plan plan-teampulse \
  --name teampulse-api \
  --runtime "DOTNETCORE:8.0"

# Static Web App (links to GitHub automatically)
az staticwebapp create \
  --name teampulse-frontend \
  --resource-group rg-teampulse \
  --source https://github.com/pandekarabhishek/Claims1-Roster \
  --branch main \
  --app-location "/frontend" \
  --output-location "dist"
```

### Step 2 — Set App Service environment variables
```bash
az webapp config appsettings set \
  --resource-group rg-teampulse \
  --name teampulse-api \
  --settings \
    ASPNETCORE_ENVIRONMENT=Production \
    ConnectionStrings__DefaultConnection="Host=teampulse-db.postgres.database.azure.com;Database=teampulse;Username=tpadmin;Password=YourStrongPassword123!;SSL Mode=Require" \
    AllowedOrigins__0="https://your-app.azurestaticapps.net"
```

### Step 3 — GitHub Actions secrets
In your GitHub repo → Settings → Secrets → Actions, add:
- `AZURE_WEBAPP_PUBLISH_PROFILE` — download from App Service → Get publish profile
- `AZURE_STATIC_WEB_APPS_API_TOKEN` — from Static Web Apps → Manage deployment token
- `DB_CONNECTION_STRING` — your PostgreSQL connection string

### Step 4 — Push → auto deploys
```bash
git add . && git commit -m "feat: initial Azure deployment" && git push origin main
```

---

## Database schema (auto-created by EF Core migrations)

```sql
CREATE TABLE "Leaves" (
  "Id"        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "Emp"       VARCHAR(150) NOT NULL,
  "Type"      VARCHAR(20)  NOT NULL,
  "FromDate"  DATE         NOT NULL,
  "ToDate"    DATE         NOT NULL,
  "Note"      TEXT         DEFAULT '',
  "CreatedAt" TIMESTAMPTZ  DEFAULT NOW(),
  "CreatedBy" VARCHAR(150) DEFAULT ''
);

CREATE INDEX idx_leaves_emp      ON "Leaves" ("Emp");
CREATE INDEX idx_leaves_fromdate ON "Leaves" ("FromDate");
```

---

## API endpoints

| Method | Endpoint              | Description             |
|--------|-----------------------|-------------------------|
| GET    | /api/leaves           | Get all leaves          |
| GET    | /api/leaves/{id}      | Get single leave        |
| GET    | /api/leaves/emp/{name}| Get leaves by employee  |
| POST   | /api/leaves           | Create leave entry      |
| DELETE | /api/leaves/{id}      | Delete leave entry      |
| GET    | /health               | Health check + DB ping  |

---

*TeamPulse v3.0 · .NET 8 · React · PostgreSQL · Azure*
