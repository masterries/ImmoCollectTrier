# lib/database.py
import os
import pandas as pd
from datetime import datetime
from .logger import get_logger
from .config import Config

logger = get_logger()

class DatabaseHandler:
    def __init__(self, filename=None):
        """Initialize DatabaseHandler with file path handling"""
        if filename:
            # If filename is provided, ensure it's a full path
            if os.path.isabs(filename):
                self.filename = filename
            else:
                self.filename = os.path.join(Config.DATA_DIR, filename)
        else:
            self.filename = Config.DEFAULT_DB_FILE
            
        self.current_date = datetime.now().strftime('%Y-%m-%d')
        self._ensure_directories()

    def _ensure_directories(self):
        """Ensure all necessary directories exist"""
        # Create data directory if it doesn't exist
        os.makedirs(Config.DATA_DIR, exist_ok=True)
        
        # Create directory for the database file if needed
        db_dir = os.path.dirname(self.filename)
        if db_dir:  # Only create if there's a directory path
            os.makedirs(db_dir, exist_ok=True)
        
        # Create other necessary directories
        os.makedirs(Config.BACKUP_DIR, exist_ok=True)
        os.makedirs(Config.CHECKPOINT_DIR, exist_ok=True)
        
        logger.debug(f"Database file will be stored at: {self.filename}")

    def _create_empty_dataframe(self):
        """Create an empty DataFrame with the correct structure"""
        return pd.DataFrame(columns=[
            'Link', 'Preis', 'Beschreibung', 'Details', 'Adresse',
            'Features', 'Vollständige_Adresse', 'Latitude', 'Longitude',
            'created_date', 'closed_date', 'Preis_cleaned', 'Wohnfläche',
            'Grundstücksfläche', 'Zimmer', 'Preis_pro_qm'
        ])

    def load_existing_data(self):
        """Load existing data from CSV file"""
        try:
            logger.info(f"Loading existing data from {self.filename}")
            if os.path.exists(self.filename):
                df = pd.read_csv(self.filename)
                
                # Add tracking columns if they don't exist
                self._ensure_tracking_columns(df)
                
                # Convert dates handling various formats
                for date_col in ['created_date', 'closed_date']:
                    if date_col in df.columns:
                        df[date_col] = pd.to_datetime(df[date_col], errors='coerce')
                
                logger.info(f"Loaded {len(df)} existing records")
                return df
            else:
                logger.info("No existing data found, starting fresh")
                return self._create_empty_dataframe()
                
        except Exception as e:
            logger.error(f"Error loading data: {str(e)}")
            return self._create_empty_dataframe()

    def _ensure_tracking_columns(self, df):
        """Ensure all necessary columns exist in the DataFrame"""
        columns = {
            'created_date': self.current_date,
            'closed_date': None,
            'Features': None,
            'Vollständige_Adresse': None,
            'Latitude': None,
            'Longitude': None,
            'Preis_cleaned': None,
            'Wohnfläche': None,
            'Grundstücksfläche': None,
            'Zimmer': None,
            'Preis_pro_qm': None
        }
        
        for col, default_value in columns.items():
            if col not in df.columns:
                logger.info(f"Adding missing column: {col}")
                df[col] = default_value

    def save_data(self, df, is_checkpoint=False):
        """Save DataFrame to CSV"""
        try:
            # Ensure dates are in consistent format before saving
            for date_col in ['created_date', 'closed_date']:
                if date_col in df.columns and not df[date_col].empty:
                    df[date_col] = pd.to_datetime(df[date_col]).dt.strftime('%Y-%m-%d')

            if is_checkpoint:
                checkpoint_file = os.path.join(
                    Config.CHECKPOINT_DIR,
                    f"checkpoint_{os.path.basename(self.filename)}_{self.current_date}.csv"
                )
                df.to_csv(checkpoint_file, index=False)
                logger.info(f"Saved checkpoint to {checkpoint_file}")
            
            df.to_csv(self.filename, index=False)
            logger.info(f"Saved {len(df)} records to {self.filename}")
            return True
        except Exception as e:
            logger.error(f"Error saving data: {str(e)}")
            return False

    def compare_listings(self, existing_df, new_df):
        """Compare existing and new listings to find changes"""
        # Ensure both DataFrames have Link column
        if 'Link' not in existing_df.columns:
            existing_df = self._create_empty_dataframe()
        if 'Link' not in new_df.columns:
            new_df = self._create_empty_dataframe()

        existing_links = set(existing_df['Link']) if not existing_df.empty else set()
        current_links = set(new_df['Link']) if not new_df.empty else set()
        
        new_listings = current_links - existing_links
        closed_listings = existing_links - current_links
        unchanged_listings = existing_links & current_links
        
        logger.info(f"Comparison results:")
        logger.info(f"- New listings: {len(new_listings)}")
        logger.info(f"- Closed listings: {len(closed_listings)}")
        logger.info(f"- Unchanged listings: {len(unchanged_listings)}")
        
        return {
            'new_listings': new_listings,
            'closed_listings': closed_listings,
            'unchanged_listings': unchanged_listings
        }

    def update_database(self, existing_df, new_df, comparison_results):
        """Update database with new listings and mark closed ones"""
        if existing_df.empty:
            # If no existing data, all new listings are new
            new_df['created_date'] = self.current_date
            return new_df
            
        # Mark closed listings
        mask = (
            existing_df['Link'].isin(comparison_results['closed_listings']) & 
            existing_df['closed_date'].isna()
        )
        existing_df.loc[mask, 'closed_date'] = self.current_date

        # Add new listings
        if comparison_results['new_listings']:
            new_entries = new_df[new_df['Link'].isin(comparison_results['new_listings'])].copy()
            new_entries['created_date'] = self.current_date
            merged_df = pd.concat([existing_df, new_entries], ignore_index=True)
        else:
            merged_df = existing_df.copy()

        return merged_df

    def get_statistics(self, df):
        """Generate statistics about the database"""
        stats = {
            "Total listings": len(df),
            "Active listings": len(df[df['closed_date'].isna()]),
            "Closed listings": len(df[df['closed_date'].notna()]),
            "New listings today": len(df[df['created_date'] == self.current_date]),
            "Listings closed today": len(df[df['closed_date'] == self.current_date])
        }
        
        # Add numeric statistics only if data exists
        for col in ['Preis_cleaned', 'Wohnfläche', 'Preis_pro_qm']:
            if col in df.columns and not df[col].empty:
                stats[f"Average {col}"] = df[col].mean()
        
        return stats