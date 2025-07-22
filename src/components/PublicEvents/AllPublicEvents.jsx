import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Container,
  CircularProgress,
  Chip,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Avatar,
  Stack,
  Divider,
  Fade,
  Skeleton
} from '@mui/material';
import { 
  Search,
  LocationOn, 
  Schedule,
  ArrowBack,
  FilterList,
  EventAvailable,
  ViewModule,
  ViewList,
  Sort,
  TuneRounded,
  Star,
  People,
  CalendarMonth
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useTheme } from '../../contexts/ThemeContext';
import { API_ROUTE } from '../../lib/config';

export default function AllPublicEvents() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchPublicEvents();
  }, []);

  useEffect(() => {
    filterAndSortEvents();
  }, [events, searchTerm, statusFilter, locationFilter, sortBy]);

  const fetchPublicEvents = async () => {
    try {
      const response = await fetch(`${API_ROUTE}/api/v1/event/public`);
      if (!response.ok) throw new Error('Failed to fetch events');
      
      const data = await response.json();
      const publicEvents = data.data || [];
      
      setEvents(publicEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const getEventStatus = (event) => {
    const now = new Date();
    const startDate = new Date(event.start_date);
    const endDate = new Date(event.end_date);
    
    if (now < startDate) return { label: 'Upcoming', color: '#6366f1', bg: '#f0f9ff', value: 'upcoming' };
    if (now >= startDate && now <= endDate) return { label: 'Live Now', color: '#10b981', bg: '#f0fdf4', value: 'active' };
    return { label: 'Ended', color: '#6b7280', bg: '#f9fafb', value: 'ended' };
  };

  const filterAndSortEvents = () => {
    let filtered = events;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.user?.company_name && event.user.company_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(event => {
        const status = getEventStatus(event);
        return status.value === statusFilter;
      });
    }

    // Location filter
    if (locationFilter !== 'all') {
      filtered = filtered.filter(event =>
        event.location.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    // Sort events
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.start_date) - new Date(b.start_date);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'location':
          return a.location.localeCompare(b.location);
        case 'recent':
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });

    setFilteredEvents(filtered);
  };

  const getUniqueLocations = () => {
    const locations = events.map(event => event.location).filter(Boolean);
    return [...new Set(locations)];
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setLocationFilter('all');
    setSortBy('date');
  };

  if (loading) {
    return (
      <Box 
        sx={{ 
          minHeight: '100vh',
          background: theme === 'dark' 
            ? 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)'
            : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
        }}
      >
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ mb: 4 }}>
            <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 3, mb: 3 }} />
            <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
          </Box>
          <Grid container spacing={4}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Grid item xs={12} sm={6} lg={4} key={item}>
                <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        background: theme === 'dark' 
          ? 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)'
          : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        fontFamily: 'var(--font-base)'
      }}
    >
      {/* Premium Header */}
      <Box 
        sx={{ 
          background: theme === 'dark'
            ? 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          position: 'relative',
          overflow: 'hidden',
          py: 6
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '-50%',
            right: '-20%',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            animation: 'float 8s ease-in-out infinite'
          }}
        />
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
            <IconButton 
              onClick={() => navigate('/public-events')}
              sx={{ 
                color: 'white',
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  background: 'rgba(255,255,255,0.2)',
                  transform: 'scale(1.05)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              <ArrowBack />
            </IconButton>
            <Box>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontFamily: 'var(--font-heading)',
                  fontSize: { xs: '2rem', md: '3rem' },
                  fontWeight: 800,
                  color: 'white',
                  letterSpacing: '-0.02em',
                  mb: 1
                }}
              >
                All Events
              </Typography>
              <Typography 
                variant="h6"
                sx={{ 
                  color: 'rgba(255,255,255,0.9)',
                  fontWeight: 400
                }}
              >
                Discover amazing events happening around you
              </Typography>
            </Box>
          </Box>

          {/* Search Bar */}
          <Card 
            sx={{ 
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 4,
              p: 2
            }}
          >
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search events, locations, organizers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: 'rgba(255,255,255,0.7)' }} />
                      </InputAdornment>
                    ),
                    sx: {
                      color: 'white',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255,255,255,0.3)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255,255,255,0.5)',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'white',
                      },
                      '& input::placeholder': {
                        color: 'rgba(255,255,255,0.7)',
                        opacity: 1,
                      }
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant={showFilters ? 'contained' : 'outlined'}
                    startIcon={<TuneRounded />}
                    onClick={() => setShowFilters(!showFilters)}
                    sx={{
                      color: 'white',
                      borderColor: 'rgba(255,255,255,0.3)',
                      background: showFilters ? 'rgba(255,255,255,0.2)' : 'transparent',
                      '&:hover': {
                        borderColor: 'white',
                        background: 'rgba(255,255,255,0.2)'
                      }
                    }}
                  >
                    Filters
                  </Button>
                  <IconButton
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                    sx={{ 
                      color: 'white',
                      background: 'rgba(255,255,255,0.1)',
                      '&:hover': {
                        background: 'rgba(255,255,255,0.2)'
                      }
                    }}
                  >
                    {viewMode === 'grid' ? <ViewList /> : <ViewModule />}
                  </IconButton>
                </Box>
              </Grid>
            </Grid>
          </Card>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Advanced Filters */}
        <Fade in={showFilters}>
          <Card 
            sx={{ 
              mb: 4, 
              p: 3, 
              borderRadius: 3,
              background: 'var(--color-card-bg)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <Typography variant="h6" sx={{ 
              fontFamily: 'var(--font-heading)',
              fontWeight: 600,
              color: 'var(--color-text)',
              mb: 3
            }}>
              Advanced Filters
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="upcoming">Upcoming</MenuItem>
                    <MenuItem value="active">Live Now</MenuItem>
                    <MenuItem value="ended">Ended</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Location</InputLabel>
                  <Select
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    label="Location"
                  >
                    <MenuItem value="all">All Locations</MenuItem>
                    {getUniqueLocations().map((location) => (
                      <MenuItem key={location} value={location}>
                        {location}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    label="Sort By"
                  >
                    <MenuItem value="date">Event Date</MenuItem>
                    <MenuItem value="name">Event Name</MenuItem>
                    <MenuItem value="location">Location</MenuItem>
                    <MenuItem value="recent">Recently Added</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="outlined" 
                onClick={clearAllFilters}
                sx={{
                  borderColor: 'var(--color-text-secondary)',
                  color: 'var(--color-text-secondary)'
                }}
              >
                Clear All Filters
              </Button>
            </Box>
          </Card>
        </Fade>

        {/* Results Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography 
              variant="h5"
              sx={{ 
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                color: 'var(--color-text)',
                mb: 0.5
              }}
            >
              {filteredEvents.length} Events Found
            </Typography>
            <Typography 
              variant="body2"
              sx={{ color: 'var(--color-text-secondary)' }}
            >
              {searchTerm && `Results for "${searchTerm}"`}
              {statusFilter !== 'all' && ` • ${statusFilter} events`}
              {locationFilter !== 'all' && ` • ${locationFilter}`}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Chip
              icon={<EventAvailable />}
              label={`${filteredEvents.length} Events`}
              variant="outlined"
              sx={{
                borderColor: 'var(--color-primary)',
                color: 'var(--color-primary)',
                fontWeight: 600
              }}
            />
          </Stack>
        </Box>

        {/* Events Grid/List */}
        {filteredEvents.length === 0 ? (
          <Card 
            sx={{ 
              borderRadius: 4,
              border: `2px dashed var(--border-color)`,
              background: 'transparent',
              p: 8,
              textAlign: 'center'
            }}
          >
            <CalendarMonth sx={{ 
              fontSize: 100, 
              color: 'var(--color-text-secondary)',
              mb: 3,
              opacity: 0.5
            }} />
            <Typography variant="h4" sx={{ 
              fontFamily: 'var(--font-heading)',
              color: 'var(--color-text)',
              fontWeight: 700,
              mb: 2
            }}>
              No Events Found
            </Typography>
            <Typography variant="body1" sx={{ 
              color: 'var(--color-text-secondary)',
              mb: 4,
              maxWidth: '400px',
              mx: 'auto'
            }}>
              We couldn't find any events matching your criteria. Try adjusting your filters or search terms.
            </Typography>
            <Button
              variant="outlined"
              onClick={clearAllFilters}
              sx={{
                borderColor: 'var(--color-primary)',
                color: 'var(--color-primary)',
                borderRadius: '50px',
                px: 3
              }}
            >
              Clear All Filters
            </Button>
          </Card>
        ) : (
          <Grid container spacing={4}>
            {filteredEvents.map((event, index) => {
              const status = getEventStatus(event);
              return (
                <Grid item xs={12} sm={6} lg={viewMode === 'list' ? 12 : 4} key={event._id}>
                  <Fade in timeout={600 + index * 100}>
                    <Card 
                      onClick={() => navigate(`/event/${event._id}/details`)}
                      className="card-professional"
                      sx={{ 
                        height: '100%',
                        borderRadius: 4,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: '1px solid var(--border-color)',
                        background: 'var(--color-card-bg)',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'translateY(-12px) scale(1.02)',
                          boxShadow: 'var(--shadow-2xl)',
                          borderColor: 'var(--color-primary)'
                        }
                      }}
                    >
                      <Box sx={{ 
                        display: viewMode === 'list' ? 'flex' : 'block',
                        height: '100%'
                      }}>
                        <Box sx={{ 
                          position: 'relative',
                          width: viewMode === 'list' ? '300px' : '100%',
                          flexShrink: 0
                        }}>
                          <CardMedia
                            component="img"
                            height={viewMode === 'list' ? '200' : '240'}
                            image={event.cover_image}
                            alt={event.name}
                            sx={{ 
                              objectFit: 'cover',
                              filter: 'brightness(0.9)'
                            }}
                          />
                          <Box sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.1) 100%)'
                          }} />
                          <Box sx={{
                            position: 'absolute',
                            top: 16,
                            left: 16,
                            right: 16,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start'
                          }}>
                            <Chip 
                              label={status.label}
                              sx={{
                                background: status.bg,
                                color: status.color,
                                fontWeight: 600,
                                borderRadius: 2,
                                fontSize: '0.75rem',
                                height: 28
                              }}
                            />
                            {status.label === 'Live Now' && (
                              <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                background: 'rgba(16, 185, 129, 0.9)',
                                color: 'white',
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 2,
                                fontSize: '0.75rem',
                                fontWeight: 600
                              }}>
                                <Box sx={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: '50%',
                                  background: 'white',
                                  animation: 'pulse 2s infinite'
                                }} />
                                LIVE
                              </Box>
                            )}
                          </Box>
                        </Box>
                        
                        <CardContent sx={{ 
                          p: 3, 
                          flexGrow: 1,
                          display: 'flex',
                          flexDirection: 'column'
                        }}>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontFamily: 'var(--font-heading)',
                              fontWeight: 700,
                              color: 'var(--color-text)',
                              mb: 1.5,
                              lineHeight: 1.3,
                              fontSize: '1.1rem'
                            }}
                          >
                            {event.name}
                          </Typography>
                          
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: 'var(--color-text-secondary)',
                              mb: 3,
                              lineHeight: 1.6,
                              display: '-webkit-box',
                              WebkitLineClamp: viewMode === 'list' ? 3 : 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              flexGrow: 1
                            }}
                          >
                            {event.description}
                          </Typography>

                          <Stack spacing={1.5} sx={{ mb: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Schedule sx={{ fontSize: 18, color: 'var(--color-primary)' }} />
                              <Typography variant="body2" sx={{ 
                                color: 'var(--color-text)',
                                fontWeight: 500
                              }}>
                                {format(new Date(event.start_date), 'MMM d, yyyy')} • {event.start_time}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LocationOn sx={{ fontSize: 18, color: 'var(--color-primary)' }} />
                              <Typography variant="body2" sx={{ 
                                color: 'var(--color-text)',
                                fontWeight: 500
                              }}>
                                {event.location}
                              </Typography>
                            </Box>
                          </Stack>

                          <Divider sx={{ mb: 2, borderColor: 'var(--border-color)' }} />
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            {event.user?.company_name && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                                  {event.user.company_name.charAt(0)}
                                </Avatar>
                                <Typography variant="caption" sx={{ 
                                  color: 'var(--color-text-secondary)',
                                  fontWeight: 500
                                }}>
                                  {event.user.company_name}
                                </Typography>
                              </Box>
                            )}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Star sx={{ fontSize: 16, color: '#fbbf24' }} />
                              <Typography variant="caption" sx={{ 
                                color: 'var(--color-text-secondary)',
                                fontWeight: 500
                              }}>
                                4.8
                              </Typography>
                              <People sx={{ fontSize: 16, color: 'var(--color-text-secondary)', ml: 1 }} />
                              <Typography variant="caption" sx={{ 
                                color: 'var(--color-text-secondary)',
                                fontWeight: 500
                              }}>
                                {Math.floor(Math.random() * 100) + 50}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Box>
                    </Card>
                  </Fade>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Container>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(3deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </Box>
  );
}