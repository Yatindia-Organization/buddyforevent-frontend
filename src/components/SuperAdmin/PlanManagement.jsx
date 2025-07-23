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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  Alert,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  ArrowBack,
  Add,
  Edit,
  Delete,
  MoreVert,
  CardGiftcard,
  MonetizationOn,
  People,
  EventAvailable,
  Visibility,
  TrendingUp,
  LocalOffer,
  Star
} from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';
import { useGlobalInfo } from '../../contexts/globalContext';
import { API_ROUTE } from '../../lib/config';

export default function PlanManagement() {
  const { theme } = useTheme();
  const { userType } = useGlobalInfo();
  const navigate = useNavigate();
  
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('create'); // 'create', 'edit', 'view'
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [stats, setStats] = useState({
    totalPlans: 0,
    activePlans: 0,
    totalRevenue: 0,
    usersWithPlans: 0
  });
  
  const [formData, setFormData] = useState({
    name: '',
    durationInDays: '',
    price: '',
    description: '',
    ticketAllowance: 100 // Default ticket allowance
  });

  useEffect(() => {
    if (userType !== 'super-admin') {
      navigate('/dashboard');
      return;
    }
    fetchPlans();
    fetchStats();
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

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const [usersRes, planOrdersRes] = await Promise.all([
        fetch(`${API_ROUTE}/api/v1/users`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_ROUTE}/api/v1/plan-orders/revenue`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const usersData = await usersRes.json();
      const revenueData = await planOrdersRes.json();

      const users = usersData.data || [];
      const usersWithPlans = users.filter(user => user.plan).length;

      setStats({
        totalPlans: plans.length,
        activePlans: plans.length, // Assuming all plans are active for now
        totalRevenue: revenueData.totalRevenue || 0,
        usersWithPlans
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleCreatePlan = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      const planData = {
        ...formData,
        durationInDays: parseInt(formData.durationInDays),
        price: parseFloat(formData.price),
        createdBy: userId
      };

      const response = await fetch(`${API_ROUTE}/api/v1/plans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(planData)
      });
      
      if (response.ok) {
        fetchPlans();
        fetchStats();
        handleCloseDialog();
      }
    } catch (error) {
      console.error('Error creating plan:', error);
    }
  };

  const handleUpdatePlan = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const planData = {
        ...formData,
        durationInDays: parseInt(formData.durationInDays),
        price: parseFloat(formData.price)
      };

      const response = await fetch(`${API_ROUTE}/api/v1/plans/${selectedPlan._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(planData)
      });
      
      if (response.ok) {
        fetchPlans();
        fetchStats();
        handleCloseDialog();
      }
    } catch (error) {
      console.error('Error updating plan:', error);
    }
  };

  const handleDeletePlan = async (planId) => {
    if (window.confirm('Are you sure you want to delete this plan? This will affect users who have this plan.')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_ROUTE}/api/v1/plans/${planId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          fetchPlans();
          fetchStats();
        }
      } catch (error) {
        console.error('Error deleting plan:', error);
      }
    }
  };

  const handleOpenDialog = (type, plan = null) => {
    setDialogType(type);
    setSelectedPlan(plan);
    
    if (plan && (type === 'edit' || type === 'view')) {
      setFormData({
        name: plan.name || '',
        durationInDays: plan.durationInDays || '',
        price: plan.price || '',
        description: plan.description || '',
        ticketAllowance: plan.ticketAllowance || 100
      });
    } else {
      setFormData({
        name: '',
        durationInDays: '',
        price: '',
        description: '',
        ticketAllowance: 100
      });
    }
    
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPlan(null);
    setAnchorEl(null);
  };

  const formatDuration = (days) => {
    if (days >= 365) return `${Math.floor(days / 365)} year${Math.floor(days / 365) > 1 ? 's' : ''}`;
    if (days >= 30) return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''}`;
    return `${days} day${days > 1 ? 's' : ''}`;
  };

  const getPlanColor = (price) => {
    if (price <= 1000) return '#10b981'; // Green for basic
    if (price <= 5000) return '#6366f1'; // Blue for standard  
    return '#f59e0b'; // Orange for premium
  };

  const StatCard = ({ title, value, icon, color, subtitle }) => (
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
      <CardContent sx={{ textAlign: 'center', py: 3 }}>
        <Box sx={{ 
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: `${color}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 2
        }}>
          {React.cloneElement(icon, { sx: { fontSize: 32, color } })}
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: 'var(--color-text)' }}>
          {value}
        </Typography>
        <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

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
                  Plan Management
                </Typography>
                <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  Create and manage ticket allowance plans
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog('create')}
              sx={{
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                fontWeight: 600,
                '&:hover': {
                  background: 'rgba(255,255,255,0.3)'
                }
              }}
            >
              Create Plan
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Stats Cards */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Plans"
              value={stats.totalPlans}
              icon={<CardGiftcard />}
              color="#6366f1"
              subtitle="Available plans"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active Plans"
              value={stats.activePlans}
              icon={<Star />}
              color="#10b981"
              subtitle="Currently offered"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Plan Revenue"
              value={`₹${stats.totalRevenue.toLocaleString()}`}
              icon={<MonetizationOn />}
              color="#f59e0b"
              subtitle="Total earnings"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Users with Plans"
              value={stats.usersWithPlans}
              icon={<People />}
              color="#ef4444"
              subtitle="Active subscribers"
            />
          </Grid>
        </Grid>

        {/* Plans Table */}
        <Card sx={{ 
          borderRadius: 4,
          background: 'var(--color-card-bg)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 4, pb: 2 }}>
              <Typography variant="h5" sx={{ 
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                color: 'var(--color-text)'
              }}>
                All Plans
              </Typography>
            </Box>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: 'var(--color-bg-subtle)' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Plan Details</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Duration</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Price</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Ticket Allowance</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {plans.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ textAlign: 'center', py: 6 }}>
                        <Typography variant="body1" sx={{ color: 'var(--color-text-secondary)' }}>
                          No plans created yet. Create your first plan to get started.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    plans.map((plan) => (
                      <TableRow key={plan._id} hover>
                        <TableCell>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                              {plan.name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
                              {plan.description || 'No description'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDuration(plan.durationInDays)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body1" sx={{ 
                            fontWeight: 600,
                            color: getPlanColor(plan.price)
                          }}>
                            ₹{plan.price.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${plan.ticketAllowance || 'Unlimited'} tickets`}
                            size="small"
                            sx={{
                              background: '#10b98115',
                              color: '#10b981',
                              fontWeight: 600
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label="Active"
                            size="small"
                            color="success"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            onClick={(e) => {
                              setAnchorEl(e.currentTarget);
                              setSelectedPlan(plan);
                            }}
                          >
                            <MoreVert />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Actions Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem onClick={() => handleOpenDialog('view', selectedPlan)}>
            <ListItemIcon><Visibility /></ListItemIcon>
            <ListItemText>View Details</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleOpenDialog('edit', selectedPlan)}>
            <ListItemIcon><Edit /></ListItemIcon>
            <ListItemText>Edit Plan</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => handleDeletePlan(selectedPlan?._id)}>
            <ListItemIcon><Delete /></ListItemIcon>
            <ListItemText>Delete Plan</ListItemText>
          </MenuItem>
        </Menu>

        {/* Create/Edit Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {dialogType === 'create' && 'Create New Plan'}
            {dialogType === 'edit' && 'Edit Plan'}
            {dialogType === 'view' && 'Plan Details'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Plan Name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  disabled={dialogType === 'view'}
                  placeholder="e.g. Basic Plan, Premium Plan"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Duration (Days)"
                  type="number"
                  value={formData.durationInDays}
                  onChange={(e) => setFormData({...formData, durationInDays: e.target.value})}
                  disabled={dialogType === 'view'}
                  placeholder="e.g. 30, 365"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Price</InputLabel>
                  <OutlinedInput
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    disabled={dialogType === 'view'}
                    startAdornment={<InputAdornment position="start">₹</InputAdornment>}
                    label="Price"
                    type="number"
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Ticket Allowance"
                  type="number"
                  value={formData.ticketAllowance}
                  onChange={(e) => setFormData({...formData, ticketAllowance: e.target.value})}
                  disabled={dialogType === 'view'}
                  placeholder="Number of tickets users can sell"
                  helperText="How many tickets can be sold with this plan"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  disabled={dialogType === 'view'}
                  placeholder="Describe what this plan offers..."
                />
              </Grid>
              
              {dialogType === 'view' && selectedPlan && (
                <Grid item xs={12}>
                  <Alert severity="info" sx={{ mt: 2 }}>
                    This plan allows users to sell up to {formData.ticketAllowance} tickets 
                    over a {formatDuration(formData.durationInDays)} period.
                  </Alert>
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleCloseDialog}>
              {dialogType === 'view' ? 'Close' : 'Cancel'}
            </Button>
            {dialogType !== 'view' && (
              <Button 
                variant="contained" 
                onClick={dialogType === 'create' ? handleCreatePlan : handleUpdatePlan}
              >
                {dialogType === 'create' ? 'Create Plan' : 'Update Plan'}
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}