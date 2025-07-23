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
  LinearProgress,
  Chip,
  Stack,
  IconButton
} from '@mui/material';
import {
  CheckCircle,
  Dashboard,
  EventAvailable,
  Timeline,
  TrendingUp,
  Share,
  WhatsApp,
  Twitter,
  Email,
  Download,
  Receipt,
  CreditCard
} from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';
import { useGlobalInfo } from '../../contexts/globalContext';
import { API_ROUTE } from '../../lib/config';

export default function PlanSuccess() {
  const { theme } = useTheme();
  const { userId, updateCreditsAfterPlanPurchase, fetchUserData } = useGlobalInfo();
  const navigate = useNavigate();
  
  const [orderData, setOrderData] = useState(null);
  const [planDetails, setPlanDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    // Get order data from session storage
    const storedOrderData = sessionStorage.getItem('planOrderData');
    if (storedOrderData) {
      const parsedData = JSON.parse(storedOrderData);
      setOrderData(parsedData);
      fetchPlanDetails(parsedData.plan);
      
      // Update user credits in global context
      if (parsedData.remainingTickets) {
        updateCreditsAfterPlanPurchase(parsedData.remainingTickets);
      }
      
      // Clear session storage
      sessionStorage.removeItem('planOrderData');
    } else {
      // If no order data, redirect to plans
      navigate('/plans/selection');
    }

    // Auto redirect countdown
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          navigate('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, updateCreditsAfterPlanPurchase]);

  const fetchPlanDetails = async (planId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ROUTE}/api/v1/plans/${planId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setPlanDetails(data.data);
      }
    } catch (error) {
      console.error('Error fetching plan details:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (duration) => {
    const days = parseInt(duration);
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
            mb: 4
          }}>
            Welcome to {planDetails?.name}! Your plan is now active.
          </Typography>

          {/* Plan Summary */}
          <Card sx={{ 
            maxWidth: 600, 
            mx: 'auto',
            borderRadius: 4,
            background: 'var(--color-card-bg)',
            border: '1px solid var(--border-color)',
            mb: 4
          }}>
            <CardContent sx={{ p: 4 }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    {planDetails?.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)', mb: 2 }}>
                    {planDetails?.description}
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Chip 
                      icon={<CreditCard />}
                      label={`₹${orderData?.finalAmount}`}
                      color="primary"
                      variant="filled"
                    />
                    <Chip 
                      icon={<EventAvailable />}
                      label={`${orderData?.remainingTickets} tickets`}
                      color="success"
                      variant="outlined"
                    />
                    {orderData?.discountAmount > 0 && (
                      <Chip 
                        label={`Saved ₹${orderData.discountAmount}`}
                        color="warning"
                        variant="outlined"
                      />
                    )}
                  </Stack>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ textAlign: { xs: 'center', md: 'right' } }}>
                    <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)', mb: 1 }}>
                      Order ID: {orderData?._id?.slice(-8).toUpperCase()}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)', mb: 3 }}>
                      Purchased on {new Date().toLocaleDateString()}
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<Receipt />}
                      size="small"
                      onClick={() => window.print()}
                    >
                      Download Receipt
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Share Success */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Share your success!
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center">
              <IconButton
                onClick={() => handleShareSuccess('whatsapp')}
                sx={{ 
                  background: '#25d366',
                  color: 'white',
                  '&:hover': { background: '#20ba5a' }
                }}
              >
                <WhatsApp />
              </IconButton>
              <IconButton
                onClick={() => handleShareSuccess('twitter')}
                sx={{ 
                  background: '#1da1f2',
                  color: 'white',
                  '&:hover': { background: '#1a91da' }
                }}
              >
                <Twitter />
              </IconButton>
              <IconButton
                onClick={() => handleShareSuccess('email')}
                sx={{ 
                  background: '#ea4335',
                  color: 'white',
                  '&:hover': { background: '#d23925' }
                }}
              >
                <Email />
              </IconButton>
            </Stack>
          </Box>
        </Box>

        {/* Next Steps */}
        <Typography variant="h4" sx={{ 
          fontFamily: 'var(--font-heading)',
          fontWeight: 700,
          color: 'var(--color-text)',
          textAlign: 'center',
          mb: 4
        }}>
          What's Next?
        </Typography>

        <Grid container spacing={4} sx={{ mb: 6 }}>
          {nextSteps.map((step, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{ 
                height: '100%',
                borderRadius: 4,
                background: 'var(--color-card-bg)',
                border: '1px solid var(--border-color)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                }
              }}
              onClick={step.action}>
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Box sx={{ 
                    color: '#6366f1',
                    mb: 2,
                    '& svg': { fontSize: 48 }
                  }}>
                    {step.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
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

        {/* Auto Redirect Notice */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Card sx={{ 
              borderRadius: 4,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                  🚀 Ready to Create Events!
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
                  Your {planDetails?.name} plan gives you {orderData?.remainingTickets} ticket credits. 
                  Start creating events and selling tickets right away!
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/create-event')}
                  sx={{
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.3)'
                    }
                  }}
                >
                  Create Your First Event
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              borderRadius: 4,
              background: 'var(--color-card-bg)',
              border: '1px solid var(--border-color)',
              textAlign: 'center'
            }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Auto Redirect
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
                    Monitor event performance and ticket sales
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Dashboard sx={{ fontSize: 48, color: '#8b5cf6', mb: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Manage Everything
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
                    Full control over events, participants, and more
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}