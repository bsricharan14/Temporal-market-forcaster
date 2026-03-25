from psycopg_pool import AsyncConnectionPool
from app.core.config import settings

_pool = None


async def get_pool():
    global _pool
    if _pool is None:
        _pool = AsyncConnectionPool(
            conninfo=settings.get_database_url(),
            min_size=1,
            max_size=10,
            open=False,
        )
        await _pool.open()
    return _pool


async def close_pool():
    global _pool
    if _pool is not None:
        await _pool.close()
        _pool = None


async def get_connection_pool():
    pool = await get_pool()
    return pool
