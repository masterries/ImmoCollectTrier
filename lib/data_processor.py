# lib/data_processor.py
import pandas as pd
import numpy as np
from datetime import datetime
import time
import re
import os
from .logger import get_logger
from . import parsers
from .config import Config
logger = get_logger()

class DataProcessor:
    def __init__(self):
        """Initialize DataProcessor with default values"""
        self.current_date = datetime.now().strftime('%Y-%m-%d')
        self.required_columns = [
            'Link', 'Preis', 'Beschreibung', 'Details', 'Adresse',
            'Features', 'Vollständige_Adresse', 'Latitude', 'Longitude',
            'created_date', 'closed_date', 'Preis_cleaned', 'Wohnfläche',
            'Grundstücksfläche', 'Zimmer', 'Preis_pro_qm'
        ]

    def process_new_data(self, df):
        """Process newly scraped data"""
        logger.info("Processing new data...")
        
        try:
            # Ensure all required columns exist
            self._ensure_columns(df)
            
            # Clean and transform data
            processed_df = self._clean_data(df)
            
            # Add derived columns
            #processed_df = self._add_derived_data(processed_df)
            
            logger.info("Data processing completed successfully")
            return processed_df
            
        except Exception as e:
            logger.error(f"Error processing data: {str(e)}")
            raise

    def _ensure_columns(self, df):
        """Ensure all required columns exist in DataFrame"""
        for col in self.required_columns:
            if col not in df.columns:
                df[col] = None
                logger.debug(f"Added missing column: {col}")

    def _clean_data(self, df):
        """Clean and standardize the data"""
        logger.info("Cleaning data...")
        
        # Create a copy to avoid modifying the original
        cleaned_df = df.copy()
        
        # Clean price data
        cleaned_df['Preis_cleaned'] = cleaned_df['Preis'].apply(parsers.clean_price)
        
        # Extract living space
        cleaned_df['Wohnfläche'] = cleaned_df['Details'].apply(parsers.extract_sqm)
        
        # Extract plot size
        cleaned_df['Grundstücksfläche'] = cleaned_df['Details'].apply(parsers.extract_plot_size)
        
        # Extract number of rooms
        cleaned_df['Zimmer'] = cleaned_df['Details'].apply(parsers.extract_rooms)
        
        # Calculate price per square meter (using living space)
        cleaned_df['Preis_pro_qm'] = cleaned_df.apply(
            lambda row: row['Preis_cleaned'] / row['Wohnfläche'] 
            if pd.notna(row['Preis_cleaned']) and pd.notna(row['Wohnfläche']) and row['Wohnfläche'] > 0 
            else None,
            axis=1
        )
        
        # Clean address data
        cleaned_df['Vollständige_Adresse'] = cleaned_df['Vollständige_Adresse'].fillna('Keine Adresse')
        
        # Handle dates
        cleaned_df['created_date'] = pd.to_datetime(cleaned_df['created_date'], format='%Y-%m-%d', errors='coerce')
        cleaned_df['closed_date'] = pd.to_datetime(cleaned_df['closed_date'], format='%Y-%m-%d', errors='coerce')
        return cleaned_df

    def _add_derived_data(self, df):
        """Add derived columns and calculations"""
        logger.info("Adding derived data...")
        
        # Add age of listing
        df['listing_age_days'] = (pd.Timestamp(self.current_date) - df['created_date']).dt.days
        
        # Add categories only if we have enough data
        valid_prices = df['Preis_cleaned'].dropna()