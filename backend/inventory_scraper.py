#!/usr/bin/env python3
"""
Shottenkirk Toyota Inventory Scraper for JokerVision AutoFollow
This module scrapes and processes real vehicle inventory data
"""

import asyncio
import aiohttp
from bs4 import BeautifulSoup
import json
import re
from datetime import datetime, timezone
from typing import List, Dict, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ShottenkilkInventoryScraper:
    def __init__(self):
        self.base_url = "https://www.shottenkirktoyotasanantonio.com"
        self.new_vehicles_url = f"{self.base_url}/new-vehicles/"
        self.used_vehicles_url = f"{self.base_url}/used-vehicles/"
        self.dealership_name = "Shottenkirk Toyota San Antonio"
        self.dealership_phone = "210.526.2851"
        self.dealership_address = "18019 US-281, San Antonio TX 78232"
        
    async def fetch_page(self, session: aiohttp.ClientSession, url: str) -> str:
        """Fetch a single page with error handling"""
        try:
            async with session.get(url, timeout=30) as response:
                if response.status == 200:
                    return await response.text()
                else:
                    logger.error(f"HTTP {response.status} for {url}")
                    return ""
        except Exception as e:
            logger.error(f"Error fetching {url}: {str(e)}")
            return ""

    def extract_vehicle_data(self, vehicle_element) -> Optional[Dict]:
        """Extract vehicle data from HTML element"""
        try:
            # Extract basic info
            title_elem = vehicle_element.find('h3') or vehicle_element.find('h4')
            if not title_elem:
                return None
                
            title_text = title_elem.get_text(strip=True)
            
            # Parse title: "New 2025 Toyota Camry XSE Sedan"
            title_parts = title_text.split()
            if len(title_parts) < 4:
                return None
                
            condition = title_parts[0]  # "New" or "Used"
            year = title_parts[1]
            make = title_parts[2]
            
            # Extract model and trim (everything after make until known body styles)
            body_styles = ['Sedan', 'SUV', 'Truck', 'Coupe', 'Hatchback', 'Van', 'Utility', 'Crewmax', 'Double cab']
            model_parts = []
            trim_parts = []
            body_style = ""
            
            for i, part in enumerate(title_parts[3:], 3):
                if part in body_styles or any(bs in part for bs in body_styles):
                    body_style = " ".join(title_parts[i:])
                    break
                elif i == len(title_parts) - 1 or title_parts[i + 1] in body_styles:
                    trim_parts.append(part)
                else:
                    model_parts.append(part)
            
            model = " ".join(model_parts) if model_parts else "Unknown"
            trim = " ".join(trim_parts) if trim_parts else ""
            
            # Extract VIN and Stock
            vin_elem = vehicle_element.find('strong', string=re.compile(r'VIN:'))
            vin = ""
            if vin_elem and vin_elem.parent:
                vin_text = vin_elem.parent.get_text()
                vin_match = re.search(r'VIN:\s*([A-Z0-9]{17})', vin_text)
                if vin_match:
                    vin = vin_match.group(1)
            
            stock_elem = vehicle_element.find('strong', string=re.compile(r'Stock:'))
            stock = ""
            if stock_elem and stock_elem.parent:
                stock_text = stock_elem.parent.get_text()
                stock_match = re.search(r'Stock:\s*([A-Z0-9]+)', stock_text)
                if stock_match:
                    stock = stock_match.group(1)
            
            # Extract prices
            price_elem = vehicle_element.find('strong', string=re.compile(r'Price|TSRP'))
            price = 0
            original_price = 0
            
            if price_elem:
                price_section = price_elem.find_parent('div', class_=lambda c: c and 'price' in c.lower()) if price_elem.find_parent() else None
                if price_section:
                    price_text = price_section.get_text()
                    
                    # Look for "Shottenkirk Toyota Price" (final price)
                    price_match = re.search(r'Shottenkirk Toyota Price\s*\$?([\d,]+)', price_text)
                    if price_match:
                        price = int(price_match.group(1).replace(',', ''))
                    
                    # Look for TSRP (original price)
                    tsrp_match = re.search(r'TSRP\s*\$?([\d,]+)', price_text)
                    if tsrp_match:
                        original_price = int(tsrp_match.group(1).replace(',', ''))
                    
                    # If no final price, use TSRP
                    if not price and original_price:
                        price = original_price
            
            # Extract images
            img_elements = vehicle_element.find_all('img')
            images = []
            for img in img_elements:
                src = img.get('src', '')
                if 'vehicle-photos-published.vauto.com' in src:
                    images.append(src)
            
            # Extract features/colors
            exterior_color = ""
            interior_color = ""
            
            # Look for color information
            color_section = vehicle_element.find('div', string=re.compile(r'EXTERIOR|INTERIOR'))
            if color_section:
                exterior_elem = vehicle_element.find('strong', string='EXTERIOR')
                if exterior_elem and exterior_elem.parent:
                    exterior_color = exterior_elem.parent.get_text().replace('EXTERIOR', '').strip()
                
                interior_elem = vehicle_element.find('strong', string='INTERIOR')
                if interior_elem and interior_elem.parent:
                    interior_color = interior_elem.parent.get_text().replace('INTERIOR', '').strip()
            
            # Calculate savings
            savings = original_price - price if original_price > price else 0
            
            # Generate description
            description = f"{year} {make} {model}"
            if trim:
                description += f" {trim}"
            if body_style:
                description += f" - {body_style}"
            
            return {
                "vin": vin,
                "stock_number": stock,
                "year": int(year) if year.isdigit() else 0,
                "make": make,
                "model": model,
                "trim": trim,
                "body_style": body_style.strip(),
                "condition": condition,
                "price": price,
                "original_price": original_price,
                "savings": savings,
                "exterior_color": exterior_color,
                "interior_color": interior_color,
                "description": description,
                "images": images[:5],  # Limit to 5 images
                "dealership": self.dealership_name,
                "dealership_phone": self.dealership_phone,
                "dealership_address": self.dealership_address,
                "url": f"{self.base_url}/vehicle/{condition}/{year}/{make}/{model.replace(' ', '-')}/{vin}/" if vin else "",
                "last_updated": datetime.now(timezone.utc).isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error extracting vehicle data: {str(e)}")
            return None

    async def scrape_inventory_page(self, session: aiohttp.ClientSession, url: str, page: int = 1) -> List[Dict]:
        """Scrape a single inventory page"""
        page_url = f"{url}?page={page}" if page > 1 else url
        logger.info(f"Scraping page {page}: {page_url}")
        
        html = await self.fetch_page(session, page_url)
        if not html:
            return []
        
        soup = BeautifulSoup(html, 'html.parser')
        vehicles = []
        
        # Find vehicle containers - they usually have specific classes or structures
        vehicle_containers = soup.find_all(['div', 'article'], class_=lambda c: c and any(
            keyword in str(c).lower() for keyword in ['vehicle', 'inventory', 'listing', 'result']
        ))
        
        # If no specific containers found, look for elements with VIN information
        if not vehicle_containers:
            vehicle_containers = soup.find_all(text=re.compile(r'VIN:\s*[A-Z0-9]{17}'))
            vehicle_containers = [elem.find_parent() for elem in vehicle_containers if elem.find_parent()]
        
        logger.info(f"Found {len(vehicle_containers)} potential vehicle containers")
        
        for container in vehicle_containers:
            if container:
                vehicle_data = self.extract_vehicle_data(container)
                if vehicle_data and vehicle_data.get('vin'):  # Only include if we have a VIN
                    vehicles.append(vehicle_data)
        
        return vehicles

    async def get_total_pages(self, session: aiohttp.ClientSession, url: str) -> int:
        """Determine total number of pages"""
        html = await self.fetch_page(session, url)
        if not html:
            return 1
        
        soup = BeautifulSoup(html, 'html.parser')
        
        # Look for pagination info
        pagination = soup.find_all(text=re.compile(r'Page \d+ of \d+'))
        if pagination:
            match = re.search(r'Page \d+ of (\d+)', pagination[0])
            if match:
                return int(match.group(1))
        
        # Look for results count
        results_text = soup.find_all(text=re.compile(r'Showing \d+ - \d+ of (\d+)'))
        if results_text:
            match = re.search(r'Showing \d+ - \d+ of (\d+)', results_text[0])
            if match:
                total_results = int(match.group(1))
                return (total_results + 23) // 24  # 24 results per page
        
        return 1

    async def scrape_all_inventory(self) -> Dict:
        """Scrape all inventory (new and used)"""
        logger.info("Starting inventory scrape for Shottenkirk Toyota San Antonio")
        
        async with aiohttp.ClientSession() as session:
            all_vehicles = []
            
            # Scrape new vehicles
            logger.info("Scraping new vehicles...")
            new_pages = await self.get_total_pages(session, self.new_vehicles_url)
            logger.info(f"Found {new_pages} pages of new vehicles")
            
            for page in range(1, min(new_pages + 1, 6)):  # Limit to 5 pages for performance
                vehicles = await self.scrape_inventory_page(session, self.new_vehicles_url, page)
                all_vehicles.extend(vehicles)
                
                # Add delay to be respectful
                await asyncio.sleep(1)
            
            # Scrape used vehicles
            logger.info("Scraping used vehicles...")
            used_pages = await self.get_total_pages(session, self.used_vehicles_url)
            logger.info(f"Found {used_pages} pages of used vehicles")
            
            for page in range(1, min(used_pages + 1, 4)):  # Limit to 3 pages for performance
                vehicles = await self.scrape_inventory_page(session, self.used_vehicles_url, page)
                all_vehicles.extend(vehicles)
                
                # Add delay to be respectful
                await asyncio.sleep(1)
        
        # Process and categorize results
        new_vehicles = [v for v in all_vehicles if v.get('condition', '').lower() == 'new']
        used_vehicles = [v for v in all_vehicles if v.get('condition', '').lower() == 'used']
        
        summary = {
            "dealership": self.dealership_name,
            "total_vehicles": len(all_vehicles),
            "new_vehicles": len(new_vehicles),
            "used_vehicles": len(used_vehicles),
            "last_updated": datetime.now(timezone.utc).isoformat(),
            "vehicles": all_vehicles,
            "summary_by_model": {}
        }
        
        # Create model summary
        for vehicle in all_vehicles:
            model = vehicle.get('model', 'Unknown')
            if model not in summary["summary_by_model"]:
                summary["summary_by_model"][model] = {"count": 0, "price_range": []}
            
            summary["summary_by_model"][model]["count"] += 1
            if vehicle.get('price', 0) > 0:
                summary["summary_by_model"][model]["price_range"].append(vehicle['price'])
        
        # Calculate price ranges
        for model, data in summary["summary_by_model"].items():
            if data["price_range"]:
                data["min_price"] = min(data["price_range"])
                data["max_price"] = max(data["price_range"])
                data["avg_price"] = sum(data["price_range"]) / len(data["price_range"])
                del data["price_range"]
        
        logger.info(f"Scraping complete: {len(all_vehicles)} total vehicles found")
        return summary

async def main():
    """Test the scraper"""
    scraper = ShottenkilkInventoryScraper()
    inventory_data = await scraper.scrape_all_inventory()
    
    print(f"Scraped {inventory_data['total_vehicles']} vehicles")
    print(f"New: {inventory_data['new_vehicles']}, Used: {inventory_data['used_vehicles']}")
    
    # Save to file for testing
    with open('/app/backend/scraped_inventory.json', 'w') as f:
        json.dump(inventory_data, f, indent=2)
    
    return inventory_data

if __name__ == "__main__":
    asyncio.run(main())