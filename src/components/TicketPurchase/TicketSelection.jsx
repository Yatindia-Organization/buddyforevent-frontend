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
  IconButton,
  Grid,
  Chip,
  Stack,
  ButtonGroup,
  Divider,
  Alert
} from '@mui/material';
import { 
  ArrowBack,
  Add,
  Remove,
  ShoppingCart,
  EventAvailable,
  Schedule,
  LocationOn,
  Person
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useTheme } from '../../contexts/ThemeContext';
import { API_ROUTE } from '../../lib/config';

export default function TicketSelection() {
  const { eventId } = useParams();
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTickets, setSelectedTickets] = useState({});
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalTickets, setTotalTickets] = useState(0);

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  useEffect(() => {
    calculateTotals();
  }, [selectedTickets]);

  const fetchEventDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ROUTE}/api/v1/event/eventid/${eventId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Event not found');
      
      const data = await response.json();
      setEvent(data.data);
    } catch (error) {
      console.error('Error fetching event:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    let amount = 0;
    let tickets = 0;
    
    Object.entries(selectedTickets).forEach(([tierName, quantity]) => {
      const tier = event?.ticket_tiers?.find(t => t.name === tierName);
      if (tier && quantity > 0) {
        amount += tier.price * quantity;
        tickets += quantity;
      }
    });
    
    setTotalAmount(amount);
    setTotalTickets(tickets);
  };

  const updateTicketQuantity = (tierName, change) => {
    const tier = event.ticket_tiers.find(t => t.name === tierName);
    const currentQty = selectedTickets[tierName] || 0;
    const newQty = Math.max(0, Math.min(tier.capacity, currentQty + change));
    
    setSelectedTickets(prev => ({
      ...prev,
      [tierName]: newQty
    }));
  };

  const getEventStatus = (event) => {
    const now = new Date();
    const startDate = new Date(event.start_date);
    const endDate = new Date(event.end_date);
    
    if (now < startDate) return { label: 'Upcoming', color: '#6366f1', bg: '#f0f9ff' };
    if (now >= startDate && now <= endDate) return { label: 'Live Now', color: '#10b981', bg: '#f0fdf4' };
    return { label: 'Ended', color: '#6b7280', bg: '#f9fafb' };
  };

  const canPurchase = () => {
    if (!event) return false;
    const status = getEventStatus(event);
    return status.label !== 'Ended' && totalTickets > 0;
  };

  const handleContinue = () => {
    if (!canPurchase()) return;
    
    // Filter out zero quantities and prepare data
    const ticketData = Object.entries(selectedTickets)
      .filter(([_, quantity]) => quantity > 0)
      .map(([tierName, quantity]) => ({
        tierName,
        quantity
      }));
    
    // Store in session for next step
    sessionStorage.setItem('selectedTickets', JSON.stringify(ticketData));
    navigate(`/event/${eventId}/tickets/forms`);
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: theme === 'dark' 
          ? 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)'
          : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <CircularProgress size={60} sx={{ color: '#6366f1' }} />
      </Box>
    );
  }

  if (error || !event) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: theme === 'dark' 
          ? 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)'
          : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Container maxWidth="md">
          <Card sx={{ p: 6, textAlign: 'center', borderRadius: 4 }}>
            <EventAvailable sx={{ fontSize: 80, color: 'var(--color-text-secondary)', mb: 2 }} />
            <Typography variant="h4" sx={{ mb: 2, fontFamily: 'var(--font-heading)' }}>
              Event Not Found
            </Typography>
            <Button variant="contained" onClick={() => navigate('/events')}>
              Back to Events
            </Button>
          </Card>
        </Container>
      </Box>
    );
  }

  const status = getEventStatus(event);

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: theme === 'dark' 
        ? 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)'
        : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      fontFamily: 'var(--font-base)'
    }}>
      {/* Header */}
      <Box sx={{ 
        background: theme === 'dark'
          ? 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4
      }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
            <IconButton 
              onClick={() => navigate(`/event/${eventId}/details`)}
              sx={{ 
                color: 'white',
                background: 'rgba(255,255,255,0.1)',
                '&:hover': { background: 'rgba(255,255,255,0.2)' }
              }}
            >
              <ArrowBack />
            </IconButton>
            <Box>
              <Typography variant="h4" sx={{ 
                color: 'white', 
                fontFamily: 'var(--font-heading)',
                fontWeight: 700
              }}>
                Select Tickets
              </Typography>
              <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                {event.name}
              </Typography>
            </Box>
          </Box>

          {/* Event Quick Info */}
          <Card sx={{ 
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 3
          }}>
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={8}>
                  <Stack direction="row" spacing={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Schedule sx={{ color: 'white', fontSize: 20 }} />
                      <Box>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                          {format(new Date(event.start_date), 'MMM d, yyyy')}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                          {event.start_time}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOn sx={{ color: 'white', fontSize: 20 }} />
                      <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                        {event.location}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={12} md={4} sx={{ textAlign: 'right' }}>
                  <Chip 
                    label={status.label}
                    sx={{
                      background: status.bg,
                      color: status.color,
                      fontWeight: 600
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={6}>
          {/* Ticket Selection */}
          <Grid item xs={12} md={8}>
            <Typography variant="h5" sx={{ 
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              color: 'var(--color-text)',
              mb: 4
            }}>
              Choose Your Tickets
            </Typography>

            {event.ticket_tiers.length === 0 ? (
              <Alert severity="info" sx={{ borderRadius: 3 }}>
                No ticket tiers available for this event.
              </Alert>
            ) : (
              <Stack spacing={3}>
                {event.ticket_tiers.map((tier) => (
                  <Card key={tier.name} sx={{ 
                    borderRadius: 4,
                    border: '1px solid var(--border-color)',
                    background: 'var(--color-card-bg)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: 'var(--color-primary)',
                      transform: 'translateY(-2px)',
                      boxShadow: 'var(--shadow-lg)'
                    }
                  }}>
                    <CardContent sx={{ p: 4 }}>
                      <Grid container spacing={3} alignItems="center">
                        <Grid item xs={12} md={6}>
                          <Typography variant="h6" sx={{ 
                            fontFamily: 'var(--font-heading)',
                            fontWeight: 700,
                            color: 'var(--color-text)',
                            mb: 1
                          }}>
                            {tier.name}
                          </Typography>
                          {tier.description && (
                            <Typography variant="body2" sx={{ 
                              color: 'var(--color-text-secondary)',
                              mb: 2
                            }}>
                              {tier.description}
                            </Typography>
                          )}
                          <Typography variant="h5" sx={{ 
                            color: 'var(--color-primary)',
                            fontWeight: 700,
                            fontFamily: 'var(--font-heading)'
                          }}>
                            ₹{tier.price.toLocaleString()}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
                            {tier.capacity} tickets available
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={6} sx={{ textAlign: 'right' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2 }}>
                            <ButtonGroup variant="outlined" sx={{ 
                              '& .MuiButton-root': {
                                borderColor: 'var(--color-primary)',
                                color: 'var(--color-primary)'
                              }
                            }}>
                              <IconButton 
                                onClick={() => updateTicketQuantity(tier.name, -1)}
                                disabled={!selectedTickets[tier.name]}
                              >
                                <Remove />
                              </IconButton>
                              <Button sx={{ minWidth: '60px', pointerEvents: 'none' }}>
                                {selectedTickets[tier.name] || 0}
                              </Button>
                              <IconButton 
                                onClick={() => updateTicketQuantity(tier.name, 1)}
                                disabled={tier.capacity === 0 || (selectedTickets[tier.name] || 0) >= tier.capacity}
                              >
                                <Add />
                              </IconButton>
                            </ButtonGroup>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}
          </Grid>

          {/* Order Summary */}
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              borderRadius: 4,
              background: 'var(--color-card-bg)',
              border: '1px solid var(--border-color)',
              position: 'sticky',
              top: 24
            }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ 
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  color: 'var(--color-text)',
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <ShoppingCart sx={{ fontSize: 24 }} />
                  Order Summary
                </Typography>

                <Stack spacing={2} sx={{ mb: 3 }}>
                  {Object.entries(selectedTickets)
                    .filter(([_, quantity]) => quantity > 0)
                    .map(([tierName, quantity]) => {
                      const tier = event.ticket_tiers.find(t => t.name === tierName);
                      return (
                        <Box key={tierName} sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {tierName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>
                              ₹{tier.price} × {quantity}
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            ₹{(tier.price * quantity).toLocaleString()}
                          </Typography>
                        </Box>
                      );
                    })}
                </Stack>

                {totalTickets > 0 && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
                        Total Tickets:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {totalTickets}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Total Amount:
                      </Typography>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 700,
                        color: 'var(--color-primary)'
                      }}>
                        ₹{totalAmount.toLocaleString()}
                      </Typography>
                    </Box>
                  </>
                )}

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={!canPurchase()}
                  onClick={handleContinue}
                  sx={{
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    borderRadius: '50px',
                    background: canPurchase() ? 'var(--gradient-primary)' : 'var(--color-text-secondary)',
                    '&:hover': {
                      background: canPurchase() ? 'var(--gradient-primary)' : 'var(--color-text-secondary)',
                      transform: canPurchase() ? 'translateY(-2px)' : 'none'
                    }
                  }}
                >
                  {totalTickets === 0 ? 'Select Tickets' : 'Continue to Forms'}
                </Button>

                {totalTickets > 0 && (
                  <Typography variant="caption" sx={{ 
                    display: 'block',
                    textAlign: 'center',
                    color: 'var(--color-text-secondary)',
                    mt: 2
                  }}>
                    <Person sx={{ fontSize: 16, mr: 0.5 }} />
                    You'll fill details for each ticket holder next
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}