import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Container,
  Button,
  Stack,
  Divider,
  Alert,
  IconButton,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel
} from '@mui/material';
import {
  ArrowBack,
  CardGiftcard,
  CreditCard,
  AccountBalance,
  Phone,
  Wallet,
  Security,
  CheckCircle,
  LocalOffer,
  Receipt,
  Timer
} from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';
import { useGlobalInfo } from '../../contexts/globalContext';
import { API_ROUTE } from '../../lib/config';

export default function PlanCheckout() {
  const { theme } = useTheme();
  const { userId } = useGlobalInfo();
  const navigate = useNavigate();
  
  const [orderData, setOrderData] = useState(null);
  const [planDetails, setPlanDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Get order data from session storage
    const storedOrderData = sessionStorage.getItem('planOrderData');
    if (!storedOrderData) {
      navigate('/plans');
      return;
    }
    
    const parsedOrderData = JSON.parse(storedOrderData);
    setOrderData(parsedOrderData);
    fetchPlanDetails(parsedOrderData.planId);
    fetchCurrentUser();
  }, [navigate]);

  const fetchPlanDetails = async (planId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ROUTE}/api/v1/plans/${planId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setPlanDetails(data.data);
    } catch (error) {
      console.error('Error fetching plan details:', error);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ROUTE}/api/v1/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setCurrentUser(data.data);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const handlePurchase = async () => {
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      // Create plan order
      const orderPayload = {
        user: userId,
        plan: orderData.planId,
        promocode: orderData.promocode,
        originalPrice: orderData.originalPrice,
        discountAmount: orderData.discountAmount,
        finalAmount: orderData.finalPrice,
        remainingTickets: planDetails.ticketAllowance || 100,
        paymentMethod: paymentMethod
      };

      const response = await fetch(`${API_ROUTE}/api/v1/plan-orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderPayload)
      });

      if (response.ok) {
        const result = await response.json();
        
        // Mock payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Update order status to completed (mock payment success)
        await fetch(`${API_ROUTE}/api/v1/plan-orders/${result.data._id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ 
            status: 'completed',
            paymentId: `MOCK_${Date.now()}`,
            paymentMethod: paymentMethod
          })
        });

        // Clear session storage
        sessionStorage.removeItem('planOrderData');
        
        // Navigate to success page
        navigate(`/plans/success?orderId=${result.data._id}`);
      } else {
        throw new Error('Payment failed');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (days) => {
    if (days >= 365) return `${Math.floor(days / 365)} year${Math.floor(days / 365) > 1 ? 's' : ''}`;
    if (days >= 30) return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''}`;
    return `${days} day${days > 1 ? 's' : ''}`;
  };

  const paymentMethods = [
    { value: 'card', label: 'Credit/Debit Card', icon: <CreditCard />, description: 'Visa, Mastercard, Rupay' },
    { value: 'upi', label: 'UPI', icon: <Phone />, description: 'PhonePe, Google Pay, Paytm' },
    { value: 'netbanking', label: 'Net Banking', icon: <AccountBalance />, description: 'All major banks' },
    { value: 'wallet', label: 'Digital Wallet', icon: <Wallet />, description: 'Paytm, Amazon Pay' }
  ];

  if (!orderData || !planDetails) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <CircularProgress />
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
              onClick={() => navigate('/plans')}
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
                fontWeight: 700,
                mb: 1
              }}>
                Complete Your Purchase
              </Typography>
              <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                You're one step away from unlocking powerful event management
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={6}>
          {/* Order Summary */}
          <Grid item xs={12} md={8}>
            {/* Plan Details */}
            <Card sx={{ 
              borderRadius: 4,
              background: 'var(--color-card-bg)',
              border: '1px solid var(--border-color)',
              mb: 4
            }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ 
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  color: 'var(--color-text)',
                  mb: 3
                }}>
                  Plan Details
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                  <CardGiftcard sx={{ fontSize: 48, color: 'var(--color-primary)' }} />
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                      {planDetails.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
                      {planDetails.description || 'Professional event management plan'}
                    </Typography>
                    <Chip 
                      label={`Valid for ${formatDuration(planDetails.durationInDays)}`}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  What you'll get:
                </Typography>
                <List dense>
                  <ListItem sx={{ px: 0 }}>
                    <CheckCircle sx={{ color: 'var(--color-success)', mr: 2, fontSize: 20 }} />
                    <ListItemText 
                      primary={`${planDetails.ticketAllowance || 'Unlimited'} ticket allowance`}
                      secondary="Create and sell tickets for your events"
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <CheckCircle sx={{ color: 'var(--color-success)', mr: 2, fontSize: 20 }} />
                    <ListItemText 
                      primary="Advanced event management tools"
                      secondary="Registration forms, QR codes, analytics"
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <CheckCircle sx={{ color: 'var(--color-success)', mr: 2, fontSize: 20 }} />
                    <ListItemText 
                      primary="Priority customer support"
                      secondary="Get help when you need it most"
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <CheckCircle sx={{ color: 'var(--color-success)', mr: 2, fontSize: 20 }} />
                    <ListItemText 
                      primary="Real-time event analytics"
                      secondary="Track attendance, revenue, and more"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            {/* Payment Method */}
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
                  Payment Method
                </Typography>

                <FormControl component="fieldset">
                  <RadioGroup
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    {paymentMethods.map((method) => (
                      <Card 
                        key={method.value}
                        sx={{ 
                          mb: 2,
                          border: paymentMethod === method.value ? '2px solid var(--color-primary)' : '1px solid var(--border-color)',
                          cursor: 'pointer',
                          '&:hover': {
                            borderColor: 'var(--color-primary)',
                            background: 'var(--color-bg-subtle)'
                          }
                        }}
                        onClick={() => setPaymentMethod(method.value)}
                      >
                        <CardContent sx={{ p: 2 }}>
                          <FormControlLabel
                            value={method.value}
                            control={<Radio />}
                            label={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 1 }}>
                                {method.icon}
                                <Box>
                                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    {method.label}
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
                                    {method.description}
                                  </Typography>
                                </Box>
                              </Box>
                            }
                            sx={{ margin: 0, width: '100%' }}
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </RadioGroup>
                </FormControl>

                <Alert severity="info" sx={{ mt: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Security sx={{ fontSize: 20 }} />
                    <Typography variant="body2">
                      Your payment is secured with bank-grade encryption. This is a mock payment for demo purposes.
                    </Typography>
                  </Box>
                </Alert>
              </CardContent>
            </Card>
          </Grid>

          {/* Checkout Summary */}
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
                  <Receipt />
                  Order Summary
                </Typography>

                <Stack spacing={2} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Plan</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {planDetails.name}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Duration</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formatDuration(planDetails.durationInDays)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Original Price</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      ₹{orderData.originalPrice.toLocaleString()}
                    </Typography>
                  </Box>

                  {orderData.promocode && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: 'var(--color-success)' }}>
                        <LocalOffer sx={{ fontSize: 16, mr: 0.5 }} />
                        {orderData.promocode}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'var(--color-success)', fontWeight: 600 }}>
                        -₹{orderData.discountAmount.toLocaleString()}
                      </Typography>
                    </Box>
                  )}
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Total Amount
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 700,
                    color: 'var(--color-primary)'
                  }}>
                    ₹{orderData.finalPrice.toLocaleString()}
                  </Typography>
                </Box>

                {orderData.discountAmount > 0 && (
                  <Alert severity="success" sx={{ mb: 3 }}>
                    You saved ₹{orderData.discountAmount.toLocaleString()} with promocode!
                  </Alert>
                )}

                {currentUser && currentUser.plan && (
                  <Alert severity="warning" sx={{ mb: 3 }}>
                    <Typography variant="body2">
                      This will replace your current plan. Your existing plan credits will be reset.
                    </Typography>
                  </Alert>
                )}

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handlePurchase}
                  disabled={loading}
                  sx={{
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    borderRadius: '50px',
                    background: 'var(--gradient-primary)',
                    '&:hover': {
                      background: 'var(--gradient-primary)',
                      transform: 'translateY(-2px)',
                      boxShadow: 'var(--shadow-xl)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {loading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <CircularProgress size={20} color="inherit" />
                      Processing Payment...
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Security />
                      Complete Purchase
                    </Box>
                  )}
                </Button>

                <Typography variant="caption" sx={{ 
                  display: 'block',
                  textAlign: 'center',
                  color: 'var(--color-text-secondary)',
                  mt: 2
                }}>
                  <Timer sx={{ fontSize: 14, mr: 0.5 }} />
                  Plan activates immediately after payment
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}