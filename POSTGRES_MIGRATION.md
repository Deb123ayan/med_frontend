# 🐘 PostgreSQL Migration Guide

This guide will help you migrate your Health Insights database from SQLite to PostgreSQL and view it using pgAdmin 4.

## 📋 Prerequisites

1.  **Install PostgreSQL**: Download and install from [postgresql.org](https://www.postgresql.org/download/windows/).
    *   During installation, remember the **password** you set for the `postgres` user.
2.  **Install pgAdmin 4**: This usually comes with the PostgreSQL installer. If not, download it separately.

---

## 🚀 Migration Steps

### Step 1: Prepare the Environment

1.  **Stop the Backend Server**: in your terminal, press `Ctrl+C` to stop `runserver`.
2.  **Install PostgreSQL Driver**:
    ```bash
    cd backend
    pip install psycopg2-binary
    ```
    *(We have already added this to `requirements.txt`, so just running `pip install -r requirements.txt` works too)*

### Step 2: Create the PostgreSQL Database

1.  Open **pgAdmin 4** from your Start menu.
2.  In the browser tree (left side), right-click on **Servers** -> **Register** -> **Server**.
    *   **Name**: `Localhost`
    *   **Connection** tab:
        *   **Host**: `localhost`
        *   **Username**: `postgres`
        *   **Password**: (The one you set during installation)
    *   Click **Save**.
3.  Expand **Servers** -> **Localhost** -> **Databases**.
4.  Right-click **Databases** -> **Create** -> **Database**.
    *   **Database**: `health_insights_db`
    *   Click **Save**.

### Step 2.5: Automated Migration (Recommended)

We have created an automated script to handle the data transfer for you.

1.  **Configure `.env`**: Create a `.env` file in `backend/` with your Postgres credentials (see `.env.example`).
2.  **Run the script**:
    ```bash
    cd backend
    python migrate_to_postgres.py
    ```
    *This script effectively replaces Steps 3, 5, and 6 below.*

### (Manual Method) Step 3: Backup Current Data (SQLite)

Before switching, export your current data.

```bash
# In backend/ directory
# Create a folder for backups
mkdir backups

# Dump data (excluding contenttypes and auth.permission to avoid conflicts)
python manage.py dumpdata --exclude auth.permission --exclude contenttypes > backups/data_dump.json
```

### Step 4: Configure the Backend

Create a `.env` file in the `backend/` directory with the following content:

```ini
# backend/.env
DEBUG=True
SECRET_KEY=your-secret-key-here
DB_ENGINE=postgres
DB_NAME=health_insights_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432
```

*Replace `your_postgres_password` with your actual password.*

### Step 5: Apply Migrations to PostgreSQL

Now that the backend is configured to use PostgreSQL, run migrations to create the tables.

```bash
python manage.py migrate
```

### Step 6: Load Data into PostgreSQL

Import the data you dumped from SQLite.

```bash
python manage.py loaddata backups/data_dump.json
```

---

## 🔍 Viewing Data in pgAdmin 4

1.  Open **pgAdmin 4**.
2.  Navigate to **Servers** -> **Localhost** -> **Databases** -> **health_insights_db** -> **Schemas** -> **public** -> **Tables**.
3.  Right-click on any table (e.g., `api_patient` or `api_prediction`).
4.  Select **View/Edit Data** -> **All Rows**.
5.  You should see your migrated data!

---

## ⚠️ Troubleshooting

-   **Authentication Failed**: Check your `DB_PASSWORD` in `.env`.
-   **Database Does Not Exist**: Ensure you created `health_insights_db` in pgAdmin exactly as named.
-   **IntegrityError during loaddata**: This can happen if data already exists (e.g., default permissions). Ensure you excluded `auth.permission` and `contenttypes` during dump.
-   **Connection Refused**: Ensure PostgreSQL service is running (Check Windows Services).

## 🔄 Reverting to SQLite

If you face issues, simply comment out `DB_ENGINE=postgres` in your `.env` file, and the system will transparently switch back to `db.sqlite3`.
