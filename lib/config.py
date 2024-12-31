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
    BASE_URL = "https://www.immowelt.de/classified-search?distributionTypes=Buy,Buy_Auction,Compulsory_Auction&estateTypes=House,Apartment&locations=eyJwbGFjZUlkIjoiQUQwOERFNDA0OCIsInJhZGl1cyI6MiwicG9seWxpbmUiOiJ1fnZuSG9ncmdAZEF8YEBqRXJfQGpJYF18TGhZYFByVGpSfk5gVHxIfFRoQnpUa0JgVHtIbFJhT35Pc1R-TGlZaklhXWpFcV9AYkF9YEBjQXtgQGtFcV9Aa0lhXV9NaVlfUHNUbVJhT2FUfUh7VGlCfVRoQmFUekhrUmBPYVByVH1MaFlrSWBda0VyX0BlQXpgQCJ9"
    # HTTP request settings
    REQUEST_DELAY = 0.1
    RETRY_ATTEMPTS = 3
    TIMEOUT = 10