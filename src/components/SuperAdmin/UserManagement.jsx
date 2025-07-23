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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Menu,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  ArrowBack,
  People,
  Add,
  Edit,
  Delete,
  MoreVert,
  Search,
  FilterList,
  AccountCircle,
  Business,
  Phone,
  Email,
  CardGiftcard,
  Block,
  CheckCircle,
  Warning
} from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';
import { useGlobalInfo } from '../../contexts/globalContext';
import { API_ROUTE } from '../../lib/config';

export default function UserManagement() {
  const { theme } = useTheme();
  const { userType } = useGlobalInfo();
  const navigate = useNavigate();
  
  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('create'); // 'create', 'edit', 'assignPlan'
  const [selectedUser, setSelectedUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone_number: '',
    company_name: '',
    company_gst_number: '',
    user_type: 'admin',
    status: 'active',
    plan: ''
  });

  useEffect(() => {
    if (userType !== 'super-admin') {
      navigate('/dashboard');
      return;
    }
    fetchUsers();
    fetchPlans();
  }, [userType, navigate]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ROUTE}/api/v1/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setUsers(data.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

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
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.company_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleCreateUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ROUTE}/api/v1/auth/sign-up`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        fetchUsers();
        handleCloseDialog();
      }
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleUpdateUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ROUTE}/api/v1/users/${selectedUser._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        fetchUsers();
        handleCloseDialog();
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_ROUTE}/api/v1/users/${userId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          fetchUsers();
        }
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleAssignPlan = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ROUTE}/api/v1/users/${selectedUser._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ plan: formData.plan })
      });
      
      if (response.ok) {
        fetchUsers();
        handleCloseDialog();
      }
    } catch (error) {
      console.error('Error assigning plan:', error);
    }
  };

  const handleOpenDialog = (type, user = null) => {
    setDialogType(type);
    setSelectedUser(user);
    
    if (user && type === 'edit') {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        phone_number: user.phone_number || '',
        company_name: user.company_name || '',
        company_gst_number: user.company_gst_number || '',
        user_type: user.user_type || 'admin',
        status: user.status || 'active',
        plan: user.plan || ''
      });
    } else if (user && type === 'assignPlan') {
      setFormData({ ...formData, plan: user.plan || '' });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        phone_number: '',
        company_name: '',
        company_gst_number: '',
        user_type: 'admin',
        status: 'active',
        plan: ''
      });
    }
    
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    setAnchorEl(null);
  };

  const getUserPlanName = (planId) => {
    const plan = plans.find(p => p._id === planId);
    return plan ? plan.name : 'No Plan';
  };

  const getStatusColor = (status) => {
    return status === 'active' ? 'success' : 'error';
  };

  const getUserTypeColor = (userType) => {
    switch(userType) {
      case 'super-admin': return '#ef4444';
      case 'admin': return '#6366f1';
      case 'user': return '#10b981';
      default: return '#6b7280';
    }
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
                  User Management
                </Typography>
                <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  Manage users, assign plans, and monitor activities
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
              Add User
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Stats Cards */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, border: '1px solid var(--border-color)' }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Avatar sx={{ mx: 'auto', mb: 2, background: '#6366f1' }}>
                  <People />
                </Avatar>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  {users.length}
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
                  Total Users
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, border: '1px solid var(--border-color)' }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Avatar sx={{ mx: 'auto', mb: 2, background: '#10b981' }}>
                  <CheckCircle />
                </Avatar>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  {users.filter(u => u.status === 'active').length}
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
                  Active Users
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, border: '1px solid var(--border-color)' }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Avatar sx={{ mx: 'auto', mb: 2, background: '#f59e0b' }}>
                  <CardGiftcard />
                </Avatar>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  {users.filter(u => u.plan).length}
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
                  With Plans
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, border: '1px solid var(--border-color)' }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Avatar sx={{ mx: 'auto', mb: 2, background: '#ef4444' }}>
                  <Warning />
                </Avatar>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  {users.filter(u => !u.plan).length}
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
                  Need Plans
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters */}
        <Card sx={{ mb: 4, borderRadius: 3, border: '1px solid var(--border-color)' }}>
          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search users, emails, companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ color: 'var(--color-text-secondary)', mr: 1 }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Status Filter</InputLabel>
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    label="Status Filter"
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="banned">Banned</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
                  Showing {filteredUsers.length} of {users.length} users
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card sx={{ borderRadius: 3, border: '1px solid var(--border-color)' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ background: 'var(--color-bg-subtle)' }}>
                  <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Company</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Contact</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Plan</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user._id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ width: 40, height: 40 }}>
                          {user.name?.charAt(0)?.toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {user.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{user.company_name}</Typography>
                      <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>
                        GST: {user.company_gst_number}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{user.phone_number}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.user_type}
                        size="small"
                        sx={{
                          background: `${getUserTypeColor(user.user_type)}15`,
                          color: getUserTypeColor(user.user_type),
                          fontWeight: 600
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {getUserPlanName(user.plan)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.status}
                        size="small"
                        color={getStatusColor(user.status)}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={(e) => {
                          setAnchorEl(e.currentTarget);
                          setSelectedUser(user);
                        }}
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {/* Actions Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem onClick={() => handleOpenDialog('edit', selectedUser)}>
            <ListItemIcon><Edit /></ListItemIcon>
            <ListItemText>Edit User</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleOpenDialog('assignPlan', selectedUser)}>
            <ListItemIcon><CardGiftcard /></ListItemIcon>
            <ListItemText>Assign Plan</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleDeleteUser(selectedUser?._id)}>
            <ListItemIcon><Delete /></ListItemIcon>
            <ListItemText>Delete User</ListItemText>
          </MenuItem>
        </Menu>

        {/* Dialog for Create/Edit/Assign Plan */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {dialogType === 'create' && 'Create New User'}
            {dialogType === 'edit' && 'Edit User'}
            {dialogType === 'assignPlan' && 'Assign Plan'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {dialogType !== 'assignPlan' && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </Grid>
                  {dialogType === 'create' && (
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                      />
                    </Grid>
                  )}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={formData.phone_number}
                      onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Company Name"
                      value={formData.company_name}
                      onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="GST Number"
                      value={formData.company_gst_number}
                      onChange={(e) => setFormData({...formData, company_gst_number: e.target.value})}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>User Type</InputLabel>
                      <Select
                        value={formData.user_type}
                        onChange={(e) => setFormData({...formData, user_type: e.target.value})}
                        label="User Type"
                      >
                        <MenuItem value="admin">Admin</MenuItem>
                        <MenuItem value="user">User</MenuItem>
                        <MenuItem value="super-admin">Super Admin</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                        label="Status"
                      >
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="banned">Banned</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </>
              )}
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Plan</InputLabel>
                  <Select
                    value={formData.plan}
                    onChange={(e) => setFormData({...formData, plan: e.target.value})}
                    label="Plan"
                  >
                    <MenuItem value="">No Plan</MenuItem>
                    {plans.map((plan) => (
                      <MenuItem key={plan._id} value={plan._id}>
                        {plan.name} - ₹{plan.price}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={
                dialogType === 'create' ? handleCreateUser :
                dialogType === 'edit' ? handleUpdateUser :
                handleAssignPlan
              }
            >
              {dialogType === 'create' && 'Create User'}
              {dialogType === 'edit' && 'Update User'}
              {dialogType === 'assignPlan' && 'Assign Plan'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}