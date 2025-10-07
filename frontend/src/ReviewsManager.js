import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  Star, MessageSquare, Send, RefreshCw, Filter, Search, Plus,
  ThumbsUp, ThumbsDown, AlertTriangle, CheckCircle2, Clock,
  ExternalLink, BarChart3, TrendingUp, Users, Eye, Edit,
  Facebook, Chrome, Car, Building2, Award, Zap, Reply
} from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

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

const ReviewsManager = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState('all');
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  useEffect(() => {
    fetchReviews();
    fetchReviewStats();
  }, [activeTab]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/reviews?tenant_id=default_dealership&platform=${activeTab}`);
      setReviews(response.data.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      // Load mock data for demonstration
      loadMockReviews();
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewStats = async () => {
    try {
      const response = await axios.get(`${API}/reviews/stats?tenant_id=default_dealership`);
      setReviewStats(response.data || {});
    } catch (error) {
      console.error('Error fetching review stats:', error);
      loadMockStats();
    }
  };

  const loadMockReviews = () => {
    const mockReviews = [
      {
        id: 'rev_1',
        platform: 'google',
        customer_name: 'Jennifer Martinez',
        rating: 5,
        title: 'Excellent Service!',
        content: 'Amazing experience at Shottenkirk Toyota! Sarah helped me find the perfect RAV4. Great customer service and fair pricing.',
        date: '2024-01-06T15:30:00Z',
        replied: true,
        reply_content: 'Thank you Jennifer! We\'re thrilled you love your new RAV4. Welcome to the Toyota family!',
        reply_date: '2024-01-06T16:45:00Z',
        sentiment: 'positive',
        vehicle: '2025 Toyota RAV4',
        sales_rep: 'Sarah Johnson'
      },
      {
        id: 'rev_2',
        platform: 'facebook',
        customer_name: 'Mike Rodriguez',
        rating: 4,
        title: 'Good Experience Overall',
        content: 'Bought my Tacoma here last month. Process was smooth, though wait time was a bit long. Happy with the truck!',
        date: '2024-01-05T10:20:00Z',
        replied: false,
        sentiment: 'positive',
        vehicle: '2025 Toyota Tacoma',
        sales_rep: 'Carlos Martinez'
      },
      {
        id: 'rev_3',
        platform: 'autotrader',
        customer_name: 'David Chen',
        rating: 2,
        title: 'Disappointing Experience',
        content: 'Had issues with financing and felt rushed through the process. Expected better service for such an expensive purchase.',
        date: '2024-01-04T14:15:00Z',
        replied: false,
        sentiment: 'negative',
        vehicle: '2025 Toyota Camry',
        sales_rep: 'Mike Wilson'
      },
      {
        id: 'rev_4',
        platform: 'cars_com',
        customer_name: 'Lisa Thompson',
        rating: 5,
        title: 'Highly Recommend!',
        content: 'First time car buyer and they made it so easy! Explained everything clearly and got me a great deal on financing.',
        date: '2024-01-03T09:45:00Z',
        replied: true,
        reply_content: 'Thank you Lisa! Congratulations on your first car purchase. Drive safely!',
        reply_date: '2024-01-03T11:20:00Z',
        sentiment: 'positive',
        vehicle: '2025 Toyota Corolla',
        sales_rep: 'Jennifer Chen'
      }
    ];
    
    if (activeTab !== 'all') {
      setReviews(mockReviews.filter(r => r.platform === activeTab));
    } else {
      setReviews(mockReviews);
    }
  };

  const loadMockStats = () => {
    setReviewStats({
      total_reviews: 247,
      average_rating: 4.2,
      positive_reviews: 186,
      negative_reviews: 23,
      response_rate: 78,
      recent_trend: '+12%'
    });
  };

  const replyToReview = async (reviewId, replyContent) => {
    try {
      await axios.post(`${API}/reviews/${reviewId}/reply`, {
        content: replyContent
      });
      
      // Update local state
      setReviews(reviews.map(review => 
        review.id === reviewId 
          ? { ...review, replied: true, reply_content: replyContent, reply_date: new Date().toISOString() }
          : review
      ));
      
      toast.success('Reply sent successfully!');
      setShowReplyModal(false);
      setSelectedReview(null);
    } catch (error) {
      console.error('Error replying to review:', error);
      toast.error('Failed to send reply');
    }
  };

  const generateAIReply = async (reviewId) => {
    try {
      const response = await axios.post(`${API}/reviews/${reviewId}/ai-reply`);
      return response.data.suggested_reply;
    } catch (error) {
      console.error('Error generating AI reply:', error);
      // Mock AI reply
      return "Thank you for your feedback! We appreciate you choosing our dealership and look forward to serving you again.";
    }
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'google': return <Chrome className="w-4 h-4" />;
      case 'facebook': return <Facebook className="w-4 h-4" />;
      case 'autotrader': return <Car className="w-4 h-4" />;
      case 'cars_com': return <Car className="w-4 h-4" />;
      case 'dealer_rater': return <Building2 className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const getPlatformColor = (platform) => {
    switch (platform) {
      case 'google': return 'bg-red-600';
      case 'facebook': return 'bg-blue-800';
      case 'autotrader': return 'bg-orange-600';
      case 'cars_com': return 'bg-blue-600';
      case 'dealer_rater': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = !searchTerm || 
      review.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRating = filterRating === 'all' || 
      (filterRating === '5' && review.rating === 5) ||
      (filterRating === '4' && review.rating === 4) ||
      (filterRating === '3' && review.rating === 3) ||
      (filterRating === 'low' && review.rating <= 2);
    
    return matchesSearch && matchesRating;
  });

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
            <h1 className="text-4xl font-bold text-glass-bright mb-2">Reviews Manager</h1>
            <p className="text-glass-muted">Collect, manage & respond to reviews across all platforms</p>
          </div>
          
          <div className="flex gap-3">
            <Button className="btn-neon">
              <Plus className="w-4 h-4 mr-2" />
              Collect Reviews
            </Button>
            <Button onClick={fetchReviews} variant="outline" className="text-glass-bright">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Review Stats */}
        <ReviewStats stats={reviewStats} />

        {/* Platform Tabs */}
        <PlatformTabs 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          getPlatformIcon={getPlatformIcon}
        />

        {/* Filters */}
        <ReviewFilters 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterRating={filterRating}
          onRatingFilterChange={setFilterRating}
        />

        {/* Reviews List */}
        <ReviewsList 
          reviews={filteredReviews}
          onReply={(review) => {
            setSelectedReview(review);
            setShowReplyModal(true);
          }}
          getPlatformIcon={getPlatformIcon}
          getPlatformColor={getPlatformColor}
          onGenerateAIReply={generateAIReply}
        />

        {/* Reply Modal */}
        {showReplyModal && (
          <ReplyModal 
            review={selectedReview}
            onClose={() => {
              setShowReplyModal(false);
              setSelectedReview(null);
            }}
            onSend={replyToReview}
            onGenerateAI={generateAIReply}
          />
        )}
      </div>
    </div>
  );
};

// Review Stats Component
const ReviewStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
      <Card className="glass-card">
        <CardContent className="p-6 text-center">
          <MessageSquare className="w-8 h-8 mx-auto mb-2 neon-blue" />
          <div className="text-2xl font-bold text-glass-bright">{stats.total_reviews || 0}</div>
          <div className="text-sm text-glass-muted">Total Reviews</div>
        </CardContent>
      </Card>
      
      <Card className="glass-card">
        <CardContent className="p-6 text-center">
          <Star className="w-8 h-8 mx-auto mb-2 neon-yellow" />
          <div className="text-2xl font-bold neon-yellow">{stats.average_rating || 0}★</div>
          <div className="text-sm text-glass-muted">Average Rating</div>
        </CardContent>
      </Card>
      
      <Card className="glass-card">
        <CardContent className="p-6 text-center">
          <ThumbsUp className="w-8 h-8 mx-auto mb-2 neon-green" />
          <div className="text-2xl font-bold neon-green">{stats.positive_reviews || 0}</div>
          <div className="text-sm text-glass-muted">Positive Reviews</div>
        </CardContent>
      </Card>
      
      <Card className="glass-card">
        <CardContent className="p-6 text-center">
          <ThumbsDown className="w-8 h-8 mx-auto mb-2 neon-red" />
          <div className="text-2xl font-bold neon-red">{stats.negative_reviews || 0}</div>
          <div className="text-sm text-glass-muted">Negative Reviews</div>
        </CardContent>
      </Card>
      
      <Card className="glass-card">
        <CardContent className="p-6 text-center">
          <Reply className="w-8 h-8 mx-auto mb-2 neon-purple" />
          <div className="text-2xl font-bold neon-purple">{stats.response_rate || 0}%</div>
          <div className="text-sm text-glass-muted">Response Rate</div>
        </CardContent>
      </Card>
      
      <Card className="glass-card">
        <CardContent className="p-6 text-center">
          <TrendingUp className="w-8 h-8 mx-auto mb-2 neon-cyan" />
          <div className="text-2xl font-bold neon-cyan">{stats.recent_trend || '0%'}</div>
          <div className="text-sm text-glass-muted">Recent Trend</div>
        </CardContent>
      </Card>
    </div>
  );
};

// Platform Tabs Component
const PlatformTabs = ({ activeTab, onTabChange, getPlatformIcon }) => {
  const platforms = [
    { id: 'all', name: 'All Platforms' },
    { id: 'google', name: 'Google' },
    { id: 'facebook', name: 'Facebook' },
    { id: 'autotrader', name: 'AutoTrader' },
    { id: 'cars_com', name: 'Cars.com' },
    { id: 'dealer_rater', name: 'DealerRater' }
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {platforms.map((platform) => (
        <Button
          key={platform.id}
          onClick={() => onTabChange(platform.id)}
          className={`${activeTab === platform.id ? 'bg-purple-600 text-white' : 'text-glass-bright hover:bg-glass'}`}
        >
          {platform.id !== 'all' && getPlatformIcon(platform.id)}
          <span className={platform.id !== 'all' ? 'ml-2' : ''}>{platform.name}</span>
        </Button>
      ))}
    </div>
  );
};

// Review Filters Component
const ReviewFilters = ({ searchTerm, onSearchChange, filterRating, onRatingFilterChange }) => {
  return (
    <Card className="glass-card mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-glass-muted" />
              <Input
                placeholder="Search reviews by customer or content..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 text-glass"
              />
            </div>
          </div>
          
          <select 
            value={filterRating} 
            onChange={(e) => onRatingFilterChange(e.target.value)}
            className="px-3 py-2 border rounded text-glass bg-glass"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="low">2 Stars & Below</option>
          </select>
          
          <Button variant="outline" className="text-glass-bright">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Reviews List Component
const ReviewsList = ({ reviews, onReply, getPlatformIcon, getPlatformColor, onGenerateAIReply }) => {
  if (reviews.length === 0) {
    return (
      <Card className="glass-card">
        <CardContent className="p-12 text-center">
          <Star className="w-16 h-16 mx-auto mb-4 text-glass-muted" />
          <h3 className="text-xl font-semibold text-glass-bright mb-2">No Reviews Found</h3>
          <p className="text-glass-muted">No reviews match your current filters</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewCard 
          key={review.id}
          review={review}
          onReply={onReply}
          getPlatformIcon={getPlatformIcon}
          getPlatformColor={getPlatformColor}
          onGenerateAIReply={onGenerateAIReply}
        />
      ))}
    </div>
  );
};

// Review Card Component
const ReviewCard = ({ review, onReply, getPlatformIcon, getPlatformColor, onGenerateAIReply }) => {
  const getRatingStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-400'}`} 
      />
    ));
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'text-green-400';
      case 'negative': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card className="glass-card hover:scale-105 transition-transform duration-200">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            <div className={`p-2 rounded-full ${getPlatformColor(review.platform)} text-white mr-4`}>
              {getPlatformIcon(review.platform)}
            </div>
            <div>
              <h4 className="font-semibold text-glass-bright">{review.customer_name}</h4>
              <div className="flex items-center mt-1">
                {getRatingStars(review.rating)}
                <span className="ml-2 text-sm text-glass-muted">{formatDate(review.date)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className={`${getSentimentColor(review.sentiment)} border`}>
              {review.sentiment}
            </Badge>
            {review.replied ? (
              <Badge className="bg-green-600 text-white">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Replied
              </Badge>
            ) : (
              <Badge className="bg-orange-600 text-white">
                <Clock className="w-3 h-3 mr-1" />
                Pending
              </Badge>
            )}
          </div>
        </div>

        {review.title && (
          <h5 className="font-medium text-glass-bright mb-2">{review.title}</h5>
        )}
        
        <p className="text-glass-muted mb-4">{review.content}</p>

        {review.vehicle && (
          <div className="flex items-center text-sm text-glass-muted mb-4">
            <Car className="w-4 h-4 mr-2" />
            {review.vehicle} • Rep: {review.sales_rep}
          </div>
        )}

        {review.replied && review.reply_content && (
          <div className="bg-glass p-3 rounded-lg mb-4">
            <div className="flex items-center mb-2">
              <Reply className="w-4 h-4 mr-2 text-purple-400" />
              <span className="text-sm font-medium text-glass-bright">Your Reply</span>
              <span className="text-xs text-glass-muted ml-2">{formatDate(review.reply_date)}</span>
            </div>
            <p className="text-sm text-glass-muted">{review.reply_content}</p>
          </div>
        )}

        <div className="flex gap-2">
          {!review.replied && (
            <Button onClick={() => onReply(review)} size="sm" className="btn-neon">
              <Reply className="w-3 h-3 mr-1" />
              Reply
            </Button>
          )}
          
          <Button size="sm" variant="outline" className="text-glass-bright">
            <ExternalLink className="w-3 h-3 mr-1" />
            View Original
          </Button>
          
          <Button size="sm" variant="outline" className="text-glass-bright">
            <Zap className="w-3 h-3 mr-1" />
            AI Insights
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Reply Modal Component
const ReplyModal = ({ review, onClose, onSend, onGenerateAI }) => {
  const [replyContent, setReplyContent] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const handleGenerateAI = async () => {
    setIsGeneratingAI(true);
    try {
      const aiReply = await onGenerateAI(review.id);
      setReplyContent(aiReply);
    } catch (error) {
      console.error('Error generating AI reply:', error);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSend = () => {
    if (!replyContent.trim()) return;
    onSend(review.id, replyContent);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="glass-card max-w-2xl w-full mx-4">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-glass-bright">Reply to Review</h3>
            <Button onClick={onClose} size="sm" variant="outline" className="text-glass-bright">
              ✕
            </Button>
          </div>

          {/* Review Preview */}
          <div className="bg-glass p-4 rounded-lg mb-6">
            <div className="flex items-center mb-2">
              <span className="font-medium text-glass-bright">{review.customer_name}</span>
              <div className="flex ml-3">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-400'}`} 
                  />
                ))}
              </div>
            </div>
            <p className="text-sm text-glass-muted">{review.content}</p>
          </div>

          {/* Reply Editor */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-glass-bright">Your Reply</label>
              <Button 
                onClick={handleGenerateAI}
                disabled={isGeneratingAI}
                size="sm"
                className="btn-neon"
              >
                <Zap className="w-3 h-3 mr-1" />
                {isGeneratingAI ? 'Generating...' : 'AI Suggest'}
              </Button>
            </div>
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a professional reply to this review..."
              className="w-full text-glass"
              rows={5}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={handleSend} disabled={!replyContent.trim()} className="btn-neon flex-1">
              <Send className="w-4 h-4 mr-2" />
              Send Reply
            </Button>
            <Button onClick={onClose} variant="outline" className="text-glass-bright">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewsManager;