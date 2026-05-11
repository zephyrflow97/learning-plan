"""
structlog 结构化日志配置
"""
import logging
import structlog

def setup_logging(debug: bool = False):
    log_level = logging.DEBUG if debug else logging.INFO
    shared_processors = [
        structlog.stdlib.add_log_level,
        structlog.stdlib.add_logger_name,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
    ]

    if debug:
        renderer = structlog.dev.ConsoleRenderer()
    else:
        renderer = structlog.processors.JSONRenderer()

    structlog.configure(
        processors=shared_processors + [renderer],
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )
    logging.basicConfig(format="%(message)s", level=log_level)


if __name__ == "__main__":
    setup_logging(debug=True)
    logger = structlog.get_logger()
    logger.info("app.start", version="1.0.0", environment="development")
    logger.info("user.login", user_id=42, ip="192.168.1.1", method="jwt")
    logger.warning("rate_limit.approaching", user_id=42, requests=95, limit=100)
    try:
        result = 1 / 0
    except ZeroDivisionError:
        logger.error("calculation.error", exc_info=True, operation="divide")
    logger.info("app.shutdown", uptime_seconds=3600)
