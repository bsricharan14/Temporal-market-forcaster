# 📈 Database Setup Guide (Docker)

Our project uses a custom Docker container that merges **PostgresML** (for in-database machine learning) and **TimescaleDB** (for temporal/time-series data). 

**You do not need to install PostgreSQL locally.** Docker will handle the entire environment.

## Prerequisites
1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/Mac) or Docker Engine (Linux).
2. Ensure the Docker engine is running in the background.
3. Pull the latest code from this repository.

---

## Step 1: Configure Environment Variables
You must set up your local credentials before building the database.
1. Navigate to the `backend/` folder.
2. Duplicate the `.env.example` file and rename it to exactly `.env`.
3. Open `.env` and set your credentials (e.g., `DB_USER=user`, `DB_NAME=market_db`, `DB_PASSWORD=password`).

---

## Step 2: Build and Launch the Engine
Open your terminal at the root of the project (where the `docker-compose.yml` is) and run:

```bash
docker compose --env-file ./backend/.env up -d --build