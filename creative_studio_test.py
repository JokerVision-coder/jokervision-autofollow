import requests
import sys
import json
from datetime import datetime

class CreativeStudioAPITester:
    def __init__(self, base_url="https://autolead-pro.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:300]}...")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_creative_studio_templates_api(self):
        """Test Creative Studio Templates API - Priority endpoint for frontend issue"""
        print("\n🎨 Testing Creative Studio Templates API...")
        
        # Test with default tenant_id as mentioned in review request
        tenant_id = "default"
        
        success, response = self.run_test(
            "Creative Templates API",
            "GET",
            f"creative/templates?tenant_id={tenant_id}",
            200
        )
        
        if success:
            # Verify response structure matches frontend expectations
            required_fields = ['custom_templates', 'builtin_templates', 'total_count']
            missing_fields = [field for field in required_fields if field not in response]
            
            if not missing_fields:
                custom_count = len(response.get('custom_templates', []))
                builtin_count = len(response.get('builtin_templates', []))
                total_count = response.get('total_count', 0)
                
                print(f"   ✅ Templates API structure valid")
                print(f"      Custom templates: {custom_count}")
                print(f"      Builtin templates: {builtin_count}")
                print(f"      Total count: {total_count}")
                
                # Check if builtin templates have required fields
                if builtin_count > 0:
                    first_template = response['builtin_templates'][0]
                    template_fields = ['id', 'name', 'platform', 'type']
                    missing_template_fields = [field for field in template_fields if field not in first_template]
                    
                    if not missing_template_fields:
                        print(f"   ✅ Template objects have required fields: {template_fields}")
                        print(f"      Sample template: {first_template['name']} ({first_template['platform']})")
                        return True
                    else:
                        print(f"   ❌ Template objects missing fields: {missing_template_fields}")
                        return False
                else:
                    print(f"   ⚠️  No builtin templates found - this may cause empty frontend sections")
                    return False
            else:
                print(f"   ❌ Templates API missing required fields: {missing_fields}")
                return False
        return False

    def test_creative_studio_asset_library_api(self):
        """Test Creative Studio Asset Library API"""
        print("\n📁 Testing Creative Studio Asset Library API...")
        
        tenant_id = "default"
        
        success, response = self.run_test(
            "Asset Library API",
            "GET",
            f"creative/asset-library?tenant_id={tenant_id}",
            200
        )
        
        if success:
            # Verify response structure
            required_fields = ['tenant_id', 'total_assets', 'folders', 'asset_types']
            missing_fields = [field for field in required_fields if field not in response]
            
            if not missing_fields:
                total_assets = response.get('total_assets', 0)
                folders = response.get('folders', {})
                asset_types = response.get('asset_types', [])
                
                print(f"   ✅ Asset Library API structure valid")
                print(f"      Total assets: {total_assets}")
                print(f"      Folders: {list(folders.keys())}")
                print(f"      Asset types: {asset_types}")
                
                if total_assets == 0:
                    print(f"   ⚠️  No assets found - this explains empty Asset Library section in frontend")
                
                return True
            else:
                print(f"   ❌ Asset Library API missing fields: {missing_fields}")
                return False
        return False

    def test_creative_studio_ai_ideas_api(self):
        """Test Creative Studio AI Ideas Generation API"""
        print("\n💡 Testing Creative Studio AI Ideas Generation API...")
        
        ideas_request = {
            "tenant_id": "default",
            "platform": "instagram",
            "objective": "engagement",
            "count": 4
        }
        
        success, response = self.run_test(
            "AI Ideas Generation API",
            "POST",
            "creative/generate-ideas",
            200,
            data=ideas_request
        )
        
        if success:
            # Verify response structure
            if 'ideas' in response:
                ideas = response['ideas']
                print(f"   ✅ AI Ideas API working - Generated {len(ideas)} ideas")
                
                # Check if ideas have required structure
                if ideas:
                    first_idea = ideas[0]
                    idea_fields = ['title', 'type', 'description', 'hashtags']
                    missing_idea_fields = [field for field in idea_fields if field not in first_idea]
                    
                    if not missing_idea_fields:
                        print(f"   ✅ Idea objects have required fields")
                        print(f"      Sample idea: {first_idea.get('title', 'N/A')}")
                        return True
                    else:
                        print(f"   ❌ Idea objects missing fields: {missing_idea_fields}")
                        return False
                else:
                    print(f"   ⚠️  No ideas generated")
                    return False
            else:
                print(f"   ❌ Response missing 'ideas' field")
                return False
        return False

    def test_creative_studio_hashtag_research_api(self):
        """Test Creative Studio Hashtag Research API"""
        print("\n🏷️ Testing Creative Studio Hashtag Research API...")
        
        hashtag_request = {
            "tenant_id": "default",
            "keywords": ["cars", "automotive"],
            "platform": "instagram"
        }
        
        success, response = self.run_test(
            "Hashtag Research API",
            "POST",
            "organic/hashtag-research",
            200,
            data=hashtag_request
        )
        
        if success:
            # Verify response structure
            required_fields = ['platform', 'keywords_researched', 'hashtag_suggestions']
            missing_fields = [field for field in required_fields if field not in response]
            
            if not missing_fields:
                hashtag_suggestions = response.get('hashtag_suggestions', [])
                keywords = response.get('keywords_researched', [])
                
                print(f"   ✅ Hashtag Research API working")
                print(f"      Keywords researched: {keywords}")
                print(f"      Hashtag suggestions: {len(hashtag_suggestions)}")
                
                # Check hashtag structure
                if hashtag_suggestions:
                    first_hashtag = hashtag_suggestions[0]
                    hashtag_fields = ['hashtag', 'volume', 'difficulty', 'relevance_score']
                    
                    # Convert to dict if it's a model object
                    if hasattr(first_hashtag, 'dict'):
                        first_hashtag = first_hashtag.dict()
                    
                    missing_hashtag_fields = [field for field in hashtag_fields if field not in first_hashtag]
                    
                    if not missing_hashtag_fields:
                        print(f"   ✅ Hashtag objects have required fields")
                        print(f"      Sample hashtag: {first_hashtag.get('hashtag', 'N/A')} (Volume: {first_hashtag.get('volume', 0)})")
                        return True
                    else:
                        print(f"   ❌ Hashtag objects missing fields: {missing_hashtag_fields}")
                        return False
                else:
                    print(f"   ⚠️  No hashtag suggestions generated")
                    return False
            else:
                print(f"   ❌ Hashtag Research API missing fields: {missing_fields}")
                return False
        return False

    def test_creative_studio_comprehensive(self):
        """Run comprehensive Creative Studio test suite focusing on frontend integration"""
        print("\n🎨 Running Creative Studio Frontend Integration Tests...")
        print("   Focus: Identifying why frontend sections are empty")
        
        creative_tests = [
            ("Templates API (Priority)", self.test_creative_studio_templates_api),
            ("Asset Library API", self.test_creative_studio_asset_library_api),
            ("AI Ideas Generation API", self.test_creative_studio_ai_ideas_api),
            ("Hashtag Research API", self.test_creative_studio_hashtag_research_api)
        ]
        
        passed_tests = 0
        total_tests = len(creative_tests)
        
        for test_name, test_func in creative_tests:
            try:
                if test_func():
                    passed_tests += 1
                    print(f"   ✅ {test_name} - PASSED")
                else:
                    print(f"   ❌ {test_name} - FAILED")
            except Exception as e:
                print(f"   ❌ {test_name} - ERROR: {str(e)}")
        
        success_rate = (passed_tests / total_tests) * 100
        print(f"\n   📊 Creative Studio Test Suite: {passed_tests}/{total_tests} passed ({success_rate:.1f}%)")
        
        # Provide specific diagnosis for frontend issues
        if passed_tests < total_tests:
            print(f"\n   🔍 FRONTEND ISSUE DIAGNOSIS:")
            if passed_tests == 0:
                print(f"      - All Creative Studio APIs are failing")
                print(f"      - This explains why frontend sections are completely empty")
            else:
                print(f"      - Some Creative Studio APIs are working, others are failing")
                print(f"      - Frontend sections may be partially populated")
        else:
            print(f"\n   ✅ All Creative Studio APIs are working correctly")
            print(f"      - If frontend sections are still empty, the issue is likely in frontend code")
        
        return passed_tests >= total_tests * 0.75  # 75% pass rate required

def main():
    """Main test execution function for Creative Studio"""
    tester = CreativeStudioAPITester()
    
    print("🎯 PRIORITY TESTING: Creative Studio Templates and Asset Library")
    print("=" * 70)
    print("Focus: Testing backend endpoints to identify why frontend sections are empty")
    print("=" * 70)
    
    # Run the comprehensive Creative Studio test
    success = tester.test_creative_studio_comprehensive()
    
    # Print final results
    print("\n" + "=" * 70)
    print(f"📊 Creative Studio Test Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if success:
        print("🎉 Creative Studio APIs are working correctly!")
        print("   If frontend sections are still empty, the issue is in frontend code.")
    else:
        print("🚨 Creative Studio API issues found!")
        print("   These backend issues explain why frontend sections are empty.")
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())