from pydantic import BaseModel
from datetime import datetime


class Tick(BaseModel):
    time: datetime
    symbol: str
    price: float
    volume: int


class OHLCV(BaseModel):
    bucket: datetime
    symbol: str
    open: float
    high: float
    low: float
    close: float
    volume: int
