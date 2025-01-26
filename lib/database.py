import os
import sqlite3
import pandas as pd
from datetime import datetime
import json
from .logger import get_logger
from .config import Config

logger = get_logger()

class DatabaseHandler:
    def __init__(self, filename=None):
        """Initialize DatabaseHandler with SQLite database"""
        if filename:
            if os.path.isabs(filename):
                self.filename = filename
            else:
                self.filename = os.path.join(Config.DATA_DIR, filename)
        else:
            self.filename = os.path.join(Config.DATA_DIR, 'listings.sqlite')
            
        self.current_date = datetime.now().strftime('%Y-%m-%d')
        self._ensure_directories()
        self._initialize_database()

    def _ensure_directories(self):
        """Ensure all necessary directories exist"""
        os.makedirs(Config.DATA_DIR, exist_ok=True)
        os.makedirs(Config.BACKUP_DIR, exist_ok=True)
        os.makedirs(Config.CHECKPOINT_DIR, exist_ok=True)
        
        db_dir = os.path.dirname(self.filename)
        if db_dir:
            os.makedirs(db_dir, exist_ok=True)
            
        logger.debug(f"Database will be stored at: {self.filename}")

    def _initialize_database(self):
        """Initialize SQLite database with schema"""
        try:
            with sqlite3.connect(self.filename) as conn:
                conn.execute('''
                    CREATE TABLE IF NOT EXISTS listings (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        Link TEXT UNIQUE,
                        Preis TEXT,
                        Beschreibung TEXT,
                        Details TEXT,
                        Adresse TEXT,
                        Features TEXT,
                        Vollständige_Adresse TEXT,
                        Latitude REAL,
                        Longitude REAL,
                        created_date TEXT,
                        closed_date TEXT,
                        Preis_cleaned REAL,
                        Wohnfläche REAL,
                        Grundstücksfläche REAL,
                        Zimmer REAL,
                        Preis_pro_qm REAL,
                        Images TEXT,
                        Vorschaubild TEXT
                    )
                ''')
                conn.commit()
        except Exception as e:
            logger.error(f"Error initializing database: {str(e)}")
            raise

    def load_existing_data(self):
        """Load existing data from SQLite database"""
        try:
            logger.info(f"Loading existing data from {self.filename}")
            
            with sqlite3.connect(self.filename) as conn:
                query = "SELECT * FROM listings"
                df = pd.read_sql_query(query, conn)
                
                # Convert date columns
                for date_col in ['created_date', 'closed_date']:
                    if date_col in df.columns:
                        df[date_col] = pd.to_datetime(df[date_col], errors='coerce')
                
                logger.info(f"Loaded {len(df)} existing records")
                return df
                
        except Exception as e:
            logger.error(f"Error loading data: {str(e)}")
            return pd.DataFrame(columns=[
                'Link', 'Preis', 'Beschreibung', 'Details', 'Adresse',
                'Features', 'Vollständige_Adresse', 'Latitude', 'Longitude',
                'created_date', 'closed_date', 'Preis_cleaned', 'Wohnfläche',
                'Grundstücksfläche', 'Zimmer', 'Preis_pro_qm', 'Images',
                'Vorschaubild'
            ])

    def save_data(self, df, is_checkpoint=False):
        """Save DataFrame to SQLite database"""
        try:
            # Ensure dates are in consistent format before saving
            for date_col in ['created_date', 'closed_date']:
                if date_col in df.columns and not df[date_col].empty:
                    df[date_col] = pd.to_datetime(df[date_col]).dt.strftime('%Y-%m-%d')

            with sqlite3.connect(self.filename) as conn:
                # Save to main database
                df.to_sql('listings', conn, if_exists='replace', index=False)
                
                if is_checkpoint:
                    # Create checkpoint copy
                    checkpoint_file = os.path.join(
                        Config.CHECKPOINT_DIR,
                        f"checkpoint_{os.path.basename(self.filename)}_{self.current_date}.sqlite"
                    )
                    import shutil
                    shutil.copy2(self.filename, checkpoint_file)
                    logger.info(f"Saved checkpoint to {checkpoint_file}")

            logger.info(f"Saved {len(df)} records to {self.filename}")
            return True
            
        except Exception as e:
            logger.error(f"Error saving data: {str(e)}")
            return False

    def compare_listings(self, existing_df, new_df):
        """Compare existing and new listings to find changes"""
        if 'Link' not in existing_df.columns:
            existing_df = pd.DataFrame(columns=['Link'])
        if 'Link' not in new_df.columns:
            new_df = pd.DataFrame(columns=['Link'])

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
        
        # Add numeric statistics if data exists
        numeric_cols = ['Preis_cleaned', 'Wohnfläche', 'Preis_pro_qm']
        for col in numeric_cols:
            if col in df.columns and not df[col].empty:
                stats[f"Average {col}"] = df[col].mean()
                stats[f"Median {col}"] = df[col].median()
        
        return stats

    def create_backup(self):
        """Create a backup of the current database"""
        try:
            backup_file = os.path.join(
                Config.BACKUP_DIR,
                f"backup_{os.path.basename(self.filename)}_{self.current_date}.sqlite"
            )
            
            import shutil
            shutil.copy2(self.filename, backup_file)
            logger.info(f"Created backup at {backup_file}")
            return True
        except Exception as e:
            logger.error(f"Error creating backup: {str(e)}")
            return False

    def export_to_json(self, output_file=None):
        """Export database to JSON format"""
        try:
            if output_file is None:
                output_file = os.path.join(
                    Config.DATA_DIR,
                    f"listings_{self.current_date}.json"
                )
            
            with sqlite3.connect(self.filename) as conn:
                df = pd.read_sql_query("SELECT * FROM listings", conn)
                
            # Convert DataFrame to JSON
            json_data = df.to_json(output_file, orient='records', date_format='iso')
            logger.info(f"Exported database to JSON: {output_file}")
            return True
        except Exception as e:
            logger.error(f"Error exporting to JSON: {str(e)}")
            return False

    def query_listings(self, conditions=None, limit=None):
        """Query listings with optional conditions"""
        try:
            query = "SELECT * FROM listings"
            if conditions:
                query += f" WHERE {conditions}"
            if limit:
                query += f" LIMIT {limit}"
                
            with sqlite3.connect(self.filename) as conn:
                return pd.read_sql_query(query, conn)
        except Exception as e:
            logger.error(f"Error querying database: {str(e)}")
            return pd.DataFrame()
