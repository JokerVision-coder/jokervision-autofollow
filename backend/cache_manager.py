#!/usr/bin/env python3
"""
Redis Cache Manager for JokerVision AutoFollow
Handles caching for improved performance and scalability
"""

import redis
import json
import os
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any, List
import hashlib
from functools import wraps

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CacheManager:
    def __init__(self):
        self.redis_client = None
        self.is_connected = False
        self.cache_enabled = True
        
        # Cache TTL settings (in seconds)
        self.TTL_CONFIG = {
            'dashboard_stats': 300,      # 5 minutes
            'inventory_list': 600,       # 10 minutes  
            'lead_intelligence': 180,    # 3 minutes
            'competitor_data': 900,      # 15 minutes
            'user_session': 3600,        # 1 hour
            'api_response': 120,         # 2 minutes
            'search_results': 300,       # 5 minutes
            'vehicle_details': 1800,     # 30 minutes
            'lead_list': 60,             # 1 minute (more dynamic)
        }
    
    async def initialize(self):
        """Initialize Redis connection"""
        try:
            redis_url = os.environ.get('REDIS_URL', 'redis://localhost:6379')
            
            # Parse Redis URL for connection
            if redis_url.startswith('redis://'):
                self.redis_client = redis.Redis.from_url(redis_url, decode_responses=True)
            else:
                # Fallback for local development
                self.redis_client = redis.Redis(
                    host='localhost',
                    port=6379,
                    db=0,
                    decode_responses=True
                )
            
            # Test connection
            await self.test_connection()
            logger.info("✅ Redis cache manager initialized successfully")
            return True
            
        except Exception as e:
            logger.warning(f"⚠️ Redis connection failed: {str(e)}. Caching disabled.")
            self.cache_enabled = False
            return False
    
    async def test_connection(self):
        """Test Redis connectivity"""
        try:
            # Use sync ping since redis-py doesn't have async ping in basic version
            self.redis_client.ping()
            self.is_connected = True
            logger.info("✅ Redis connection test successful")
        except Exception as e:
            logger.error(f"❌ Redis connection test failed: {str(e)}")
            self.is_connected = False
            self.cache_enabled = False
            raise
    
    def _generate_cache_key(self, prefix: str, identifier: str, params: Dict = None) -> str:
        """Generate a consistent cache key"""
        if params:
            param_str = json.dumps(params, sort_keys=True)
            param_hash = hashlib.md5(param_str.encode()).hexdigest()[:8]
            return f"jv:{prefix}:{identifier}:{param_hash}"
        return f"jv:{prefix}:{identifier}"
    
    def _serialize_data(self, data: Any) -> str:
        """Serialize data for Redis storage"""
        try:
            if isinstance(data, str):
                return data
            return json.dumps(data, default=str)
        except Exception as e:
            logger.error(f"Serialization error: {str(e)}")
            return json.dumps({"error": "serialization_failed"})
    
    def _deserialize_data(self, data: str) -> Any:
        """Deserialize data from Redis"""
        try:
            return json.loads(data)
        except json.JSONDecodeError:
            # Return as string if not JSON
            return data
        except Exception as e:
            logger.error(f"Deserialization error: {str(e)}")
            return None
    
    async def get(self, cache_type: str, identifier: str, params: Dict = None) -> Optional[Any]:
        """Get data from cache"""
        if not self.cache_enabled or not self.is_connected:
            return None
        
        try:
            cache_key = self._generate_cache_key(cache_type, identifier, params)
            cached_data = self.redis_client.get(cache_key)
            
            if cached_data:
                logger.debug(f"Cache HIT: {cache_key}")
                return self._deserialize_data(cached_data)
            else:
                logger.debug(f"Cache MISS: {cache_key}")
                return None
                
        except Exception as e:
            logger.error(f"Cache GET error: {str(e)}")
            return None
    
    async def set(self, cache_type: str, identifier: str, data: Any, 
                  ttl: Optional[int] = None, params: Dict = None) -> bool:
        """Set data in cache"""
        if not self.cache_enabled or not self.is_connected:
            return False
        
        try:
            cache_key = self._generate_cache_key(cache_type, identifier, params)
            serialized_data = self._serialize_data(data)
            
            # Use configured TTL or provided TTL
            cache_ttl = ttl or self.TTL_CONFIG.get(cache_type, 300)
            
            # Set with expiration
            result = self.redis_client.setex(cache_key, cache_ttl, serialized_data)
            
            if result:
                logger.debug(f"Cache SET: {cache_key} (TTL: {cache_ttl}s)")
            
            return bool(result)
            
        except Exception as e:
            logger.error(f"Cache SET error: {str(e)}")
            return False
    
    async def delete(self, cache_type: str, identifier: str, params: Dict = None) -> bool:
        """Delete specific cache entry"""
        if not self.cache_enabled or not self.is_connected:
            return False
        
        try:
            cache_key = self._generate_cache_key(cache_type, identifier, params)
            result = self.redis_client.delete(cache_key)
            
            if result:
                logger.debug(f"Cache DELETE: {cache_key}")
            
            return bool(result)
            
        except Exception as e:
            logger.error(f"Cache DELETE error: {str(e)}")
            return False
    
    async def invalidate_pattern(self, pattern: str) -> int:
        """Invalidate multiple cache entries matching pattern"""
        if not self.cache_enabled or not self.is_connected:
            return 0
        
        try:
            keys = self.redis_client.keys(f"jv:{pattern}*")
            if keys:
                count = self.redis_client.delete(*keys)
                logger.info(f"Cache INVALIDATE: {count} keys matching pattern '{pattern}'")
                return count
            return 0
            
        except Exception as e:
            logger.error(f"Cache INVALIDATE error: {str(e)}")
            return 0
    
    async def clear_all(self) -> bool:
        """Clear all JokerVision cache entries"""
        if not self.cache_enabled or not self.is_connected:
            return False
        
        try:
            keys = self.redis_client.keys("jv:*")
            if keys:
                count = self.redis_client.delete(*keys)
                logger.info(f"Cache CLEAR ALL: {count} keys cleared")
                return True
            return True
            
        except Exception as e:
            logger.error(f"Cache CLEAR ALL error: {str(e)}")
            return False
    
    async def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        if not self.cache_enabled or not self.is_connected:
            return {"cache_enabled": False, "status": "disabled"}
        
        try:
            info = self.redis_client.info()
            jv_keys = len(self.redis_client.keys("jv:*"))
            
            stats = {
                "cache_enabled": True,
                "status": "connected",
                "total_jv_keys": jv_keys,
                "used_memory": info.get('used_memory_human', 'unknown'),
                "connected_clients": info.get('connected_clients', 0),
                "total_commands_processed": info.get('total_commands_processed', 0),
                "keyspace_hits": info.get('keyspace_hits', 0),
                "keyspace_misses": info.get('keyspace_misses', 0),
            }
            
            # Calculate hit rate
            hits = stats['keyspace_hits']
            misses = stats['keyspace_misses']
            if hits + misses > 0:
                stats['hit_rate'] = round((hits / (hits + misses)) * 100, 2)
            else:
                stats['hit_rate'] = 0.0
            
            return stats
            
        except Exception as e:
            logger.error(f"Cache STATS error: {str(e)}")
            return {"cache_enabled": True, "status": "error", "error": str(e)}

# Create global cache manager instance
cache_manager = CacheManager()

# Decorator for caching function results
def cached(cache_type: str, ttl: Optional[int] = None, key_func=None):
    """Decorator to cache function results"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Generate cache key based on function name and arguments
            if key_func:
                cache_key = key_func(*args, **kwargs)
            else:
                # Default key generation
                arg_str = "_".join(str(arg) for arg in args)
                kwarg_str = "_".join(f"{k}_{v}" for k, v in sorted(kwargs.items()))
                cache_key = f"{func.__name__}_{arg_str}_{kwarg_str}"
            
            # Try to get from cache
            cached_result = await cache_manager.get(cache_type, cache_key)
            if cached_result is not None:
                return cached_result
            
            # Execute function and cache result
            result = await func(*args, **kwargs)
            
            if result is not None:
                await cache_manager.set(cache_type, cache_key, result, ttl)
            
            return result
        return wrapper
    return decorator

# Convenience functions
async def get_cached(cache_type: str, identifier: str, params: Dict = None):
    """Get cached data"""
    return await cache_manager.get(cache_type, identifier, params)

async def set_cached(cache_type: str, identifier: str, data: Any, 
                     ttl: Optional[int] = None, params: Dict = None):
    """Set cached data"""
    return await cache_manager.set(cache_type, identifier, data, ttl, params)

async def invalidate_cache(cache_type: str, identifier: str = None, pattern: str = None):
    """Invalidate cached data"""
    if pattern:
        return await cache_manager.invalidate_pattern(pattern)
    elif identifier:
        return await cache_manager.delete(cache_type, identifier)
    else:
        return await cache_manager.invalidate_pattern(cache_type)

async def get_cache_statistics():
    """Get cache performance statistics"""
    return await cache_manager.get_cache_stats()

# Initialize cache manager on import
async def initialize_cache():
    """Initialize the cache manager"""
    return await cache_manager.initialize()

if __name__ == "__main__":
    import asyncio
    
    async def test_cache():
        """Test cache functionality"""
        print("🧪 Testing Redis Cache Manager...")
        
        # Initialize
        success = await initialize_cache()
        if not success:
            print("❌ Cache initialization failed")
            return
        
        # Test basic operations
        test_data = {"message": "Hello, Redis!", "timestamp": datetime.now().isoformat()}
        
        # Set cache
        set_result = await set_cached("test", "example", test_data)
        print(f"Set cache result: {set_result}")
        
        # Get cache
        cached_data = await get_cached("test", "example")
        print(f"Retrieved from cache: {cached_data}")
        
        # Get stats
        stats = await get_cache_statistics()
        print(f"Cache statistics: {stats}")
        
        # Clean up
        await invalidate_cache("test", "example")
        print("✅ Cache test completed")
    
    asyncio.run(test_cache())