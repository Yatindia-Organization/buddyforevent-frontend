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
  Avatar,
  Divider,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  Dashboard,
  People,
  Event,
  Payment,
  TrendingUp,
  Settings,
  Add,
  VerifiedUser,
  MonetizationOn,
  EventAvailable,
  CardGiftcard,
  ArrowForward,
  Warning
} from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';
import { useGlobalInfo } from '../../contexts/globalContext';
import { API_ROUTE } from '../../lib/config';

export default function SuperAdminDashboard() {
  const { theme } = useTheme();
  const { userType } = useGlobalInfo();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    totalRevenue: 0,
    totalPlans: 0,
    activePromocodes: 0,
    recentPayments: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userType !== 'super-admin') {
      navigate('/dashboard');
      return;
    }
    fetchDashboardStats();
  }, [userType, navigate]);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch multiple endpoints for dashboard data
      const [usersRes, eventsRes, paymentsRes, plansRes, promocodesRes] = await Promise.all([
        fetch(`${API_ROUTE}/api/v1/users`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_ROUTE}/api/v1/event`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_ROUTE}/api/v1/payments/analytics/all`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_ROUTE}/api/v1/plans`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_ROUTE}/api/v1/promocode`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const usersData = await usersRes.json();
      const eventsData = await eventsRes.json();
      const paymentsData = await paymentsRes.json();
      const plansData = await plansRes.json();
      const promocodesData = await promocodesRes.json();

      setStats({
        totalUsers: usersData.data?.length || 0,
        totalEvents: eventsData.data?.length || 0,
        totalRevenue: paymentsData.totalRevenue || 0,
        totalPlans: plansData.data?.length || 0,
        activePromocodes: promocodesData.filter(p => p.active).length || 0,
        recentPayments: paymentsData.recentPayments?.slice(0, 5) || []
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };
    const handleLogout = () => {
    localStorage.clear();
    context.changeLoginFlow(false);
    context.changeUserId(null);
    context.changeUserType(null);
    navigate("/login");
  };

  const quickActions = [
    { label: 'Manage Users', icon: <People />, path: '/super-admin/users', color: '#6366f1' },
    { label: 'Manage Plans', icon: <CardGiftcard />, path: '/super-admin/plans', color: '#10b981' },
    { label: 'Promocodes', icon: <MonetizationOn />, path: '/super-admin/promocodes', color: '#f59e0b' },
    { label: 'Analytics', icon: <TrendingUp />, path: '/super-admin/analytics', color: '#ef4444' }
  ];

  const StatCard = ({ title, value, icon, color, subtitle, action }) => (
    <Card sx={{ 
      height: '100%',
      borderRadius: 3,
      background: 'var(--color-card-bg)',
      border: '1px solid var(--border-color)',
      position: 'relative',
      overflow: 'hidden',
      '&:hover': {
        transform: 'translateY(-4px)',
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
              color: 'var(--color-text)'
            }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ 
            background: `${color}15`,
            color: color,
            width: 56,
            height: 56
          }}>
            {icon}
          </Avatar>
        </Box>
        {action && (
          <Button
            size="small"
            endIcon={<ArrowForward />}
            onClick={action.onClick}
            sx={{
              color: color,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
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
            <Box>
              <Typography variant="h3" sx={{ 
                color: 'white', 
                fontFamily: 'var(--font-heading)',
                fontWeight: 800,
                mb: 1
              }}>
                Super Admin Dashboard
              </Typography>
              <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                System Overview & Management
              </Typography>
            </Box>
            <Chip
              icon={<VerifiedUser />}
              label="Super Admin"
              sx={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontWeight: 600,
                backdropFilter: 'blur(10px)'
              }}
            />
                    <button
        onClick={handleLogout}
        className="mt-6 w-1/6 bg-red-600 hover:bg-red-700 text-white py-2 rounded"
      >
        Logout
      </button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Alert for low plan usage */}
        <Alert 
          severity="info" 
          sx={{ mb: 4, borderRadius: 2 }}
          icon={<Warning />}
        >
          <Typography variant="body2">
            Monitor user plan consumption and system health from this central dashboard.
          </Typography>
        </Alert>

        {/* Stats Grid */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              icon={<People />}
              color="#6366f1"
              subtitle="Registered accounts"
              action={{
                label: "Manage",
                onClick: () => navigate('/super-admin/users')
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active Events"
              value={stats.totalEvents}
              icon={<EventAvailable />}
              color="#10b981"
              subtitle="Platform-wide"
              action={{
                label: "View All",
                onClick: () => navigate('/super-admin/events')
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Revenue"
              value={`₹${stats.totalRevenue.toLocaleString()}`}
              icon={<MonetizationOn />}
              color="#f59e0b"
              subtitle="All-time earnings"
              action={{
                label: "Analytics",
                onClick: () => navigate('/super-admin/analytics')
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active Plans"
              value={stats.totalPlans}
              icon={<CardGiftcard />}
              color="#ef4444"
              subtitle={`${stats.activePromocodes} promocodes`}
              action={{
                label: "Manage",
                onClick: () => navigate('/super-admin/plans')
              }}
            />
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Card sx={{ 
          borderRadius: 4,
          background: 'var(--color-card-bg)',
          border: '1px solid var(--border-color)',
          mb: 6
        }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ 
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              color: 'var(--color-text)',
              mb: 3
            }}>
              Quick Actions
            </Typography>
            <Grid container spacing={3}>
              {quickActions.map((action, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={action.icon}
                    onClick={() => navigate(action.path)}
                    sx={{
                      py: 2,
                      borderColor: action.color,
                      color: action.color,
                      textTransform: 'none',
                      fontWeight: 600,
                      '&:hover': {
                        background: `${action.color}10`,
                        borderColor: action.color
                      }
                    }}
                  >
                    {action.label}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
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
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">User Growth</Typography>
                      <Typography variant="body2" sx={{ color: 'var(--color-success)' }}>+12%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={75} sx={{ borderRadius: 1 }} />
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Event Activity</Typography>
                      <Typography variant="body2" sx={{ color: 'var(--color-success)' }}>+8%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={60} sx={{ borderRadius: 1 }} />
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Revenue Growth</Typography>
                      <Typography variant="body2" sx={{ color: 'var(--color-success)' }}>+25%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={85} sx={{ borderRadius: 1 }} />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
               
            