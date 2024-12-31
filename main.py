#!/usr/bin/env python3
import sys
import os
from datetime import datetime
import time
import argparse
import pandas as pd

# Add the project root directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from lib.logger import get_logger
from lib.scraper import WebScraper
from lib.database import DatabaseHandler
from lib.data_processor import DataProcessor
from lib.config import Config

def parse_arguments():
    parser = argparse.ArgumentParser(description='Immowelt Scraper')
    parser.add_argument('--backup', action='store_true', 
                        help='Create a backup before running')
    parser.add_argument('--output', type=str, 
                        default='miete_trier50km_detailed2.csv',
                        help='Output file name (relative to data directory or absolute path)')
    parser.add_argument('--fix-data', action='store_true',
                        help='Fix and standardize the data format')
    return parser.parse_args()

def main():
    # Initialize logger
    logger = get_logger()
    logger.info("Starting Immowelt Scraper...")

    try:
        # Parse command line arguments
        args = parse_arguments()

        # Initialize components
        scraper = WebScraper()
        db_handler = DatabaseHandler(args.output)
        data_processor = DataProcessor()

        # Create backup if requested
        if args.backup and os.path.exists(db_handler.filename):
            logger.info("Creating backup...")
            db_handler.backup_database()

        # Fix data format if requested
        if args.fix_data:
            logger.info("Fixing data format...")
            data_processor.fix_csv_data(
                input_file=db_handler.filename,
                output_file=os.path.join(
                    Config.DATA_DIR,
                    'fixed_' + os.path.basename(args.output)
                )
            )
            return 0

        # Load existing data (empty if file does not exist)
        existing_df = db_handler.load_existing_data()

        # Scrape current listings
        logger.info("Starting web scraping...")
        current_listings = scraper.scrape_all_listings()
        
        if not current_listings:
            logger.error("No listings found! Exiting...")
            return 1

        # Convert listings to DataFrame and process
        logger.info("Converting listings to DataFrame...")
        df_current = pd.DataFrame(current_listings)
        
        # Process scraped data
        logger.info("Processing scraped data...")
        new_df = data_processor.process_new_data(df_current)

        # DEBUG logging to confirm new_df structure
        logger.info(f"DEBUG: new_df is type: {type(new_df)}")
        if isinstance(new_df, pd.DataFrame):
            logger.info(f"DEBUG: new_df shape: {new_df.shape}")
            logger.info(f"DEBUG: new_df columns: {list(new_df.columns)}")
        else:
            logger.info("DEBUG: new_df is None or not a DataFrame!")

        # Check if this is the very first run (database file does not exist)
        if not os.path.exists(db_handler.filename):
            logger.info("First run - creating new database...")

            # Mark all listings as created today
            new_df['created_date'] = datetime.now().strftime('%Y-%m-%d')

            # Since no existing data, all are "new" listings
            # => Scrape detail pages for all of them
            logger.info(f"Scraping detail pages for all {len(new_df)} listings on the first run...")
            for i, (idx, row) in enumerate(new_df.iterrows(), start=1):
                link = row['Link']
                logger.info(f"[{i}/{len(new_df)}] Detail scraping: {link}")
                details = scraper.get_detail_page_info(link)
                if details:
                    new_df.at[idx, 'Features'] = '; '.join(details['features'])
                    new_df.at[idx, 'Vollständige_Adresse'] = details['full_address']
                    new_df.at[idx, 'Latitude'] = details['latitude']
                    new_df.at[idx, 'Longitude'] = details['longitude']
                else:
                    logger.warning(f"Could not retrieve details for: {link}")
                time.sleep(0.5)

            # Save the database after populating detail info
            db_handler.save_data(new_df)
            logger.info("Initial database created successfully!")
            return 0

        # Otherwise, if we do have existing data, proceed with comparison
        comparison = db_handler.compare_listings(existing_df, new_df)

        # Process new listings if any found (fetch GPS, features, etc.)
        if comparison['new_listings']:
            logger.info(f"Processing {len(comparison['new_listings'])} new listings...")
            new_links = list(comparison['new_listings'])
            for i, link in enumerate(new_links, start=1):
                logger.info(f"[{i}/{len(new_links)}] Detail scraping new listing: {link}")

                details = scraper.get_detail_page_info(link)
                if details:
                    idx = new_df[new_df['Link'] == link].index[0]
                    new_df.at[idx, 'Features'] = '; '.join(details['features'])
                    new_df.at[idx, 'Vollständige_Adresse'] = details['full_address']
                    new_df.at[idx, 'Latitude'] = details['latitude']
                    new_df.at[idx, 'Longitude'] = details['longitude']
                else:
                    logger.warning(f"Could not retrieve details for: {link}")
                time.sleep(0.1)
        
        # Update database (mark closed listings, etc.)
        merged_df = db_handler.update_database(existing_df, new_df, comparison)
        
        # Save results
        logger.info("Saving results...")
        db_handler.save_data(merged_df)
        
        # Print statistics
        stats = db_handler.get_statistics(merged_df)
        logger.info("\nFinal Statistics:")
        for key, value in stats.items():
            if isinstance(value, float):
                logger.info(f"{key}: {value:.2f}")
            else:
                logger.info(f"{key}: {value}")

        logger.info("Script completed successfully!")
        return 0

    except KeyboardInterrupt:
        logger.info("\nScript interrupted by user")
        return 130
    except Exception as e:
        logger.error(f"An error occurred: {str(e)}", exc_info=True)
        return 1

if __name__ == "__main__":
    sys.exit(main())
