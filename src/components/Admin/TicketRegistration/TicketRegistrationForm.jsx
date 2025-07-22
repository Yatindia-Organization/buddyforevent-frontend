// src/components/Admin/TicketRegistration/TicketRegistrationForm.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  IconButton,
  TextField,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Chip,
  Alert,
  Card,
  CardContent,
  LinearProgress,
  Tooltip,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import DeleteIcon from "@mui/icons-material/Delete";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import EditIcon from "@mui/icons-material/Edit";
import RefreshIcon from "@mui/icons-material/Refresh";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import { API_ROUTE } from "../../../lib/config";
import { useGlobalInfo } from "../../../contexts/globalContext";

export default function TicketRegistrationForm({ eventName }) {
  const { event: eventId } = useGlobalInfo();
  const [tiers, setTiers] = useState([]);
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState(null);

  // fetch existing tiers
  useEffect(() => {
    if (!eventId) return;
   const token = localStorage.getItem('token');

fetch(`${API_ROUTE}/api/v1/event/ticket-tiers/${eventId}`, {
 headers: { 'Authorization': `Bearer ${token}` }
})
 .then((r) => {
   if (!r.ok) throw new Error("Failed to fetch tiers");
   return r.json();
 })
      .then((json) => {
        const existing = json.data.ticket_tiers;
        setTiers(
          existing.length
            ? existing
            : [{ name: "", description: "", price: "", capacity: "", perks: "" }]
        );
      })
      .catch(() => {
        setTiers([{ name: "", description: "", price: "", capacity: "", perks: "" }]);
      });
  }, [eventId]);

  // Fetch analytics data
  const fetchAnalytics = async () => {
    if (!eventId) return;
    
    setLoading(true);
    setAnalyticsError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ROUTE}/api/v1/event/tickets/events/${eventId}/analytics`,
 {
   headers: {
     'Authorization': `Bearer ${token}`
   }
 });
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      const data = await response.json();
      setAnalytics(data.data);
    } catch (error) {
      console.error('Analytics error:', error);
      setAnalyticsError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Load analytics when switching to analytics tab
  useEffect(() => {
    if (currentTab === 1 && eventId) {
      fetchAnalytics();
    }
  }, [currentTab, eventId]);

  // handlers...
  const handleTierChange = (idx, field, val) => {
    const copy = [...tiers];
    copy[idx][field] =
      field === "price" || field === "capacity" ? (val === "" ? "" : Number(val)) : val;
    setTiers(copy);
  };
  
  const handleAddTier = () =>
    setTiers([...tiers, { name: "", description: "", price: "", capacity: "", perks: "" }]);
  
  const handleRemoveTier = (idx) => setTiers(tiers.filter((_, i) => i !== idx));
  
  const validate = () => {
    const errs = {};
    tiers.forEach((t, i) => {
      if (!t.name) errs[`name${i}`] = "Name is required";
      if (typeof t.price !== "number" || t.price < 0) errs[`price${i}`] = "Valid price required";
      if (typeof t.capacity !== "number" || t.capacity < 1)
        errs[`capacity${i}`] = "Valid capacity required";
    });
    setErrors(errs);
    return !Object.keys(errs).length;
  };
  
  const handleSubmit = async () => {
    if (!validate()) return;
    const payload = tiers.map((t) => ({
      name: t.name,
      description: t.description,
      price: t.price,
      capacity: t.capacity,
      perks: t.perks.split(",").map((p) => p.trim()).filter(Boolean),
    }));
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${API_ROUTE}/api/v1/event/ticket-tiers/${eventId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ ticket_tiers: payload }),
        }
      );
      if (!res.ok) throw new Error(await res.text());
      setIsEditing(false);
      // Refresh analytics if on analytics tab
      if (currentTab === 1) {
        fetchAnalytics();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SOLD OUT':
        return 'error';
      case 'ALMOST SOLD OUT':
        return 'warning';
      case 'MODERATE':
        return 'info';
      case 'AVAILABLE':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };



  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div className="min-h-screen p-8 bg-bg text-text font-sans">
        <Box p={6} borderRadius={2} sx={{ bgcolor: "var(--color-card-bg)" }}>
          <Typography className="text-lg font-heading mb-4">
            Ticket Management for event{" "}
            {eventName && <strong className="font-semibold">{eventName}</strong>}
          </Typography>

          <Tabs value={currentTab} onChange={handleTabChange} sx={{ mb: 3 }}>
            <Tab 
              icon={<EditIcon />} 
              label="Manage Tiers" 
              sx={{ textTransform: 'none' }}
            />
            <Tab 
              icon={<AnalyticsIcon />} 
              label="Analytics" 
              sx={{ textTransform: 'none' }}
            />
          </Tabs>

          {/* Tab 0: Tier Management */}
          {currentTab === 0 && (
            <>
              {!isEditing ? (
                <>
                  <TableContainer
                    component={Paper}
                    sx={{ bgcolor: "var(--color-card-bg)" }}
                  >
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          {["Name","Description","Price","Capacity","Perks"].map((h) => (
                            <TableCell
                              key={h}
                              sx={{ fontWeight: "bold", bgColor: "var(--color-card-bg)" }}
                            >
                              {h}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {tiers.map((t, i) => (
                          <TableRow key={i}>
                            <TableCell>{t.name}</TableCell>
                            <TableCell>{t.description || "—"}</TableCell>
                            <TableCell>{formatCurrency(t.price)}</TableCell>
                            <TableCell>{t.capacity}</TableCell>
                            <TableCell>
                              {Array.isArray(t.perks) ? t.perks.join(", ") : t.perks}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Box mt={4} display="flex" justifyContent="flex-end">
                    <Button
                      onClick={() => setIsEditing(true)}
                      sx={{
                        bgcolor: "var(--color-primary)",
                        color: "white",
                        textTransform: "none",
                        "&:hover": { bgcolor: "var(--color-primary-hover)" },
                      }}
                    >
                      Add / Edit Ticket Tiers
                    </Button>
                  </Box>
                </>
              ) : (
                <>
                  <Typography className="text-lg font-heading mb-4">
                    Editing tiers for event{" "}
                    {eventName && <strong className="font-semibold">{eventName}</strong>}
                  </Typography>

                  {tiers.map((tier, idx) => (
                    <Box
                      key={idx}
                      mb={4}
                      p={2}
                      sx={{ border: "1px solid var(--color-card-bg)" }}
                      borderRadius={1}
                    >
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={11}>
                          <Typography className="font-medium">Tier #{idx + 1}</Typography>
                        </Grid>
                        <Grid item xs={1}>
                          {tiers.length > 1 && (
                            <IconButton onClick={() => handleRemoveTier(idx)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            label="Name"
                            fullWidth
                            value={tier.name}
                            error={!!errors[`name${idx}`]}
                            helperText={errors[`name${idx}`]}
                            onChange={(e) => handleTierChange(idx, "name", e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            label="Description"
                            fullWidth
                            value={tier.description}
                            onChange={(e) =>
                              handleTierChange(idx, "description", e.target.value)
                            }
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <TextField
                            label="Price"
                            type="number"
                            fullWidth
                            value={tier.price}
                            error={!!errors[`price${idx}`]}
                            helperText={errors[`price${idx}`]}
                            onChange={(e) =>
                              handleTierChange(idx, "price", e.target.value)
                            }
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <TextField
                            label="Capacity"
                            type="number"
                            fullWidth
                            value={tier.capacity}
                            error={!!errors[`capacity${idx}`]}
                            helperText={errors[`capacity${idx}`]}
                            onChange={(e) =>
                              handleTierChange(idx, "capacity", e.target.value)
                            }
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <TextField
                            label="Perks (comma-separated)"
                            fullWidth
                            value={tier.perks}
                            onChange={(e) =>
                              handleTierChange(idx, "perks", e.target.value)
                            }
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  ))}

                  <Box display="flex" gap={2} mb={2}>
                    <Button
                      onClick={handleAddTier}
                      variant="outlined"
                      sx={{
                        borderColor: "var(--color-primary)",
                        color: "var(--color-primary)",
                        textTransform: "none",
                        "&:hover": {
                          bgcolor: "var(--color-primary)",
                          color: "white",
                        },
                      }}
                    >
                      + Add another tier
                    </Button>
                  </Box>

                  <Box display="flex" justifyContent="flex-end" gap={2}>
                    <Button
                      onClick={() => setIsEditing(false)}
                      variant="outlined"
                      sx={{
                        borderColor: "var(--color-text-secondary)",
                        color: "var(--color-text-secondary)",
                        textTransform: "none",
                        "&:hover": { bgcolor: "var(--color-card-bg)" },
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      sx={{
                        bgcolor: "var(--color-primary)",
                        color: "white",
                        textTransform: "none",
                        "&:hover": { bgcolor: "var(--color-primary-hover)" },
                      }}
                    >
                      Save Tiers
                    </Button>
                  </Box>
                </>
              )}
            </>
          )}

          {/* Tab 1: Analytics */}
          {currentTab === 1 && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6">Ticket Sales Analytics</Typography>
                <Button
                  onClick={fetchAnalytics}
                  disabled={loading}
                  startIcon={<RefreshIcon />}
                  sx={{
                    textTransform: "none",
                    bgcolor: "var(--color-primary)",
                    color: "white",
                    "&:hover": { bgcolor: "var(--color-primary-hover)" },
                  }}
                >
                  Refresh Data
                </Button>
              </Box>

              {loading && <LinearProgress sx={{ mb: 2 }} />}

              {analyticsError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {analyticsError}
                </Alert>
              )}

              {analytics && (
                <TableContainer component={Paper} sx={{ bgcolor: "var(--color-card-bg)" }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: "bold" }}>Tier Name</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Price</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Capacity</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Sold</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Remaining</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Sell-through %</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Revenue</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Profit*</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {analytics.tiers.map((tier, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {tier.tierName}
                              </Typography>
                              {tier.description && (
                                <Typography variant="caption" color="text.secondary">
                                  {tier.description}
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>{formatCurrency(tier.price)}</TableCell>
                          <TableCell>{tier.initialCapacity}</TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              {tier.soldCount}
                              {tier.isHighPerformer && (
                                <Tooltip title="High performer">
                                  <TrendingUpIcon fontSize="small" color="success" />
                                </Tooltip>
                              )}
                              {tier.needsAttention && (
                                <Tooltip title="Needs attention">
                                  <TrendingDownIcon fontSize="small" color="warning" />
                                </Tooltip>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>{tier.remainingCapacity}</TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              {formatPercentage(tier.sellThroughRate)}
                              <LinearProgress
                                variant="determinate"
                                value={tier.sellThroughRate}
                                sx={{ width: 50, height: 4 }}
                              />
                            </Box>
                          </TableCell>
                          <TableCell>{formatCurrency(tier.totalRevenue)}</TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2">
                                {formatCurrency(tier.totalProfit)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatPercentage(tier.profitMargin)}% margin
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={tier.status}
                              color={getStatusColor(tier.status)}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

            
            </Box>
          )}
        </Box>
      </div>
    </LocalizationProvider>
  );
}