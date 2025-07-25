import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Container,
  Button,
  Stack,
  Chip,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress
} from '@mui/material';
import {
  CheckCircle,
  Dashboard,
  EventAvailable,
  Timeline,
  CardGiftcard,
  Download,
  Share,
  WhatsApp,
  Email,
  Twitter,
  Receipt,
  CalendarMonth,
  Star,
  TrendingUp
} from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';
import { useGlobalInfo } from '../../contexts/globalContext';
import { API_ROUTE } from '../../lib/config';
import { format } from 'date-fns';

export default function PlanSuccess() {
  const { theme } = useTheme();
  const { userId, changeUserType } = useGlobalInfo();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [orderDetails, setOrderDetails] = useState(null);
  const [planDetails, setPlanDetails] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(5);

  const orderId = searchParams.get('orderId');

  useEffect(() => {
    if (!orderId) {
      navigate('/plans');
      return;
    }
    fetchOrderDetails();
    startCountdown();
  }, [orderId, navigate]);

  const fetchOrderDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch order details from backend
      const orderResponse = await fetch(`${API_ROUTE}/api/v1/plan-orders/${orderId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!orderResponse.ok) {
        throw new Error('Order not found');
      }
      
      const orderData = await orderResponse.json();
      setOrderDetails(orderData.data);

      // Fetch updated user details to get new plan
      const userResponse = await fetch(`${API_ROUTE}/api/v1/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const userData = await userResponse.json();
      setUserDetails(userData.data);

      // Fetch plan details if plan is populated
      if (orderData.data?.plan) {
        const planId = typeof orderData.data.plan === 'object' ? 
          orderData.data.plan._id : orderData.data.plan;
          
        const planResponse = await fetch(`${API_ROUTE}/api/v1/plans/${planId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const planData = await planResponse.json();
        setPlanDetails(planData.data);
      }

    } catch (error) {
      console.error('Error fetching order details:', error);
      // If order not found, redirect to plans
      navigate('/plans');
    } finally {
      setLoading(false);
    }
  };

  const startCountdown = () => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatDuration = (days) => {
    if (days >= 365) return `${Math.floor(days / 365)} year${Math.floor(days / 365) > 1 ? 's' : ''}`;
    if (days >= 30) return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''}`;
    return `${days} day${days > 1 ? 's' : ''}`;
  };

  const handleShareSuccess = (platform) => {
    const message = `🎉 Just upgraded my event management with ${planDetails?.name}! Ready to create amazing events.`;
    const url = window.location.origin;
    
    switch(platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(message + ' ' + url)}`);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(url)}`);
        break;
      case 'email':
        window.open(`mailto:?subject=Plan Upgrade Success&body=${encodeURIComponent(message + '\n\n' + url)}`);
        break;
    }
  };

  const nextSteps = [
    {
      icon: <EventAvailable />,
      title: 'Create Your First Event',
      description: 'Start building amazing events with your new plan',
      action: () => navigate('/create-event')
    },
    {
      icon: <Dashboard />,
      title: 'Explore Dashboard',
      description: 'Get familiar with all the features available',
      action: () => navigate('/dashboard')
    },
    {
      icon: <Timeline />,
      title: 'View Analytics',
      description: 'Track your plan usage and event performance',
      action: () => navigate('/reports')
    }
  ];

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme === 'dark' 
          ? 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)'
          : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
      }}>
        <LinearProgress sx={{ width: 300 }} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: theme === 'dark' 
        ? 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)'
        : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      fontFamily: 'var(--font-base)',
      py: 6
    }}>
      <Container maxWidth="lg">
        {/* Success Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Box sx={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: 'linear-gradient(45deg, #10b981, #059669)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 3,
            animation: 'bounce 2s infinite'
          }}>
            <CheckCircle sx={{ fontSize: 64, color: 'white' }} />
          </Box>
          
          <Typography variant="h2" sx={{ 
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            color: 'var(--color-text)',
            mb: 2
          }}>
            🎉 Payment Successful!
          </Typography>
          
          <Typography variant="h5" sx={{ 
            color: 'var(--color-text-secondary)',
            mb: 3,
            maxWidth: '600px',
            mx: 'auto'
          }}>
            Welcome to {planDetails?.name}! Your plan is now active and ready to use.
          </Typography>

          <Alert severity="success" sx={{ 
            maxWidth: '500px',
            mx: 'auto',
            borderRadius: 3,
            '& .MuiAlert-message': {
              fontSize: '1.1rem'
            }
          }}>
            Your ticket allowance has been activated. Start creating events now!
          </Alert>
        </Box>

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
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <CardGiftcard />
                  Your New Plan
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ 
                      p: 3,
                      background: 'linear-gradient(45deg, #667eea, #764ba2)',
                      borderRadius: 3,
                      color: 'white',
                      textAlign: 'center'
                    }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                        {planDetails?.name}
                      </Typography>
                      <Typography variant="body1" sx={{ opacity: 0.9, mb: 2 }}>
                        {planDetails?.description}
                      </Typography>
                      <Chip 
                        label={`Valid for ${formatDuration(planDetails?.durationInDays)}`}
                        sx={{ 
                          background: 'rgba(255,255,255,0.2)',
                          color: 'white',
                          fontWeight: 600
                        }}
                      />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
                          Ticket Allowance
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: 'var(--color-success)' }}>
                          {planDetails?.ticketAllowance || 'Unlimited'} tickets
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
                          Plan Duration
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {formatDuration(planDetails?.durationInDays)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
                          Amount Paid
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          ₹{orderDetails?.finalAmount?.toLocaleString()}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Next Steps */}
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
                  What's Next?
                </Typography>
                
                <Grid container spacing={3}>
                  {nextSteps.map((step, index) => (
                    <Grid item xs={12} md={4} key={index}>
                      <Card sx={{ 
                        border: '1px solid var(--border-color)',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 'var(--shadow-lg)'
                        },
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                      }}
                      onClick={step.action}
                      >
                        <CardContent sx={{ textAlign: 'center', p: 3 }}>
                          <Box sx={{
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            background: `var(--color-primary)15`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 2
                          }}>
                            {React.cloneElement(step.icon, { 
                              sx: { fontSize: 32, color: 'var(--color-primary)' } 
                            })}
                          </Box>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                            {step.title}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
                            {step.description}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Order Receipt & Actions */}
          <Grid item xs={12} md={4}>
            {/* Order Receipt */}
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
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <Receipt />
                  Order Details
                </Typography>

                <Stack spacing={2} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Order ID</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                      #{orderId?.slice(-8)}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Date</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {format(new Date(), 'MMM dd, yyyy')}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Payment Method</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {orderDetails?.paymentMethod || 'Card'}
                    </Typography>
                  </Box>

                  {orderDetails?.promocode && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Promocode</Typography>
                      <Chip 
                        label={orderDetails.promocode}
                        size="small"
                        sx={{ fontFamily: 'monospace' }}
                      />
                    </Box>
                  )}
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Total Paid
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 700,
                    color: 'var(--color-success)'
                  }}>
                    ₹{orderDetails?.finalAmount?.toLocaleString()}
                  </Typography>
                </Box>

                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<Download />}
                  sx={{
                    borderColor: 'var(--color-primary)',
                    color: 'var(--color-primary)',
                    '&:hover': {
                      background: 'var(--color-primary)10'
                    }
                  }}
                >
                  Download Receipt
                </Button>
              </CardContent>
            </Card>

            {/* Share Success */}
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
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <Share />
                  Share Your Success
                </Typography>

                <Typography variant="body2" sx={{ 
                  color: 'var(--color-text-secondary)',
                  mb: 3
                }}>
                  Let others know about your plan upgrade!
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => handleShareSuccess('whatsapp')}
                      sx={{
                        borderColor: '#25D366',
                        color: '#25D366',
                        '&:hover': {
                          background: '#25D36610',
                          borderColor: '#25D366'
                        }
                      }}
                    >
                      <WhatsApp />
                    </Button>
                  </Grid>
                  <Grid item xs={4}>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => handleShareSuccess('twitter')}
                      sx={{
                        borderColor: '#1DA1F2',
                        color: '#1DA1F2',
                        '&:hover': {
                          background: '#1DA1F210',
                          borderColor: '#1DA1F2'
                        }
                      }}
                    >
                      <Twitter />
                    </Button>
                  </Grid>
                  <Grid item xs={4}>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => handleShareSuccess('email')}
                      sx={{
                        borderColor: 'var(--color-text-secondary)',
                        color: 'var(--color-text-secondary)',
                        '&:hover': {
                          background: 'var(--color-bg-subtle)'
                        }
                      }}
                    >
                      <Email />
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Auto Redirect */}
            <Card sx={{ 
              borderRadius: 4,
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              color: 'white'
            }}>
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <CalendarMonth sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Ready to Get Started?
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 3 }}>
                  Redirecting to dashboard in {countdown} seconds...
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => navigate('/dashboard')}
                  sx={{
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.3)'
                    }
                  }}
                >
                  Go to Dashboard Now
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Plan Features Highlight */}
        <Card sx={{ 
          mt: 6,
          borderRadius: 4,
          background: 'var(--color-card-bg)',
          border: '1px solid var(--border-color)'
        }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ 
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              color: 'var(--color-text)',
              mb: 3,
              textAlign: 'center'
            }}>
              What You Can Do Now
            </Typography>
            
            <Grid container spacing={4}>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <EventAvailable sx={{ fontSize: 48, color: '#6366f1', mb: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Create Events
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
                    Build amazing events with custom registration forms
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <TrendingUp sx={{ fontSize: 48, color: '#10b981', mb: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Sell Tickets
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
                    Generate QR tickets and manage registrations
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Timeline sx={{ fontSize: 48, color: '#f59e0b', mb: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Track Analytics
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
                    Monitor attendance, revenue, and engagement
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Star sx={{ fontSize: 48, color: '#ef4444', mb: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Premium Support
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
                    Get priority help whenever you need it
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>

      <style jsx>{`
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% { transform: translateY(0); }
          40%, 43% { transform: translateY(-30px); }
          70% { transform: translateY(-15px); }
          90% { transform: translateY(-4px); }
        }
      `}</style>
    </Box>
  );
}