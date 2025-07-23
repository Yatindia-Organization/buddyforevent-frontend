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
  Avatar
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
  QrCode
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
      
      // Get tickets with QR codes from order completion
      if (data.data.orderStatus === 'completed' && data.data.submissionIds) {
        // Fetch individual submissions to get QR codes
        const ticketPromises = data.data.submissionIds.map(async (submissionId) => {
          try {
            const submissionResponse = await fetch(`${API_ROUTE}/api/v1/event/form-submission/${submissionId}`);
            if (submissionResponse.ok) {
              const submissionData = await submissionResponse.json();
              return submissionData;
            }
          } catch (err) {
            console.error('Error fetching submission:', err);
            return null;
          }
        });
        
        const submissionResults = await Promise.all(ticketPromises);
        const validTickets = submissionResults.filter(ticket => ticket && ticket.qrcodeUrl);
        setTickets(validTickets);
      } else {
        // Fallback: create ticket info from order data without QR codes
        const ticketInfo = [];
        data.data.ticketDetails?.forEach((tierGroup, tierIndex) => {
          tierGroup.participantForms?.forEach((form, formIndex) => {
            ticketInfo.push({
              _id: `${tierIndex}_${formIndex}`,
              participant: form.participantName || `Guest ${ticketInfo.length + 1}`,
              tierName: tierGroup.tierName,
              seat: form.seat,
              qrcodeUrl: null,
              qrcode: `DEMO-${Date.now()}-${ticketInfo.length}`
            });
          });
        });
        setTickets(ticketInfo);
      }
      
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
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
        <Container maxWidth="lg">
          <Box sx={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            animation: 'fadeInUp 0.8s ease-out'
          }}>
            <CheckCircle sx={{ 
              fontSize: 80, 
              color: 'white',
              mb: 2,
              filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))'
            }} />
            <Typography variant="h3" sx={{ 
              color: 'white', 
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              mb: 1,
              fontSize: { xs: '1.8rem', md: '2.5rem' }
            }}>
              Payment Successful!
            </Typography>
            <Typography variant="h6" sx={{ 
              color: 'rgba(255,255,255,0.9)',
              mb: 3
            }}>
              Your tickets are ready for download
            </Typography>
            
            {/* Quick stats */}
            <Grid container spacing={3} sx={{ maxWidth: '500px' }}>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ 
                    color: 'white',
                    fontWeight: 700,
                    fontFamily: 'var(--font-heading)'
                  }}>
                    {tickets.length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Tickets
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ 
                    color: 'white',
                    fontWeight: 700,
                    fontFamily: 'var(--font-heading)'
                  }}>
                    ₹{order?.totalAmount?.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Total Paid
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <CheckCircle sx={{ 
                    fontSize: '3rem',
                    color: 'white'
                  }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Confirmed
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4}>
          {/* Left Sidebar - Ticket List */}
          <Grid item xs={12} md={3}>
            <Card sx={{ 
              borderRadius: 4,
              background: 'var(--color-card-bg)',
              border: '1px solid var(--border-color)',
              height: 'fit-content',
              position: 'sticky',
              top: 24
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ 
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  color: 'var(--color-text)',
                  mb: 3,
                  textAlign: 'center'
                }}>
                  All Tickets ({tickets.length})
                </Typography>

                <Stack spacing={2}>
                  {tickets.map((ticket, index) => (
                    <Card 
                      key={ticket._id}
                      onClick={() => setCurrentTicketIndex(index)}
                      sx={{ 
                        p: 2,
                        cursor: 'pointer',
                        borderRadius: 3,
                        border: currentTicketIndex === index 
                          ? '2px solid var(--color-primary)' 
                          : '1px solid var(--border-color)',
                        background: currentTicketIndex === index 
                          ? 'var(--color-primary-light)' 
                          : 'var(--color-bg)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: 'var(--color-primary)',
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ 
                          width: 32, 
                          height: 32,
                          background: currentTicketIndex === index 
                            ? 'var(--color-primary)' 
                            : 'var(--color-text-secondary)',
                          fontSize: '0.8rem'
                        }}>
                          {index + 1}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" sx={{ 
                            fontWeight: 600,
                            color: 'var(--color-text)',
                            fontSize: '0.85rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {ticket.participant || `Guest ${index + 1}`}
                          </Typography>
                          <Typography variant="caption" sx={{ 
                            color: 'var(--color-text-secondary)',
                            fontSize: '0.75rem'
                          }}>
                            {ticket.tierName}
                          </Typography>
                        </Box>
                      </Box>
                    </Card>
                  ))}
                </Stack>

                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={downloading ? <CircularProgress size={16} /> : <GetApp />}
                    onClick={downloadAllTickets}
                    disabled={downloading}
                    fullWidth
                    sx={{
                      borderColor: 'var(--color-primary)',
                      color: 'var(--color-primary)',
                      fontSize: '0.8rem'
                    }}
                  >
                    {downloading ? 'Downloading...' : 'Download All'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Center - Current Ticket + Order Summary */}
          <Grid item xs={12} md={6}>
            <Stack spacing={4}>
              {/* Current Ticket Display */}
              {currentTicket && (
                <Card sx={{ 
                  borderRadius: 4,
                  border: '1px solid var(--border-color)',
                  background: 'var(--color-card-bg)'
                }}>
                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <IconButton 
                        onClick={() => setCurrentTicketIndex(Math.max(0, currentTicketIndex - 1))}
                        disabled={currentTicketIndex === 0}
                      >
                        <ArrowBack />
                      </IconButton>
                      
                      <Typography variant="h6" sx={{ 
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 700
                      }}>
                        Ticket {currentTicketIndex + 1} of {tickets.length}
                      </Typography>
                      
                      <IconButton 
                        onClick={() => setCurrentTicketIndex(Math.min(tickets.length - 1, currentTicketIndex + 1))}
                        disabled={currentTicketIndex === tickets.length - 1}
                      >
                        <ArrowForward />
                      </IconButton>
                    </Box>

                    {/* QR Code Display */}
                    <Box sx={{ mb: 4 }}>
                      {currentTicket.qrcodeUrl ? (
                        <Box
                          component="img"
                          src={currentTicket.qrcodeUrl}
                          alt="Ticket QR Code"
                          sx={{
                            width: '250px',
                            height: '250px',
                            borderRadius: 3,
                            border: '2px solid var(--border-color)',
                            objectFit: 'contain',
                            background: 'white'
                          }}
                        />
                      ) : (
                        <Box sx={{
                          width: '250px',
                          height: '250px',
                          background: 'var(--gradient-primary)',
                          borderRadius: 3,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          flexDirection: 'column',
                          gap: 2,
                          mx: 'auto'
                        }}>
                          <QrCode sx={{ fontSize: 60 }} />
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            QR CODE
                          </Typography>
                          <Typography variant="caption">
                            #{currentTicketIndex + 1}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Ticket Details */}
                    <Stack spacing={2} sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <Person sx={{ fontSize: 20, color: 'var(--color-primary)' }} />
                        <Typography variant="h6" sx={{ 
                          fontFamily: 'var(--font-heading)',
                          fontWeight: 600
                        }}>
                          {currentTicket.participant || `Guest ${currentTicketIndex + 1}`}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                        <Chip 
                          label={currentTicket.tierName}
                          sx={{ 
                            background: 'var(--color-primary)',
                            color: 'white',
                            fontWeight: 600
                          }}
                        />
                        {currentTicket.seat && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <EventSeat sx={{ fontSize: 16, color: 'var(--color-text-secondary)' }} />
                            <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
                              Seat: {currentTicket.seat}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                      
                      <Typography variant="body2" sx={{ 
                        color: 'var(--color-text-secondary)',
                        fontFamily: 'monospace',
                        fontSize: '0.85rem'
                      }}>
                        Ticket ID: {currentTicket.qrcode || `TKT-${orderId?.slice(-8).toUpperCase()}-${currentTicketIndex + 1}`}
                      </Typography>
                    </Stack>

                    {/* Download Button */}
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
                        px: 4,
                        '&:hover': {
                          background: 'var(--gradient-primary)',
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      Download This Ticket
                    </Button>

                    {/* Pagination */}
                    {tickets.length > 1 && (
                      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                        <Pagination 
                          count={tickets.length}
                          page={currentTicketIndex + 1}
                          onChange={(e, page) => setCurrentTicketIndex(page - 1)}
                          color="primary"
                          size="small"
                        />
                      </Box>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Order Summary - Centered */}
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
                    textAlign: 'center'
                  }}>
                    Order Summary
                  </Typography>

                  {/* Event Info */}
                  <Box sx={{ mb: 3, p: 3, borderRadius: 2, background: 'var(--color-bg-secondary)', textAlign: 'center' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                      {order?.eventId?.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)', mb: 1 }}>
                      {order?.eventId?.start_date && format(new Date(order.eventId.start_date), 'MMM d, yyyy')}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
                      {order?.eventId?.location}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  {/* Customer Info */}
                  <Stack spacing={2} sx={{ mb: 3, textAlign: 'center' }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>
                        Customer Name
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {order?.customerName}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>
                        Email
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {order?.customerEmail}
                      </Typography>
                    </Box>
                  </Stack>

                  <Divider sx={{ my: 3 }} />

                  {/* Payment Summary */}
                  <Stack spacing={1} sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Subtotal:</Typography>
                      <Typography variant="body2">₹{order?.originalAmount?.toLocaleString()}</Typography>
                    </Box>
                    
                    {order?.discountAmount > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: 'var(--color-success)' }}>
                          Discount:
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'var(--color-success)' }}>
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
                  </Stack>

                  <Typography variant="caption" sx={{ 
                    display: 'block',
                    textAlign: 'center',
                    color: 'var(--color-text-secondary)',
                    fontFamily: 'monospace'
                  }}>
                    Order ID: {orderId?.slice(-12).toUpperCase()}
                  </Typography>
                </CardContent>
              </Card>
            </Stack>
          </Grid>

          {/* Right Sidebar - Actions */}
          <Grid item xs={12} md={3}>
            <Card sx={{ 
              borderRadius: 4,
              background: 'var(--color-card-bg)',
              border: '1px solid var(--border-color)',
              height: 'fit-content',
              position: 'sticky',
              top: 24
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ 
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  color: 'var(--color-text)',
                  mb: 3,
                  textAlign: 'center'
                }}>
                  Quick Actions
                </Typography>

                <Stack spacing={2}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Share />}
                    onClick={shareOrder}
                    sx={{
                      borderColor: 'var(--color-primary)',
                      color: 'var(--color-primary)',
                      '&:hover': {
                        borderColor: 'var(--color-primary)',
                        background: 'var(--color-primary)',
                        color: 'white'
                      }
                    }}
                  >
                    Share Order
                  </Button>
                  
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<Home />}
                    onClick={() => navigate('/events')}
                    sx={{
                      background: 'var(--gradient-primary)',
                      '&:hover': {
                        background: 'var(--gradient-primary)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    Browse Events
                  </Button>
                </Stack>

                <Alert severity="info" sx={{ mt: 3, borderRadius: 2, fontSize: '0.85rem' }}>
                  <Typography variant="caption">
                    <strong>Important:</strong> Save your tickets and bring them to the event. Each QR code will be scanned for entry.
                  </Typography>
                </Alert>
              </CardContent>
            </Card>
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