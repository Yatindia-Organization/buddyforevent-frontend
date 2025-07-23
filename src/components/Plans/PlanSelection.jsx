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
  Chip,
  TextField,
  InputAdornment,
  Alert,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  ArrowBack,
  CardGiftcard,
  CheckCircle,
  Star,
  LocalOffer,
  EventAvailable,
  Timeline,
  Support,
  Security,
  Speed,
  TrendingUp,
  Close,
  Info
} from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';
import { useGlobalInfo } from '../../contexts/globalContext';
import { API_ROUTE } from '../../lib/config';

export default function PlanSelection() {
  const { theme } = useTheme();
  const { userType, userId } = useGlobalInfo();
  const navigate = useNavigate();
  
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [promocode, setPromocode] = useState('');
  const [promocodeApplied, setPromocodeApplied] = useState(null);
  const [promocodeError, setPromocodeError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);

  useEffect(() => {
    if (userType === 'super-admin') {
      navigate('/super-admin');
      return;
    }
    fetchPlans();
    fetchCurrentUser();
  }, [userType, navigate]);

  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ROUTE}/api/v1/plans`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setPlans(data.data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
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

  const validatePromocode = async () => {
    if (!promocode.trim()) {
      setPromocodeError('Please enter a promocode');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ROUTE}/api/v1/ticket-orders/promocode/validate/plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code: promocode })
      });
      
      const data = await response.json();
      
      if (data.valid) {
        setPromocodeApplied({
          code: promocode,
          discount: data.discount,
          message: data.message
        });
        setPromocodeError('');
      } else {
        setPromocodeError(data.message || 'Invalid promocode');
        setPromocodeApplied(null);
      }
    } catch (error) {
      setPromocodeError('Error validating promocode');
      setPromocodeApplied(null);
    }
  };

  const removePromocode = () => {
    setPromocode('');
    setPromocodeApplied(null);
    setPromocodeError('');
  };

  const calculateDiscountedPrice = (originalPrice) => {
    if (!promocodeApplied) return originalPrice;
    return originalPrice - (originalPrice * promocodeApplied.discount / 100);
  };

  const formatDuration = (days) => {
    if (days >= 365) return `${Math.floor(days / 365)} year${Math.floor(days / 365) > 1 ? 's' : ''}`;
    if (days >= 30) return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''}`;
    return `${days} day${days > 1 ? 's' : ''}`;
  };

  const getPlanRecommendation = (plan) => {
    if (plan.price <= 1000) return { label: 'Best for Starters', color: '#10b981' };
    if (plan.price <= 5000) return { label: 'Most Popular', color: '#6366f1' };
    return { label: 'Professional', color: '#f59e0b' };
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    
    // Store plan selection data for checkout
    const orderData = {
      planId: plan._id,
      originalPrice: plan.price,
      finalPrice: calculateDiscountedPrice(plan.price),
      promocode: promocodeApplied?.code || null,
      discountAmount: promocodeApplied ? (plan.price * promocodeApplied.discount / 100) : 0
    };
    
    sessionStorage.setItem('planOrderData', JSON.stringify(orderData));
    navigate('/plans/checkout');
  };

  const planFeatures = {
    basic: [
      'Up to 100 tickets per event',
      'Basic event management',
      'Email support',
      'Standard templates'
    ],
    standard: [
      'Up to 500 tickets per event',
      'Advanced event management',
      'Priority support',
      'Custom templates',
      'Analytics dashboard',
      'QR code generation'
    ],
    premium: [
      'Unlimited tickets',
      'Complete event management suite',
      '24/7 priority support',
      'Custom branding',
      'Advanced analytics',
      'API access',
      'Dedicated account manager'
    ]
  };

  const getFeaturesByPrice = (price) => {
    if (price <= 1000) return planFeatures.basic;
    if (price <= 5000) return planFeatures.standard;
    return planFeatures.premium;
  };

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
        py: 6
      }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
            <IconButton 
              onClick={() => navigate('/dashboard')}
              sx={{ 
                color: 'white',
                background: 'rgba(255,255,255,0.1)',
                '&:hover': { background: 'rgba(255,255,255,0.2)' }
              }}
            >
              <ArrowBack />
            </IconButton>
            <Box>
              <Typography variant="h3" sx={{ 
                color: 'white', 
                fontFamily: 'var(--font-heading)',
                fontWeight: 800,
                mb: 1
              }}>
                Choose Your Plan
              </Typography>
              <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                Unlock the power to create amazing events
              </Typography>
            </Box>
          </Box>

          {/* Current Plan Status */}
          {currentUser && (
            <Alert 
              severity={currentUser.plan ? "info" : "warning"} 
              sx={{ 
                mb: 4,
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                '& .MuiAlert-icon': { color: 'white' }
              }}
            >
              {currentUser.plan ? 
                `You currently have an active plan. Purchasing a new plan will replace your current plan.` :
                `You don't have an active plan. Choose a plan to start creating events and selling tickets.`
              }
            </Alert>
          )}

          {/* Promocode Section */}
          <Card sx={{ 
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 3,
            p: 3
          }}>
            <Typography variant="h6" sx={{ color: 'white', mb: 2, fontWeight: 600 }}>
              Have a promocode?
            </Typography>
            <Grid container spacing={2} alignItems="flex-start">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Enter promocode"
                  value={promocode}
                  onChange={(e) => setPromocode(e.target.value.toUpperCase())}
                  disabled={!!promocodeApplied}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocalOffer sx={{ color: 'rgba(255,255,255,0.7)' }} />
                      </InputAdornment>
                    ),
                    sx: {
                      color: 'white',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255,255,255,0.3)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255,255,255,0.5)',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'white',
                      },
                      '& input::placeholder': {
                        color: 'rgba(255,255,255,0.7)',
                        opacity: 1,
                      }
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                {!promocodeApplied ? (
                  <Button
                    variant="contained"
                    onClick={validatePromocode}
                    disabled={!promocode.trim()}
                    sx={{
                      background: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      '&:hover': { background: 'rgba(255,255,255,0.3)' },
                      height: '56px'
                    }}
                  >
                    Apply Code
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    onClick={removePromocode}
                    sx={{
                      borderColor: 'rgba(255,255,255,0.5)',
                      color: 'white',
                      height: '56px'
                    }}
                  >
                    Remove
                  </Button>
                )}
              </Grid>
              <Grid item xs={12}>
                {promocodeError && (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    {promocodeError}
                  </Alert>
                )}
                {promocodeApplied && (
                  <Alert severity="success" sx={{ mt: 1 }}>
                    🎉 {promocodeApplied.message}
                  </Alert>
                )}
              </Grid>
            </Grid>
          </Card>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Plans Grid */}
        <Grid container spacing={4}>
          {plans.map((plan) => {
            const recommendation = getPlanRecommendation(plan);
            const originalPrice = plan.price;
            const discountedPrice = calculateDiscountedPrice(originalPrice);
            const features = getFeaturesByPrice(plan.price);
            
            return (
              <Grid item xs={12} md={4} key={plan._id}>
                <Card sx={{ 
                  height: '100%',
                  borderRadius: 4,
                  border: selectedPlan?._id === plan._id ? '2px solid var(--color-primary)' : '1px solid var(--border-color)',
                  background: 'var(--color-card-bg)',
                  position: 'relative',
                  overflow: 'visible',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 'var(--shadow-xl)'
                  },
                  transition: 'all 0.3s ease'
                }}>
                  {/* Recommendation Badge */}
                  {recommendation && (
                    <Chip
                      label={recommendation.label}
                      sx={{
                        position: 'absolute',
                        top: -12,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: recommendation.color,
                        color: 'white',
                        fontWeight: 600,
                        zIndex: 1
                      }}
                    />
                  )}

                  <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* Plan Header */}
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                      <CardGiftcard sx={{ 
                        fontSize: 48, 
                        color: recommendation.color,
                        mb: 2
                      }} />
                      <Typography variant="h5" sx={{ 
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 700,
                        color: 'var(--color-text)',
                        mb: 1
                      }}>
                        {plan.name}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: 'var(--color-text-secondary)',
                        mb: 2
                      }}>
                        {plan.description || 'Perfect for growing businesses'}
                      </Typography>
                      
                      {/* Pricing */}
                      <Box sx={{ mb: 2 }}>
                        {promocodeApplied && discountedPrice < originalPrice ? (
                          <Box>
                            <Typography variant="h6" sx={{ 
                              color: 'var(--color-text-secondary)',
                              textDecoration: 'line-through',
                              mb: 0.5
                            }}>
                              ₹{originalPrice.toLocaleString()}
                            </Typography>
                            <Typography variant="h3" sx={{ 
                              fontFamily: 'var(--font-heading)',
                              fontWeight: 800,
                              color: recommendation.color
                            }}>
                              ₹{discountedPrice.toLocaleString()}
                            </Typography>
                            <Chip 
                              label={`Save ₹${(originalPrice - discountedPrice).toLocaleString()}`}
                              size="small"
                              sx={{ 
                                background: '#10b98115',
                                color: '#10b981',
                                fontWeight: 600,
                                mt: 1
                              }}
                            />
                          </Box>
                        ) : (
                          <Typography variant="h3" sx={{ 
                            fontFamily: 'var(--font-heading)',
                            fontWeight: 800,
                            color: recommendation.color
                          }}>
                            ₹{originalPrice.toLocaleString()}
                          </Typography>
                        )}
                        <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
                          Valid for {formatDuration(plan.durationInDays)}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Features */}
                    <Box sx={{ flexGrow: 1, mb: 3 }}>
                      <Typography variant="subtitle2" sx={{ 
                        fontWeight: 600,
                        color: 'var(--color-text)',
                        mb: 2
                      }}>
                        What's included:
                      </Typography>
                      <List dense>
                        {features.map((feature, index) => (
                          <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <CheckCircle sx={{ fontSize: 20, color: recommendation.color }} />
                            </ListItemIcon>
                            <ListItemText 
                              primary={feature}
                              primaryTypographyProps={{ 
                                variant: 'body2',
                                color: 'var(--color-text)'
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>

                    {/* Action Buttons */}
                    <Stack spacing={2}>
                      <Button
                        variant="contained"
                        size="large"
                        onClick={() => handleSelectPlan(plan)}
                        sx={{
                          background: `linear-gradient(45deg, ${recommendation.color}, ${recommendation.color}dd)`,
                          color: 'white',
                          fontWeight: 700,
                          py: 1.5,
                          '&:hover': {
                            background: `linear-gradient(45deg, ${recommendation.color}dd, ${recommendation.color}bb)`,
                            transform: 'translateY(-2px)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Choose {plan.name}
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          setSelectedPlan(plan);
                          setOpenDetailsDialog(true);
                        }}
                        sx={{
                          borderColor: recommendation.color,
                          color: recommendation.color,
                          '&:hover': {
                            borderColor: recommendation.color,
                            background: `${recommendation.color}10`
                          }
                        }}
                      >
                        View Details
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Plan Comparison Footer */}
        <Card sx={{ 
          mt: 6,
          borderRadius: 4,
          background: 'var(--color-card-bg)',
          border: '1px solid var(--border-color)',
          p: 4
        }}>
          <Typography variant="h6" sx={{ 
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            color: 'var(--color-text)',
            mb: 3,
            textAlign: 'center'
          }}>
            Why Choose Our Plans?
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <EventAvailable sx={{ fontSize: 48, color: '#6366f1', mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Easy Event Management
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
                  Create and manage events with our intuitive interface
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Security sx={{ fontSize: 48, color: '#10b981', mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Secure Payments
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
                  Bank-grade security for all transactions
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Speed sx={{ fontSize: 48, color: '#f59e0b', mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Lightning Fast
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
                  Quick setup and instant ticket generation
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Support sx={{ fontSize: 48, color: '#ef4444', mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  24/7 Support
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
                  Always here to help you succeed
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Card>

        {/* Plan Details Dialog */}
        <Dialog 
          open={openDetailsDialog} 
          onClose={() => setOpenDetailsDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {selectedPlan?.name} - Plan Details
            </Typography>
            <IconButton onClick={() => setOpenDetailsDialog(false)}>
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            {selectedPlan && (
              <Box>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                      Plan Information
                    </Typography>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
                          Duration
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {formatDuration(selectedPlan.durationInDays)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
                          Price
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                          ₹{selectedPlan.price.toLocaleString()}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
                          Ticket Allowance
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {selectedPlan.ticketAllowance || 'Unlimited'} tickets
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                      Features Included
                    </Typography>
                    <List dense>
                      {getFeaturesByPrice(selectedPlan.price).map((feature, index) => (
                        <ListItem key={index} sx={{ px: 0 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <CheckCircle sx={{ fontSize: 20, color: 'var(--color-success)' }} />
                          </ListItemIcon>
                          <ListItemText primary={feature} />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenDetailsDialog(false)}>
              Close
            </Button>
            <Button 
              variant="contained" 
              onClick={() => {
                setOpenDetailsDialog(false);
                handleSelectPlan(selectedPlan);
              }}
            >
              Choose This Plan
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}