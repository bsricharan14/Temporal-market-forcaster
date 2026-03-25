# TimescaleDB Schema Setup

This backend now includes a temporal schema tuned for high-frequency market ticks.

## Included artifacts

- SQL schema: `backend/sql/001_timescale_schema.sql`
- Bootstrap script: `backend/scripts/bootstrap_db.py`
- Runtime API routes:
  - `GET /market/ticks`
  - `GET /market/ohlcv`
  - `GET /market/benchmark`

## Schema design

### 1) Dimension table

- `symbols` stores instrument metadata and active/inactive state.

### 2) Temporal fact tables

- `market_ticks` is a Timescale hypertable on `time` with a hash dimension on `symbol`.
- `market_ticks_plain` is a regular Postgres table for benchmark comparison.

### 3) Aggregation layer

- `ohlcv_1m` is a Timescale continuous aggregate for 1-minute candles.
- `latest_quotes` provides latest tick per symbol.

### 4) Performance and lifecycle policies

- Composite indexes for `(symbol, time DESC)` on hot query paths.
- Compression policy after 3 days.
- Retention policy after 30 days.
- Continuous aggregate refresh policy every minute.

## Quick start

### Option A: Docker (recommended)

From project root:

```bash
docker compose up -d
```

### Option B: Existing PostgreSQL/TimescaleDB instance

Use your own instance and set `DATABASE_URL` in `backend/.env`.

## Initialize schema

From `backend` folder:

```bash
python scripts/bootstrap_db.py
```

## Load sample tick data

From `backend` folder:

```bash
python scripts/bootstrap_db.py --load-sample-data --truncate
```

The script loads `../synthetic_ticks.csv` into both `market_ticks` and `market_ticks_plain` and refreshes `ohlcv_1m`.

## Example API calls

```bash
curl "http://localhost:8000/market/ticks?symbol=AAPL&limit=100"
curl "http://localhost:8000/market/ohlcv?symbol=AAPL&limit=120"
curl "http://localhost:8000/market/benchmark?symbol=AAPL&window_minutes=60"
```
