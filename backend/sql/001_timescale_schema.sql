CREATE EXTENSION IF NOT EXISTS timescaledb;

CREATE TABLE IF NOT EXISTS symbols (
    symbol TEXT PRIMARY KEY,
    name TEXT,
    market TEXT NOT NULL DEFAULT 'NASDAQ',
    lot_size INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS market_ticks (
    time TIMESTAMPTZ NOT NULL,
    symbol TEXT NOT NULL REFERENCES symbols(symbol),
    price NUMERIC(12, 4) NOT NULL CHECK (price > 0),
    volume BIGINT NOT NULL CHECK (volume > 0),
    trade_id BIGSERIAL,
    ingest_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (time, symbol, trade_id)
);

SELECT create_hypertable(
    'market_ticks',
    by_range('time', INTERVAL '1 day'),
    if_not_exists => TRUE,
    migrate_data => TRUE
);

SELECT add_dimension('market_ticks', by_hash('symbol', 4), if_not_exists => TRUE);

CREATE TABLE IF NOT EXISTS market_ticks_plain (
    time TIMESTAMPTZ NOT NULL,
    symbol TEXT NOT NULL,
    price NUMERIC(12, 4) NOT NULL CHECK (price > 0),
    volume BIGINT NOT NULL CHECK (volume > 0),
    trade_id BIGSERIAL,
    ingest_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (time, symbol, trade_id)
);

CREATE INDEX IF NOT EXISTS idx_market_ticks_symbol_time ON market_ticks (symbol, time DESC);
CREATE INDEX IF NOT EXISTS idx_market_ticks_time ON market_ticks (time DESC);
CREATE INDEX IF NOT EXISTS idx_market_ticks_plain_symbol_time ON market_ticks_plain (symbol, time DESC);

CREATE MATERIALIZED VIEW IF NOT EXISTS ohlcv_1m
WITH (timescaledb.continuous) AS
SELECT
    time_bucket(INTERVAL '1 minute', time) AS bucket,
    symbol,
    first(price, time) AS open,
    max(price) AS high,
    min(price) AS low,
    last(price, time) AS close,
    sum(volume) AS volume
FROM market_ticks
GROUP BY bucket, symbol
WITH NO DATA;

CREATE INDEX IF NOT EXISTS idx_ohlcv_1m_symbol_bucket ON ohlcv_1m (symbol, bucket DESC);

CREATE OR REPLACE VIEW latest_quotes AS
SELECT DISTINCT ON (symbol)
    symbol,
    time,
    price,
    volume
FROM market_ticks
ORDER BY symbol, time DESC;

ALTER TABLE market_ticks
SET (
    timescaledb.compress,
    timescaledb.compress_segmentby = 'symbol',
    timescaledb.compress_orderby = 'time DESC'
);

DO $$
BEGIN
    PERFORM add_continuous_aggregate_policy(
        'ohlcv_1m',
        start_offset => INTERVAL '2 hours',
        end_offset => INTERVAL '1 minute',
        schedule_interval => INTERVAL '1 minute'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    PERFORM add_compression_policy('market_ticks', INTERVAL '3 days');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    PERFORM add_retention_policy('market_ticks', INTERVAL '30 days');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

INSERT INTO symbols(symbol, name)
VALUES
    ('AAPL', 'Apple Inc.'),
    ('MSFT', 'Microsoft Corp.'),
    ('GOOGL', 'Alphabet Inc.')
ON CONFLICT (symbol) DO NOTHING;
