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
  Grid,
  Chip,
  Stack,
  Divider,
  IconButton,
  Alert,
  Pagination,
  Avatar,
  Paper
} from '@mui/material';
import { 
  CheckCircle,
  Download,
  Share,
  Home,
  Person,
  EventSeat,
  GetApp,
  ArrowBack,
  ArrowForward,
  QrCode,
  CalendarToday,
  LocationOn,
  Receipt,
  Email,
  Phone
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useTheme } from '../../contexts/ThemeContext';
import { API_ROUTE } from '../../lib/config';

export default function TicketSuccess() {
  const { eventId, orderId } = useParams();
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [currentTicketIndex, setCurrentTicketIndex] = useState(0);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`${API_ROUTE}/api/v1/ticket-orders/${orderId}`);
      if (!response.ok) throw new Error('Order not found');
      
      const data = await response.json();
      console.log('Order data:', data.data);
      setOrder(data.data);
      
      // Extract tickets directly from ALREADY POPULATED submissionIds
      if (data.data.orderStatus === 'completed' && data.data.submissionIds) {
        const tickets = data.data.submissionIds.map((submission, index) => {
          const tierName = findTierForParticipant(submission.participant, data.data.ticketDetails);
          
          return {
            _id: submission._id,
            participant: submission.participant,
            tierName: tierName,
            seat: submission.seat,
            qrcodeUrl: submission.qrcodeUrl,
            qrcode: submission.qrcode
          };
        });
        
        console.log('Processed tickets:', tickets);
        setTickets(tickets);
      }
      
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const findTierForParticipant = (participantName, ticketDetails) => {
    for (const tierGroup of ticketDetails) {
      const foundForm = tierGroup.participantForms.find(form => 
        form.participantName === participantName
      );
      if (foundForm) {
        return tierGroup.tierName;
      }
    }
    return 'General';
  };

  const downloadTicket = async (ticketUrl, filename) => {
    try {
      const response = await fetch(ticketUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const downloadAllTickets = async () => {
    setDownloading(true);
    try {
      for (let i = 0; i < tickets.length; i++) {
        const ticket = tickets[i];
        if (ticket.qrcodeUrl) {
          await downloadTicket(
            ticket.qrcodeUrl, 
            `ticket_${ticket.participant?.replace(/\s+/g, '_') || `guest_${i+1}`}.png`
          );
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    } catch (error) {
      console.error('Bulk download failed:', error);
    } finally {
      setDownloading(false);
    }
  };

  const shareOrder = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Event Tickets',
        text: `I just got tickets for ${order?.eventId?.name}!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const currentTicket = tickets[currentTicketIndex];

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

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: theme === 'dark' 
        ? 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)'
        : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      fontFamily: 'var(--font-base)'
    }}>
      {/* Success Header */}
      <Box sx={{ 
        background: theme === 'dark'
          ? 'linear-gradient(135deg, #065f46 0%, #10b981 100%)'
          : 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
        py: 6,
        textAlign: 'center'
      }}>
        <Container maxWidth="xl">
          <Box sx={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            animation: 'fadeInUp 0.8s ease-out'
          }}>
            <CheckCircle sx={{ 
              fontSize: 100, 
              color: 'white',
              mb: 3,
              filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))'
            }} />
            <Typography variant="h2" sx={{ 
              color: 'white', 
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              mb: 2,
              fontSize: { xs: '2rem', md: '3rem' }
            }}>
              🎉 Payment Successful!
            </Typography>
            <Typography variant="h5" sx={{ 
              color: 'rgba(255,255,255,0.9)',
              mb: 4,
              maxWidth: '600px'
            }}>
              Your beautiful event tickets are ready for download
            </Typography>
            
            {/* Quick stats */}
            <Grid container spacing={4} sx={{ maxWidth: '600px' }}>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ 
                    color: 'white',
                    fontWeight: 800,
                    fontFamily: 'var(--font-heading)'
                  }}>
                    {tickets.length}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                    Tickets
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ 
                    color: 'white',
                    fontWeight: 800,
                    fontFamily: 'var(--font-heading)'
                  }}>
                    ₹{order?.totalAmount?.toLocaleString()}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                    Total Paid
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <CheckCircle sx={{ 
                    fontSize: '3.5rem',
                    color: 'white',
                    mb: 1
                  }} />
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                    Confirmed
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 6 }}>
        <Grid container spacing={6}>
          {/* Left Side - Full Size Ticket Display */}
          <Grid item xs={12} lg={8}>
            {currentTicket && (
              <Card sx={{ 
                borderRadius: 6,
                border: '1px solid var(--border-color)',
                background: 'var(--color-card-bg)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-xl)'
              }}>
                <CardContent sx={{ p: 0 }}>
                  {/* Ticket Navigation Header */}
                  <Box sx={{ 
                    p: 4, 
                    background: 'var(--color-bg-subtle)',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center' 
                  }}>
                    <IconButton 
                      onClick={() => setCurrentTicketIndex(Math.max(0, currentTicketIndex - 1))}
                      disabled={currentTicketIndex === 0}
                      sx={{ 
                        background: 'var(--color-card-bg)',
                        '&:hover': { background: 'var(--color-primary)', color: 'white' }
                      }}
                    >
                      <ArrowBack />
                    </IconButton>
                    
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" sx={{ 
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 700,
                        mb: 1
                      }}>
                        {currentTicket.participant || `Guest ${currentTicketIndex + 1}`}
                      </Typography>
                      <Chip 
                        label={`Ticket ${currentTicketIndex + 1} of ${tickets.length}`}
                        sx={{ 
                          background: 'var(--color-primary)',
                          color: 'white',
                          fontWeight: 600
                        }}
                      />
                    </Box>
                    
                    <IconButton 
                      onClick={() => setCurrentTicketIndex(Math.min(tickets.length - 1, currentTicketIndex + 1))}
                      disabled={currentTicketIndex === tickets.length - 1}
                      sx={{ 
                        background: 'var(--color-card-bg)',
                        '&:hover': { background: 'var(--color-primary)', color: 'white' }
                      }}
                    >
                      <ArrowForward />
                    </IconButton>
                  </Box>

                  {/* Full Size Ticket Image */}
                  <Box sx={{ 
                    p: 4,
                    display: 'flex',
                    justifyContent: 'center',
                    background: 'linear-gradient(45deg, #f8fafc, #e2e8f0)'
                  }}>
                    {currentTicket.qrcodeUrl ? (
                      <Box
                        component="img"
                        src={currentTicket.qrcodeUrl}
                        alt={`Ticket for ${currentTicket.participant}`}
                        sx={{
                          maxWidth: '100%',
                          maxHeight: '800px',
                          borderRadius: 4,
                          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                          border: '1px solid rgba(255,255,255,0.8)',
                          objectFit: 'contain'
                        }}
                      />
                    ) : (
                      <Box sx={{
                        width: '400px',
                        height: '600px',
                        background: 'var(--gradient-primary)',
                        borderRadius: 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        flexDirection: 'column',
                        gap: 3
                      }}>
                        <QrCode sx={{ fontSize: 100 }} />
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                          Apple Ticket
                        </Typography>
                        <Typography variant="h6">
                          #{currentTicketIndex + 1}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Ticket Info Footer */}
                  <Box sx={{ 
                    p: 4, 
                    background: 'var(--color-card-bg)',
                    borderTop: '1px solid var(--border-color)'
                  }}>
                    <Grid container spacing={3} alignItems="center">
                      <Grid item xs={12} md={6}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar sx={{ 
                            width: 48, 
                            height: 48,
                            background: 'var(--color-primary)',
                            fontSize: '1.2rem',
                            fontWeight: 700
                          }}>
                            {currentTicket.participant?.charAt(0)?.toUpperCase() || 'G'}
                          </Avatar>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                              {currentTicket.participant || `Guest ${currentTicketIndex + 1}`}
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Chip 
                                label={currentTicket.tierName}
                                size="small"
                                sx={{ 
                                  background: 'var(--color-success)',
                                  color: 'white',
                                  fontWeight: 600
                                }}
                              />
                              {currentTicket.seat && (
                                <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
                                  Seat: {currentTicket.seat}
                                </Typography>
                              )}
                            </Stack>
                          </Box>
                        </Stack>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Stack spacing={2}>
                          <Typography variant="body2" sx={{ 
                            color: 'var(--color-text-secondary)',
                            fontFamily: 'monospace',
                            fontSize: '0.9rem',
                            textAlign: { xs: 'left', md: 'right' }
                          }}>
                            Ticket ID: {currentTicket.qrcode}
                          </Typography>
                          
                          <Stack direction="row" spacing={2} sx={{ justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                            <Button
                              variant="contained"
                              startIcon={<Download />}
                              onClick={() => currentTicket.qrcodeUrl && downloadTicket(
                                currentTicket.qrcodeUrl, 
                                `ticket_${currentTicket.participant?.replace(/\s+/g, '_') || `guest_${currentTicketIndex + 1}`}.png`
                              )}
                              disabled={!currentTicket.qrcodeUrl}
                              sx={{
                                borderRadius: '50px',
                                background: 'var(--gradient-primary)',
                                px: 3,
                                fontWeight: 600,
                                '&:hover': {
                                  transform: 'translateY(-2px)',
                                  boxShadow: 'var(--shadow-lg)'
                                }
                              }}
                            >
                              Download
                            </Button>
                            
                            <Button
                              variant="outlined"
                              startIcon={<Share />}
                              onClick={shareOrder}
                              sx={{
                                borderRadius: '50px',
                                borderColor: 'var(--color-primary)',
                                color: 'var(--color-primary)',
                                px: 3,
                                fontWeight: 600
                              }}
                            >
                              Share
                            </Button>
                          </Stack>
                        </Stack>
                      </Grid>
                    </Grid>

                    {/* Pagination */}
                    {tickets.length > 1 && (
                      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                        <Pagination 
                          count={tickets.length}
                          page={currentTicketIndex + 1}
                          onChange={(e, page) => setCurrentTicketIndex(page - 1)}
                          color="primary"
                          size="large"
                          sx={{
                            '& .MuiPaginationItem-root': {
                              fontSize: '1rem',
                              fontWeight: 600
                            }
                          }}
                        />
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            )}
          </Grid>

          {/* Right Side - Order Summary & Actions */}
          <Grid item xs={12} lg={4}>
            <Stack spacing={4}>
              {/* Quick Actions Card */}
              <Card sx={{ 
                borderRadius: 4,
                background: 'var(--color-card-bg)',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-lg)'
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" sx={{ 
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    color: 'var(--color-text)',
                    mb: 3
                  }}>
                    Quick Actions
                  </Typography>

                  <Stack spacing={3}>
                    <Button
                      variant="contained"
                      fullWidth
                      size="large"
                      startIcon={downloading ? <CircularProgress size={20} color="inherit" /> : <GetApp />}
                      onClick={downloadAllTickets}
                      disabled={downloading}
                      sx={{
                        py: 2,
                        borderRadius: '50px',
                        background: 'var(--gradient-primary)',
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 'var(--shadow-xl)'
                        }
                      }}
                    >
                      {downloading ? 'Downloading All...' : `Download All ${tickets.length} Tickets`}
                    </Button>
                    
                    <Button
                      variant="outlined"
                      fullWidth
                      size="large"
                      startIcon={<Home />}
                      onClick={() => navigate('/events')}
                      sx={{
                        py: 2,
                        borderRadius: '50px',
                        borderColor: 'var(--color-primary)',
                        color: 'var(--color-primary)',
                        fontSize: '1rem',
                        fontWeight: 600,
                        '&:hover': {
                          background: 'var(--color-primary)',
                          color: 'white',
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      Browse More Events
                    </Button>
                  </Stack>
                </CardContent>
              </Card>

              {/* All Tickets List */}
              <Card sx={{ 
                borderRadius: 4,
                background: 'var(--color-card-bg)',
                border: '1px solid var(--border-color)'
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" sx={{ 
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    color: 'var(--color-text)',
                    mb: 3
                  }}>
                    All Tickets ({tickets.length})
                  </Typography>

                  <Stack spacing={2}>
                    {tickets.map((ticket, index) => (
                      <Card 
                        key={ticket._id}
                        onClick={() => setCurrentTicketIndex(index)}
                        sx={{ 
                          p: 3,
                          cursor: 'pointer',
                          borderRadius: 3,
                          border: currentTicketIndex === index 
                            ? '2px solid var(--color-primary)' 
                            : '1px solid var(--border-color)',
                          background: currentTicketIndex === index 
                            ? 'var(--color-primary)05' 
                            : 'var(--color-bg)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            borderColor: 'var(--color-primary)',
                            transform: 'translateY(-2px)',
                            boxShadow: 'var(--shadow-md)'
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Avatar sx={{ 
                            width: 48, 
                            height: 48,
                            background: currentTicketIndex === index 
                              ? 'var(--color-primary)' 
                              : 'var(--color-text-secondary)',
                            fontWeight: 700,
                            fontSize: '1.1rem'
                          }}>
                            {index + 1}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body1" sx={{ 
                              fontWeight: 700,
                              color: 'var(--color-text)',
                              mb: 0.5
                            }}>
                              {ticket.participant || `Guest ${index + 1}`}
                            </Typography>
                            <Chip 
                              label={ticket.tierName}
                              size="small"
                              sx={{
                                fontSize: '0.75rem',
                                background: currentTicketIndex === index 
                                  ? 'var(--color-primary)' 
                                  : 'var(--color-text-secondary)',
                                color: 'white'
                              }}
                            />
                          </Box>
                          {ticket.qrcodeUrl && (
                            <CheckCircle sx={{ 
                              color: 'var(--color-success)',
                              fontSize: 24
                            }} />
                          )}
                        </Box>
                      </Card>
                    ))}
                  </Stack>
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card sx={{ 
                borderRadius: 4,
                background: 'var(--color-card-bg)',
                border: '1px solid var(--border-color)'
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
                    <Receipt />
                    Order Summary
                  </Typography>

                  {/* Event Info */}
                  <Paper sx={{ 
                    p: 3, 
                    mb: 3, 
                    borderRadius: 3, 
                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                    color: 'white'
                  }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                      {order?.eventId?.name}
                    </Typography>
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarToday sx={{ fontSize: 16 }} />
                        <Typography variant="body2">
                          {order?.eventId?.start_date && format(new Date(order.eventId.start_date), 'MMM d, yyyy')}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOn sx={{ fontSize: 16 }} />
                        <Typography variant="body2">
                          {order?.eventId?.location}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>

                  {/* Customer Info */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ 
                      fontWeight: 600, 
                      color: 'var(--color-text-secondary)',
                      mb: 2 
                    }}>
                      Customer Details
                    </Typography>
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Person sx={{ color: 'var(--color-primary)' }} />
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {order?.customerName}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Email sx={{ color: 'var(--color-primary)' }} />
                        <Typography variant="body2">
                          {order?.customerEmail}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Phone sx={{ color: 'var(--color-primary)' }} />
                        <Typography variant="body2">
                          {order?.customerPhone}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  {/* Payment Summary */}
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body1">Subtotal:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        ₹{order?.originalAmount?.toLocaleString()}
                      </Typography>
                    </Box>
                    
                    {order?.discountAmount > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body1" sx={{ color: 'var(--color-success)' }}>
                          Discount:
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'var(--color-success)', fontWeight: 600 }}>
                          -₹{order.discountAmount.toLocaleString()}
                        </Typography>
                      </Box>
                    )}
                    
                    <Divider />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Total Paid:
                      </Typography>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 700,
                        color: 'var(--color-primary)'
                      }}>
                        ₹{order?.totalAmount?.toLocaleString()}
                      </Typography>
                    </Box>
                    
                    <Typography variant="caption" sx={{ 
                      color: 'var(--color-text-secondary)',
                      fontFamily: 'monospace',
                      textAlign: 'center',
                      mt: 2
                    }}>
                      Order #{orderId?.slice(-12).toUpperCase()}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>

              {/* Important Notice */}
              <Alert 
                severity="info" 
                sx={{ 
                  borderRadius: 3,
                  fontSize: '0.9rem',
                  '& .MuiAlert-message': {
                    fontWeight: 500
                  }
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  Important Notice:
                </Typography>
                Save your tickets and bring them to the event. Each QR code will be scanned for entry verification.
              </Alert>
            </Stack>
          </Grid>
        </Grid>
      </Container>

      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Box>
  );
}