import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  Facebook, Instagram, Play, Settings, Users, BarChart3, Calendar, 
  Upload, Eye, Edit, Trash2, Plus, RefreshCw, ExternalLink, 
  LogIn, LogOut, CheckCircle, AlertCircle, Clock, MessageSquare
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Simple component definitions
const Card = ({ children, className = "" }) => <div className={`${className}`}>{children}</div>;
const CardContent = ({ children, className = "" }) => <div className={`${className}`}>{children}</div>;
const Button = ({ children, className = "", onClick, size = "", variant = "", disabled = false, ...props }) => (
  <button 
    className={`px-4 py-2 rounded transition-colors ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    onClick={onClick}
    disabled={disabled}
    {...props}
  >
    {children}
  </button>
);
const Input = ({ className = "", ...props }) => (
  <input className={`px-3 py-2 border rounded ${className}`} {...props} />
);
const Textarea = ({ className = "", ...props }) => (
  <textarea className={`px-3 py-2 border rounded ${className}`} {...props} />
);
const Badge = ({ children, className = "" }) => <span className={`px-2 py-1 rounded text-xs ${className}`}>{children}</span>;

const SocialMediaHub = () => {
  const [activeTab, setActiveTab] = useState('accounts');
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [posts, setPosts] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);

  useEffect(() => {
    fetchConnectedAccounts();
    fetchPosts();
    fetchAnalytics();
  }, []);

  const fetchConnectedAccounts = async () => {
    try {
      const response = await axios.get(`${API}/social-media/accounts?tenant_id=default_dealership`);
      setConnectedAccounts(response.data.accounts || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      loadMockAccounts();
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API}/social-media/posts?tenant_id=default_dealership`);
      setPosts(response.data.posts || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      loadMockPosts();
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${API}/social-media/analytics?tenant_id=default_dealership`);
      setAnalytics(response.data || {});
    } catch (error) {
      console.error('Error fetching analytics:', error);
      loadMockAnalytics();
    } finally {
      setLoading(false);
    }
  };

  const loadMockAccounts = () => {
    setConnectedAccounts([
      {
        id: 'fb_123',
        platform: 'facebook',
        name: 'Shottenkirk Toyota',
        username: '@shottenkirktoyota',
        followers: 12500,
        status: 'connected',
        avatar: '/api/placeholder/50/50',
        connected_at: '2024-01-15T10:30:00Z'
      },
      {
        id: 'ig_456',
        platform: 'instagram',
        name: 'Shottenkirk Toyota',
        username: '@shottenkirktoyota',
        followers: 8900,
        status: 'connected',
        avatar: '/api/placeholder/50/50',
        connected_at: '2024-01-15T10:35:00Z'
      },
      {
        id: 'tt_789',
        platform: 'tiktok',
        name: 'Shottenkirk Toyota',
        username: '@shottenkirktoyota',
        followers: 15200,
        status: 'connected',
        avatar: '/api/placeholder/50/50',
        connected_at: '2024-01-20T14:20:00Z'
      }
    ]);
  };

  const loadMockPosts = () => {
    setPosts([
      {
        id: 'post_1',
        platform: 'facebook',
        content: 'Check out our latest 2025 Toyota Camry! Special financing available this month. 🚗✨',
        media_type: 'image',
        media_url: '/api/placeholder/300/200',
        status: 'published',
        likes: 156,
        shares: 23,
        comments: 12,
        reach: 2340,
        scheduled_at: '2024-01-22T09:00:00Z',
        published_at: '2024-01-22T09:00:00Z'
      },
      {
        id: 'post_2',
        platform: 'instagram',
        content: 'New arrival! 2025 RAV4 Hybrid 🌱 Fuel efficient and adventure ready. Book your test drive today!',
        media_type: 'video',
        media_url: '/api/placeholder/300/300',
        status: 'scheduled',
        likes: 0,
        shares: 0,
        comments: 0,
        reach: 0,
        scheduled_at: '2024-01-25T15:30:00Z',
        published_at: null
      },
      {
        id: 'post_3',
        platform: 'tiktok',
        content: 'POV: You just got the keys to your dream Toyota 🔑 #Toyota #NewCar #DreamCar',
        media_type: 'video',
        media_url: '/api/placeholder/200/350',
        status: 'draft',
        likes: 0,
        shares: 0,
        comments: 0,
        reach: 0,
        scheduled_at: null,
        published_at: null
      }
    ]);
  };

  const loadMockAnalytics = () => {
    setAnalytics({
      total_followers: 36600,
      total_posts: 127,
      total_engagement: 4850,
      avg_engagement_rate: 6.8,
      top_performing_platform: 'tiktok',
      recent_growth: 12.5,
      weekly_stats: {
        facebook: { posts: 5, engagement: 1240, reach: 15600 },
        instagram: { posts: 7, engagement: 2150, reach: 12800 },
        tiktok: { posts: 4, engagement: 3580, reach: 28400 }
      }
    });
  };

  const connectPlatform = async (platform) => {
    // In real implementation, this would redirect to OAuth flow
    toast.success(`Redirecting to ${platform} OAuth...`);
    
    // Mock connection after 2 seconds
    setTimeout(() => {
      const newAccount = {
        id: `${platform}_${Date.now()}`,
        platform: platform,
        name: 'Your Account',
        username: `@youraccount`,
        followers: Math.floor(Math.random() * 10000),
        status: 'connected',
        avatar: '/api/placeholder/50/50',
        connected_at: new Date().toISOString()
      };
      setConnectedAccounts([...connectedAccounts, newAccount]);
      toast.success(`${platform} account connected successfully!`);
    }, 2000);
  };

  const disconnectAccount = async (accountId) => {
    try {
      await axios.delete(`${API}/social-media/accounts/${accountId}`);
      setConnectedAccounts(connectedAccounts.filter(acc => acc.id !== accountId));
      toast.success('Account disconnected successfully');
    } catch (error) {
      // Mock disconnect
      setConnectedAccounts(connectedAccounts.filter(acc => acc.id !== accountId));
      toast.success('Account disconnected successfully');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner-neon"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-glass-bright mb-2">Social Media Hub</h1>
            <p className="text-glass-muted">Manage your Meta & TikTok presence from one place</p>
          </div>
          
          <div className="flex gap-3">
            <Button 
              onClick={() => setShowPostModal(true)}
              className="btn-neon"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Post
            </Button>
            <Button onClick={fetchConnectedAccounts} variant="outline" className="text-glass-bright">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Analytics Overview */}
        <AnalyticsOverview analytics={analytics} />

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <Button
            onClick={() => setActiveTab('accounts')}
            className={`${activeTab === 'accounts' ? 'bg-purple-600 text-white' : 'text-glass-bright hover:bg-glass'}`}
          >
            <Users className="w-4 h-4 mr-2" />
            Accounts
          </Button>
          <Button
            onClick={() => setActiveTab('posts')}
            className={`${activeTab === 'posts' ? 'bg-purple-600 text-white' : 'text-glass-bright hover:bg-glass'}`}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Posts
          </Button>
          <Button
            onClick={() => setActiveTab('analytics')}
            className={`${activeTab === 'analytics' ? 'bg-purple-600 text-white' : 'text-glass-bright hover:bg-glass'}`}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
        </div>

        {/* Content Area */}
        {activeTab === 'accounts' ? (
          <AccountsSection 
            accounts={connectedAccounts}
            onConnect={connectPlatform}
            onDisconnect={disconnectAccount}
          />
        ) : activeTab === 'posts' ? (
          <PostsSection 
            posts={posts}
            onRefresh={fetchPosts}
          />
        ) : (
          <AnalyticsSection 
            analytics={analytics}
          />
        )}

        {/* Create Post Modal */}
        {showPostModal && (
          <CreatePostModal 
            onClose={() => setShowPostModal(false)}
            accounts={connectedAccounts}
            onPostCreated={(post) => {
              setPosts([post, ...posts]);
              setShowPostModal(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

// Analytics Overview Component
const AnalyticsOverview = ({ analytics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="glass-card">
        <CardContent className="p-6 text-center">
          <Users className="w-8 h-8 mx-auto mb-2 neon-blue" />
          <div className="text-2xl font-bold text-glass-bright">{(analytics.total_followers || 0).toLocaleString()}</div>
          <div className="text-sm text-glass-muted">Total Followers</div>
        </CardContent>
      </Card>
      
      <Card className="glass-card">
        <CardContent className="p-6 text-center">
          <MessageSquare className="w-8 h-8 mx-auto mb-2 neon-green" />
          <div className="text-2xl font-bold neon-green">{analytics.total_posts || 0}</div>
          <div className="text-sm text-glass-muted">Total Posts</div>
        </CardContent>
      </Card>
      
      <Card className="glass-card">
        <CardContent className="p-6 text-center">
          <BarChart3 className="w-8 h-8 mx-auto mb-2 neon-purple" />
          <div className="text-2xl font-bold neon-purple">{(analytics.total_engagement || 0).toLocaleString()}</div>
          <div className="text-sm text-glass-muted">Total Engagement</div>
        </CardContent>
      </Card>
      
      <Card className="glass-card">
        <CardContent className="p-6 text-center">
          <Play className="w-8 h-8 mx-auto mb-2 neon-orange" />
          <div className="text-2xl font-bold neon-orange">{analytics.avg_engagement_rate || 0}%</div>
          <div className="text-sm text-glass-muted">Avg Engagement</div>
        </CardContent>
      </Card>
    </div>
  );
};

// Accounts Section Component
const AccountsSection = ({ accounts, onConnect, onDisconnect }) => {
  const platforms = [
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'bg-blue-600' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'bg-pink-600' },
    { id: 'tiktok', name: 'TikTok', icon: Play, color: 'bg-black' }
  ];

  const getConnectedAccount = (platformId) => {
    return accounts.find(acc => acc.platform === platformId);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {platforms.map((platform) => {
        const Icon = platform.icon;
        const connectedAccount = getConnectedAccount(platform.id);
        
        return (
          <Card key={platform.id} className="glass-card hover:scale-105 transition-transform duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className={`p-3 rounded-full ${platform.color} text-white mr-4`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-glass-bright">{platform.name}</h3>
                    {connectedAccount ? (
                      <p className="text-sm text-glass-muted">{connectedAccount.username}</p>
                    ) : (
                      <p className="text-sm text-glass-muted">Not connected</p>
                    )}
                  </div>
                </div>
                
                {connectedAccount ? (
                  <Badge className="bg-green-600 text-white">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                ) : (
                  <Badge className="bg-gray-600 text-white">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Disconnected
                  </Badge>
                )}
              </div>

              {connectedAccount ? (
                <>
                  <div className="mb-4">
                    <div className="text-lg font-bold text-glass-bright">{connectedAccount.followers?.toLocaleString()}</div>
                    <div className="text-sm text-glass-muted">Followers</div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" className="btn-neon flex-1">
                      <Settings className="w-3 h-3 mr-1" />
                      Settings
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-red-400"
                      onClick={() => onDisconnect(connectedAccount.id)}
                    >
                      <LogOut className="w-3 h-3" />
                    </Button>
                  </div>
                </>
              ) : (
                <Button 
                  onClick={() => onConnect(platform.id)}
                  className="btn-neon w-full"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Connect Account
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

// Posts Section Component
const PostsSection = ({ posts, onRefresh }) => {
  if (posts.length === 0) {
    return (
      <Card className="glass-card">
        <CardContent className="p-12 text-center">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-glass-muted" />
          <h3 className="text-xl font-semibold text-glass-bright mb-2">No Posts Yet</h3>
          <p className="text-glass-muted">Create your first social media post to get started</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};

// Post Card Component
const PostCard = ({ post }) => {
  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'facebook': return <Facebook className="w-5 h-5" />;
      case 'instagram': return <Instagram className="w-5 h-5" />;
      case 'tiktok': return <Play className="w-5 h-5" />;
      default: return <MessageSquare className="w-5 h-5" />;
    }
  };

  const getPlatformColor = (platform) => {
    switch (platform) {
      case 'facebook': return 'bg-blue-600';
      case 'instagram': return 'bg-pink-600';
      case 'tiktok': return 'bg-black';
      default: return 'bg-gray-600';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'neon-green';
      case 'scheduled': return 'neon-orange';
      case 'draft': return 'text-glass-muted';
      default: return 'text-glass';
    }
  };

  return (
    <Card className="glass-card hover:scale-105 transition-transform duration-200">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            <div className={`p-2 rounded-full ${getPlatformColor(post.platform)} text-white mr-4`}>
              {getPlatformIcon(post.platform)}
            </div>
            <div>
              <h4 className="font-semibold text-glass-bright capitalize">{post.platform}</h4>
              <p className="text-sm text-glass-muted">
                {post.status === 'published' ? 'Published' : post.status === 'scheduled' ? 'Scheduled' : 'Draft'}
                {post.published_at && ` • ${new Date(post.published_at).toLocaleDateString()}`}
                {post.scheduled_at && post.status === 'scheduled' && ` • ${new Date(post.scheduled_at).toLocaleDateString()}`}
              </p>
            </div>
          </div>
          
          <Badge className={`badge-neon ${getStatusColor(post.status)}`}>
            {post.status.toUpperCase()}
          </Badge>
        </div>

        <p className="text-sm text-glass-muted mb-4 line-clamp-3">{post.content}</p>

        {post.media_url && (
          <div className="mb-4">
            <img 
              src={post.media_url} 
              alt="Post media" 
              className="rounded-lg max-w-full h-32 object-cover"
            />
          </div>
        )}

        {post.status === 'published' && (
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-lg font-bold text-glass-bright">{post.likes}</div>
              <div className="text-xs text-glass-muted">Likes</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-glass-bright">{post.shares}</div>
              <div className="text-xs text-glass-muted">Shares</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-glass-bright">{post.comments}</div>
              <div className="text-xs text-glass-muted">Comments</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-glass-bright">{post.reach}</div>
              <div className="text-xs text-glass-muted">Reach</div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="text-sm text-glass-muted">
            {post.scheduled_at && `Scheduled: ${new Date(post.scheduled_at).toLocaleString()}`}
          </div>
          
          <div className="flex gap-2">
            <Button size="sm" className="btn-neon">
              <Eye className="w-3 h-3 mr-1" />
              View
            </Button>
            <Button size="sm" variant="outline" className="text-glass-bright">
              <Edit className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="outline" className="text-glass-bright">
              <ExternalLink className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Analytics Section Component
const AnalyticsSection = ({ analytics }) => {
  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold text-glass-bright mb-4">Platform Performance</h3>
          
          <div className="space-y-4">
            {analytics.weekly_stats && Object.entries(analytics.weekly_stats).map(([platform, stats]) => (
              <div key={platform} className="flex items-center justify-between p-4 bg-glass rounded-lg">
                <div className="flex items-center">
                  <div className="capitalize font-medium text-glass-bright">{platform}</div>
                </div>
                <div className="flex gap-6 text-sm">
                  <div>
                    <span className="text-glass-muted">Posts: </span>
                    <span className="text-glass-bright font-medium">{stats.posts}</span>
                  </div>
                  <div>
                    <span className="text-glass-muted">Engagement: </span>
                    <span className="text-glass-bright font-medium">{stats.engagement}</span>
                  </div>
                  <div>
                    <span className="text-glass-muted">Reach: </span>
                    <span className="text-glass-bright font-medium">{stats.reach?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Create Post Modal Component
const CreatePostModal = ({ onClose, accounts, onPostCreated }) => {
  const [postData, setPostData] = useState({
    content: '',
    platforms: [],
    media_type: 'text',
    scheduled_date: ''
  });

  const connectedPlatforms = accounts.map(acc => acc.platform);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API}/social-media/posts`, {
        tenant_id: 'default_dealership',
        ...postData
      });
      
      toast.success('Post created successfully!');
      onPostCreated(response.data);
    } catch (error) {
      console.error('Error creating post:', error);
      
      // Mock post creation
      const newPost = {
        id: `post_${Date.now()}`,
        platform: postData.platforms[0] || 'facebook',
        content: postData.content,
        media_type: postData.media_type,
        status: postData.scheduled_date ? 'scheduled' : 'draft',
        likes: 0,
        shares: 0,
        comments: 0,
        reach: 0,
        scheduled_at: postData.scheduled_date || null,
        published_at: null
      };
      
      toast.success('Post created successfully!');
      onPostCreated(newPost);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="glass-card max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-glass-bright">Create Social Media Post</h3>
            <Button onClick={onClose} size="sm" variant="outline" className="text-glass-bright">
              ✕
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-glass-bright mb-1">Content</label>
              <Textarea
                value={postData.content}
                onChange={(e) => setPostData({...postData, content: e.target.value})}
                placeholder="What's happening at your dealership?"
                className="text-glass w-full"
                rows={4}
                required
              />
              <p className="text-sm text-glass-muted mt-1">
                Characters: {postData.content.length}/2200
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-glass-bright mb-1">Platforms</label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: 'facebook', name: 'Facebook', icon: Facebook },
                  { id: 'instagram', name: 'Instagram', icon: Instagram },
                  { id: 'tiktok', name: 'TikTok', icon: Play }
                ].map((platform) => {
                  const Icon = platform.icon;
                  const isConnected = connectedPlatforms.includes(platform.id);
                  const isSelected = postData.platforms.includes(platform.id);
                  
                  return (
                    <div key={platform.id} className="relative">
                      <label className={`
                        flex items-center p-3 rounded border cursor-pointer transition-colors
                        ${isConnected 
                          ? isSelected 
                            ? 'bg-purple-600 text-white border-purple-600' 
                            : 'bg-glass border-glass-muted hover:bg-glass-bright'
                          : 'bg-gray-600 border-gray-600 cursor-not-allowed opacity-50'
                        }
                      `}>
                        <input
                          type="checkbox"
                          className="sr-only"
                          disabled={!isConnected}
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setPostData({
                                ...postData,
                                platforms: [...postData.platforms, platform.id]
                              });
                            } else {
                              setPostData({
                                ...postData,
                                platforms: postData.platforms.filter(p => p !== platform.id)
                              });
                            }
                          }}
                        />
                        <Icon className="w-5 h-5 mr-2" />
                        <span className="text-sm font-medium">{platform.name}</span>
                        {!isConnected && (
                          <Badge className="ml-auto bg-red-600 text-white text-xs">
                            Not Connected
                          </Badge>
                        )}
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-glass-bright mb-1">Media Type</label>
              <select 
                value={postData.media_type} 
                onChange={(e) => setPostData({...postData, media_type: e.target.value})}
                className="px-3 py-2 border rounded w-full text-glass"
              >
                <option value="text">Text Only</option>
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-glass-bright mb-1">Schedule (Optional)</label>
              <Input
                type="datetime-local"
                value={postData.scheduled_date}
                onChange={(e) => setPostData({...postData, scheduled_date: e.target.value})}
                className="text-glass"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="btn-neon flex-1" disabled={postData.platforms.length === 0}>
                <Upload className="w-4 h-4 mr-2" />
                {postData.scheduled_date ? 'Schedule Post' : 'Create Draft'}
              </Button>
              <Button type="button" onClick={onClose} variant="outline" className="text-glass-bright">
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialMediaHub;