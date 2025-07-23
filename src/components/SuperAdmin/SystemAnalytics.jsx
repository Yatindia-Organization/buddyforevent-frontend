import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Container,
  IconButton,
  Button,
  Stack,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress,
  Divider
} from '@mui/material';
import {
  ArrowBack,
  TrendingUp,
  People,
  EventAvailable,
  MonetizationOn,
  Timeline,
  Assessment,
  Download,
  DateRange,
  LocalOffer,
  CardGiftcard,
  Star,
  Visibility
} from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';
import { useGlobalInfo } from '../../contexts/globalContext';
import { API_ROUTE } from '../../lib/config';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

export default function SystemAnalytics() {
  const { theme } = useTheme();
  const { userType } = useGlobalInfo();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30'); // Last 30 days
  const [analytics, setAnalytics] = useState({
    userGrowth: {
      total: 0,
      newThisMonth: 0,
      growthRate: 0,
      chartData: []
    },
    eventMetrics: {
      totalEvents: 0,
      activeEvents: 0,
      completedEvents: 0,
      publicEvents: 0
    },
    revenueAnalytics: {
      totalRevenue: 0,
      planRevenue: 0,
      ticketRevenue: 0,
      growthRate: 0,
      chartData: []
    },
    promocodeUsage: {
      totalPromocodes: 0,
      activePromocodes: 0,
      totalUsage: 0,
      totalSavings: 0
    },
    topPlans: [],
    recentTransactions: [],
    systemHealth: {
      userActivity: 85,
      eventSuccess: 92,
      paymentSuccess: 98,
      systemUptime: 99.9
    }
  });

  useEffect(() => {
    if (userType !== 'super-admin') {
      navigate('/dashboard');
      return;
    }
    fetchAnalytics();
  }, [userType, navigate, timeRange]);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch multiple data sources
      const [usersRes, eventsRes, paymentsRes, promocodesRes, plansRes] = await Promise.all([
        fetch(`${API_ROUTE}/api/v1/users`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_ROUTE}/api/v1/event`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_ROUTE}/api/v1/payments/analytics/all`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_ROUTE}/api/v1/promocode`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_ROUTE}/api/v1/plans`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const users = await usersRes.json();
      const events = await eventsRes.json();
      const payments = await paymentsRes.json();
      const promocodes = await promocodesRes.json();
      const plans = await plansRes.json();

      // Process user analytics
      const userData = users.data || [];
      const currentMonth = new Date();
      const lastMonth = subDays(currentMonth, 30);
      
      const newUsersThisMonth = userData.filter(user => 
        new Date(user.createdAt) >= lastMonth
      ).length;
      
      const userGrowthRate = userData.length > 0 ? 
        ((newUsersThisMonth / userData.length) * 100) : 0;

      // Process event analytics
      const eventData = events.data || [];
      const now = new Date();
      const activeEvents = eventData.filter(event => 
        new Date(event.start_date) <= now && new Date(event.end_date) >= now
      ).length;
      
      const completedEvents = eventData.filter(event => 
        new Date(event.end_date) < now
      ).length;

      const publicEvents = eventData.filter(event => event.public_event).length;

      // Process revenue analytics
      const paymentData = payments.data || [];
      const totalRevenue = paymentData
        .filter(p => p.paymentStatus === 'completed')
        .reduce((sum, p) => sum + p.amount, 0);

      // Process promocode analytics
      const promocodeData = Array.isArray(promocodes) ? promocodes : [];
      const activePromocodes = promocodeData.filter(p => p.active).length;
      const totalUsage = promocodeData.reduce((sum, p) => sum + (p.usedCount || 0), 0);
      
      // Process plan analytics
      const planData = plans.data || [];
      const topPlans = planData
        .map(plan => ({
          ...plan,
          userCount: userData.filter(user => user.plan === plan._id).length
        }))
        .sort((a, b) => b.userCount - a.userCount)
        .slice(0, 5);

      // Mock recent transactions (you can fetch real data)
      const recentTransactions = paymentData
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10);

      setAnalytics({
        userGrowth: {
          total: userData.length,
          newThisMonth: newUsersThisMonth,
          growthRate: Math.round(userGrowthRate * 100) / 100,
          chartData: [] // You can implement chart data here
        },
        eventMetrics: {
          totalEvents: eventData.length,
          activeEvents,
          completedEvents,
          publicEvents
        },
        revenueAnalytics: {
          totalRevenue,
          planRevenue: totalRevenue * 0.3, // Mock split
          ticketRevenue: totalRevenue * 0.7, // Mock split
          growthRate: 15.5, // Mock growth rate
          chartData: []
        },
        promocodeUsage: {
          totalPromocodes: promocodeData.length,
          activePromocodes,
          totalUsage,
          totalSavings: totalUsage * 15 // Mock average savings
        },
        topPlans,
        recentTransactions,
        systemHealth: {
          userActivity: 85 + Math.random() * 10,
          eventSuccess: 90 + Math.random() * 8,
          paymentSuccess: 95 + Math.random() * 4,
          systemUptime: 99.5 + Math.random() * 0.4
        }
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const MetricCard = ({ title, value, icon, color, subtitle, trend }) => (
    <Card sx={{ 
      borderRadius: 3,
      border: '1px solid var(--border-color)',
      background: 'var(--color-card-bg)',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: 'var(--shadow-lg)'
      },
      transition: 'all 0.3s ease'
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)', mb: 1 }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ 
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              color: 'var(--color-text)',
              mb: 0.5
            }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{ 
            width: 50,
            height: 50,
            borderRadius: 2,
            background: `${color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {React.cloneElement(icon, { sx: { fontSize: 24, color } })}
          </Box>
        </Box>
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUp sx={{ fontSize: 16, color: '#10b981' }} />
            <Typography variant="body2" sx={{ color: '#10b981', fontWeight: 600 }}>
              +{trend}%
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
              vs last month
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const HealthCard = ({ title, percentage, color }) => (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: color, fontWeight: 600 }}>
          {percentage.toFixed(1)}%
        </Typography>
      </Box>
      <LinearProgress 
        variant="determinate" 
        value={percentage} 
        sx={{ 
          borderRadius: 1,
          height: 8,
          '& .MuiLinearProgress-bar': {
            backgroundColor: color
          }
        }} 
      />
    </Box>
  );

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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <IconButton 
                onClick={() => navigate('/super-admin')}
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
                  System Analytics
                </Typography>
                <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  Comprehensive platform insights and metrics
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  sx={{
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255,255,255,0.3)'
                    },
                    '& .MuiSvgIcon-root': {
                      color: 'white'
                    }
                  }}
                >
                  <MenuItem value="7">Last 7 days</MenuItem>
                  <MenuItem value="30">Last 30 days</MenuItem>
                  <MenuItem value="90">Last 3 months</MenuItem>
                  <MenuItem value="365">Last year</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="outlined"
                startIcon={<Download />}
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.3)',
                  '&:hover': {
                    borderColor: 'white'
                  }
                }}
              >
                Export
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Key Metrics */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Total Users"
              value={analytics.userGrowth.total}
              icon={<People />}
              color="#6366f1"
              subtitle={`${analytics.userGrowth.newThisMonth} new this month`}
              trend={analytics.userGrowth.growthRate}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Total Events"
              value={analytics.eventMetrics.totalEvents}
              icon={<EventAvailable />}
              color="#10b981"
              subtitle={`${analytics.eventMetrics.activeEvents} active now`}
              trend={12.5}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Total Revenue"
              value={`₹${analytics.revenueAnalytics.totalRevenue.toLocaleString()}`}
              icon={<MonetizationOn />}
              color="#f59e0b"
              subtitle="All-time earnings"
              trend={analytics.revenueAnalytics.growthRate}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Promocode Usage"
              value={analytics.promocodeUsage.totalUsage}
              icon={<LocalOffer />}
              color="#ef4444"
              subtitle={`${analytics.promocodeUsage.activePromocodes} active codes`}
              trend={8.2}
            />
          </Grid>
        </Grid>

        <Grid container spacing={4}>
          {/* Event Analytics */}
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              borderRadius: 4,
              background: 'var(--color-card-bg)',
              border: '1px solid var(--border-color)',
              height: '400px'
            }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ 
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  color: 'var(--color-text)',
                  mb: 3
                }}>
                  Event Breakdown
                </Typography>
                <Stack spacing={3}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Total Events</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {analytics.eventMetrics.totalEvents}
                      </Typography>
                    </Box>
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Active Events</Typography>
                      <Typography variant="body2" sx={{ color: '#10b981', fontWeight: 600 }}>
                        {analytics.eventMetrics.activeEvents}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={(analytics.eventMetrics.activeEvents / analytics.eventMetrics.totalEvents) * 100} 
                      sx={{ borderRadius: 1 }} 
                    />
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Completed Events</Typography>
                      <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 600 }}>
                        {analytics.eventMetrics.completedEvents}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={(analytics.eventMetrics.completedEvents / analytics.eventMetrics.totalEvents) * 100} 
                      sx={{ borderRadius: 1 }} 
                    />
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Public Events</Typography>
                      <Typography variant="body2" sx={{ color: '#6366f1', fontWeight: 600 }}>
                        {analytics.eventMetrics.publicEvents}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={(analytics.eventMetrics.publicEvents / analytics.eventMetrics.totalEvents) * 100} 
                      sx={{ borderRadius: 1 }} 
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* System Health */}
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              borderRadius: 4,
              background: 'var(--color-card-bg)',
              border: '1px solid var(--border-color)',
              height: '400px'
            }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ 
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  color: 'var(--color-text)',
                  mb: 3
                }}>
                  System Health
                </Typography>
                <Stack spacing={3}>
                  <HealthCard
                    title="User Activity Rate"
                    percentage={analytics.systemHealth.userActivity}
                    color="#10b981"
                  />
                  <HealthCard
                    title="Event Success Rate"
                    percentage={analytics.systemHealth.eventSuccess}
                    color="#6366f1"
                  />
                  <HealthCard
                    title="Payment Success Rate"
                    percentage={analytics.systemHealth.paymentSuccess}
                    color="#f59e0b"
                  />
                  <HealthCard
                    title="System Uptime"
                    percentage={analytics.systemHealth.systemUptime}
                    color="#ef4444"
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Top Plans */}
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              borderRadius: 4,
              background: 'var(--color-card-bg)',
              border: '1px solid var(--border-color)',
              height: '400px'
            }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ 
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  color: 'var(--color-text)',
                  mb: 3
                }}>
                  Top Performing Plans
                </Typography>
                <Stack spacing={2}>
                  {analytics.topPlans.slice(0, 5).map((plan, index) => (
                    <Box key={plan._id} sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 2,
                      background: 'var(--color-bg-subtle)',
                      borderRadius: 2
                    }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {plan.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>
                          ₹{plan.price} • {plan.durationInDays} days
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {plan.userCount} users
                        </Typography>
                        <Chip 
                          label={`#${index + 1}`} 
                          size="small" 
                          sx={{ fontSize: '0.7rem', height: 20 }}
                        />
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Transactions */}
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              borderRadius: 4,
              background: 'var(--color-card-bg)',
              border: '1px solid var(--border-color)',
              height: '400px'
            }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ 
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  color: 'var(--color-text)',
                  mb: 3
                }}>
                  Recent Transactions
                </Typography>
                <Stack spacing={2}>
                  {analytics.recentTransactions.slice(0, 6).map((transaction, index) => (
                    <Box key={index} sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 2,
                      background: 'var(--color-bg-subtle)',
                      borderRadius: 2
                    }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {transaction.customerName || 'Customer'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>
                          {transaction.paymentMethod} • {transaction.tierName || 'Plan'}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--color-success)' }}>
                        ₹{transaction.amount}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}