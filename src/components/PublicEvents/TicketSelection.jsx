import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Container,
  CircularProgress,
  Grid,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Avatar,
  Stack,
  Divider,
  Chip,
  Alert,
  Paper,
  Fade,
  Breadcrumbs,
  Link,
  Snackbar
} from '@mui/material';
import { 
  ArrowBack,
  Add,
  Remove,
  Schedule,
  LocationOn,
  ArrowForward,
  Person,
  LocalOffer,
  Star,
  CheckCircle,
  NavigateNext,
  Groups,
  Security,
  ConfirmationNumber,
  Warning
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useTheme } from '../../contexts/ThemeContext';
import { API_ROUTE } from '../../lib/config';

export default function TicketSelection() {
  const { eventId } = useParams();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [event, setEvent] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ticketQuantities, setTicketQuantities] = useState({});
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalTickets, setTotalTickets] = useState(0);
  const [submissionData, setSubmissionData] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // Get submission data from navigation state
  useEffect(() => {
    if (location.state) {
      setSubmissionData(location.state);
    } else {
      setSnackbar({
        open: true,
        message: 'Please complete registration first',
        severity: 'warning'
      });
      setTimeout(() => {
        navigate(`/event/${eventId}/register`);
      }, 2000);
    }
  }, [location.state, navigate, eventId]);

  useEffect(() => {
    fetchEventAndTickets();
  }, [eventId]);

  useEffect(() => {
    calculateTotals();
  }, [ticketQuantities, tickets]);

  const fetchEventAndTickets = async () => {
    try {
      // FIXED: Use correct endpoint for single event
      const eventResponse = await fetch(`${API_ROUTE}/api/v1/event/eventid/${eventId}`);
      if (!eventResponse.ok) throw new Error('Failed to fetch event');
      
      const eventData = await eventResponse.json();
      setEvent(eventData.data); // FIXED: Direct access to data
      
      const availableTickets = eventData.data.ticket_tiers || [];
      setTickets(availableTickets);
      
      const initialQuantities = {};
      availableTickets.forEach(ticket => {
        initialQuantities[ticket.name] = 0;
      });
      setTicketQuantities(initialQuantities);

    } catch (error) {
      console.error('Error fetching data:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load ticket information',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    let total = 0;
    let count = 0;
    
    Object.entries(ticketQuantities).forEach(([tierName, quantity]) => {
      const ticket = tickets.find(t => t.name === tierName);
      if (ticket && quantity > 0) {
        total += ticket.price * quantity;
        count += quantity;
      }
    });
    
    setTotalAmount(total);
    setTotalTickets(count);
  };

  const handleQuantityChange = (tierName, change) => {
    setTicketQuantities(prev => {
      const ticket = tickets.find(t => t.name === tierName);
      const currentQuantity = prev[tierName] || 0;
      // FIXED: Use correct capacity field
      const maxCapacity = ticket?.totalCapacity || ticket?.capacity || ticket?.availableCapacity || 10;
      const newQuantity = Math.max(0, Math.min(currentQuantity + change, maxCapacity));
      
      return {
        ...prev,
        [tierName]: newQuantity
      };
    });
  };

  const handleProceedToPayment = async () => {
    if (totalTickets === 0) {
      setSnackbar({
        open: true,
        message: 'Please select at least one ticket',
        severity: 'warning'
      });
      return;
    }

    if (!submissionData?.submissionId) {
      setSnackbar({
        open: true,
        message: 'Registration data missing. Please start over.',
        severity: 'error'
      });
      setTimeout(() => {
        navigate(`/event/${eventId}/register`);
      }, 2000);
      return;
    }

    setSubmitting(true);

    try {
      const selectedTickets = Object.entries(ticketQuantities)
        .filter(([_, quantity]) => quantity > 0)
        .map(([tierName, quantity]) => {
          const ticket = tickets.find(t => t.name === tierName);
          return {
            tierName,
            quantity,
            price: ticket.price,
            totalPrice: ticket.price * quantity
          };
        });

      // Get participant info from submission data or form
      const participantName = submissionData.participantName || 'Guest';
      
      // Extract contact info - you might need to adjust this based on your form structure
      const customerEmail = submissionData.email || 'guest@example.com';
      const customerPhone = submissionData.phone || '0000000000';

      let paymentResponse;

      if (totalTickets === 1) {
        // Single ticket payment
        const selectedTicket = selectedTickets[0];
        
        const paymentData = {
          eventId,
          userSubmissionId: submissionData.submissionId,
          tierName: selectedTicket.tierName,
          amount: selectedTicket.totalPrice,
          customerEmail,
          customerPhone,
          customerName: participantName,
          paymentMethod: 'cash', // You can make this dynamic
          notes: `Single ticket purchase for ${selectedTicket.tierName}`
        };

        paymentResponse = await fetch(`${API_ROUTE}/api/v1/payments/single`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(paymentData)
        });

      } else {
        // Multiple tickets - use bulk payment
        // For bulk, we need to create attendee objects
        const attendees = [];
        
        selectedTickets.forEach(ticketGroup => {
          for (let i = 0; i < ticketGroup.quantity; i++) {
            attendees.push({
              name: `${participantName} - Ticket ${attendees.length + 1}`,
              responses: submissionData.responses || [], // Use original form responses
              seat: null // You can implement seat assignment logic here
            });
          }
        });

        const bulkPaymentData = {
          eventId,
          formId: submissionData.formId || eventId, // Use formId if available
          tierName: selectedTickets[0].tierName, // For bulk, assuming same tier
          attendees,
          customerEmail,
          customerPhone,
          customerName: participantName,
          paymentMethod: 'cash',
          notes: `Bulk purchase for ${totalTickets} tickets`
        };

        paymentResponse = await fetch(`${API_ROUTE}/api/v1/payments/bulk`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bulkPaymentData)
        });
      }

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json();
        throw new Error(errorData.error || 'Payment failed');
      }

      const result = await paymentResponse.json();
      
      setSnackbar({
        open: true,
        message: 'Payment successful! Redirecting to confirmation...',
        severity: 'success'
      });

      // Navigate to confirmation page with payment details
      setTimeout(() => {
        navigate(`/event/${eventId}/confirmation`, {
          state: {
            paymentId: result.payment.orderId,
            tickets: result.tickets || [result.ticket],
            totalAmount,
            totalTickets,
            customerName: participantName,
            eventDetails: {
              name: event.name,
              date: event.start_date,
              time: event.start_time,
              location: event.location
            }
          }
        });
      }, 2000);

    } catch (error) {
      console.error('Payment error:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Payment processing failed',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading) {
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
        <Card sx={{ 
          p: 6, 
          borderRadius: 4,
          textAlign: 'center',
          background: 'var(--color-card-bg)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-xl)'
        }}>
          <CircularProgress size={60} thickness={4} sx={{ color: 'var(--color-primary)', mb: 3 }} />
          <Typography variant="h6" sx={{ 
            fontFamily: 'var(--font-heading)',
            fontWeight: 600,
            color: 'var(--color-text)',
            mb: 1
          }}>
            Loading Ticket Options
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
            Please wait while we fetch available tickets...
          </Typography>
        </Card>
      </Box>
    );
  }

  if (!event) {
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
            p: 6, 
            borderRadius: 4,
            textAlign: 'center',
            background: 'var(--color-card-bg)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-xl)'
          }}>
            <ConfirmationNumber sx={{ 
              fontSize: 100, 
              color: 'var(--color-text-secondary)', 
              mb: 3,
              opacity: 0.6
            }} />
            <Typography variant="h4" sx={{ 
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              color: 'var(--color-text)',
              mb: 2
            }}>
              Event Not Found
            </Typography>
            <Typography variant="body1" sx={{ 
              color: 'var(--color-text-secondary)',
              mb: 4
            }}>
              We couldn't find the event you're trying to purchase tickets for.
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
                py: 1.5
              }}
            >
              Back to Events
            </Button>
          </Card>
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
      {/* Header */}
      <Box 
        sx={{ 
          background: theme === 'dark'
            ? 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          py: 4,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '-30%',
            right: '-10%',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            animation: 'float 6s ease-in-out infinite'
          }}
        />
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
            <IconButton 
              onClick={() => navigate(`/event/${eventId}/register`)}
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
                  fontSize: { xs: '1.8rem', md: '2.5rem' },
                  fontWeight: 800,
                  color: 'white',
                  letterSpacing: '-0.02em',
                  mb: 0.5
                }}
              >
                Select Tickets
              </Typography>
              <Typography 
                variant="h6"
                sx={{ 
                  color: 'rgba(255,255,255,0.9)',
                  fontWeight: 400
                }}
              >
                {event.name}
              </Typography>
            </Box>
          </Box>

          {/* Breadcrumbs */}
          <Breadcrumbs 
            separator={<NavigateNext fontSize="small" />}
            sx={{ mb: 2 }}
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
            <Link 
              onClick={() => navigate(`/event/${eventId}/details`)}
              sx={{ 
                color: 'rgba(255,255,255,0.8)',
                cursor: 'pointer',
                textDecoration: 'none',
                '&:hover': { color: 'white' }
              }}
            >
              Event Details
            </Link>
            <Typography sx={{ color: 'white', fontWeight: 500 }}>
              Ticket Selection
            </Typography>
          </Breadcrumbs>

          {/* Quick Event Info */}
          <Grid container spacing={3} sx={{ maxWidth: '600px' }}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Schedule sx={{ color: '#fbbf24', fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  {format(new Date(event.start_date), 'MMM d, yyyy')} at {event.start_time}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn sx={{ color: '#10b981', fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  {event.location}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Progress Stepper */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Card sx={{ 
          borderRadius: 3,
          background: 'var(--color-card-bg)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-md)',
          mb: 4
        }}>
          <CardContent sx={{ p: 4 }}>
            <Stepper activeStep={1} sx={{ mb: 2 }}>
              <Step completed>
                <StepLabel>Registration</StepLabel>
              </Step>
              <Step>
                <StepLabel 
                  StepIconComponent={() => (
                    <Avatar sx={{ 
                      background: 'var(--gradient-primary)',
                      width: 32,
                      height: 32,
                      fontSize: '0.9rem'
                    }}>
                      2
                    </Avatar>
                  )}
                >
                  <Typography sx={{ fontWeight: 600, color: 'var(--color-text)' }}>
                    Ticket Selection
                  </Typography>
                </StepLabel>
              </Step>
              <Step>
                <StepLabel>Payment</StepLabel>
              </Step>
              <Step>
                <StepLabel>Confirmation</StepLabel>
              </Step>
            </Stepper>
            
            {submissionData?.participantName && (
              <Alert 
                icon={<CheckCircle />}
                severity="success" 
                sx={{ 
                  borderRadius: 2,
                  '& .MuiAlert-message': {
                    fontSize: '0.95rem'
                  }
                }}
              >
                Welcome <strong>{submissionData.participantName}</strong>! Your registration is complete. Now select your tickets.
              </Alert>
            )}
          </CardContent>
        </Card>
      </Container>

      <Container maxWidth="lg" sx={{ pb: 8 }}>
        <Grid container spacing={6}>
          {/* Ticket Options */}
          <Grid item xs={12} md={8}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                color: 'var(--color-text)',
                mb: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              <LocalOffer sx={{ color: 'var(--color-primary)', fontSize: 36 }} />
              Available Tickets
            </Typography>

            {tickets.length === 0 ? (
              <Card sx={{ 
                borderRadius: 4,
                border: `2px dashed var(--border-color)`,
                background: 'transparent',
                p: 6,
                textAlign: 'center'
              }}>
                <ConfirmationNumber sx={{ 
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
                  No Tickets Available
                </Typography>
                <Typography variant="body1" sx={{ color: 'var(--color-text-secondary)' }}>
                  This event doesn't have any ticket tiers configured yet.
                </Typography>
              </Card>
            ) : (
              <Stack spacing={3}>
                {tickets.map((ticket, index) => (
                  <Fade in timeout={600 + index * 100} key={ticket.name}>
                    <Card 
                      sx={{ 
                        borderRadius: 4,
                        background: 'var(--color-card-bg)',
                        border: '1px solid var(--border-color)',
                        boxShadow: 'var(--shadow-lg)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 'var(--shadow-xl)',
                          borderColor: 'var(--color-primary)'
                        }
                      }}
                    >
                      <CardContent sx={{ p: 4 }}>
                        <Grid container spacing={3} alignItems="center">
                          <Grid item xs={12} md={6}>
                            <Box>
                              <Typography 
                                variant="h5" 
                                sx={{ 
                                  fontFamily: 'var(--font-heading)',
                                  fontWeight: 700,
                                  color: 'var(--color-text)',
                                  mb: 1
                                }}
                              >
                                {ticket.name}
                              </Typography>
                              
                              {ticket.description && (
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    color: 'var(--color-text-secondary)',
                                    mb: 2,
                                    lineHeight: 1.6
                                  }}
                                >
                                  {ticket.description}
                                </Typography>
                              )}

                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                <Typography 
                                  variant="h4" 
                                  sx={{ 
                                    fontFamily: 'var(--font-heading)',
                                    fontWeight: 800,
                                    color: 'var(--color-primary)'
                                  }}
                                >
                                  ₹{ticket.price}
                                </Typography>
                                {ticket.price === 0 && (
                                  <Chip 
                                    label="FREE" 
                                    sx={{ 
                                      background: 'var(--color-success)',
                                      color: 'white',
                                      fontWeight: 600
                                    }}
                                  />
                                )}
                              </Box>

                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Groups sx={{ fontSize: 20, color: 'var(--color-text-secondary)' }} />
                                <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
                                  {ticket.totalCapacity || ticket.capacity || ticket.availableCapacity} tickets available
                                </Typography>
                              </Box>

                              {ticket.perks && ticket.perks.length > 0 && (
                                <Box sx={{ mt: 2 }}>
                                  <Typography variant="subtitle2" sx={{ 
                                    color: 'var(--color-text)',
                                    fontWeight: 600,
                                    mb: 1
                                  }}>
                                    Includes:
                                  </Typography>
                                  <Stack spacing={0.5}>
                                    {ticket.perks.slice(0, 3).map((perk, i) => (
                                      <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Star sx={{ fontSize: 16, color: '#fbbf24' }} />
                                        <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
                                          {perk}
                                        </Typography>
                                      </Box>
                                    ))}
                                  </Stack>
                                </Box>
                              )}
                            </Box>
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                            <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                              <Typography 
                                variant="h6" 
                                sx={{ 
                                  fontFamily: 'var(--font-heading)',
                                  fontWeight: 600,
                                  color: 'var(--color-text)',
                                  mb: 2
                                }}
                              >
                                Quantity
                              </Typography>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                                <IconButton
                                  onClick={() => handleQuantityChange(ticket.name, -1)}
                                  disabled={!ticketQuantities[ticket.name] || ticketQuantities[ticket.name] === 0}
                                  sx={{
                                    background: 'var(--color-primary)',
                                    color: 'white',
                                    width: 40,
                                    height: 40,
                                    '&:hover': {
                                      background: 'var(--color-primary-hover)',
                                      transform: 'scale(1.1)'
                                    },
                                    '&:disabled': {
                                      background: 'var(--color-text-secondary)',
                                      color: 'white'
                                    },
                                    transition: 'all 0.2s ease'
                                  }}
                                >
                                  <Remove />
                                </IconButton>
                                
                                <Paper 
                                  sx={{ 
                                    px: 3, 
                                    py: 1, 
                                    minWidth: '60px',
                                    textAlign: 'center',
                                    background: 'var(--color-bg)',
                                    border: '2px solid var(--border-color)'
                                  }}
                                >
                                  <Typography 
                                    variant="h5" 
                                    sx={{ 
                                      fontFamily: 'var(--font-heading)',
                                      fontWeight: 700,
                                      color: 'var(--color-text)'
                                    }}
                                  >
                                    {ticketQuantities[ticket.name] || 0}
                                  </Typography>
                                </Paper>
                                
                                <IconButton
                                  onClick={() => handleQuantityChange(ticket.name, 1)}
                                  disabled={ticketQuantities[ticket.name] >= (ticket.totalCapacity || ticket.capacity || ticket.availableCapacity)}
                                  sx={{
                                    background: 'var(--color-primary)',
                                    color: 'white',
                                    width: 40,
                                    height: 40,
                                    '&:hover': {
                                      background: 'var(--color-primary-hover)',
                                      transform: 'scale(1.1)'
                                    },
                                    '&:disabled': {
                                      background: 'var(--color-text-secondary)',
                                      color: 'white'
                                    },
                                    transition: 'all 0.2s ease'
                                  }}
                                >
                                  <Add />
                                </IconButton>
                              </Box>

                              {ticketQuantities[ticket.name] > 0 && (
                                <Fade in>
                                  <Typography 
                                    variant="h6" 
                                    sx={{ 
                                      fontFamily: 'var(--font-heading)',
                                      fontWeight: 700,
                                      color: 'var(--color-primary)',
                                      mt: 2
                                    }}
                                  >
                                    Subtotal: ₹{(ticket.price * ticketQuantities[ticket.name]).toLocaleString()}
                                  </Typography>
                                </Fade>
                              )}
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Fade>
                ))}
              </Stack>
            )}
          </Grid>

          {/* Order Summary */}
          <Grid item xs={12} md={4}>
            <Card 
              sx={{ 
                borderRadius: 4,
                background: 'var(--color-card-bg)',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-lg)',
                position: 'sticky',
                top: 24
              }}
            >
              <Box sx={{ 
                background: 'var(--gradient-primary)',
                p: 3,
                textAlign: 'center'
              }}>
                {/* <Confirmation sx={{ fontSize: 48, color: 'white', mb: 2 }} /> */}
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    color: 'white'
                  }}
                >
                  Order Summary
                </Typography>
              </Box>

              <CardContent sx={{ p: 4 }}>
                {totalTickets === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Person sx={{ 
                      fontSize: 60, 
                      color: 'var(--color-text-secondary)',
                      mb: 2,
                      opacity: 0.6
                    }} />
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontFamily: 'var(--font-heading)',
                        color: 'var(--color-text)',
                        fontWeight: 600,
                        mb: 1
                      }}
                    >
                      No Tickets Selected
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
                      Please select tickets from the options above
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <Stack spacing={2} sx={{ mb: 3 }}>
                      {Object.entries(ticketQuantities)
                        .filter(([_, quantity]) => quantity > 0)
                        .map(([tierName, quantity]) => {
                          const ticket = tickets.find(t => t.name === tierName);
                          return (
                            <Box key={tierName} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box>
                                <Typography 
                                  variant="body1" 
                                  sx={{ 
                                    color: 'var(--color-text)',
                                    fontWeight: 600
                                  }}
                                >
                                  {tierName}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
                                  {quantity} × ₹{ticket.price}
                                </Typography>
                              </Box>
                              <Typography 
                                variant="h6" 
                                sx={{ 
                                  fontFamily: 'var(--font-heading)',
                                  fontWeight: 700,
                                  color: 'var(--color-text)'
                                }}
                              >
                                ₹{(ticket.price * quantity).toLocaleString()}
                              </Typography>
                            </Box>
                          );
                        })
                      }
                    </Stack>

                    <Divider sx={{ my: 3, borderColor: 'var(--border-color)' }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontFamily: 'var(--font-heading)',
                          fontWeight: 600,
                          color: 'var(--color-text)'
                        }}
                      >
                        Total Tickets:
                      </Typography>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontFamily: 'var(--font-heading)',
                          fontWeight: 700,
                          color: 'var(--color-primary)'
                        }}
                      >
                        {totalTickets}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          fontFamily: 'var(--font-heading)',
                          fontWeight: 700,
                          color: 'var(--color-text)'
                        }}
                      >
                        Total Amount:
                      </Typography>
                      <Typography 
                        variant="h4" 
                        sx={{ 
                          fontFamily: 'var(--font-heading)',
                          fontWeight: 800,
                          color: 'var(--color-primary)'
                        }}
                      >
                        ₹{totalAmount.toLocaleString()}
                      </Typography>
                    </Box>

                    <Button
                      variant="contained"
                      size="large"
                      fullWidth
                      endIcon={submitting ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <ArrowForward />}
                      onClick={handleProceedToPayment}
                      disabled={submitting || totalTickets === 0}
                      sx={{
                        py: 2,
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        borderRadius: '50px',
                        textTransform: 'none',
                        background: totalTickets > 0 ? 'var(--gradient-primary)' : 'var(--color-text-secondary)',
                        boxShadow: totalTickets > 0 ? 'var(--shadow-lg)' : 'none',
                        '&:hover': {
                          background: totalTickets > 0 ? 'var(--gradient-primary)' : 'var(--color-text-secondary)',
                          transform: totalTickets > 0 ? 'translateY(-2px)' : 'none',
                          boxShadow: totalTickets > 0 ? 'var(--shadow-xl)' : 'none'
                        },
                        '&:disabled': {
                          background: 'var(--color-text-secondary)',
                          color: 'white'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {submitting ? 'Processing Payment...' : 'Proceed to Payment'}
                    </Button>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 2 }}>
                      <Security sx={{ fontSize: 16, color: 'var(--color-success)' }} />
                      <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>
                        Secure checkout powered by Buddy Events
                      </Typography>
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Event Info Card */}
            <Card 
              sx={{ 
                mt: 4,
                borderRadius: 3,
                background: 'var(--surface-1)',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 600,
                    color: 'var(--color-text)',
                    mb: 2
                  }}
                >
                  Event Details
                </Typography>

                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Schedule sx={{ color: 'var(--color-primary)', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
                        Date & Time
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'var(--color-text)', fontWeight: 500 }}>
                        {format(new Date(event.start_date), 'MMM d, yyyy')} at {event.start_time}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <LocationOn sx={{ color: 'var(--color-primary)', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
                        Location
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'var(--color-text)', fontWeight: 500 }}>
                        {event.location}
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ 
            width: '100%',
            borderRadius: 2,
            fontWeight: 500
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Global Styles for Animations */}
      <Box
        sx={{
          '@keyframes float': {
            '0%, 100%': { 
              transform: 'translateY(0px) rotate(0deg)' 
            },
            '50%': { 
              transform: 'translateY(-15px) rotate(2deg)' 
            }
          }
        }}
      />
    </Box>
  );
}