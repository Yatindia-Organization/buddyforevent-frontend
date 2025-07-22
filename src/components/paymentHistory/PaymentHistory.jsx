import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Select,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Chip,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Alert,
  Snackbar,
  Backdrop,
  CircularProgress,
  FormControlLabel,
  Radio,
  RadioGroup,
  Divider
} from '@mui/material';
import {
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
  Receipt as ReceiptIcon,
  Analytics as AnalyticsIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';

// Mock API configuration - replace with your actual API
const API_ROUTE = 'http://localhost:5000';

// Mock data for development
const mockPayments = [
  {
    _id: '1',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    customerPhone: '+91-9876543210',
    tierName: 'Premium',
    amount: 500,
    quantity: 1,
    paymentStatus: 'completed',
    paymentMethod: 'cash',
    createdAt: '2024-01-15T10:30:00Z',
    eventId: { _id: 'event1', name: 'Tech Conference 2024' },
    userSubmissionId: 'sub1',
    notes: 'VIP access included'
  },
  {
    _id: '2',
    customerName: 'Jane Smith',
    customerEmail: 'jane@example.com',
    customerPhone: '+91-9876543211',
    tierName: 'Standard',
    amount: 600,
    quantity: 2,
    paymentStatus: 'pending',
    paymentMethod: 'online',
    createdAt: '2024-01-14T15:45:00Z',
    eventId: { _id: 'event1', name: 'Music Festival' },
    userSubmissionId: 'sub2',
    notes: 'Group booking'
  },
  {
    _id: '3',
    customerName: 'Mike Johnson',
    customerEmail: 'mike@example.com',
    customerPhone: '+91-9876543212',
    tierName: 'Basic',
    amount: 200,
    quantity: 1,
    paymentStatus: 'failed',
    paymentMethod: 'card',
    createdAt: '2024-01-13T09:15:00Z',
    eventId: { _id: 'event1', name: 'Workshop Series' },
    userSubmissionId: 'sub3',
    notes: 'Payment declined'
  }
];

const mockAnalytics = {
  summary: {
    totalPayments: 150,
    totalTickets: 200,
    totalRevenue: 75000,
    completedPayments: 140,
    completedRevenue: 70000
  },
  analytics: [
    {
      _id: 'Premium',
      totalTickets: 50,
      totalRevenue: 25000,
      stats: [{ status: 'completed', count: 45, revenue: 22500 }]
    },
    {
      _id: 'Standard',
      totalTickets: 100,
      totalRevenue: 30000,
      stats: [{ status: 'completed', count: 95, revenue: 28500 }]
    },
    {
      _id: 'Basic',
      totalTickets: 50,
      totalRevenue: 20000,
      stats: [{ status: 'completed', count: 40, revenue: 18000 }]
    }
  ]
};

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`payment-tabpanel-${index}`}
      aria-labelledby={`payment-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function PaymentManagement() {
  const [activeTab, setActiveTab] = useState(0);
  const [payments, setPayments] = useState(mockPayments);
  const [analytics, setAnalytics] = useState(mockAnalytics);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState(''); // 'view', 'edit', 'create'
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Form states
  const [paymentForm, setPaymentForm] = useState({
    eventId: '',
    userSubmissionId: '',
    tierName: '',
    amount: '',
    customerEmail: '',
    customerPhone: '',
    customerName: '',
    paymentMethod: 'cash',
    notes: ''
  });

  // This would come from your global context
  const eventId = 'mock-event-id';

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const filteredPayments = payments.filter(payment => {
    if (filter === 'all') return true;
    return payment.paymentStatus === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      case 'refunded': return 'info';
      default: return 'default';
    }
  };

  const openDialog = (type, payment = null) => {
    setDialogType(type);
    setSelectedPayment(payment);
    if (payment) {
      setPaymentForm({
        eventId: payment.eventId._id || '',
        userSubmissionId: payment.userSubmissionId || '',
        tierName: payment.tierName || '',
        amount: payment.amount || '',
        customerEmail: payment.customerEmail || '',
        customerPhone: payment.customerPhone || '',
        customerName: payment.customerName || '',
        paymentMethod: payment.paymentMethod || 'cash',
        notes: payment.notes || ''
      });
    } else {
      setPaymentForm({
        eventId: eventId,
        userSubmissionId: '',
        tierName: '',
        amount: '',
        customerEmail: '',
        customerPhone: '',
        customerName: '',
        paymentMethod: 'cash',
        notes: ''
      });
    }
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedPayment(null);
    setDialogType('');
  };

  const handleFormChange = (field, value) => {
    setPaymentForm(prev => ({ ...prev, [field]: value }));
  };

  const handleCreatePayment = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ROUTE}/api/v1/payments/single`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(paymentForm),
      });
      
      if (response.ok) {
        showSnackbar('Payment created successfully!');
        // Refresh payments list
        loadPayments();
        closeDialog();
      } else {
        throw new Error('Failed to create payment');
      }
    } catch (error) {
      showSnackbar(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePaymentStatus = async (paymentId, newStatus) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ROUTE}/api/v1/payments/${paymentId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        setPayments(prev => prev.map(p => 
          p._id === paymentId ? { ...p, paymentStatus: newStatus } : p
        ));
        showSnackbar('Payment status updated successfully!');
      } else {
        throw new Error('Failed to update payment status');
      }
    } catch (error) {
      showSnackbar(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadPayments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ROUTE}/api/v1/payments/event/${eventId}?page=${page}&limit=${limit}`,
 {
   headers: {
     'Authorization': `Bearer ${token}`
   }
 });
      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments);
      }
    } catch (error) {
      console.error('Failed to load payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ROUTE}/api/v1/payments/analytics/${eventId}`,
 {
   headers: {
     'Authorization': `Bearer ${token}`
   }
 });
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  useEffect(() => {
    // In real app, load data from API
    // loadPayments();
    // loadAnalytics();
  }, [eventId, page, limit]);

  return (
    <Box sx={{ 
      p: 4, 
      bgcolor: 'var(--color-bg)', 
      minHeight: '100vh',
      color: 'var(--color-text)'
    }}>
      <Backdrop open={loading} sx={{ zIndex: 999 }}>
        <CircularProgress color="inherit" />
      </Backdrop>

      <Typography 
        variant="h4" 
        sx={{ 
          fontWeight: 'bold', 
          mb: 3, 
          color: 'var(--color-text)',
          fontFamily: 'var(--font-heading)'
        }}
      >
        PAYMENT MANAGEMENT
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'var(--color-text-secondary)', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="PAYMENTS" icon={<ReceiptIcon />} />
          <Tab label="ANALYTICS" icon={<AnalyticsIcon />} />
          <Tab label="BULK PAYMENTS" icon={<PeopleIcon />} />
        </Tabs>
      </Box>

      {/* Tab 1: Payments List */}
      <TabPanel value={activeTab} index={0}>
        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              bgcolor: 'var(--color-card-bg)',
              border: '1px solid var(--color-primary)',
              borderLeft: '4px solid #10b981'
            }}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ color: 'var(--color-text-secondary)' }}>
                  TOTAL REVENUE
                </Typography>
                <Typography variant="h5" sx={{ 
                  color: '#10b981', 
                  fontWeight: 'bold',
                  fontFamily: 'var(--font-heading)'
                }}>
                  ₹{analytics.summary?.completedRevenue?.toLocaleString() || '0'}
                </Typography>
                <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>
                  From {analytics.summary?.completedPayments || 0} completed payments
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              bgcolor: 'var(--color-card-bg)',
              border: '1px solid var(--color-primary)',
              borderLeft: '4px solid #f59e0b'
            }}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ color: 'var(--color-text-secondary)' }}>
                  PENDING AMOUNT
                </Typography>
                <Typography variant="h5" sx={{ 
                  color: '#f59e0b', 
                  fontWeight: 'bold',
                  fontFamily: 'var(--font-heading)'
                }}>
                  ₹{((analytics.summary?.totalRevenue || 0) - (analytics.summary?.completedRevenue || 0)).toLocaleString()}
                </Typography>
                <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>
                  From {(analytics.summary?.totalPayments || 0) - (analytics.summary?.completedPayments || 0)} pending payments
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'var(--color-card-bg)' }}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ color: 'var(--color-text-secondary)' }}>
                  TOTAL TICKETS
                </Typography>
                <Typography variant="h5" sx={{ 
                  fontWeight: 'bold',
                  color: 'var(--color-text)',
                  fontFamily: 'var(--font-heading)'
                }}>
                  {analytics.summary?.totalTickets || 0}
                </Typography>
                <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>
                  Across all tiers
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'var(--color-card-bg)' }}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ color: 'var(--color-text-secondary)' }}>
                  TOTAL PAYMENTS
                </Typography>
                <Typography variant="h5" sx={{ 
                  fontWeight: 'bold',
                  color: 'var(--color-text)',
                  fontFamily: 'var(--font-heading)'
                }}>
                  {analytics.summary?.totalPayments || 0}
                </Typography>
                <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>
                  All payment records
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Controls */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="subtitle1" sx={{ 
              mb: 1, 
              fontWeight: 'bold',
              color: 'var(--color-text)'
            }}>
              PAYMENT HISTORY
            </Typography>
            <ToggleButtonGroup
              value={filter}
              exclusive
              onChange={(e, val) => val && setFilter(val)}
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  color: 'var(--color-text)',
                  borderColor: 'var(--color-text-secondary)',
                  '&.Mui-selected': {
                    backgroundColor: 'var(--color-primary)',
                    color: '#fff',
                  },
                },
              }}
            >
              <ToggleButton value="all">ALL</ToggleButton>
              <ToggleButton value="completed">COMPLETED</ToggleButton>
              <ToggleButton value="pending">PENDING</ToggleButton>
              <ToggleButton value="failed">FAILED</ToggleButton>
              <ToggleButton value="refunded">REFUNDED</ToggleButton>
            </ToggleButtonGroup>
          </Box>
          {/* <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => openDialog('create')}
            sx={{ 
              textTransform: 'uppercase',
              backgroundColor: 'var(--color-primary)',
              '&:hover': {
                backgroundColor: 'var(--color-primary-hover)',
              }
            }}
          >
            Create Payment
          </Button> */}
        </Box>

        {/* Payments Table */}
        <TableContainer component={Paper} sx={{ bgcolor: 'var(--color-card-bg)' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: 'var(--color-text)', fontWeight: 'bold' }}>CUSTOMER</TableCell>
                <TableCell sx={{ color: 'var(--color-text)', fontWeight: 'bold' }}>EVENT</TableCell>
                <TableCell sx={{ color: 'var(--color-text)', fontWeight: 'bold' }}>TIER</TableCell>
                <TableCell sx={{ color: 'var(--color-text)', fontWeight: 'bold' }}>AMOUNT</TableCell>
                <TableCell sx={{ color: 'var(--color-text)', fontWeight: 'bold' }}>QUANTITY</TableCell>
                <TableCell sx={{ color: 'var(--color-text)', fontWeight: 'bold' }}>METHOD</TableCell>
                <TableCell sx={{ color: 'var(--color-text)', fontWeight: 'bold' }}>STATUS</TableCell>
                <TableCell sx={{ color: 'var(--color-text)', fontWeight: 'bold' }}>DATE</TableCell>
                <TableCell sx={{ color: 'var(--color-text)', fontWeight: 'bold' }}>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment._id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ 
                        fontWeight: 'bold',
                        color: 'var(--color-text)'
                      }}>
                        {payment.customerName.toUpperCase()}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>
                        {payment.customerEmail}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: 'var(--color-text)' }}>
                    {payment.eventId?.name || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={payment.tierName.toUpperCase()} 
                      size="small"
                      sx={{ 
                        backgroundColor: 'var(--color-primary)',
                        color: '#fff'
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 'bold',
                    color: 'var(--color-text)'
                  }}>
                    ₹{payment.amount}
                  </TableCell>
                  <TableCell sx={{ color: 'var(--color-text)' }}>
                    {payment.quantity || 1}
                  </TableCell>
                  <TableCell sx={{ color: 'var(--color-text)' }}>
                    {payment.paymentMethod.toUpperCase()}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={payment.paymentStatus.toUpperCase()}
                      color={getStatusColor(payment.paymentStatus)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell sx={{ color: 'var(--color-text)' }}>
                    {new Date(payment.createdAt).toLocaleDateString('en-IN')}
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      size="small" 
                      onClick={() => openDialog('view', payment)}
                      title="View Details"
                      sx={{ color: 'var(--color-primary)' }}
                    >
                      <ViewIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => openDialog('edit', payment)}
                      title="Edit Payment"
                      sx={{ color: 'var(--color-text-secondary)' }}
                    >
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mt={2}>
          <Box display="flex" alignItems="center">
            <Select 
              size="small" 
              value={limit} 
              onChange={(e) => setLimit(e.target.value)}
              sx={{ color: 'var(--color-text)' }}
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
              <MenuItem value={50}>50</MenuItem>
            </Select>
            <Typography variant="body2" sx={{ ml: 1, color: 'var(--color-text)' }}>
              per page
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" sx={{ color: 'var(--color-text)' }}>
              Page {page} of 1
            </Typography>
            <Button 
              size="small" 
              onClick={() => setPage(Math.max(1, page - 1))}
              sx={{ color: 'var(--color-primary)' }}
            >
              {'<'}
            </Button>
            <Button 
              size="small" 
              onClick={() => setPage(page + 1)}
              sx={{ color: 'var(--color-primary)' }}
            >
              {'>'}
            </Button>
          </Box>
        </Box>
      </TabPanel>

      {/* Tab 2: Analytics */}
      <TabPanel value={activeTab} index={1}>
        <Grid container spacing={3}>
          {analytics.analytics?.map((tier) => (
            <Grid item xs={12} md={6} key={tier._id}>
              <Card sx={{ bgcolor: 'var(--color-card-bg)' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ 
                    color: 'var(--color-text)',
                    fontFamily: 'var(--font-heading)'
                  }}>
                    {tier._id.toUpperCase()} TIER
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
                      Total Tickets: {tier.totalTickets}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
                      Total Revenue: ₹{tier.totalRevenue?.toLocaleString()}
                    </Typography>
                  </Box>
                  {tier.stats?.map((stat, index) => (
                    <Box key={index} sx={{ mt: 1 }}>
                      <Chip 
                        label={`${stat.status.toUpperCase()}: ${stat.count} tickets (₹${stat.revenue?.toLocaleString()})`}
                        color={getStatusColor(stat.status)}
                        size="small"
                      />
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Tab 3: Bulk Payments */}
      <TabPanel value={activeTab} index={2}>
        <Alert severity="info" sx={{ mb: 3 }}>
          Bulk payment feature allows you to create multiple tickets at once for group bookings.
        </Alert>
        <Button 
          variant="contained" 
          startIcon={<PeopleIcon />}
          sx={{ 
            backgroundColor: 'var(--color-primary)',
            '&:hover': {
              backgroundColor: 'var(--color-primary-hover)',
            }
          }}
        >
          CREATE BULK PAYMENT
        </Button>
      </TabPanel>

      {/* Payment Dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ color: 'var(--color-text)', bgcolor: 'var(--color-card-bg)' }}>
          {dialogType === 'create' ? 'CREATE PAYMENT' : 
           dialogType === 'edit' ? 'EDIT PAYMENT' : 'PAYMENT DETAILS'}
        </DialogTitle>
        <DialogContent sx={{ bgcolor: 'var(--color-card-bg)' }}>
          {dialogType === 'view' && selectedPayment ? (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" sx={{ color: 'var(--color-text-secondary)' }}>
                    Customer Name
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'var(--color-text)' }}>
                    {selectedPayment.customerName}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" sx={{ color: 'var(--color-text-secondary)' }}>
                    Email
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'var(--color-text)' }}>
                    {selectedPayment.customerEmail}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" sx={{ color: 'var(--color-text-secondary)' }}>
                    Phone
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'var(--color-text)' }}>
                    {selectedPayment.customerPhone}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" sx={{ color: 'var(--color-text-secondary)' }}>
                    Tier
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'var(--color-text)' }}>
                    {selectedPayment.tierName}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" sx={{ color: 'var(--color-text-secondary)' }}>
                    Amount
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'var(--color-text)' }}>
                    ₹{selectedPayment.amount}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" sx={{ color: 'var(--color-text-secondary)' }}>
                    Status
                  </Typography>
                  <Chip 
                    label={selectedPayment.paymentStatus.toUpperCase()}
                    color={getStatusColor(selectedPayment.paymentStatus)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" sx={{ color: 'var(--color-text-secondary)' }}>
                    Method
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'var(--color-text)' }}>
                    {selectedPayment.paymentMethod}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" sx={{ color: 'var(--color-text-secondary)' }}>
                    Quantity
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'var(--color-text)' }}>
                    {selectedPayment.quantity || 1}
                  </Typography>
                </Grid>
                {selectedPayment.notes && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ color: 'var(--color-text-secondary)' }}>
                      Notes
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'var(--color-text)' }}>
                      {selectedPayment.notes}
                    </Typography>
                  </Grid>
                )}
              </Grid>
              
              {selectedPayment.paymentStatus === 'pending' && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ color: 'var(--color-text)' }}>
                    Update Status
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button 
                      variant="outlined" 
                      color="success"
                      onClick={() => handleUpdatePaymentStatus(selectedPayment._id, 'completed')}
                    >
                      Mark Completed
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="error"
                      onClick={() => handleUpdatePaymentStatus(selectedPayment._id, 'failed')}
                    >
                      Mark Failed
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
          ) : (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Customer Name"
                    value={paymentForm.customerName}
                    onChange={(e) => handleFormChange('customerName', e.target.value)}
                    required
                    sx={{ 
                      '& .MuiInputLabel-root': { color: 'var(--color-text-secondary)' },
                      '& .MuiOutlinedInput-root': { color: 'var(--color-text)' }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Customer Email"
                    type="email"
                    value={paymentForm.customerEmail}
                    onChange={(e) => handleFormChange('customerEmail', e.target.value)}
                    required
                    sx={{ 
                      '& .MuiInputLabel-root': { color: 'var(--color-text-secondary)' },
                      '& .MuiOutlinedInput-root': { color: 'var(--color-text)' }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Customer Phone"
                    value={paymentForm.customerPhone}
                    onChange={(e) => handleFormChange('customerPhone', e.target.value)}
                    required
                    sx={{ 
                      '& .MuiInputLabel-root': { color: 'var(--color-text-secondary)' },
                      '& .MuiOutlinedInput-root': { color: 'var(--color-text)' }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel sx={{ color: 'var(--color-text-secondary)' }}>Tier Name</InputLabel>
                    <Select
                      value={paymentForm.tierName}
                      onChange={(e) => handleFormChange('tierName', e.target.value)}
                      sx={{ color: 'var(--color-text)' }}
                    >
                      <MenuItem value="Premium">Premium</MenuItem>
                      <MenuItem value="Standard">Standard</MenuItem>
                      <MenuItem value="Basic">Basic</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Amount"
                    type="number"
                    value={paymentForm.amount}
                    onChange={(e) => handleFormChange('amount', e.target.value)}
                    required
                    sx={{ 
                      '& .MuiInputLabel-root': { color: 'var(--color-text-secondary)' },
                      '& .MuiOutlinedInput-root': { color: 'var(--color-text)' }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="User Submission ID"
                    value={paymentForm.userSubmissionId}
                    onChange={(e) => handleFormChange('userSubmissionId', e.target.value)}
                    required
                    sx={{ 
                      '& .MuiInputLabel-root': { color: 'var(--color-text-secondary)' },
                      '& .MuiOutlinedInput-root': { color: 'var(--color-text)' }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom sx={{ color: 'var(--color-text)' }}>
                    Payment Method
                  </Typography>
                  <RadioGroup
                    row
                    value={paymentForm.paymentMethod}
                    onChange={(e) => handleFormChange('paymentMethod', e.target.value)}
                  >
                    <FormControlLabel 
                      value="cash" 
                      control={<Radio sx={{ color: 'var(--color-primary)' }} />} 
                      label="Cash"
                      sx={{ color: 'var(--color-text)' }}
                    />
                    <FormControlLabel 
                      value="online" 
                      control={<Radio sx={{ color: 'var(--color-primary)' }} />} 
                      label="Online"
                      sx={{ color: 'var(--color-text)' }}
                    />
                    <FormControlLabel 
                      value="card" 
                      control={<Radio sx={{ color: 'var(--color-primary)' }} />} 
                      label="Card"
                      sx={{ color: 'var(--color-text)' }}
                    />
                  </RadioGroup>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Notes"
                    multiline
                    rows={3}
                    value={paymentForm.notes}
                    onChange={(e) => handleFormChange('notes', e.target.value)}
                    sx={{ 
                      '& .MuiInputLabel-root': { color: 'var(--color-text-secondary)' },
                      '& .MuiOutlinedInput-root': { color: 'var(--color-text)' }
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ bgcolor: 'var(--color-card-bg)' }}>
          <Button 
            onClick={closeDialog}
            sx={{ color: 'var(--color-text-secondary)' }}
          >
            CANCEL
          </Button>
          {/* {dialogType === 'create' && (
            <Button 
              onClick={handleCreatePayment} 
              variant="contained"
              sx={{ 
                backgroundColor: 'var(--color-primary)',
                '&:hover': {
                  backgroundColor: 'var(--color-primary-hover)',
                }
              }}
            >
              CREATE PAYMENT
            </Button>
          )}
          {dialogType === 'edit' && (
            <Button 
              onClick={handleCreatePayment} 
              variant="contained"
              sx={{ 
                backgroundColor: 'var(--color-primary)',
                '&:hover': {
                  backgroundColor: 'var(--color-primary-hover)',
                }
              }}
            >
              UPDATE PAYMENT
            </Button>
          )} */}
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          severity={snackbar.severity} 
          sx={{ 
            width: '100%',
            backgroundColor: 'var(--color-card-bg)',
            color: 'var(--color-text)'
          }}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}