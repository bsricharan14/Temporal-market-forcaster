import argparse
from pathlib import Path

import psycopg
from dotenv import load_dotenv

from app.core.config import settings


DEFAULT_SCHEMA = Path(__file__).resolve().parents[1] / "sql" / "001_timescale_schema.sql"
DEFAULT_CSV = Path(__file__).resolve().parents[2] / "synthetic_ticks.csv"
ENV_FILE = Path(__file__).resolve().parents[1] / ".env"

load_dotenv(dotenv_path=ENV_FILE)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Initialize TimescaleDB schema and optional sample data")
    parser.add_argument(
        "--database-url",
        default=settings.get_database_url(),
        help="PostgreSQL connection URL",
    )
    parser.add_argument(
        "--schema-file",
        default=str(DEFAULT_SCHEMA),
        help="Path to SQL schema file",
    )
    parser.add_argument(
        "--csv-file",
        default=str(DEFAULT_CSV),
        help="Path to synthetic ticks CSV",
    )
    parser.add_argument(
        "--load-sample-data",
        action="store_true",
        help="Load CSV into both hypertable and plain benchmark table",
    )
    parser.add_argument(
        "--truncate",
        action="store_true",
        help="Truncate existing tick rows before loading sample data",
    )
    return parser.parse_args()


def execute_schema(conn: psycopg.Connection, schema_file: Path) -> None:
    sql_text = schema_file.read_text(encoding="utf-8")
    with conn.cursor() as cur:
        cur.execute(sql_text)


def load_sample_data(conn: psycopg.Connection, csv_file: Path, truncate: bool) -> None:
    if not csv_file.exists():
        raise FileNotFoundError(f"CSV file not found: {csv_file}")

    with conn.cursor() as cur:
        if truncate:
            cur.execute("TRUNCATE TABLE market_ticks RESTART IDENTITY CASCADE")
            cur.execute("TRUNCATE TABLE market_ticks_plain RESTART IDENTITY")

        with csv_file.open("r", encoding="utf-8") as f:
            with cur.copy("COPY market_ticks(time, symbol, price, volume) FROM STDIN WITH (FORMAT csv, HEADER true)") as copy:
                for line in f:
                    copy.write(line)

        with csv_file.open("r", encoding="utf-8") as f:
            with cur.copy("COPY market_ticks_plain(time, symbol, price, volume) FROM STDIN WITH (FORMAT csv, HEADER true)") as copy:
                for line in f:
                    copy.write(line)

        cur.execute("CALL refresh_continuous_aggregate('ohlcv_1m', NULL, NULL)")


def main() -> None:
    args = parse_args()
    schema_file = Path(args.schema_file).resolve()
    csv_file = Path(args.csv_file).resolve()

    if not schema_file.exists():
        raise FileNotFoundError(f"Schema file not found: {schema_file}")

    with psycopg.connect(args.database_url, autocommit=True) as conn:
        execute_schema(conn, schema_file)
        if args.load_sample_data:
            load_sample_data(conn, csv_file, args.truncate)

    print("Database bootstrap complete.")


if __name__ == "__main__":
    main()
