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
  TextField,
  Divider,
  Stack,
  Chip,
  Alert,
  InputAdornment
} from '@mui/material';
import { 
  ArrowBack,
  Payment,
  Person,
  EventSeat,
  LocalOffer,
  CheckCircle,
  Email,
  Phone,
  CreditCard
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useTheme } from '../../contexts/ThemeContext';
import { API_ROUTE } from '../../lib/config';

export default function TicketCheckout() {
  const { eventId } = useParams();
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);
  const [customerDetails, setCustomerDetails] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: ''
  });
  const [promocode, setPromocode] = useState('');
  const [promocodeStatus, setPromocodeStatus] = useState(null);
  const [orderSummary, setOrderSummary] = useState({
    originalAmount: 0,
    discountAmount: 0,
    totalAmount: 0
  });

  useEffect(() => {
    // Get checkout data from session storage
    const data = sessionStorage.getItem('checkoutData');
    if (!data) {
      navigate(`/event/${eventId}/tickets`);
      return;
    }
    
    const parsedData = JSON.parse(data);
    setCheckoutData(parsedData);
    fetchEventDetails();
  }, [eventId]);

  useEffect(() => {
    if (event && checkoutData) {
      calculateOrderSummary();
    }
  }, [event, checkoutData, promocodeStatus]);

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
    } finally {
      setLoading(false);
    }
  };

  const calculateOrderSummary = () => {
    if (!event || !checkoutData) return;

    let originalAmount = 0;
    
    checkoutData.ticketDetails.forEach(ticketGroup => {
      const tier = event.ticket_tiers.find(t => t.name === ticketGroup.tierName);
      if (tier) {
        originalAmount += tier.price * ticketGroup.quantity;
      }
    });

    const discountAmount = promocodeStatus?.valid ? 
      Math.round((originalAmount * promocodeStatus.discount) / 100) : 0;
    
    const totalAmount = originalAmount - discountAmount;

    setOrderSummary({
      originalAmount,
      discountAmount,
      totalAmount
    });
  };

  const handleCustomerDetailChange = (field, value) => {
    setCustomerDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validatePromocode = async () => {
    if (!promocode.trim()) {
      setPromocodeStatus(null);
      return;
    }

    try {
      const response = await fetch(`${API_ROUTE}/api/v1/ticket-orders/promocode/validate/${eventId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promocode })
      });

      const data = await response.json();
      setPromocodeStatus(data.data);
    } catch (error) {
      console.error('Error validating promocode:', error);
      setPromocodeStatus({ valid: false, message: 'Error validating promocode' });
    }
  };

  const getTotalTickets = () => {
    if (!checkoutData) return 0;
    return checkoutData.ticketDetails.reduce((total, group) => total + group.quantity, 0);
  };

  const handlePayment = async () => {
    // Validate customer details
    if (!customerDetails.customerName || !customerDetails.customerEmail || !customerDetails.customerPhone) {
      alert('Please fill in all customer details');
      return;
    }

    setProcessing(true);

    try {
      // Create ticket order
      const orderPayload = {
        ...checkoutData,
        ...customerDetails,
        promocode: promocodeStatus?.valid ? promocode : undefined
      };

      const createResponse = await fetch(`${API_ROUTE}/api/v1/ticket-orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      if (!createResponse.ok) throw new Error('Failed to create order');
      
      const orderData = await createResponse.json();
      const orderId = orderData.data._id;

      // Complete payment (mock)
      const completeResponse = await fetch(`${API_ROUTE}/api/v1/ticket-orders/${orderId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!completeResponse.ok) throw new Error('Payment failed');

      // Clear session storage
      sessionStorage.removeItem('selectedTickets');
      sessionStorage.removeItem('checkoutData');

      // Navigate to success page
      navigate(`/event/${eventId}/tickets/success/${orderId}`);

    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <IconButton 
              onClick={() => navigate(`/event/${eventId}/tickets/forms`)}
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
                Complete Payment
              </Typography>
              <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                {event?.name}
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={6}>
          {/* Payment Form */}
          <Grid item xs={12} md={8}>
            <Stack spacing={4}>
              {/* Customer Details */}
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
                    <Person sx={{ fontSize: 24 }} />
                    Customer Details
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Full Name"
                        value={customerDetails.customerName}
                        onChange={(e) => handleCustomerDetailChange('customerName', e.target.value)}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person sx={{ color: 'var(--color-text-secondary)' }} />
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Email Address"
                        type="email"
                        value={customerDetails.customerEmail}
                        onChange={(e) => handleCustomerDetailChange('customerEmail', e.target.value)}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Email sx={{ color: 'var(--color-text-secondary)' }} />
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Phone Number"
                        value={customerDetails.customerPhone}
                        onChange={(e) => handleCustomerDetailChange('customerPhone', e.target.value)}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Phone sx={{ color: 'var(--color-text-secondary)' }} />
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Promocode */}
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
                    <LocalOffer sx={{ fontSize: 24 }} />
                    Promocode (Optional)
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <TextField
                      fullWidth
                      label="Enter promocode"
                      value={promocode}
                      onChange={(e) => setPromocode(e.target.value.toUpperCase())}
                      onBlur={validatePromocode}
                    />
                    <Button
                      variant="outlined"
                      onClick={validatePromocode}
                      sx={{ minWidth: '120px' }}
                    >
                      Apply
                    </Button>
                  </Box>

                  {promocodeStatus && (
                    <Alert 
                      severity={promocodeStatus.valid ? 'success' : 'error'}
                      sx={{ borderRadius: 2 }}
                    >
                      {promocodeStatus.message}
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Mock Payment */}
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
                    <CreditCard sx={{ fontSize: 24 }} />
                    Payment Method
                  </Typography>

                  <Alert severity="info" sx={{ borderRadius: 2 }}>
                    This is a demo payment. Click "Complete Purchase" to proceed.
                  </Alert>
                </CardContent>
              </Card>
            </Stack>
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
                  <Payment sx={{ fontSize: 24 }} />
                  Order Summary
                </Typography>

                {/* Event Info */}
                <Box sx={{ mb: 3, p: 3, borderRadius: 2, background: 'var(--color-bg-secondary)' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    {event?.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
                    {format(new Date(event?.start_date), 'MMM d, yyyy')} • {event?.start_time}
                  </Typography>
                </Box>

                {/* Tickets */}
                <Stack spacing={2} sx={{ mb: 3 }}>
                  {checkoutData?.ticketDetails.map((ticketGroup) => {
                    const tier = event?.ticket_tiers?.find(t => t.name === ticketGroup.tierName);
                    return (
                      <Box key={ticketGroup.tierName} sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {ticketGroup.tierName}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>
                            ₹{tier?.price} × {ticketGroup.quantity}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          ₹{((tier?.price || 0) * ticketGroup.quantity).toLocaleString()}
                        </Typography>
                      </Box>
                    );
                  })}
                </Stack>

                <Divider sx={{ my: 2 }} />

                {/* Pricing breakdown */}
                <Stack spacing={1} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Subtotal:</Typography>
                    <Typography variant="body2">₹{orderSummary.originalAmount.toLocaleString()}</Typography>
                  </Box>
                  
                  {orderSummary.discountAmount > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: 'var(--color-success)' }}>
                        Discount:
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'var(--color-success)' }}>
                        -₹{orderSummary.discountAmount.toLocaleString()}
                      </Typography>
                    </Box>
                  )}
                  
                  <Divider />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Total:
                    </Typography>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 700,
                      color: 'var(--color-primary)'
                    }}>
                      ₹{orderSummary.totalAmount.toLocaleString()}
                    </Typography>
                  </Box>
                </Stack>

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handlePayment}
                  disabled={processing || !customerDetails.customerName || !customerDetails.customerEmail || !customerDetails.customerPhone}
                  sx={{
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    borderRadius: '50px',
                    background: 'var(--gradient-primary)',
                    '&:hover': {
                      background: 'var(--gradient-primary)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  {processing ? (
                    <CircularProgress size={24} sx={{ color: 'white' }} />
                  ) : (
                    'Complete Purchase'
                  )}
                </Button>

                <Typography variant="caption" sx={{ 
                  display: 'block',
                  textAlign: 'center',
                  color: 'var(--color-text-secondary)',
                  mt: 2
                }}>
                  🔒 Secure checkout • Instant ticket delivery
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}