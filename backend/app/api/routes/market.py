from fastapi import APIRouter

router = APIRouter(prefix="/market", tags=["market"])


@router.get("/ticks")
async def get_ticks():
    # TODO: fetch recent tick data from hypertable
    pass


@router.get("/ohlcv")
async def get_ohlcv():
    # TODO: fetch OHLCV candlestick data from continuous aggregates
    pass


@router.get("/benchmark")
async def benchmark():
    # TODO: run latency comparison between vanilla table and hypertable
    pass
