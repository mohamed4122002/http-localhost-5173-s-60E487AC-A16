import logging
import sys
import time
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

# Configure logging
def setup_logging():
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[
            logging.StreamHandler(sys.stdout)
        ]
    )

logger = logging.getLogger("survey_platform")

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable):
        start_time = time.time()
        
        # Log request details
        method = request.method
        url = request.url.path
        client_host = request.client.host if request.client else "unknown"
        
        logger.info(f"Incoming request: {method} {url} from {client_host}")
        
        try:
            response = await call_next(request)
            
            process_time = (time.time() - start_time) * 1000
            status_code = response.status_code
            
            logger.info(
                f"Completed request: {method} {url} - Status: {status_code} - Duration: {process_time:.2f}ms"
            )
            
            return response
        except Exception as e:
            process_time = (time.time() - start_time) * 1000
            logger.error(
                f"Request failed: {method} {url} - Error: {str(e)} - Duration: {process_time:.2f}ms",
                exc_info=True
            )
            raise
