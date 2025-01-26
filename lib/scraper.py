# lib/scraper.py
import json
import requests
from bs4 import BeautifulSoup
import time
import re
import urllib.parse
from urllib.parse import urljoin, unquote
import random
from .logger import get_logger
from .config import Config
logger = get_logger()

def clean_image_url(url):
    """Clean the image URL to get the original version without size parameters."""
    # Remove size parameters (w= and h=)
    url = re.sub(r'[?&]w=\d+', '', url)
    url = re.sub(r'[?&]h=\d+', '', url)
    
    # Extract the base URL and query parameters
    parsed = urllib.parse.urlparse(url)
    params = urllib.parse.parse_qs(parsed.query)
    
    # Keep only the ci_seal parameter if it exists
    cleaned_params = {}
    if 'ci_seal' in params:
        cleaned_params['ci_seal'] = params['ci_seal'][0]
    
    # Reconstruct the URL
    cleaned_url = urllib.parse.urlunparse((
        parsed.scheme,
        parsed.netloc,
        parsed.path,
        parsed.params,
        urllib.parse.urlencode(cleaned_params),
        parsed.fragment
    ))
    
    return cleaned_url


def calculate_polygon_centroid(coordinates):
    """Calculate the centroid of a polygon from coordinates."""
    x_coords = [point[0] for point in coordinates]
    y_coords = [point[1] for point in coordinates]

    x_centroid = sum(x_coords) / len(x_coords)
    y_centroid = sum(y_coords) / len(y_coords)

    return x_centroid, y_centroid

class WebScraper:
    def __init__(self):
        self.session = requests.Session()
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7',
            'Connection': 'keep-alive',
        }
        self.session.headers.update(self.headers)
        self.base_url = "https://www.immowelt.de"

    def extract_coordinates_from_html(self, html_content):
        """Extract coordinates from HTML content."""
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Find the img tag with the mapbox URL
        map_img = soup.find('img', alt='Standort')
        
        if not map_img:
            return None
        
        # Get the src attribute
        src_url = map_img['src']
        
        # Find the geojson part in the URL
        geojson_match = re.search(r'geojson\((.*?)\)/', src_url)
        
        if not geojson_match:
            return None
        
        # Extract and decode the GeoJSON
        geojson_encoded = geojson_match.group(1)
        geojson_decoded = unquote(geojson_encoded)
        
        try:
            # Parse the GeoJSON
            geojson_data = json.loads(geojson_decoded)
            coordinates = geojson_data['geometry']['coordinates']
            
            # Check the geometry type
            geometry_type = geojson_data['geometry']['type']
            
            if geometry_type == 'Point':
                # For Point type, coordinates are directly [longitude, latitude]
                longitude, latitude = coordinates
                return {
                    'coordinates': [coordinates],  # Wrap in list for consistency
                    'centroid': (longitude, latitude)
                }
            elif geometry_type == 'Polygon':
                # For Polygon type, calculate centroid from polygon coordinates
                coordinates = coordinates[0][:-1]  # Remove the closing point
                sum_lon = sum(p[0] for p in coordinates)
                sum_lat = sum(p[1] for p in coordinates)
                centroid = (sum_lon/len(coordinates), sum_lat/len(coordinates))
                return {
                    'coordinates': coordinates,
                    'centroid': centroid
                }
            else:
                logger.warning(f"Unexpected geometry type: {geometry_type}")
                return None
                
        except json.JSONDecodeError:
            logger.error("Error decoding GeoJSON")
            return None
        except KeyError:
            logger.error("Unexpected GeoJSON structure")
            return None
        except Exception as e:
            logger.error(f"Error processing coordinates: {str(e)}")
            return None




    def _make_request(self, url, retries=Config.RETRY_ATTEMPTS, delay=Config.REQUEST_DELAY):
        for attempt in range(retries):
            try:
                time.sleep(delay)
                response = self.session.get(url, timeout=Config.TIMEOUT)
                response.raise_for_status()
                return response.text
            except requests.RequestException as e:
                logger.warning(f"Attempt {attempt + 1} failed for {url}: {str(e)}")
                if attempt < retries - 1:
                    time.sleep(delay * (attempt + 1))
                else:
                    logger.error(f"Failed to get HTML after {retries} attempts: {url}")
                    return None

    def get_detail_page_info(self, url):
        html = self._make_request(url)
        if not html:
            return None

        soup = BeautifulSoup(html, 'html.parser')
        
        # Extract features
        features = []
        features_section = soup.find("section", {"data-testid": "aviv.CDP.Sections.Features"})
        if features_section:
            feature_items = features_section.find_all("div", {"data-testid": "aviv.CDP.Sections.Features.Feature"})
            for item in feature_items:
                feature_text = item.find("span", class_="css-1az3ztj")
                if feature_text:
                    features.append(feature_text.text.strip())

        # Extract images
        image_urls = self.extract_images(soup)

        # Extract coordinates using the new method
        coordinates_data = self.extract_coordinates_from_html(html)
        latitude = None
        longitude = None
        
        if coordinates_data:
            longitude, latitude = coordinates_data['centroid']
            logger.info(f"Found coordinates from GeoJSON: lat={latitude}, lon={longitude}")
        else:
            # Fallback to the old method
            try:
                for script in soup.find_all("script"):
                    if script.string and "coordinates" in str(script.string):
                        coords_match = re.search(r'\[(\d+\.\d+),\s*(\d+\.\d+)\]', script.string)
                        if coords_match:
                            try:
                                longitude = float(coords_match.group(1))
                                latitude = float(coords_match.group(2))
                                logger.info(f"Found coordinates from script: lat={latitude}, lon={longitude}")
                                break
                            except Exception as e:
                                logger.error(f"Error extracting coordinates from script: {str(e)}")
            except Exception as e:
                logger.error(f"Error extracting coordinates: {str(e)}")

        # Extract address
        address_div = soup.find("div", {"data-testid": "aviv.CDP.Location.Address"})
        full_address = address_div.text.strip() if address_div else "Keine Adresse gefunden"

        return {
            "features": features,
            "full_address": full_address,
            "latitude": latitude,
            "longitude": longitude,
            "image_urls": image_urls
        }


    
    def extract_listing_data(self, listing):
        """Extract data from a single listing item"""
        try:
            # Extract price
            price = listing.find("div", {"data-testid": "cardmfe-price-testid"})
            price = price.text.strip() if price else "Keine Info"
            
            # Extract description
            description = listing.find("div", class_="css-1cbj9xw")
            description = description.text.strip() if description else "Keine Info"
            
            # Extract details
            details = listing.find("div", {"data-testid": "cardmfe-keyfacts-testid"})
            details = details.text.strip() if details else "Keine Info"
            
            # Extract address
            address = listing.find("div", {"data-testid": "cardmfe-description-box-address"})
            address = address.text.strip() if address else "Keine Info"
            
            # Extract link
            link_element = listing.find("a", {"data-testid": "card-mfe-covering-link-testid"})
            if link_element and 'href' in link_element.attrs:
                href = link_element['href'].split('?')[0]
                link = urljoin(self.base_url, href)
            else:
                link = "Keine Info"

            # Extract preview image
            preview_image = None
            picture_elem = listing.find("picture")
            if picture_elem:
                source = picture_elem.find("source")
                if source and source.get("srcset"):
                    preview_image = source["srcset"].split(",")[0].split()[0]
                else:
                    img = picture_elem.find("img")
                    if img and img.get("src"):
                        preview_image = img["src"]
            
            return {
                'Link': link,
                'Preis': price,
                'Beschreibung': description,
                'Details': details,
                'Adresse': address,
                'Vorschaubild': preview_image
            }
        except Exception as e:
            logger.error(f"Error extracting listing data: {str(e)}")
            return None

    def get_listings_from_page(self, html):
        """Get all listings from a single page"""
        if not html:
            return []

        soup = BeautifulSoup(html, 'html.parser')
        listings = []
        estate_items = soup.find_all("div", {"data-testid": "serp-core-classified-card-testid"})
        
        for item in estate_items:
            listing_data = self.extract_listing_data(item)
            if listing_data:
                listings.append(listing_data)

        return listings

    def get_total_pages(self, html):
        """Extract total number of pages from search results"""
        try:
            soup = BeautifulSoup(html, "html.parser")
            pagination = soup.find("nav", {"aria-label": "pagination navigation"})
            if not pagination:
                return 1
            pages = pagination.find_all("button", {"aria-label": lambda x: x and x.startswith("zu seite")})
            if pages:
                return int(pages[-1].text.strip())
            return 1
        except Exception as e:
            logger.error(f"Error determining total pages: {str(e)}")
            return 1

    def scrape_all_listings(self, base_url=None):
        """Scrape all listings from all pages"""
        base_url = base_url or Config.BASE_URL
        logger.info("Starting to scrape all listings...")
        all_listings = []
        page = 1

        # Get first page and determine total pages
        html = self._make_request(base_url)
        if not html:
            return []

        total_pages = self.get_total_pages(html)
        logger.info(f"Found {total_pages} pages to scrape")

        while page <= total_pages:
            url = f"{base_url}&page={page}" if page > 1 else base_url
            logger.info(f"Scraping page {page}/{total_pages}")

            html = self._make_request(url)
            if not html:
                break

            page_listings = self.get_listings_from_page(html)
            if not page_listings:
                logger.warning(f"No listings found on page {page}")
                break

            all_listings.extend(page_listings)
            logger.info(f"Found {len(page_listings)} listings on page {page}")

            page += 1

        logger.info(f"Completed scraping. Total listings found: {len(all_listings)}")
        return all_listings
    
    def clean_image_url(url):
        """Clean the image URL to get the original version without size parameters."""
        # Remove size parameters (w= and h=)
        url = re.sub(r'[?&]w=\d+', '', url)
        url = re.sub(r'[?&]h=\d+', '', url)
        
        # Extract the base URL and query parameters
        parsed = urllib.parse.urlparse(url)
        params = urllib.parse.parse_qs(parsed.query)
        
        # Keep only the ci_seal parameter if it exists
        cleaned_params = {}
        if 'ci_seal' in params:
            cleaned_params['ci_seal'] = params['ci_seal'][0]
        
        # Reconstruct the URL
        cleaned_url = urllib.parse.urlunparse((
            parsed.scheme,
            parsed.netloc,
            parsed.path,
            parsed.params,
            urllib.parse.urlencode(cleaned_params),
            parsed.fragment
        ))
        
        return cleaned_url

    def get_file_extension(url):
        """Get the correct file extension from the image URL."""
        # Extract the path from the URL
        path = urllib.parse.urlparse(url).path
        
        # Get the original extension
        ext = os.path.splitext(path)[1].lower()
        
        # If no extension or not a common image extension, default to .jpg
        valid_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
        return ext if ext in valid_extensions else '.jpg'

    def extract_images(self, soup):
        """Extract image URLs from the detail page."""
        images = []
        try:
            # Find all picture elements
            picture_elements = soup.find_all("picture")
            for picture in picture_elements:
                # Check source elements first
                sources = picture.find_all("source")
                for source in sources:
                    srcset = source.get("srcset")
                    if srcset:
                        # Extract URLs from srcset
                        urls = [url.strip().split()[0] for url in srcset.split(",")]
                        if urls:
                            # Clean the URL and add to images list
                            cleaned_url = clean_image_url(urls[0])
                            if cleaned_url:
                                images.append(cleaned_url)
                
                # Check img element as fallback
                img = picture.find("img")
                if img and img.get("src"):
                    cleaned_url = clean_image_url(img["src"])
                    if cleaned_url:
                        images.append(cleaned_url)

            # Remove duplicates while preserving order
            images = list(dict.fromkeys(images))
            logger.debug(f"Found {len(images)} unique images")
            return images

        except Exception as e:
            logger.error(f"Error extracting images: {str(e)}")
            return []