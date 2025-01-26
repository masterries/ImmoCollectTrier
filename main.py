#!/usr/bin/env python3
import sys
import os
from datetime import datetime
import time
import argparse
import pandas as pd
import requests
from urllib.parse import urljoin
import urllib.parse

# Add the project root directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from lib.logger import get_logger
from lib.scraper import WebScraper
from lib.database import DatabaseHandler
from lib.data_processor import DataProcessor
from lib.config import Config



def get_file_extension(url):
    """Get the correct file extension from the image URL."""
    # Extract the path from the URL
    path = urllib.parse.urlparse(url).path
    
    # Get the original extension
    ext = os.path.splitext(path)[1].lower()
    
    # If no extension or not a common image extension, default to .jpg
    valid_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
    return ext if ext in valid_extensions else '.jpg'

def parse_arguments():
    parser = argparse.ArgumentParser(description='Immowelt Scraper')
    parser.add_argument('--backup', action='store_true', 
                        help='Create a backup before running')
    parser.add_argument('--output', type=str, 
                        default='miete_trier50km.sqlite',
                        help='Output file name (relative to data directory or absolute path)')
    parser.add_argument('--fix-data', action='store_true',
                        help='Fix and standardize the data format')
    parser.add_argument('--image-dir', type=str,
                        default='images',
                        help='Directory to store scraped images')
    return parser.parse_args()

def ensure_dir(directory):
    """Ensure that a directory exists, creating it if necessary."""
    if not os.path.exists(directory):
        os.makedirs(directory)

def download_image(url, image_dir, listing_id):
    """Download and save an image from URL with correct extension."""
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            # Get the proper file extension
            ext = get_file_extension(url)
            
            # Create filename with correct extension
            filename = f"{listing_id}_{int(time.time())}{ext}"
            filepath = os.path.join(image_dir, filename)
            
            with open(filepath, 'wb') as f:
                f.write(response.content)
            
            return filename
    except Exception as e:
        print(f"Failed to download image {url}: {str(e)}")
    return None

def main():
    # Initialize logger
    logger = get_logger()
    logger.info("Starting Immowelt Scraper...")

    try:
        # Parse command line arguments
        args = parse_arguments()

        # Ensure image directory exists
        image_dir = os.path.join(Config.DATA_DIR, args.image_dir)
        ensure_dir(image_dir)

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

        # Load existing data
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

        # Add images column if it doesn't exist
        if 'Images' not in new_df.columns:
            new_df['Images'] = ''

        # First run handling
        if not os.path.exists(db_handler.filename):
            logger.info("First run - creating new database...")
            new_df['created_date'] = datetime.now().strftime('%Y-%m-%d')

            logger.info(f"Scraping detail pages for all {len(new_df)} listings...")
            for i, (idx, row) in enumerate(new_df.iterrows(), start=1):
                link = row['Link']
                logger.info(f"[{i}/{len(new_df)}] Detail scraping: {link}")
                
                details = scraper.get_detail_page_info(link)
                if details:
                    new_df.at[idx, 'Features'] = '; '.join(details['features'])
                    new_df.at[idx, 'Vollständige_Adresse'] = details['full_address']
                    new_df.at[idx, 'Latitude'] = details['latitude']
                    new_df.at[idx, 'Longitude'] = details['longitude']
                    
                    # Store image URLs instead of downloading
                    image_urls = details.get('image_urls', [])
                    if image_urls:
                        new_df.at[idx, 'Images'] = ';'.join(image_urls)
                else:
                    logger.warning(f"Could not retrieve details for: {link}")
                time.sleep(0.5)
        
              # Handle existing database updates
        comparison = db_handler.compare_listings(existing_df, new_df)

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
                    
                    # Store image URLs for new listings
                    image_urls = details.get('image_urls', [])
                    if image_urls:
                        new_df.at[idx, 'Images'] = ';'.join(image_urls)
                else:
                    logger.warning(f"Could not retrieve details for: {link}")
                time.sleep(0.1)
        # Update database
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