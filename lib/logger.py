# lib/logger.py
import logging
from logging.handlers import RotatingFileHandler
import os
from datetime import datetime
from .config import Config

class Logger:
    _instance = None
    _initialized = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(Logger, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        if not Logger._initialized:
            self.setup_logging()
            Logger._initialized = True

    def setup_logging(self):
        """Configure logging with both file and console handlers."""
        # Create logs directory if it doesn't exist
        os.makedirs(Config.LOG_DIR, exist_ok=True)

        # Set up formatting
        log_format = '%(asctime)s - %(levelname)s - %(message)s'
        date_format = '%Y-%m-%d %H:%M:%S'

        # Create logger
        self.logger = logging.getLogger('immo_tracker')
        self.logger.setLevel(logging.DEBUG)

        # Clear any existing handlers
        if self.logger.handlers:
            self.logger.handlers.clear()

        # Create rotating file handler
        current_date = datetime.now().strftime('%Y-%m-%d')
        file_handler = RotatingFileHandler(
            os.path.join(Config.LOG_DIR, f'immo_tracker_{current_date}.log'),
            maxBytes=1024*1024,  # 1MB
            backupCount=5
        )
        file_handler.setLevel(logging.DEBUG)
        file_handler.setFormatter(logging.Formatter(log_format, date_format))

        # Create console handler
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.INFO)
        console_handler.setFormatter(logging.Formatter(log_format, date_format))

        # Add handlers to logger
        self.logger.addHandler(file_handler)
        self.logger.addHandler(console_handler)

    def get_logger(self):
        """Get the configured logger instance."""
        return self.logger

def get_logger():
    """Convenience function to get logger instance."""
    return Logger().get_logger()