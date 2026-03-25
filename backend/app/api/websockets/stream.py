import asyncio

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()


@router.websocket("/ws/stream/{symbol}")
async def market_stream(websocket: WebSocket, symbol: str):
    await websocket.accept()
    try:
        while True:
            # Keep socket alive until real tick streaming is wired in.
            await websocket.send_json({"symbol": symbol, "status": "connected"})
            await asyncio.sleep(2)
    except WebSocketDisconnect:
        pass
