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
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  Menu,
  ListItemIcon,
  ListItemText,
  Divider,
  Tabs,
  Tab
} from '@mui/material';
import {
  ArrowBack,
  Add,
  Edit,
  Delete,
  MoreVert,
  LocalOffer,
  TrendingUp,
  People,
  EventAvailable,
  Visibility,
  Timeline,
  CheckCircle,
  Cancel,
  Schedule
} from '@mui/icons-material';
import { default as Copy } from '@mui/icons-material/ContentCopy';

import { useTheme } from '../../contexts/ThemeContext';
import { useGlobalInfo } from '../../contexts/globalContext';
import { API_ROUTE } from '../../lib/config';
import { format } from 'date-fns';

export default function PromocodeManagement() {
  const { theme } = useTheme();
  const { userType } = useGlobalInfo();
  const navigate = useNavigate();
  
  const [promocodes, setPromocodes] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('create');
  const [selectedPromocode, setSelectedPromocode] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [tabValue, setTabValue] = useState(0); // 0 = Plan Promocodes, 1 = Event Promocodes
  const [stats, setStats] = useState({
    totalPromocodes: 0,
    activePromocodes: 0,
    totalUsage: 0,
    totalSavings: 0
  });
  
  const [formData, setFormData] = useState({
    code: '',
    type: 'plan', // 'plan' or 'ticket'
    discount: 10,
    maxUsage: 1,
    eventId: '',
    expiresAt: '',
    active: true
  });

  useEffect(() => {
    if (userType !== 'super-admin') {
      navigate('/dashboard');
      return;
    }
    fetchPromocodes();
    fetchEvents();
    fetchStats();
  }, [userType, navigate]);

  const fetchPromocodes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ROUTE}/api/v1/promocode`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setPromocodes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching promocodes:', error);
      setPromocodes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ROUTE}/api/v1/event`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setEvents(data.data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchStats = async () => {
    try {
      // Calculate stats from promocodes
      const totalPromocodes = promocodes.length;
      const activePromocodes = promocodes.filter(p => p.active).length;
      const totalUsage = promocodes.reduce((sum, p) => sum + (p.usedCount || 0), 0);
      const totalSavings = promocodes.reduce((sum, p) => sum + (p.usedCount || 0) * (p.discount || 0), 0);

      setStats({
        totalPromocodes,
        activePromocodes,
        totalUsage,
        totalSavings
      });
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [promocodes]);

  const handleCreatePromocode = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      const promocodeData = {
        ...formData,
        createdBy: userId,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt) : null
      };

      const response = await fetch(`${API_ROUTE}/api/v1/promocode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(promocodeData)
      });
      
      if (response.ok) {
        fetchPromocodes();
        handleCloseDialog();
      }
    } catch (error) {
      console.error('Error creating promocode:', error);
    }
  };

  const handleUpdatePromocode = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const promocodeData = {
        ...formData,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt) : null
      };

      const response = await fetch(`${API_ROUTE}/api/v1/promocode/${selectedPromocode._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(promocodeData)
      });
      
      if (response.ok) {
        fetchPromocodes();
        handleCloseDialog();
      }
    } catch (error) {
      console.error('Error updating promocode:', error);
    }
  };

  const handleDeletePromocode = async (promocodeId) => {
    if (window.confirm('Are you sure you want to delete this promocode?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_ROUTE}/api/v1/promocode/${promocodeId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          fetchPromocodes();
        }
      } catch (error) {
        console.error('Error deleting promocode:', error);
      }
    }
  };

  const handleOpenDialog = (type, promocode = null) => {
    setDialogType(type);
    setSelectedPromocode(promocode);
    
    if (promocode && (type === 'edit' || type === 'view')) {
      setFormData({
        code: promocode.code || '',
        type: promocode.type || 'plan',
        discount: promocode.discount || 10,
        maxUsage: promocode.maxUsage || 1,
        eventId: promocode.eventId || '',
        expiresAt: promocode.expiresAt ? format(new Date(promocode.expiresAt), 'yyyy-MM-dd') : '',
        active: promocode.active !== undefined ? promocode.active : true
      });
    } else {
      setFormData({
        code: '',
        type: tabValue === 0 ? 'plan' : 'ticket',
        discount: 10,
        maxUsage: 1,
        eventId: '',
        expiresAt: '',
        active: true
      });
    }
    
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPromocode(null);
    setAnchorEl(null);
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    // You could show a snackbar here
  };

  const getStatusColor = (promocode) => {
    if (!promocode.active) return 'error';
    if (promocode.expiresAt && new Date(promocode.expiresAt) < new Date()) return 'warning';
    if (promocode.usedCount >= promocode.maxUsage) return 'secondary';
    return 'success';
  };

  const getStatusLabel = (promocode) => {
    if (!promocode.active) return 'Inactive';
    if (promocode.expiresAt && new Date(promocode.expiresAt) < new Date()) return 'Expired';
    if (promocode.usedCount >= promocode.maxUsage) return 'Used Up';
    return 'Active';
  };

  const filteredPromocodes = promocodes.filter(p => 
    tabValue === 0 ? p.type === 'plan' : p.type === 'ticket'
  );

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
                  Promocode Management
                </Typography>
                <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  Manage discounts for plans and events
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
              Create Promocode
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Stats Cards */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Promocodes"
              value={stats.totalPromocodes}
              icon={<LocalOffer />}
              color="#6366f1"
              subtitle="All promocodes"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active Promocodes"
              value={stats.activePromocodes}
              icon={<CheckCircle />}
              color="#10b981"
              subtitle="Currently available"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Usage"
              value={stats.totalUsage}
              icon={<Timeline />}
              color="#f59e0b"
              subtitle="Times used"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Savings"
              value={`${stats.totalSavings}%`}
              icon={<TrendingUp />}
              color="#ef4444"
              subtitle="Discount given"
            />
          </Grid>
        </Grid>

        {/* Tabs for Plan vs Event Promocodes */}
        <Card sx={{ 
          borderRadius: 4,
          background: 'var(--color-card-bg)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-lg)',
          mb: 4
        }}>
          <Tabs 
            value={tabValue} 
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{ borderBottom: '1px solid var(--border-color)' }}
          >
            <Tab 
              label={`Plan Promocodes (${promocodes.filter(p => p.type === 'plan').length})`}
              icon={<LocalOffer />}
              iconPosition="start"
            />
            <Tab 
              label={`Event Promocodes (${promocodes.filter(p => p.type === 'ticket').length})`}
              icon={<EventAvailable />}
              iconPosition="start"
            />
          </Tabs>
        </Card>

        {/* Promocodes Table */}
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
                {tabValue === 0 ? 'Plan Promocodes' : 'Event Promocodes'}
              </Typography>
              <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)', mt: 1 }}>
                {tabValue === 0 ? 'Discounts for plan purchases' : 'Discounts for event tickets'}
              </Typography>
            </Box>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: 'var(--color-bg-subtle)' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Code</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Discount</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Usage</TableCell>
                    {tabValue === 1 && <TableCell sx={{ fontWeight: 600 }}>Event</TableCell>}
                    <TableCell sx={{ fontWeight: 600 }}>Expires</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPromocodes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={tabValue === 1 ? 7 : 6} sx={{ textAlign: 'center', py: 6 }}>
                        <Typography variant="body1" sx={{ color: 'var(--color-text-secondary)' }}>
                          No {tabValue === 0 ? 'plan' : 'event'} promocodes created yet.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPromocodes.map((promocode) => (
                      <TableRow key={promocode._id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                              {promocode.code}
                            </Typography>
                            <IconButton 
                              size="small" 
                              onClick={() => handleCopyCode(promocode.code)}
                              sx={{ opacity: 0.7 }}
                            >
                              <Copy sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${promocode.discount}% OFF`}
                            size="small"
                            sx={{
                              background: '#10b98115',
                              color: '#10b981',
                              fontWeight: 600
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {promocode.usedCount || 0} / {promocode.maxUsage}
                          </Typography>
                        </TableCell>
                        {tabValue === 1 && (
                          <TableCell>
                            <Typography variant="body2">
                              {promocode.eventId ? 
                                events.find(e => e._id === promocode.eventId)?.name || 'Event Not Found' : 
                                'All Events'
                              }
                            </Typography>
                          </TableCell>
                        )}
                        <TableCell>
                          <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
                            {promocode.expiresAt ? 
                              format(new Date(promocode.expiresAt), 'MMM dd, yyyy') : 
                              'Never'
                            }
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(promocode)}
                            size="small"
                            color={getStatusColor(promocode)}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            onClick={(e) => {
                              setAnchorEl(e.currentTarget);
                              setSelectedPromocode(promocode);
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
          <MenuItem onClick={() => handleOpenDialog('view', selectedPromocode)}>
            <ListItemIcon><Visibility /></ListItemIcon>
            <ListItemText>View Details</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleOpenDialog('edit', selectedPromocode)}>
            <ListItemIcon><Edit /></ListItemIcon>
            <ListItemText>Edit Promocode</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleCopyCode(selectedPromocode?.code)}>
            <ListItemIcon><Copy /></ListItemIcon>
            <ListItemText>Copy Code</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => handleDeletePromocode(selectedPromocode?._id)}>
            <ListItemIcon><Delete /></ListItemIcon>
            <ListItemText>Delete Promocode</ListItemText>
          </MenuItem>
        </Menu>

        {/* Create/Edit Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {dialogType === 'create' && 'Create New Promocode'}
            {dialogType === 'edit' && 'Edit Promocode'}
            {dialogType === 'view' && 'Promocode Details'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Promocode"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  disabled={dialogType === 'view'}
                  placeholder="e.g. SAVE20, SUMMER2024"
                  helperText="Use uppercase letters and numbers"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    disabled={dialogType === 'view'}
                    label="Type"
                  >
                    <MenuItem value="plan">Plan Discount</MenuItem>
                    <MenuItem value="ticket">Event Ticket Discount</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Discount Percentage</InputLabel>
                  <Select
                    value={formData.discount}
                    onChange={(e) => setFormData({...formData, discount: e.target.value})}
                    disabled={dialogType === 'view'}
                    label="Discount Percentage"
                  >
                    {[2, 5, 10, 20, 30, 50, 65, 80, 90, 100].map(discount => (
                      <MenuItem key={discount} value={discount}>{discount}% OFF</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Maximum Usage"
                  type="number"
                  value={formData.maxUsage}
                  onChange={(e) => setFormData({...formData, maxUsage: parseInt(e.target.value)})}
                  disabled={dialogType === 'view'}
                  helperText="How many times this code can be used"
                />
              </Grid>
              {formData.type === 'ticket' && (
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Event (Optional)</InputLabel>
                    <Select
                      value={formData.eventId}
                      onChange={(e) => setFormData({...formData, eventId: e.target.value})}
                      disabled={dialogType === 'view'}
                      label="Event (Optional)"
                    >
                      <MenuItem value="">All Events</MenuItem>
                      {events.map(event => (
                        <MenuItem key={event._id} value={event._id}>
                          {event.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Expiry Date (Optional)"
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({...formData, expiresAt: e.target.value})}
                  disabled={dialogType === 'view'}
                  InputLabelProps={{ shrink: true }}
                  helperText="Leave empty for no expiry"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.active}
                      onChange={(e) => setFormData({...formData, active: e.target.checked})}
                      disabled={dialogType === 'view'}
                    />
                  }
                  label="Active"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleCloseDialog}>
              {dialogType === 'view' ? 'Close' : 'Cancel'}
            </Button>
            {dialogType !== 'view' && (
              <Button 
                variant="contained" 
                onClick={dialogType === 'create' ? handleCreatePromocode : handleUpdatePromocode}
              >
                {dialogType === 'create' ? 'Create Promocode' : 'Update Promocode'}
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}