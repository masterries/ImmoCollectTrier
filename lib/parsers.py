# lib/parsers.py
import re
from .logger import get_logger

logger = get_logger()

def clean_price(price_str):
    """Clean and normalize price strings"""
    if price_str in ['Preis auf Anfrage', 'Keine Info']:
        return None
    try:
        if '€' in str(price_str) and any(c.isdigit() for c in str(price_str)):
            price = price_str.split('€')[0].strip().replace('.', '')
            price = re.search(r'\d+', price).group()
            return float(price)
        return None
    except Exception as e:
        logger.debug(f"Could not clean price '{price_str}': {str(e)}")
        return None

def extract_sqm(details_str):
    """Extract square meters from details string"""
    if details_str in ['Keine Info', 'EG'] or not isinstance(details_str, str):
        return None
        
    try:
        # Handle both formats (e.g., "147" and "147.000")
        match = re.search(r'(\d+(?:[\.,]\d+)?)\s*m²', str(details_str))
        if match:
            sqm = match.group(1).replace('.', '').replace(',', '.')
            return float(sqm)
        return None
    except Exception as e:
        logger.debug(f"Could not extract square meters from '{details_str}': {str(e)}")
        return None

def extract_rooms(details_str):
    """Extract number of rooms from details string"""
    if details_str in ['Keine Info'] or not isinstance(details_str, str):
        return None
        
    try:
        # Support different room number formats
        match = re.search(r'(\d+(?:,\d+)?)\s*(?:Zimmer|Zi\.?)', str(details_str))
        if match:
            rooms = match.group(1).replace(',', '.')
            return float(rooms)
        return None
    except Exception as e:
        logger.debug(f"Could not extract rooms from '{details_str}': {str(e)}")
        return None

def extract_plot_size(details_str):
    """Extract plot size from details string"""
    if not isinstance(details_str, str):
        return None
        
    try:
        if 'Grundstück' in details_str:
            match = re.search(r'(\d+(?:[\.,]\d+)?)\s*m²\s*Grundstück', str(details_str))
            if match:
                size = match.group(1).replace('.', '').replace(',', '.')
                return float(size)
        return None
    except Exception as e:
        logger.debug(f"Could not extract plot size from '{details_str}': {str(e)}")
        return None