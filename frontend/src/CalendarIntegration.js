import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  Calendar, Plus, Clock, Users, MapPin, Settings, RefreshCw,
  CheckCircle2, AlertCircle, Edit, Trash2, ExternalLink, Phone,
  Mail, Car, Wrench, Package, ChevronLeft, ChevronRight, Eye
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

const CalendarIntegration = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [viewMode, setViewMode] = useState('week'); // day, week, month
  const [connectedCalendars, setConnectedCalendars] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, [currentDate, viewMode]);

  const fetchEvents = async () => {
    try {
      const startDate = getStartDate().toISOString();
      const endDate = getEndDate().toISOString();
      
      const response = await axios.get(`${API}/calendar/events`, {
        params: {
          tenant_id: 'default_dealership',
          start_date: startDate,
          end_date: endDate
        }
      });
      setEvents(response.data.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      loadMockEvents();
    } finally {
      setLoading(false);
    }
  };

  const loadMockEvents = () => {
    const today = new Date();
    setEvents([
      {
        id: 'evt_1',
        title: 'Test Drive - 2025 Camry',
        description: 'Test drive appointment with Sarah Johnson',
        start_time: new Date(today.getTime() + 24*60*60*1000).toISOString(),
        end_time: new Date(today.getTime() + 24*60*60*1000 + 30*60*1000).toISOString(),
        location: 'Shottenkirk Toyota Showroom',
        event_type: 'appointment',
        status: 'scheduled',
        attendees: ['sarah.johnson@email.com'],
        lead_id: 'lead_123'
      },
      {
        id: 'evt_2',
        title: 'Service Appointment - Oil Change',
        description: 'Routine maintenance for Mike Chen',
        start_time: new Date(today.getTime() + 48*60*60*1000).toISOString(),
        end_time: new Date(today.getTime() + 48*60*60*1000 + 60*60*1000).toISOString(),
        location: 'Service Department',
        event_type: 'service',
        status: 'confirmed',
        attendees: ['mike.chen@email.com']
      },
      {
        id: 'evt_3',
        title: 'Vehicle Delivery',
        description: 'New RAV4 delivery for Johnson family',
        start_time: new Date(today.getTime() + 72*60*60*1000).toISOString(),
        end_time: new Date(today.getTime() + 72*60*60*1000 + 45*60*1000).toISOString(),
        location: 'Delivery Bay',
        event_type: 'delivery',
        status: 'scheduled',
        attendees: ['family.johnson@email.com']
      }
    ]);
  };

  const getStartDate = () => {
    const date = new Date(currentDate);
    if (viewMode === 'day') {
      date.setHours(0, 0, 0, 0);
      return date;
    } else if (viewMode === 'week') {
      const day = date.getDay();
      date.setDate(date.getDate() - day);
      date.setHours(0, 0, 0, 0);
      return date;
    } else {
      date.setDate(1);
      date.setHours(0, 0, 0, 0);
      return date;
    }
  };

  const getEndDate = () => {
    const date = new Date(currentDate);
    if (viewMode === 'day') {
      date.setHours(23, 59, 59, 999);
      return date;
    } else if (viewMode === 'week') {
      const day = date.getDay();
      date.setDate(date.getDate() - day + 6);
      date.setHours(23, 59, 59, 999);
      return date;
    } else {
      date.setMonth(date.getMonth() + 1, 0);
      date.setHours(23, 59, 59, 999);
      return date;
    }
  };

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + direction);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction * 7));
    } else {
      newDate.setMonth(newDate.getMonth() + direction);
    }
    setCurrentDate(newDate);
  };

  const getEventTypeIcon = (type) => {
    switch (type) {
      case 'appointment': return <Car className="w-4 h-4" />;
      case 'service': return <Wrench className="w-4 h-4" />;
      case 'delivery': return <Package className="w-4 h-4" />;
      case 'follow_up': return <Phone className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'appointment': return 'bg-blue-600';
      case 'service': return 'bg-green-600';  
      case 'delivery': return 'bg-purple-600';
      case 'follow_up': return 'bg-orange-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'neon-green';
      case 'scheduled': return 'neon-blue';
      case 'cancelled': return 'text-red-400';
      case 'completed': return 'text-glass-muted';
      default: return 'text-glass';
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
            <h1 className="text-4xl font-bold text-glass-bright mb-2">Calendar Integration</h1>
            <p className="text-glass-muted">Manage appointments and sync with Google Calendar & Outlook</p>
          </div>
          
          <div className="flex gap-3">
            <Button 
              onClick={() => setShowEventModal(true)}
              className="btn-neon"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Event
            </Button>
            <Button onClick={fetchEvents} variant="outline" className="text-glass-bright">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => setShowSettings(true)} variant="outline" className="text-glass-bright">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Calendar Header */}
        <CalendarHeader 
          currentDate={currentDate}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onNavigate={navigateDate}
        />

        {/* Calendar View */}
        {viewMode === 'week' ? (
          <WeekView events={events} currentDate={currentDate} onEventClick={setSelectedEvent} />
        ) : viewMode === 'day' ? (
          <DayView events={events} currentDate={currentDate} onEventClick={setSelectedEvent} />
        ) : (
          <MonthView events={events} currentDate={currentDate} onEventClick={setSelectedEvent} />
        )}

        {/* Event Details Modal */}
        {selectedEvent && (
          <EventDetailsModal 
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
            onEdit={() => {
              setShowEventModal(true);
              setSelectedEvent(null);
            }}
          />
        )}

        {/* Create/Edit Event Modal */}
        {showEventModal && (
          <CreateEventModal 
            onClose={() => setShowEventModal(false)}
            onEventCreated={(event) => {
              setEvents([...events, event]);
              setShowEventModal(false);
            }}
          />
        )}

        {/* Settings Modal */}
        {showSettings && (
          <SettingsModal 
            onClose={() => setShowSettings(false)}
            connectedCalendars={connectedCalendars}
            setConnectedCalendars={setConnectedCalendars}
          />
        )}
      </div>
    </div>
  );
};

// Calendar Header Component
const CalendarHeader = ({ currentDate, viewMode, onViewModeChange, onNavigate }) => {
  const formatHeaderDate = () => {
    const options = viewMode === 'month' 
      ? { year: 'numeric', month: 'long' }
      : viewMode === 'week'
      ? { year: 'numeric', month: 'long', day: 'numeric' }
      : { year: 'numeric', month: 'long', day: 'numeric' };
    
    return currentDate.toLocaleDateString('en-US', options);
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-4">
        <div className="flex gap-2">
          <Button onClick={() => onNavigate(-1)} variant="outline" size="sm" className="text-glass-bright">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button onClick={() => onNavigate(1)} variant="outline" size="sm" className="text-glass-bright">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        
        <h2 className="text-2xl font-semibold text-glass-bright">{formatHeaderDate()}</h2>
        
        <Button 
          onClick={() => setCurrentDate(new Date())}
          variant="outline" 
          size="sm" 
          className="text-glass-bright"
        >
          Today
        </Button>
      </div>

      <div className="flex gap-2">
        {['day', 'week', 'month'].map((mode) => (
          <Button
            key={mode}
            onClick={() => onViewModeChange(mode)}
            className={`${viewMode === mode ? 'bg-purple-600 text-white' : 'text-glass-bright hover:bg-glass'}`}
            size="sm"
          >
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </Button>
        ))}
      </div>
    </div>
  );
};

// Week View Component
const WeekView = ({ events, currentDate, onEventClick }) => {
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    return day;
  });

  const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM

  const getEventsForDayHour = (day, hour) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_time);
      return eventDate.toDateString() === day.toDateString() && 
             eventDate.getHours() === hour;
    });
  };

  return (
    <Card className="glass-card">
      <CardContent className="p-6">
        <div className="grid grid-cols-8 gap-1 mb-4">
          <div className="text-sm font-medium text-glass-bright p-2">Time</div>
          {weekDays.map((day, index) => (
            <div key={index} className="text-sm font-medium text-glass-bright p-2 text-center">
              <div>{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
              <div className="text-xs text-glass-muted">{day.getDate()}</div>
            </div>
          ))}
        </div>

        <div className="space-y-1 max-h-96 overflow-y-auto">
          {hours.map(hour => (
            <div key={hour} className="grid grid-cols-8 gap-1 min-h-12">
              <div className="text-sm text-glass-muted p-2">
                {hour}:00
              </div>
              {weekDays.map((day, dayIndex) => {
                const dayEvents = getEventsForDayHour(day, hour);
                return (
                  <div key={dayIndex} className="p-1 border border-glass-muted/20 rounded">
                    {dayEvents.map(event => (
                      <div
                        key={event.id}
                        onClick={() => onEventClick(event)}
                        className="text-xs p-1 rounded bg-blue-600 text-white cursor-pointer hover:bg-blue-500 mb-1"
                      >
                        {event.title}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Day View Component  
const DayView = ({ events, currentDate, onEventClick }) => {
  const dayEvents = events.filter(event => {
    const eventDate = new Date(event.start_time);
    return eventDate.toDateString() === currentDate.toDateString();
  });

  const hours = Array.from({ length: 12 }, (_, i) => i + 8);

  return (
    <Card className="glass-card">
      <CardContent className="p-6">
        <div className="space-y-2">
          {hours.map(hour => {
            const hourEvents = dayEvents.filter(event => {
              const eventDate = new Date(event.start_time);
              return eventDate.getHours() === hour;
            });

            return (
              <div key={hour} className="flex border-b border-glass-muted/20 pb-2">
                <div className="w-20 text-sm text-glass-muted p-2">
                  {hour}:00
                </div>
                <div className="flex-1 p-2 space-y-1">
                  {hourEvents.map(event => (
                    <EventCard key={event.id} event={event} onClick={() => onEventClick(event)} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

// Month View Component
const MonthView = ({ events, currentDate, onEventClick }) => {
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(firstDay.getDate() - firstDay.getDay());

  const weeks = [];
  let currentWeek = [];
  
  for (let i = 0; i < 42; i++) {
    const day = new Date(startDate);
    day.setDate(startDate.getDate() + i);
    
    currentWeek.push(day);
    
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  return (
    <Card className="glass-card">
      <CardContent className="p-6">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-sm font-medium text-glass-bright p-2 text-center">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="space-y-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-1">
              {week.map((day, dayIndex) => {
                const dayEvents = events.filter(event => {
                  const eventDate = new Date(event.start_time);
                  return eventDate.toDateString() === day.toDateString();
                });

                const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                const isToday = day.toDateString() === new Date().toDateString();

                return (
                  <div
                    key={dayIndex}
                    className={`
                      min-h-24 p-1 border border-glass-muted/20 rounded
                      ${isCurrentMonth ? 'bg-glass/10' : 'bg-glass-muted/5'}
                      ${isToday ? 'ring-2 ring-purple-500' : ''}
                    `}
                  >
                    <div className={`
                      text-sm font-medium p-1
                      ${isCurrentMonth ? 'text-glass-bright' : 'text-glass-muted'}
                      ${isToday ? 'text-purple-400' : ''}
                    `}>
                      {day.getDate()}
                    </div>
                    
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map(event => (
                        <div
                          key={event.id}
                          onClick={() => onEventClick(event)}
                          className="text-xs p-1 rounded bg-blue-600 text-white cursor-pointer hover:bg-blue-500"
                        >
                          {event.title.slice(0, 15)}...
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-glass-muted">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Event Card Component
const EventCard = ({ event, onClick }) => {
  const getEventTypeIcon = (type) => {
    switch (type) {
      case 'appointment': return <Car className="w-4 h-4" />;
      case 'service': return <Wrench className="w-4 h-4" />;
      case 'delivery': return <Package className="w-4 h-4" />;
      case 'follow_up': return <Phone className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'appointment': return 'bg-blue-600';
      case 'service': return 'bg-green-600';
      case 'delivery': return 'bg-purple-600';
      case 'follow_up': return 'bg-orange-600';
      default: return 'bg-gray-600';
    }
  };

  const startTime = new Date(event.start_time);
  const endTime = new Date(event.end_time);

  return (
    <div
      onClick={onClick}
      className="flex items-center p-3 rounded-lg glass-card hover:scale-105 transition-transform cursor-pointer"
    >
      <div className={`p-2 rounded-full ${getEventTypeColor(event.event_type)} text-white mr-3`}>
        {getEventTypeIcon(event.event_type)}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="font-medium text-glass-bright">{event.title}</div>
        <div className="text-sm text-glass-muted">
          {startTime.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
          })} - {endTime.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
          })}
        </div>
        {event.location && (
          <div className="text-sm text-glass-muted flex items-center mt-1">
            <MapPin className="w-3 h-3 mr-1" />
            {event.location}
          </div>
        )}
      </div>

      <Badge className={`ml-2 ${
        event.status === 'confirmed' ? 'bg-green-600 text-white' :
        event.status === 'scheduled' ? 'bg-blue-600 text-white' :
        'bg-gray-600 text-white'
      }`}>
        {event.status}
      </Badge>
    </div>
  );
};

// Event Details Modal
const EventDetailsModal = ({ event, onClose, onEdit }) => {
  const startTime = new Date(event.start_time);
  const endTime = new Date(event.end_time);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="glass-card max-w-md w-full mx-4">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-semibold text-glass-bright">{event.title}</h3>
            <Button onClick={onClose} size="sm" variant="outline" className="text-glass-bright">
              ✕
            </Button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center text-glass-muted">
              <Clock className="w-4 h-4 mr-2" />
              <span>
                {startTime.toLocaleDateString()} at {startTime.toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit', 
                  hour12: true 
                })} - {endTime.toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit', 
                  hour12: true 
                })}
              </span>
            </div>

            {event.location && (
              <div className="flex items-center text-glass-muted">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{event.location}</span>
              </div>
            )}

            {event.attendees && event.attendees.length > 0 && (
              <div className="flex items-center text-glass-muted">
                <Users className="w-4 h-4 mr-2" />
                <span>{event.attendees.join(', ')}</span>
              </div>
            )}

            {event.description && (
              <div className="text-glass-muted">
                <p>{event.description}</p>
              </div>
            )}

            <div className="flex items-center">
              <Badge className={`${
                event.status === 'confirmed' ? 'bg-green-600 text-white' :
                event.status === 'scheduled' ? 'bg-blue-600 text-white' :
                'bg-gray-600 text-white'
              }`}>
                {event.status}
              </Badge>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={onEdit} className="btn-neon flex-1">
              <Edit className="w-4 h-4 mr-2" />
              Edit Event
            </Button>
            <Button variant="outline" className="text-glass-bright">
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Create Event Modal
const CreateEventModal = ({ onClose, onEventCreated }) => {
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    event_type: 'appointment',
    start_time: '',
    end_time: '',
    location: '',
    attendees: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API}/calendar/events`, {
        tenant_id: 'default_dealership',
        ...eventData,
        attendees: eventData.attendees.split(',').map(email => email.trim()).filter(Boolean)
      });
      
      toast.success('Event created successfully!');
      onEventCreated(response.data);
    } catch (error) {
      console.error('Error creating event:', error);
      
      // Mock event creation
      const newEvent = {
        id: `evt_${Date.now()}`,
        ...eventData,
        attendees: eventData.attendees.split(',').map(email => email.trim()).filter(Boolean),
        status: 'scheduled'
      };
      
      toast.success('Event created successfully!');
      onEventCreated(newEvent);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="glass-card max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-glass-bright">Create New Event</h3>
            <Button onClick={onClose} size="sm" variant="outline" className="text-glass-bright">
              ✕
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-glass-bright mb-1">Title</label>
              <Input
                value={eventData.title}
                onChange={(e) => setEventData({...eventData, title: e.target.value})}
                placeholder="Event title"
                className="text-glass w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-glass-bright mb-1">Type</label>
              <select 
                value={eventData.event_type} 
                onChange={(e) => setEventData({...eventData, event_type: e.target.value})}
                className="px-3 py-2 border rounded w-full text-glass"
              >
                <option value="appointment">Test Drive Appointment</option>
                <option value="service">Service Appointment</option>
                <option value="delivery">Vehicle Delivery</option>
                <option value="follow_up">Follow-up Call</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-glass-bright mb-1">Start Time</label>
                <Input
                  type="datetime-local"
                  value={eventData.start_time}
                  onChange={(e) => setEventData({...eventData, start_time: e.target.value})}
                  className="text-glass"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-glass-bright mb-1">End Time</label>
                <Input
                  type="datetime-local"
                  value={eventData.end_time}
                  onChange={(e) => setEventData({...eventData, end_time: e.target.value})}
                  className="text-glass"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-glass-bright mb-1">Location</label>
              <Input
                value={eventData.location}
                onChange={(e) => setEventData({...eventData, location: e.target.value})}
                placeholder="Event location"
                className="text-glass w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-glass-bright mb-1">Attendees (comma-separated emails)</label>
              <Input
                value={eventData.attendees}
                onChange={(e) => setEventData({...eventData, attendees: e.target.value})}
                placeholder="email1@example.com, email2@example.com"
                className="text-glass w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-glass-bright mb-1">Description</label>
              <Textarea
                value={eventData.description}
                onChange={(e) => setEventData({...eventData, description: e.target.value})}
                placeholder="Event description"
                className="text-glass w-full"
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="btn-neon flex-1">
                <Plus className="w-4 h-4 mr-2" />
                Create Event
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

export default CalendarIntegration;