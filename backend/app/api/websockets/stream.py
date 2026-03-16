from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()


@router.websocket("/ws/stream/{symbol}")
async def market_stream(websocket: WebSocket, symbol: str):
    await websocket.accept()
    try:
        while True:
            # TODO: push live price ticks to the frontend
            pass
    except WebSocketDisconnect:
        pass
