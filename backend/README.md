# Backend Database Setup

This guide helps every teammate create the same **local** SQL Server database for the backend using **SQL Server Express 2025**, **SSMS**, and **Entity Framework Core migrations**.

## Goal

Every developer should have the same schema locally:

- SQL Server Express name: `localhost\SQLEXPRESS`
- Database name: `FlashIdDb`
- Schema source: EF Core migrations in `FlashIdBackend/Infrastructure/Migrations`

## Prerequisites

Install these first:

- .NET 10 SDK
- SQL Server Express 2025
- SQL Server Management Studio (SSMS)
- `dotnet-ef`

Install `dotnet-ef` if needed:

```powershell
dotnet tool install --global dotnet-ef
```

## Connection string

The backend is configured to use this local connection string:

```text
Server=localhost\SQLEXPRESS;Database=FlashIdDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True
```

This points the app to your local SQL Server Express instance and lets SSMS / EF Core use the same database name.

## Connect to the SQL Server Express instance in SSMS

1. Open **SSMS**.
2.  **Connect** dialog box pops up.
3. Use these values:
   - **Server name:** `localhost\SQLEXPRESS`
   - **Authentication:** Windows Authentication
   - enable the **Trust server certificate** checkbox

## Create the database schema with EF Core migrations

From the repo root, run:

```powershell
dotnet ef database update --project backend/FlashIdBackend/Infrastructure --startup-project backend/FlashIdBackend/Presentation
```

What this does:

- reads the EF Core model from `AppDbContext`
- applies the migrations in `Infrastructure/Migrations`
- creates `FlashIdDb` if it does not exist
- creates all tables, keys, indexes, and relationships

## After running the migration

Open SSMS and verify:

- `FlashIdDb` exists under **Databases**
- tables were created successfully
- the schema matches the current backend entities

## If you change the model later

If you change entities, enums, or relationships, create a new migration and update the database again:

```powershell
dotnet ef migrations add <MigrationName> --project backend/FlashIdBackend/Infrastructure --startup-project backend/FlashIdBackend/Presentation
dotnet ef database update --project backend/FlashIdBackend/Infrastructure --startup-project backend/FlashIdBackend/Presentation
```

## Troubleshooting

- **Cannot connect in SSMS:** make sure `SQL Server (SQLEXPRESS)` is running in Windows Services.
- **SSL / certificate warning:** use **Trust server certificate** in SSMS for local dev.
- **Database missing:** rerun `dotnet ef database update`.
- **`dotnet-ef` not found:** install it with `dotnet tool install --global dotnet-ef`.
- **Wrong database name:** make sure you are using `FlashIdDb`, not `master`.

## Summary

If everyone uses the same migration files and the same local connection string, each teammate can generate the same database schema on their own machine.

