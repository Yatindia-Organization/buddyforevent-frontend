import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Container,
  CircularProgress,
  Chip,
  IconButton,
  Grid,
  Divider,
  Alert,
  Avatar,
  Stack,
  Fab,
  Breadcrumbs,
  Link,
  Fade,
  Skeleton
} from '@mui/material';
import { 
  ArrowBack,
  LocationOn, 
  Schedule,
  EventAvailable,
  Business,
  Description,
  ArrowForward,
  ArrowBackIos,
  ArrowForwardIos,
  Share,
  Favorite,
  FavoriteBorder,
  People,
  Star,
  CalendarToday,
  AccessTime,
  Language,
  Phone,
  Email,
  NavigateNext,
  PlayArrow
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useTheme } from '../../contexts/ThemeContext';
import { API_ROUTE } from '../../lib/config';

export default function EventDetails() {
  const { eventId } = useParams();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ROUTE}/api/v1/event/public`,
 {
   headers: {
     'Authorization': `Bearer ${token}`
   }
 });
      if (!response.ok) throw new Error('Failed to fetch events');
      
      const data = await response.json();
      const events = data.data || [];
      const eventDetails = events.find(e => e._id === eventId);
      
      if (!eventDetails) {
        throw new Error('Event not found');
      }
      
      setEvent(eventDetails);
    } catch (error) {
      console.error('Error fetching event details:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getEventStatus = (event) => {
    const now = new Date();
    const startDate = new Date(event.start_date);
    const endDate = new Date(event.end_date);
    
    if (now < startDate) return { 
      label: 'Upcoming', 
      color: '#6366f1', 
      bg: '#f0f9ff', 
      value: 'upcoming',
      icon: <CalendarToday sx={{ fontSize: 16 }} />
    };
    if (now >= startDate && now <= endDate) return { 
      label: 'Live Now', 
      color: '#10b981', 
      bg: '#f0fdf4', 
      value: 'active',
      icon: <PlayArrow sx={{ fontSize: 16 }} />
    };
    return { 
      label: 'Ended', 
      color: '#6b7280', 
      bg: '#f9fafb', 
      value: 'ended',
      icon: <EventAvailable sx={{ fontSize: 16 }} />
    };
  };

  const canRegister = (event) => {
    const status = getEventStatus(event);
    return status.value === 'upcoming' || status.value === 'active';
  };

  const nextImage = () => {
    if (event.event_images && event.event_images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === event.event_images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (event.event_images && event.event_images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? event.event_images.length - 1 : prev - 1
      );
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.name,
        text: event.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // You could show a snackbar here
    }
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
          <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2, mb: 4 }} />
          <Grid container spacing={6}>
            <Grid item xs={12} md={8}>
              <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 4, mb: 4 }} />
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3 }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Skeleton variant="rectangular" height={600} sx={{ borderRadius: 4 }} />
            </Grid>
          </Grid>
        </Container>
      </Box>
    );
  }

  if (error || !event) {
    return (
      <Box 
        sx={{ 
          minHeight: '100vh',
          background: theme === 'dark' 
            ? 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)'
            : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Container maxWidth="md">
          <Card sx={{ 
            borderRadius: 4,
            background: 'var(--color-card-bg)', 
            border: '1px solid var(--border-color)',
            p: 6, 
            textAlign: 'center',
            boxShadow: 'var(--shadow-xl)'
          }}>
            <EventAvailable sx={{ 
              fontSize: 100, 
              color: 'var(--color-text-secondary)', 
              mb: 3,
              opacity: 0.6
            }} />
            <Typography variant="h3" sx={{ 
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              color: 'var(--color-text)',
              mb: 2
            }}>
              Event Not Found
            </Typography>
            <Typography variant="body1" sx={{ 
              color: 'var(--color-text-secondary)',
              mb: 4,
              maxWidth: '400px',
              mx: 'auto'
            }}>
              {error || 'The event you\'re looking for doesn\'t exist or has been removed.'}
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/events')}
              sx={{
                background: 'var(--gradient-primary)',
                borderRadius: '50px',
                textTransform: 'none',
                fontWeight: 600,
                px: 4,
                py: 1.5,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 'var(--shadow-xl)'
                }
              }}
            >
              Back to Events
            </Button>
          </Card>
        </Container>
      </Box>
    );
  }

  const status = getEventStatus(event);
  const registrationAllowed = canRegister(event);

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
      {/* Hero Header */}
      <Box 
        sx={{ 
          position: 'relative',
          height: '50vh',
          backgroundImage: `url(${event.cover_image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          display: 'flex',
          alignItems: 'flex-end'
        }}
      >
        {/* Overlay */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.8) 100%)'
        }} />
        
        {/* Navigation */}
        <Box sx={{
          position: 'absolute',
          top: 24,
          left: 24,
          zIndex: 3
        }}>
          <IconButton 
            onClick={() => navigate('/events')}
            sx={{ 
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              '&:hover': {
                background: 'rgba(0,0,0,0.7)',
                transform: 'scale(1.05)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            <ArrowBack />
          </IconButton>
        </Box>

        {/* Action Buttons */}
        <Box sx={{
          position: 'absolute',
          top: 24,
          right: 24,
          zIndex: 3,
          display: 'flex',
          gap: 2
        }}>
          <IconButton 
            onClick={() => setIsFavorited(!isFavorited)}
            sx={{ 
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(10px)',
              color: isFavorited ? '#f472b6' : 'white',
              '&:hover': {
                background: 'rgba(0,0,0,0.7)',
                transform: 'scale(1.05)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            {isFavorited ? <Favorite /> : <FavoriteBorder />}
          </IconButton>
          <IconButton 
            onClick={handleShare}
            sx={{ 
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              '&:hover': {
                background: 'rgba(0,0,0,0.7)',
                transform: 'scale(1.05)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            <Share />
          </IconButton>
        </Box>

        {/* Hero Content */}
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, pb: 8 }}>
          <Fade in timeout={800}>
            <Box>
              {/* Breadcrumbs */}
              <Breadcrumbs 
                separator={<NavigateNext fontSize="small" />}
                sx={{ mb: 3 }}
              >
                <Link 
                  onClick={() => navigate('/events')}
                  sx={{ 
                    color: 'rgba(255,255,255,0.8)',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    '&:hover': { color: 'white' }
                  }}
                >
                  All Events
                </Link>
                <Typography sx={{ color: 'white', fontWeight: 500 }}>
                  Event Details
                </Typography>
              </Breadcrumbs>

              {/* Status and Company */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Chip 
                  icon={status.icon}
                  label={status.label}
                  sx={{
                    background: status.bg,
                    color: status.color,
                    fontWeight: 600,
                    borderRadius: 3,
                    height: 36,
                    fontSize: '0.9rem'
                  }}
                />
                {event.user?.company_name && (
                  <Chip
                    icon={<Business sx={{ fontSize: 16 }} />}
                    label={`by ${event.user.company_name}`}
                    sx={{
                      background: 'rgba(255,255,255,0.1)',
                      color: 'white',
                      borderRadius: 3,
                      height: 36,
                      backdropFilter: 'blur(10px)'
                    }}
                  />
                )}
              </Box>

              {/* Event Title */}
              <Typography 
                variant="h1" 
                sx={{ 
                  fontFamily: 'var(--font-heading)',
                  fontSize: { xs: '2.5rem', md: '4rem' },
                  fontWeight: 800,
                  color: 'white',
                  lineHeight: 1.1,
                  mb: 3,
                  letterSpacing: '-0.02em',
                  textShadow: '0 4px 20px rgba(0,0,0,0.5)'
                }}
              >
                {event.name}
              </Typography>

              {/* Quick Info */}
              <Grid container spacing={4} sx={{ maxWidth: '800px' }}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Schedule sx={{ color: '#fbbf24', fontSize: 24 }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                        Event Date
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                        {format(new Date(event.start_date), 'MMM d, yyyy')}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <AccessTime sx={{ color: '#10b981', fontSize: 24 }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                        Time
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                        {event.start_time} - {event.end_time}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <LocationOn sx={{ color: '#f472b6', fontSize: 24 }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                        Location
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                        {event.location}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Fade>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={6}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            {/* Event Description */}
            <Card 
              sx={{ 
                mb: 4,
                borderRadius: 4,
                background: 'var(--color-card-bg)',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-lg)'
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    color: 'var(--color-text)',
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}
                >
                  <Description sx={{ color: 'var(--color-primary)' }} />
                  About This Event
                </Typography>
                
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: 'var(--color-text)',
                    lineHeight: 1.8,
                    fontSize: '1.1rem',
                    display: showFullDescription ? 'block' : '-webkit-box',
                    WebkitLineClamp: showFullDescription ? 'none' : 4,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {event.description}
                </Typography>
                
                {event.description && event.description.length > 200 && (
                  <Button
                    variant="text"
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    sx={{
                      mt: 2,
                      color: 'var(--color-primary)',
                      textTransform: 'none',
                      fontWeight: 600
                    }}
                  >
                    {showFullDescription ? 'Show Less' : 'Read More'}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Event Gallery */}
            {event.event_images && event.event_images.length > 0 && (
              <Card 
                sx={{ 
                  borderRadius: 4,
                  background: 'var(--color-card-bg)',
                  border: '1px solid var(--border-color)',
                  boxShadow: 'var(--shadow-lg)',
                  overflow: 'hidden'
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ p: 4, pb: 2 }}>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 700,
                        color: 'var(--color-text)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2
                      }}
                    >
                      <EventAvailable sx={{ color: 'var(--color-primary)' }} />
                      Event Gallery
                    </Typography>
                  </Box>
                  
                  <Box sx={{ position: 'relative' }}>
                    <Box
                      component="img"
                      src={event.event_images[currentImageIndex]}
                      alt={`Event image ${currentImageIndex + 1}`}
                      sx={{
                        width: '100%',
                        height: '400px',
                        objectFit: 'cover',
                        display: 'block'
                      }}
                    />
                    
                    {event.event_images.length > 1 && (
                      <>
                        <IconButton
                          onClick={prevImage}
                          sx={{
                            position: 'absolute',
                            top: '50%',
                            left: 16,
                            transform: 'translateY(-50%)',
                            background: 'rgba(0,0,0,0.6)',
                            color: 'white',
                            backdropFilter: 'blur(10px)',
                            '&:hover': {
                              background: 'rgba(0,0,0,0.8)',
                              transform: 'translateY(-50%) scale(1.1)'
                            },
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <ArrowBackIos />
                        </IconButton>
                        <IconButton
                          onClick={nextImage}
                          sx={{
                            position: 'absolute',
                            top: '50%',
                            right: 16,
                            transform: 'translateY(-50%)',
                            background: 'rgba(0,0,0,0.6)',
                            color: 'white',
                            backdropFilter: 'blur(10px)',
                            '&:hover': {
                              background: 'rgba(0,0,0,0.8)',
                              transform: 'translateY(-50%) scale(1.1)'
                            },
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <ArrowForwardIos />
                        </IconButton>
                      </>
                    )}
                    
                    {/* Image Indicators */}
                    <Box sx={{
                      position: 'absolute',
                      bottom: 16,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      display: 'flex',
                      gap: 1
                    }}>
                      {event.event_images.map((_, index) => (
                        <Box
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: index === currentImageIndex ? 'white' : 'rgba(255,255,255,0.5)',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                  
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography 
                      variant="caption" 
                      sx={{ color: 'var(--color-text-secondary)' }}
                    >
                      {currentImageIndex + 1} of {event.event_images.length}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Event Logo & Registration */}
            <Card 
              sx={{ 
                mb: 4,
                borderRadius: 4,
                background: 'var(--color-card-bg)',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-lg)',
                position: 'sticky',
                top: 24
              }}
            >
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                {/* Event Logo */}
                {event.logo_image && (
                  <Avatar
                    src={event.logo_image}
                    alt="Event Logo"
                    sx={{
                      width: 100,
                      height: 100,
                      mx: 'auto',
                      mb: 3,
                      border: '4px solid var(--color-primary)',
                      boxShadow: 'var(--shadow-lg)'
                    }}
                  />
                )}

                {/* Event Stats */}
                <Grid container spacing={2} sx={{ mb: 4 }}>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 700,
                        color: 'var(--color-text)',
                        fontFamily: 'var(--font-heading)'
                      }}>
                        4.8
                      </Typography>
                      <Stack direction="row" justifyContent="center" spacing={0.5} sx={{ mb: 0.5 }}>
                        {[1,2,3,4,5].map((star) => (
                          <Star key={star} sx={{ fontSize: 12, color: '#fbbf24' }} />
                        ))}
                      </Stack>
                      <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>
                        Rating
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 700,
                        color: 'var(--color-text)',
                        fontFamily: 'var(--font-heading)'
                      }}>
                        {Math.floor(Math.random() * 500) + 100}
                      </Typography>
                      <People sx={{ fontSize: 20, color: 'var(--color-primary)', mb: 0.5 }} />
                      <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>
                        Attending
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 700,
                        color: 'var(--color-text)',
                        fontFamily: 'var(--font-heading)'
                      }}>
                        Free
                      </Typography>
                      <EventAvailable sx={{ fontSize: 20, color: 'var(--color-success)', mb: 0.5 }} />
                      <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>
                        Entry
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3, borderColor: 'var(--border-color)' }} />

                {/* Registration Status */}
                {!registrationAllowed && (
                  <Alert 
                    severity="warning" 
                    sx={{ 
                      mb: 3,
                      borderRadius: 2,
                      '& .MuiAlert-message': {
                        fontSize: '0.9rem'
                      }
                    }}
                  >
                    Registration is not available for this event.
                    {status.value === 'ended' ? ' This event has ended.' : ''}
                  </Alert>
                )}

                {/* Registration Button */}
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={!registrationAllowed}
                  endIcon={<ArrowForward />}
                  onClick={() => navigate(`/event/${eventId}/tickets`)}
                  sx={{
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    borderRadius: '50px',
                    textTransform: 'none',
                    background: registrationAllowed ? 'var(--gradient-primary)' : 'var(--color-text-secondary)',
                    boxShadow: registrationAllowed ? 'var(--shadow-lg)' : 'none',
                    '&:hover': {
                      background: registrationAllowed ? 'var(--gradient-primary)' : 'var(--color-text-secondary)',
                      transform: registrationAllowed ? 'translateY(-2px)' : 'none',
                      boxShadow: registrationAllowed ? 'var(--shadow-xl)' : 'none'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {registrationAllowed ? 'Register Now' : 'Registration Closed'}
                </Button>

                {registrationAllowed && (
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'var(--color-text-secondary)',
                      mt: 2,
                      fontSize: '0.9rem'
                    }}
                  >
                    🎉 Free registration • Instant confirmation
                  </Typography>
                )}
              </CardContent>
            </Card>

            {/* Event Details Card */}
            <Card 
              sx={{ 
                borderRadius: 4,
                background: 'var(--color-card-bg)',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-lg)'
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    color: 'var(--color-text)',
                    mb: 3
                  }}
                >
                  Event Information
                </Typography>

                <Stack spacing={3}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Schedule sx={{ color: 'var(--color-primary)', mt: 0.5, fontSize: 24 }} />
                    <Box>
                      <Typography variant="subtitle2" sx={{ 
                        color: 'var(--color-text)',
                        fontWeight: 600,
                        mb: 0.5
                      }}>
                        Date & Time
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
                        {event.location}
                      </Typography>
                    </Box>
                  </Box>

                  {event.user?.company_name && (
                    <>
                      <Divider sx={{ borderColor: 'var(--border-color)' }} />
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <Business sx={{ color: 'var(--color-primary)', mt: 0.5, fontSize: 24 }} />
                        <Box>
                          <Typography variant="subtitle2" sx={{ 
                            color: 'var(--color-text)',
                            fontWeight: 600,
                            mb: 0.5
                          }}>
                            Organized by
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
                            {event.user.company_name}
                          </Typography>
                        </Box>
                      </Box>
                    </>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Floating Action Button for Registration */}
      {registrationAllowed && (
        <Fab
          variant="extended"
          onClick={() => navigate(`/event/${eventId}/tickets`)}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            background: 'var(--gradient-primary)',
            color: 'white',
            fontWeight: 700,
            fontSize: '1rem',
            px: 3,
            py: 1.5,
            borderRadius: '50px',
            boxShadow: 'var(--shadow-xl)',
            '&:hover': {
              background: 'var(--gradient-primary)',
              transform: 'scale(1.05)',
              boxShadow: 'var(--shadow-2xl)'
            },
            transition: 'all 0.3s ease',
            zIndex: 1000
          }}
        >
          <ArrowForward sx={{ mr: 1 }} />
          Register Now
        </Fab>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </Box>
  );
}
 