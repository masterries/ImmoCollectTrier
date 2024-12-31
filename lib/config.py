# lib/config.py
import os

class Config:
    # Base directory (project root)
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # Data directory
    DATA_DIR = os.path.join(BASE_DIR, 'data')
    
    # Ensure data directory exists
    os.makedirs(DATA_DIR, exist_ok=True)
    
    # Database files
    DEFAULT_DB_FILE = os.path.join(DATA_DIR, 'miete_trier50km_detailed2.csv')
    BACKUP_DIR = os.path.join(DATA_DIR, 'backups')
    CHECKPOINT_DIR = os.path.join(DATA_DIR, 'checkpoints')
    
    # Logs directory
    LOG_DIR = os.path.join(BASE_DIR, 'logs')
    
    # Base URL for scraping
    BASE_URL = "https://www.immowelt.de/classified-search?distributionTypes=Buy,Buy_Auction,Compulsory_Auction&estateTypes=House,Apartment&locations=eyJwbGFjZUlkIjoiQUQwOERFNDA0OCIsInJhZGl1cyI6MjUsInBvbHlsaW5lIjoiX2pfcEhvZ3JnQGBadmhMZm9BYnhLZmFDdHdKZG5EcGhJaHRFdmxHZHJGcmZFcmZHfnhCfnBHeGZAdHBHdWpAfGVHZ3xCYnFGeWhFYnNFb21HfGxEeWdJZGBDb3VKbm5Be3RLell7ZEx7WXtkTG9uQXt0S2VgQ291Sn1sRHdnSWNzRXFtR2NxRnloRX1lR2d8QnVwR3NqQF9xR3hmQHNmR3x4QmVyRnRmRWl0RXZsR2VuRHBoSWdhQ3J3SmdvQWR4S2FadGhMIn0"    # HTTP request settings
    REQUEST_DELAY = 0.1
    RETRY_ATTEMPTS = 3
    TIMEOUT = 10