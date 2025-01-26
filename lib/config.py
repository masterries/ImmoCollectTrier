import os

class Config:
    # Base directory (project root)
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # Data directory
    DATA_DIR = os.path.join(BASE_DIR, 'data')
    
    # Ensure data directory exists
    os.makedirs(DATA_DIR, exist_ok=True)
    
    # Database files
    DEFAULT_DB_FILE = os.path.join(DATA_DIR, 'miete_trier50km.sqlite')
    BACKUP_DIR = os.path.join(DATA_DIR, 'backups')
    CHECKPOINT_DIR = os.path.join(DATA_DIR, 'checkpoints')
    
    # Logs directory
    LOG_DIR = os.path.join(BASE_DIR, 'logs')
    
    # Database configuration
    DB_CONFIG = {
        'filename': DEFAULT_DB_FILE,
        'backup_enabled': True,
        'checkpoint_enabled': True,
        'json_export_enabled': True,
        'json_export_path': os.path.join(DATA_DIR, 'export.json')
    }
    
    # Base URL for scraping
    BASE_URL = "https://www.immowelt.de/classified-search?distributionTypes=Buy,Buy_Auction,Compulsory_Auction&estateTypes=House,Apartment&locations=eyJwbGFjZUlkIjoiQUQwOERFNDA0OCIsInJhZGl1cyI6NTAsInBvbHlsaW5lIjoic2VrcUhvZ3JnQGx1QGp2WWRgRHJ0WG5kR25yVnJ-SXhyU3pqTHZ5T2xmTn5rS2BvT3RvRmJjUHZqQWJiUGV6QWRsT3V8RmRiTnd0S3xlTHd8T3J5SXlvU2pgR3dpVmh9Q3FnWGx0QF9nWW10QH1mWWl9Q3FnWGtgR3dpVnN5SXlvU31lTHd8T2ViTnl0S2VsT3V8RmNiUGN6QWNjUHZqQWFvT3JvRm1mTmBsS3tqTHR5T3N-SXpyU29kR25yVmVgRHB0WG11QGp2WSJ9"
    REQUEST_DELAY = 0.1
    RETRY_ATTEMPTS = 3
    TIMEOUT = 10