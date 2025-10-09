#!/usr/bin/env python3

import requests
import json

def test_inventory_system():
    """Test inventory system backend to analyze current vehicle data structure"""
    
    base_url = 'https://autolead-pro.preview.emergentagent.com/api'
    
    print('🚗 INVENTORY SYSTEM BACKEND TESTING')
    print('='*60)
    
    # Test 1: Get inventory vehicles
    print('\n1. Testing GET /api/inventory/vehicles')
    try:
        response = requests.get(f'{base_url}/inventory/vehicles?tenant_id=default_dealership&limit=50')
        print(f'   Status: {response.status_code}')
        
        if response.status_code == 200:
            data = response.json()
            vehicles = data.get('vehicles', [])
            total = data.get('total', 0)
            
            print(f'   📊 Total vehicles in database: {total}')
            print(f'   📊 Vehicles returned: {len(vehicles)}')
            
            if vehicles:
                # Analyze first vehicle structure
                first_vehicle = vehicles[0]
                print(f'\n   🔍 First vehicle analysis:')
                print(f'   - Year: {first_vehicle.get("year", "Missing")}')
                print(f'   - Make: {first_vehicle.get("make", "Missing")}')
                print(f'   - Model: {first_vehicle.get("model", "Missing")}')
                print(f'   - Trim: {first_vehicle.get("trim", "Missing")}')
                
                # Check images
                images = first_vehicle.get('images', [])
                print(f'   - Images: {len(images)} images')
                if images:
                    first_image = images[0]
                    print(f'     * First image URL: {first_image.get("url", "Missing")[:50]}...')
                    print(f'     * Image type: {first_image.get("type", "Missing")}')
                
                # Check specifications
                specs = first_vehicle.get('specifications', {})
                print(f'   - Specifications: {len(specs)} fields')
                if specs:
                    print(f'     * Spec fields: {list(specs.keys())[:5]}')
                
                # Check features
                features = first_vehicle.get('features', [])
                print(f'   - Features: {len(features)} features')
                if features:
                    print(f'     * Sample features: {features[:3]}')
                
                # Check pricing
                price = first_vehicle.get('price')
                msrp = first_vehicle.get('msrp')
                print(f'   - Price: ${price:,}' if price else '   - Price: Missing')
                print(f'   - MSRP: ${msrp:,}' if msrp else '   - MSRP: Missing')
                
                # Analyze multiple vehicles for patterns
                print(f'\n   🔍 Analyzing {min(10, len(vehicles))} vehicles for patterns:')
                
                image_counts = []
                spec_counts = []
                feature_counts = []
                complete_titles = 0
                
                for i, vehicle in enumerate(vehicles[:10]):
                    images = vehicle.get('images', [])
                    specs = vehicle.get('specifications', {})
                    features = vehicle.get('features', [])
                    
                    image_counts.append(len(images))
                    spec_counts.append(len(specs))
                    feature_counts.append(len(features))
                    
                    if all(vehicle.get(field) for field in ['year', 'make', 'model']):
                        complete_titles += 1
                
                avg_images = sum(image_counts) / len(image_counts)
                avg_specs = sum(spec_counts) / len(spec_counts)
                avg_features = sum(feature_counts) / len(feature_counts)
                
                print(f'   - Average images per vehicle: {avg_images:.1f}')
                print(f'   - Average specifications per vehicle: {avg_specs:.1f}')
                print(f'   - Average features per vehicle: {avg_features:.1f}')
                print(f'   - Vehicles with complete titles: {complete_titles}/10')
                
            else:
                print('   ❌ No vehicles found in response')
        else:
            print(f'   ❌ Error: {response.text}')
            
    except Exception as e:
        print(f'   ❌ Exception: {str(e)}')
    
    # Test 2: Get inventory summary
    print('\n2. Testing GET /api/inventory/summary')
    try:
        response = requests.get(f'{base_url}/inventory/summary?tenant_id=default_dealership')
        print(f'   Status: {response.status_code}')
        
        if response.status_code == 200:
            data = response.json()
            total_vehicles = data.get('total_vehicles', 0)
            by_make = data.get('by_make', {})
            by_year = data.get('by_year', {})
            recent_additions = data.get('recent_additions', [])
            
            print(f'   📊 Summary Analysis:')
            print(f'   - Total vehicles: {total_vehicles}')
            print(f'   - Makes available: {len(by_make)}')
            print(f'   - Years available: {len(by_year)}')
            print(f'   - Recent additions: {len(recent_additions)}')
            
            if by_make:
                print('   🏭 Top makes:')
                for make, count in sorted(by_make.items(), key=lambda x: x[1], reverse=True)[:5]:
                    print(f'      - {make}: {count} vehicles')
            else:
                print('   ❌ No make breakdown available')
                
        else:
            print(f'   ❌ Error: {response.text}')
            
    except Exception as e:
        print(f'   ❌ Exception: {str(e)}')
    
    # Test 3: Issues identification
    print('\n3. INVENTORY ISSUES IDENTIFICATION')
    print('='*40)
    
    issues_found = []
    
    try:
        # Get vehicle data for analysis
        response = requests.get(f'{base_url}/inventory/vehicles?tenant_id=default_dealership&limit=20')
        if response.status_code == 200:
            data = response.json()
            vehicles = data.get('vehicles', [])
            total = data.get('total', 0)
            
            # Issue 1: Low inventory count
            if total < 100:
                issues_found.append(f"LOW INVENTORY: Only {total} vehicles (expected 200+ for dealership)")
            
            # Issue 2: Image gallery problems
            if vehicles:
                single_image_vehicles = 0
                no_image_vehicles = 0
                
                for vehicle in vehicles:
                    images = vehicle.get('images', [])
                    if len(images) == 0:
                        no_image_vehicles += 1
                    elif len(images) == 1:
                        single_image_vehicles += 1
                
                if single_image_vehicles > len(vehicles) * 0.8:
                    issues_found.append(f"IMAGE GALLERY ISSUE: {single_image_vehicles}/{len(vehicles)} vehicles have only 1 image")
                
                if no_image_vehicles > 0:
                    issues_found.append(f"MISSING IMAGES: {no_image_vehicles}/{len(vehicles)} vehicles have no images")
            
            # Issue 3: Missing specifications
            if vehicles:
                missing_specs = 0
                for vehicle in vehicles:
                    specs = vehicle.get('specifications', {})
                    if len(specs) < 3:
                        missing_specs += 1
                
                if missing_specs > len(vehicles) * 0.5:
                    issues_found.append(f"MISSING SPECIFICATIONS: {missing_specs}/{len(vehicles)} vehicles lack detailed specs")
            
            # Issue 4: Missing features
            if vehicles:
                missing_features = 0
                for vehicle in vehicles:
                    features = vehicle.get('features', [])
                    if len(features) < 5:
                        missing_features += 1
                
                if missing_features > len(vehicles) * 0.5:
                    issues_found.append(f"MISSING FEATURES: {missing_features}/{len(vehicles)} vehicles lack feature lists")
            
            # Issue 5: Incomplete titles
            if vehicles:
                incomplete_titles = 0
                for vehicle in vehicles:
                    if not all(vehicle.get(field) for field in ['year', 'make', 'model']):
                        incomplete_titles += 1
                
                if incomplete_titles > 0:
                    issues_found.append(f"INCOMPLETE TITLES: {incomplete_titles}/{len(vehicles)} vehicles missing year/make/model")
        
        # Check summary consistency
        summary_response = requests.get(f'{base_url}/inventory/summary?tenant_id=default_dealership')
        if summary_response.status_code == 200:
            summary_data = summary_response.json()
            summary_total = summary_data.get('total_vehicles', 0)
            by_make = summary_data.get('by_make', {})
            
            if total != summary_total:
                issues_found.append(f"DATA INCONSISTENCY: Vehicles endpoint shows {total}, summary shows {summary_total}")
            
            if len(by_make) == 0:
                issues_found.append("MISSING MAKE BREAKDOWN: Summary endpoint has no vehicle make distribution")
        
    except Exception as e:
        issues_found.append(f"TESTING ERROR: {str(e)}")
    
    # Report issues
    print(f'📊 ISSUES FOUND: {len(issues_found)}')
    if issues_found:
        for i, issue in enumerate(issues_found, 1):
            print(f'   {i}. ❌ {issue}')
    else:
        print('   ✅ No major issues identified')
    
    print('\n' + '='*60)
    print('INVENTORY SYSTEM ANALYSIS COMPLETE')
    
    # Summary recommendations
    print('\n📋 RECOMMENDATIONS:')
    if len(issues_found) > 0:
        print('   🔧 BACKEND DATA NEEDS ENHANCEMENT:')
        if any('IMAGE GALLERY' in issue for issue in issues_found):
            print('   - Add multiple high-resolution images per vehicle (exterior, interior, engine)')
        if any('SPECIFICATIONS' in issue for issue in issues_found):
            print('   - Add detailed vehicle specifications (engine, transmission, features)')
        if any('FEATURES' in issue for issue in issues_found):
            print('   - Add comprehensive feature lists for each vehicle')
        if any('LOW INVENTORY' in issue for issue in issues_found):
            print('   - Complete dealership inventory upload (target 200+ vehicles)')
        if any('INCONSISTENCY' in issue for issue in issues_found):
            print('   - Fix data consistency between endpoints')
    else:
        print('   ✅ Inventory system appears to be working correctly')

if __name__ == "__main__":
    test_inventory_system()