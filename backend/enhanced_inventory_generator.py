#!/usr/bin/env python3
"""
Enhanced Inventory Data Generator for JokerVision AutoFollow
Generates realistic vehicle inventory data for car dealerships
"""

import random
import uuid
from datetime import datetime, timezone, timedelta
from typing import List, Dict
import json

class EnhancedInventoryGenerator:
    def __init__(self):
        # Real vehicle models and configurations from major manufacturers
        self.vehicle_catalog = {
            "Toyota": {
                "models": {
                    "Camry": ["LE", "SE", "XLE", "XSE", "TRD"],
                    "Corolla": ["L", "LE", "XLE", "SE", "Apex"],
                    "RAV4": ["LE", "XLE", "XLE Premium", "Adventure", "TRD Off-Road"],
                    "Highlander": ["L", "LE", "XLE", "Limited", "Platinum"],
                    "4Runner": ["SR5", "TRD Off-Road", "TRD Pro", "Limited"],
                    "Tacoma": ["SR", "SR5", "TRD Sport", "TRD Off-Road", "TRD Pro"],
                    "Tundra": ["SR", "SR5", "Limited", "Platinum", "TRD Pro"],
                    "Prius": ["L Eco", "LE", "XLE", "Limited"],
                    "Sienna": ["LE", "XLE", "Limited", "Platinum"]
                },
                "years": [2022, 2023, 2024, 2025],
                "price_ranges": {
                    "Camry": (25000, 38000),
                    "Corolla": (22000, 28000),
                    "RAV4": (29000, 42000),
                    "Highlander": (36000, 52000),
                    "4Runner": (38000, 55000),
                    "Tacoma": (28000, 45000),
                    "Tundra": (37000, 65000),
                    "Prius": (25000, 34000),
                    "Sienna": (35000, 52000)
                }
            },
            "Honda": {
                "models": {
                    "Civic": ["LX", "Sport", "EX", "Touring", "Type R"],
                    "Accord": ["LX", "Sport", "EX", "EX-L", "Touring"],
                    "CR-V": ["LX", "EX", "EX-L", "Touring"],
                    "Pilot": ["LX", "EX", "EX-L", "Touring", "Elite"],
                    "HR-V": ["LX", "Sport", "EX", "EX-L"],
                    "Ridgeline": ["Sport", "RTL", "RTL-E", "Black Edition"],
                    "Passport": ["Sport", "EX-L", "TrailSport", "Elite"],
                    "Odyssey": ["LX", "EX", "EX-L", "Touring", "Elite"]
                },
                "years": [2022, 2023, 2024, 2025],
                "price_ranges": {
                    "Civic": (23000, 35000),
                    "Accord": (26000, 38000),
                    "CR-V": (27000, 37000),
                    "Pilot": (34000, 50000),
                    "HR-V": (22000, 29000),
                    "Ridgeline": (37000, 48000),
                    "Passport": (33000, 45000),
                    "Odyssey": (33000, 49000)
                }
            },
            "Ford": {
                "models": {
                    "F-150": ["Regular Cab", "SuperCab", "SuperCrew", "Lightning", "Raptor"],
                    "Mustang": ["EcoBoost", "GT", "Mach 1", "Shelby GT350", "Shelby GT500"],
                    "Explorer": ["Base", "XLT", "Limited", "Platinum", "ST"],
                    "Escape": ["S", "SE", "SEL", "Titanium"],
                    "Edge": ["SE", "SEL", "Titanium", "ST"],
                    "Expedition": ["XLT", "Limited", "King Ranch", "Platinum"],
                    "Bronco": ["Base", "Big Bend", "Black Diamond", "Outer Banks", "Badlands", "Wildtrak"],
                    "Ranger": ["XL", "XLT", "Lariat", "Tremor"]
                },
                "years": [2022, 2023, 2024, 2025],
                "price_ranges": {
                    "F-150": (32000, 75000),
                    "Mustang": (28000, 75000),
                    "Explorer": (33000, 55000),
                    "Escape": (25000, 35000),
                    "Edge": (32000, 43000),
                    "Expedition": (53000, 78000),
                    "Bronco": (32000, 60000),
                    "Ranger": (26000, 42000)
                }
            },
            "Chevrolet": {
                "models": {
                    "Silverado": ["Work Truck", "LT", "RST", "LTZ", "High Country"],
                    "Equinox": ["L", "LS", "LT", "Premier"],
                    "Tahoe": ["LS", "LT", "RST", "Z71", "Premier", "High Country"],
                    "Suburban": ["LS", "LT", "RST", "Z71", "Premier", "High Country"],
                    "Malibu": ["L", "LS", "LT", "Premier"],
                    "Camaro": ["1LS", "1LT", "2LT", "1SS", "2SS", "ZL1"],
                    "Traverse": ["L", "LS", "LT", "Premier", "RS"],
                    "Blazer": ["L", "LT", "RS", "Premier"]
                },
                "years": [2022, 2023, 2024, 2025],
                "price_ranges": {
                    "Silverado": (32000, 65000),
                    "Equinox": (25000, 35000),
                    "Tahoe": (52000, 75000),
                    "Suburban": (55000, 80000),
                    "Malibu": (23000, 30000),
                    "Camaro": (26000, 65000),
                    "Traverse": (32000, 45000),
                    "Blazer": (33000, 47000)
                }
            }
        }
        
        self.colors = {
            "exterior": [
                "White", "Black", "Silver", "Red", "Blue", "Gray", "Brown", "Green",
                "Pearl White", "Metallic Black", "Midnight Blue", "Ruby Red",
                "Magnetic Gray", "Ingot Silver", "Oxford White", "Race Red",
                "Velocity Blue", "Carbonized Gray", "Agate Black", "Stone Gray"
            ],
            "interior": [
                "Black", "Gray", "Beige", "Tan", "Brown", "Red", "Blue",
                "Charcoal Black", "Medium Light Stone", "Ebony", "Dune",
                "ActiveX Black", "Leather Trimmed Black", "Premium Cloth"
            ]
        }
        
        self.features = [
            "Backup Camera", "Bluetooth Connectivity", "Apple CarPlay", "Android Auto",
            "Heated Seats", "Cooled Seats", "Sunroof", "Navigation System",
            "Keyless Entry", "Push Button Start", "Cruise Control", "Lane Departure Warning",
            "Blind Spot Monitor", "Automatic Emergency Braking", "Adaptive Cruise Control",
            "Wireless Charging", "Premium Audio", "Leather Seats", "Power Liftgate",
            "Remote Start", "Dual Climate Control", "Third Row Seating", "All-Wheel Drive",
            "Four-Wheel Drive", "Tow Package", "Bed Liner", "Running Boards"
        ]

    def generate_vin(self) -> str:
        """Generate a realistic VIN"""
        # VIN format: WMI(3) + VDS(6) + VIS(8) = 17 characters
        letters = "ABCDEFGHJKLMNPRSTUVWXYZ"  # Excludes I, O, Q
        numbers = "0123456789"
        
        # World Manufacturer Identifier (first 3 chars)
        wmi = "".join(random.choices(letters + numbers, k=3))
        
        # Vehicle Descriptor Section (6 chars)
        vds = "".join(random.choices(letters + numbers, k=6))
        
        # Vehicle Identifier Section (8 chars)
        vis = "".join(random.choices(letters + numbers, k=8))
        
        return wmi + vds + vis

    def generate_stock_number(self) -> str:
        """Generate stock number"""
        return f"STK{random.randint(100000, 999999)}"

    def generate_vehicle(self, make: str = None, condition: str = "New") -> Dict:
        """Generate a single realistic vehicle"""
        if not make:
            make = random.choice(list(self.vehicle_catalog.keys()))
        
        make_info = self.vehicle_catalog[make]
        model = random.choice(list(make_info["models"].keys()))
        trim = random.choice(make_info["models"][model])
        year = random.choice(make_info["years"]) if condition == "New" else random.randint(2018, 2023)
        
        # Adjust price based on condition and year
        base_price_range = make_info["price_ranges"][model]
        if condition == "New":
            price = random.randint(base_price_range[0], base_price_range[1])
            mileage = random.randint(5, 50)  # Delivery miles
        else:
            # Used car pricing
            age_factor = 2025 - year
            depreciation = 0.15 * age_factor  # 15% per year
            price_factor = 1 - min(depreciation, 0.6)  # Max 60% depreciation
            price = int(base_price_range[0] * price_factor * random.uniform(0.8, 1.2))
            mileage = random.randint(15000 * age_factor, 25000 * age_factor)
        
        # Generate savings for some vehicles
        original_price = None
        if random.choice([True, False]):  # 50% chance of having a discount
            original_price = price + random.randint(1000, 5000)
        
        # Generate realistic features based on trim level
        num_features = random.randint(5, 15)
        selected_features = random.sample(self.features, num_features)
        
        # Generate image URLs (placeholder service)
        num_images = random.randint(8, 25)
        images = [
            f"https://images.dealer.com/ddc/vehicles/{year}/{make.lower()}/{model.lower()}/image{i+1}.jpg"
            for i in range(num_images)
        ]
        
        # Create description
        description = f"{year} {make} {model} {trim}"
        if condition == "Used":
            description += f" with {mileage:,} miles"
        
        description += f". This vehicle features {', '.join(selected_features[:3])} and much more."
        
        return {
            "id": str(uuid.uuid4()),
            "vin": self.generate_vin(),
            "stock_number": self.generate_stock_number(),
            "year": year,
            "make": make,
            "model": model,
            "trim": trim,
            "condition": condition,
            "price": price,
            "original_price": original_price,
            "mileage": mileage,
            "exterior_color": random.choice(self.colors["exterior"]),
            "interior_color": random.choice(self.colors["interior"]),
            "fuel_type": random.choice(["Gasoline", "Hybrid", "Electric", "Diesel"]),
            "transmission": random.choice(["Automatic", "Manual", "CVT"]),
            "engine": f"{random.uniform(1.5, 6.2):.1f}L V{random.choice([4, 6, 8])}",
            "features": selected_features,
            "images": images,
            "description": description,
            "status": "Available",
            "marketplace_listed": random.choice([True, False]),
            "leads_count": random.randint(0, 15),
            "views_count": random.randint(50, 500),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }

    def generate_dealership_inventory(self, total_vehicles: int = 150) -> Dict:
        """Generate complete dealership inventory"""
        vehicles = []
        
        # 70% new, 30% used
        new_count = int(total_vehicles * 0.7)
        used_count = total_vehicles - new_count
        
        # Generate new vehicles
        for _ in range(new_count):
            vehicles.append(self.generate_vehicle(condition="New"))
        
        # Generate used vehicles
        for _ in range(used_count):
            vehicles.append(self.generate_vehicle(condition="Used"))
        
        # Calculate statistics
        new_vehicles = [v for v in vehicles if v["condition"] == "New"]
        used_vehicles = [v for v in vehicles if v["condition"] == "Used"]
        
        # Group by make and model
        summary_by_make = {}
        summary_by_model = {}
        
        for vehicle in vehicles:
            make = vehicle["make"]
            model = vehicle["model"]
            
            if make not in summary_by_make:
                summary_by_make[make] = {"count": 0, "new": 0, "used": 0}
            summary_by_make[make]["count"] += 1
            if vehicle["condition"] == "New":
                summary_by_make[make]["new"] += 1
            else:
                summary_by_make[make]["used"] += 1
            
            model_key = f"{make} {model}"
            if model_key not in summary_by_model:
                summary_by_model[model_key] = {"count": 0, "price_range": []}
            summary_by_model[model_key]["count"] += 1
            summary_by_model[model_key]["price_range"].append(vehicle["price"])
        
        # Calculate price ranges for models
        for model, data in summary_by_model.items():
            if data["price_range"]:
                data["min_price"] = min(data["price_range"])
                data["max_price"] = max(data["price_range"])
                data["avg_price"] = int(sum(data["price_range"]) / len(data["price_range"]))
                del data["price_range"]
        
        return {
            "dealership": "Enhanced Dealership Inventory",
            "total_vehicles": len(vehicles),
            "new_vehicles": len(new_vehicles),
            "used_vehicles": len(used_vehicles),
            "last_updated": datetime.now(timezone.utc).isoformat(),
            "vehicles": vehicles,
            "summary_by_make": summary_by_make,
            "summary_by_model": summary_by_model,
            "enhanced_data": True
        }

if __name__ == "__main__":
    generator = EnhancedInventoryGenerator()
    inventory = generator.generate_dealership_inventory(200)
    
    print(f"Generated {inventory['total_vehicles']} vehicles")
    print(f"New: {inventory['new_vehicles']}, Used: {inventory['used_vehicles']}")
    print(f"Makes available: {list(inventory['summary_by_make'].keys())}")
    
    # Save to file
    with open('/app/backend/enhanced_inventory.json', 'w') as f:
        json.dump(inventory, f, indent=2)