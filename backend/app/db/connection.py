import psycopg
from app.core.config import settings

_pool = None


async def get_pool():
    global _pool
    if _pool is None:
        _pool = await psycopg.AsyncConnection.connect(settings.DATABASE_URL)
    return _pool


async def get_connection():
    pool = await get_pool()
    return pool
