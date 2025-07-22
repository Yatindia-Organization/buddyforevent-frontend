import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  IconButton,
  Avatar,
  Stack,
  Divider
} from '@mui/material';
import { 
  EventAvailable, 
  LocationOn, 
  Schedule,
  ArrowForward,
  Brightness4,
  Brightness7,
  TrendingUp,
  People,
  Star,
  CalendarMonth
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useTheme } from '../../contexts/ThemeContext';
import { API_ROUTE } from '../../lib/config';

export default function PublicEventsDashboard() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    activeEvents: 0
  });

  useEffect(() => {
    fetchPublicEvents();
  }, []);

  const fetchPublicEvents = async () => {
    try {
      const response = await fetch(`${API_ROUTE}/api/v1/event/public`);
      if (!response.ok) throw new Error('Failed to fetch events');
      
      const data = await response.json();
      const publicEvents = data.data || [];
      
      setEvents(publicEvents.slice(0, 6));
      
      const now = new Date();
      const upcoming = publicEvents.filter(event => new Date(event.start_date) > now);
      const active = publicEvents.filter(event => 
        new Date(event.start_date) <= now && new Date(event.end_date) >= now
      );
      
      setStats({
        totalEvents: publicEvents.length,
        upcomingEvents: upcoming.length,
        activeEvents: active.length
      });
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const getEventStatus = (event) => {
    const now = new Date();
    const startDate = new Date(event.start_date);
    const endDate = new Date(event.end_date);
    
    if (now < startDate) return { label: 'Upcoming', color: '#6366f1', bg: '#f0f9ff' };
    if (now >= startDate && now <= endDate) return { label: 'Live Now', color: '#10b981', bg: '#f0fdf4' };
    return { label: 'Ended', color: '#6b7280', bg: '#f9fafb' };
  };

  if (loading) {
    return (
      <Box 
        sx={{ 
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: theme === 'dark' 
            ? 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)'
            : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} thickness={4} sx={{ color: '#6366f1', mb: 3 }} />
          <Typography variant="h6" sx={{ color: 'var(--color-text)', fontWeight: 500 }}>
            Loading amazing events...
          </Typography>
        </Box>
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
      {/* Premium Header Section */}
      <Box 
        sx={{ 
          position: 'relative',
          background: theme === 'dark'
            ? 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e40af 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #6366f1 100%)',
          overflow: 'hidden',
          py: { xs: 8, md: 12 }
        }}
      >
        {/* Animated Background Elements */}
        <Box
          sx={{
            position: 'absolute',
            top: '-50%',
            right: '-20%',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            animation: 'float 6s ease-in-out infinite'
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '-30%',
            left: '-10%',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
            animation: 'float 8s ease-in-out infinite reverse'
          }}
        />
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          {/* Navigation Bar */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 8 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar 
                sx={{ 
                  width: 48, 
                  height: 48, 
                  background: 'linear-gradient(45deg, #ff6b6b, #feca57)',
                  fontSize: '1.5rem',
                  fontWeight: 'bold'
                }}
              >
                B
              </Avatar>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: 'white', 
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  letterSpacing: '-0.5px'
                }}
              >
                Buddy Events
              </Typography>
            </Box>
            
            <Stack direction="row" spacing={2} alignItems="center">
              <Button
                variant="outlined"
                onClick={() => navigate('/events')}
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.3)',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3,
                  '&:hover': {
                    borderColor: 'white',
                    background: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Browse Events
              </Button>
              <IconButton 
                onClick={toggleTheme}
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
                {theme === 'dark' ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
            </Stack>
          </Box>

          {/* Hero Content */}
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={7}>
              <Box sx={{ animation: 'fadeInUp 0.8s ease-out' }}>
                <Typography 
                  variant="h1" 
                  sx={{ 
                    fontFamily: 'var(--font-heading)',
                    fontSize: { xs: '2.5rem', md: '4rem' },
                    fontWeight: 800,
                    color: 'white',
                    lineHeight: 1.1,
                    mb: 3,
                    letterSpacing: '-0.02em'
                  }}
                >
                  Discover Events That
                  <Box component="span" sx={{ display: 'block', background: 'linear-gradient(45deg, #fbbf24, #f472b6)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Inspire You
                  </Box>
                </Typography>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    color: 'rgba(255,255,255,0.9)',
                    mb: 5,
                    fontWeight: 400,
                    lineHeight: 1.6,
                    maxWidth: '500px'
                  }}
                >
                  Join thousands of people discovering amazing events, workshops, and experiences in your city.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForward />}
                  onClick={() => navigate('/events')}
                  sx={{
                    background: 'linear-gradient(45deg, #fbbf24, #f472b6)',
                    borderRadius: '50px',
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    px: 4,
                    py: 2,
                    boxShadow: '0 10px 30px rgba(244, 114, 182, 0.3)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 15px 40px rgba(244, 114, 182, 0.4)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Explore Events
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box sx={{ position: 'relative', animation: 'fadeInRight 1s ease-out 0.3s both' }}>
                {/* Stats Preview */}
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Card sx={{ 
                      background: 'rgba(255,255,255,0.1)', 
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: 3,
                      p: 3,
                      textAlign: 'center'
                    }}>
                      <TrendingUp sx={{ fontSize: 40, color: '#fbbf24', mb: 1 }} />
                      <Typography variant="h4" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>
                        {stats.totalEvents}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                        Live Events
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={6}>
                    <Card sx={{ 
                      background: 'rgba(255,255,255,0.1)', 
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: 3,
                      p: 3,
                      textAlign: 'center'
                    }}>
                      <People sx={{ fontSize: 40, color: '#10b981', mb: 1 }} />
                      <Typography variant="h4" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>
                        2.5K+
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                        Attendees
                      </Typography>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Featured Events Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography 
            variant="h2" 
            sx={{ 
              fontFamily: 'var(--font-heading)',
              fontSize: { xs: '2rem', md: '3rem' },
              fontWeight: 800,
              color: 'var(--color-text)',
              mb: 2,
              letterSpacing: '-0.02em'
            }}
          >
            Featured Events
          </Typography>
          <Typography 
            variant="h6"
            sx={{ 
              color: 'var(--color-text-secondary)',
              maxWidth: '600px',
              mx: 'auto',
              fontWeight: 400,
              lineHeight: 1.6
            }}
          >
            Hand-picked events that promise unforgettable experiences
          </Typography>
        </Box>

        {events.length === 0 ? (
          <Card sx={{ 
            borderRadius: 4,
            border: `2px dashed var(--border-color)`,
            background: 'transparent',
            p: 8,
            textAlign: 'center'
          }}>
            <CalendarMonth sx={{ 
              fontSize: 80, 
              color: 'var(--color-text-secondary)',
              mb: 3,
              opacity: 0.5
            }} />
            <Typography variant="h5" sx={{ 
              fontFamily: 'var(--font-heading)',
              color: 'var(--color-text)',
              fontWeight: 600,
              mb: 2
            }}>
              No Events Available
            </Typography>
            <Typography variant="body1" sx={{ color: 'var(--color-text-secondary)' }}>
              Stay tuned! Amazing events are coming soon.
            </Typography>
          </Card>
        ) : (
          <Grid container spacing={4}>
            {events.map((event, index) => {
              const status = getEventStatus(event);
              return (
                <Grid item xs={12} md={6} lg={4} key={event._id}>
                  <Card 
                    onClick={() => navigate(`/event/${event._id}/details`)}
                    sx={{ 
                      height: '100%',
                      borderRadius: 4,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: '1px solid var(--border-color)',
                      background: 'var(--color-card-bg)',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                      '&:hover': {
                        transform: 'translateY(-12px) scale(1.02)',
                        boxShadow: theme === 'dark' 
                          ? '0 25px 50px rgba(0,0,0,0.5)'
                          : '0 25px 50px rgba(0,0,0,0.15)',
                        borderColor: '#6366f1'
                      }
                    }}
                  >
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="240"
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
                    
                    <CardContent sx={{ p: 3 }}>
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
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {event.description}
                      </Typography>

                      <Stack spacing={1.5} sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Schedule sx={{ fontSize: 18, color: '#6366f1' }} />
                          <Typography variant="body2" sx={{ 
                            color: 'var(--color-text)',
                            fontWeight: 500
                          }}>
                            {format(new Date(event.start_date), 'MMM d, yyyy')} • {event.start_time}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationOn sx={{ fontSize: 18, color: '#6366f1' }} />
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
                          <Typography variant="caption" sx={{ 
                            color: 'var(--color-text-secondary)',
                            fontWeight: 500
                          }}>
                            by {event.user.company_name}
                          </Typography>
                        )}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Star sx={{ fontSize: 16, color: '#fbbf24' }} />
                          <Typography variant="caption" sx={{ 
                            color: 'var(--color-text-secondary)',
                            fontWeight: 500
                          }}>
                            4.8
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        {events.length > 0 && (
          <Box sx={{ textAlign: 'center', mt: 8 }}>
            <Button
              variant="outlined"
              size="large"
              endIcon={<ArrowForward />}
              onClick={() => navigate('/events')}
              sx={{
                borderColor: '#6366f1',
                color: '#6366f1',
                borderRadius: '50px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                px: 4,
                py: 1.5,
                '&:hover': {
                  background: '#6366f1',
                  color: 'white',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 10px 30px rgba(99, 102, 241, 0.3)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              View All Events
            </Button>
          </Box>
        )}
      </Container>

      {/* Footer */}
      <Box sx={{ 
        background: theme === 'dark' 
          ? 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)'
          : 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
        borderTop: '1px solid var(--border-color)',
        py: 6
      }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Avatar 
              sx={{ 
                width: 56, 
                height: 56, 
                background: 'linear-gradient(45deg, #ff6b6b, #feca57)',
                fontSize: '1.75rem',
                fontWeight: 'bold',
                mx: 'auto',
                mb: 2
              }}
            >
              B
            </Avatar>
            <Typography variant="h6" sx={{ 
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              color: 'var(--color-text)',
              mb: 1
            }}>
              Buddy Events
            </Typography>
            <Typography variant="body2" sx={{ 
              color: 'var(--color-text-secondary)',
              maxWidth: '400px',
              mx: 'auto'
            }}>
              © 2025 Buddy Events. Crafting unforgettable experiences, one event at a time.
            </Typography>
          </Box>
        </Container>
      </Box>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </Box>
  );
}