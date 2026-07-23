import asyncio
import json
import logging
from typing import Dict, List, Callable, Any

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("EventBus")

class EventBus:
    def __init__(self):
        self._subscribers: Dict[str, List[Callable[[Any], Any]]] = {}
        self._websocket_connections: List[Any] = []

    def subscribe(self, event_type: str, callback: Callable[[Any], Any]):
        if event_type not in self._subscribers:
            self._subscribers[event_type] = []
        self._subscribers[event_type].append(callback)

    async def publish(self, event_type: str, data: Any):
        logger.info(f"Event: {event_type} - {str(data)[:200]}")
        
        # Run local callback subscribers
        if event_type in self._subscribers:
            for callback in self._subscribers[event_type]:
                try:
                    if asyncio.iscoroutinefunction(callback):
                        await callback(data)
                    else:
                        callback(data)
                except Exception as e:
                    logger.error(f"Error in subscriber callback for {event_type}: {e}")
        
        # Broadcast to websockets
        payload = json.dumps({"event": event_type, "data": data})
        dead_connections = []
        for ws in self._websocket_connections:
            try:
                await ws.send_text(payload)
            except Exception:
                dead_connections.append(ws)
        
        for dead in dead_connections:
            if dead in self._websocket_connections:
                self._websocket_connections.remove(dead)

    def register_websocket(self, websocket):
        self._websocket_connections.append(websocket)

    def unregister_websocket(self, websocket):
        if websocket in self._websocket_connections:
            self._websocket_connections.remove(websocket)

# Global Event Bus Instance
event_bus = EventBus()
