import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Container,
  CircularProgress,
  IconButton,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Paper,
  FormControlLabel,
  Radio,
  RadioGroup,
  Checkbox,
  Fade,
  LinearProgress,
  Avatar
} from '@mui/material';
import { 
  ArrowBack,
  ExpandMore,
  Person,
  CheckCircle,
  EventSeat,
  Assignment,
  Email,
  Phone,
  TextFields,
  Description,
  Numbers,
  List,
  RadioButtonChecked,
  CheckBox,
  Link,
  CalendarToday,
  Label,
  Security
} from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';
import { API_ROUTE } from '../../lib/config';

export default function TicketForms() {
  const { eventId } = useParams();
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState(null);
  const [registrationForm, setRegistrationForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [formData, setFormData] = useState({});
  const [expandedPanels, setExpandedPanels] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [completionProgress, setCompletionProgress] = useState(0);

  useEffect(() => {
    // Get selected tickets from session storage
    const ticketData = sessionStorage.getItem('selectedTickets');
    if (!ticketData) {
      navigate(`/event/${eventId}/tickets`);
      return;
    }
    
    setSelectedTickets(JSON.parse(ticketData));
    fetchEventAndForm();
  }, [eventId]);

  useEffect(() => {
    calculateProgress();
  }, [formData, registrationForm]);

  // Initialize form data when selectedTickets changes
  useEffect(() => {
    if (selectedTickets.length > 0) {
      initializeFormData();
    }
  }, [selectedTickets]);

  const fetchEventAndForm = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch event details first
      const eventResponse = await fetch(`${API_ROUTE}/api/v1/event/eventid/${eventId}`, {
        headers: { 
          'Authorization': `Bearer ${token}`, 
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache' 
        }
      });
      if (!eventResponse.ok) throw new Error('Event not found');
      const eventData = await eventResponse.json();
      setEvent(eventData.data);

      // Fetch registration form by eventId
      const formResponse = await fetch(`${API_ROUTE}/api/v1/event/registration-form/eventId/${eventId}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache' 
        }
      });
      
      if (formResponse.ok) {
        const formData = await formResponse.json();
        console.log('Form data received:', formData);
        
        if (formData && formData.length > 0) {
          setRegistrationForm(formData[0]); // Use first form
          console.log('Registration form set:', formData[0]);
        } else {
          console.log('No registration form found for this event');
          setRegistrationForm(null);
        }
      } else {
        console.log('Failed to fetch registration form, status:', formResponse.status);
        setRegistrationForm(null);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      setRegistrationForm(null);
    } finally {
      setLoading(false);
    }
  };

  const initializeFormData = () => {
    console.log('Initializing form data with selectedTickets:', selectedTickets);
    
    const initialData = {};
    const initialExpanded = {};
    let participantIndex = 0;

    selectedTickets.forEach((ticketGroup) => {
      for (let i = 0; i < ticketGroup.quantity; i++) {
        const key = `${ticketGroup.tierName}_${i}`;
        initialData[key] = {
          tierName: ticketGroup.tierName,
          responses: {}
        };
        
        // Expand first panel by default
        if (participantIndex === 0) {
          initialExpanded[key] = true;
        }
        participantIndex++;
      }
    });

    console.log('Form data initialized:', initialData);
    setFormData(initialData);
    setExpandedPanels(initialExpanded);
  };

  const calculateProgress = () => {
    if (!registrationForm?.fields || Object.keys(formData).length === 0) return;
    
    let totalFields = 0;
    let filledFields = 0;

    Object.values(formData).forEach(participantData => {
      registrationForm.fields.forEach(field => {
        if (field.type !== 'Label') {
          totalFields++;
          
          const value = participantData.responses[field.id];
          if (field.type === 'Checkbox') {
            if (value && Array.isArray(value) && value.length > 0) {
              filledFields++;
            }
          } else if (value && value.toString().trim() !== '') {
            filledFields++;
          }
        }
      });
    });
    
    const progress = totalFields > 0 ? (filledFields / totalFields) * 100 : 0;
    setCompletionProgress(progress);
  };

  const handlePanelChange = (panel) => (event, isExpanded) => {
    setExpandedPanels(prev => ({
      ...prev,
      [panel]: isExpanded
    }));
  };

  const handleFieldChange = (participantKey, fieldId, value) => {
    setFormData(prev => ({
      ...prev,
      [participantKey]: {
        ...prev[participantKey],
        responses: {
          ...prev[participantKey].responses,
          [fieldId]: value
        }
      }
    }));

    // Clear validation error
    if (validationErrors[`${participantKey}_${fieldId}`]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`${participantKey}_${fieldId}`];
        return newErrors;
      });
    }
  };

  const handleCheckboxChange = (participantKey, fieldId, option, checked) => {
    setFormData(prev => {
      const currentValues = prev[participantKey].responses[fieldId] || [];
      let newValues;
      
      if (checked) {
        newValues = [...currentValues, option];
      } else {
        newValues = currentValues.filter(val => val !== option);
      }
      
      return {
        ...prev,
        [participantKey]: {
          ...prev[participantKey],
          responses: {
            ...prev[participantKey].responses,
            [fieldId]: newValues
          }
        }
      };
    });
  };

  const validateForms = () => {
    const errors = {};
    let isValid = true;

    Object.entries(formData).forEach(([participantKey, data]) => {
      // Validate required fields from registration form
      if (registrationForm?.fields) {
        registrationForm.fields.forEach(field => {
          if (field.mandatory && field.type !== 'Label') {
            const value = data.responses[field.id];
            
            if (field.type === 'Checkbox') {
              if (!value || !Array.isArray(value) || value.length === 0) {
                errors[`${participantKey}_${field.id}`] = `Please select at least one ${field.label}`;
                isValid = false;
              }
            } else {
              if (!value || value.toString().trim() === '') {
                errors[`${participantKey}_${field.id}`] = `${field.label} is required`;
                isValid = false;
              }
            }
          }

          // Email validation
          if (field.type === 'Email' && data.responses[field.id]) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.responses[field.id])) {
              errors[`${participantKey}_${field.id}`] = 'Please enter a valid email address';
              isValid = false;
            }
          }

          // Phone validation
          if (field.type === 'Phone Number' && data.responses[field.id]) {
            const phoneRegex = /^[+]?[\d\s\-\(\)]+$/;
            if (!phoneRegex.test(data.responses[field.id]) || data.responses[field.id].length < 10) {
              errors[`${participantKey}_${field.id}`] = 'Please enter a valid phone number';
              isValid = false;
            }
          }

          // URL validation
          if (field.type === 'URL' && data.responses[field.id]) {
            try {
              new URL(data.responses[field.id]);
            } catch {
              errors[`${participantKey}_${field.id}`] = 'Please enter a valid URL';
              isValid = false;
            }
          }
        });
      }
    });

    setValidationErrors(errors);
    return isValid;
  };

  const getParticipantNameFromResponses = (responses) => {
    if (registrationForm?.fields) {
      // Look for name field
      const nameField = registrationForm.fields.find(field => 
        field.type === 'Input Field' && 
        (field.label.toLowerCase().includes('name') || field.label.toLowerCase().includes('naam'))
      );
      
      if (nameField && responses[nameField.id]) {
        return responses[nameField.id];
      }
      
      // Fallback to email if no name field
      const emailField = registrationForm.fields.find(field => field.type === 'Email');
      if (emailField && responses[emailField.id]) {
        return responses[emailField.id].split('@')[0]; // Use email prefix as name
      }
    }
    
    return 'Participant';
  };

  const handleContinue = () => {
    // Check if there's a form and validate if needed
    if (registrationForm && !validateForms()) {
      return;
    }

    // Prepare data for checkout
    const checkoutData = {
      eventId,
      ticketDetails: selectedTickets.map(ticketGroup => ({
        tierName: ticketGroup.tierName,
        quantity: ticketGroup.quantity,
        participantForms: Object.entries(formData)
          .filter(([key]) => key.startsWith(ticketGroup.tierName))
          .map(([_, data]) => ({
            responses: Object.entries(data.responses).map(([fieldId, value]) => ({
              fieldId,
              value
            })),
            participantName: getParticipantNameFromResponses(data.responses)
          }))
      }))
    };

    // Store in session storage
    sessionStorage.setItem('checkoutData', JSON.stringify(checkoutData));
    navigate(`/event/${eventId}/tickets/checkout`);
  };

  const getTotalTickets = () => {
    return selectedTickets.reduce((total, group) => total + group.quantity, 0);
  };

  // Get field icon function
  const getFieldIcon = (type) => {
    switch (type) {
      case 'Email': return <Email sx={{ fontSize: 20, color: 'var(--color-primary)' }} />;
      case 'Phone Number': return <Phone sx={{ fontSize: 20, color: 'var(--color-primary)' }} />;
      case 'Input Field': return <TextFields sx={{ fontSize: 20, color: 'var(--color-primary)' }} />;
      case 'Textarea': return <Description sx={{ fontSize: 20, color: 'var(--color-primary)' }} />;
      case 'Number Field': return <Numbers sx={{ fontSize: 20, color: 'var(--color-primary)' }} />;
      case 'Select Menu': return <List sx={{ fontSize: 20, color: 'var(--color-primary)' }} />;
      case 'Radio Button': return <RadioButtonChecked sx={{ fontSize: 20, color: 'var(--color-primary)' }} />;
      case 'Checkbox': return <CheckBox sx={{ fontSize: 20, color: 'var(--color-primary)' }} />;
      case 'URL': return <Link sx={{ fontSize: 20, color: 'var(--color-primary)' }} />;
      case 'Date': return <CalendarToday sx={{ fontSize: 20, color: 'var(--color-primary)' }} />;
      case 'Label': return <Label sx={{ fontSize: 20, color: 'var(--color-primary)' }} />;
      default: return <Assignment sx={{ fontSize: 20, color: 'var(--color-primary)' }} />;
    }
  };

  const renderFormField = (field, participantKey, value) => {
    const errorKey = `${participantKey}_${field.id}`;
    const hasError = !!validationErrors[errorKey];

    const commonTextFieldProps = {
      fullWidth: true,
      variant: "outlined",
      value: value || '',
      error: hasError,
      helperText: hasError ? validationErrors[errorKey] : field.description,
      inputProps: {
        maxLength: field.maxLength || undefined
      },
      sx: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 3,
          background: 'var(--color-bg)',
          '& fieldset': {
            borderColor: 'var(--border-color)',
            borderWidth: '2px'
          },
          '&:hover fieldset': {
            borderColor: 'var(--color-primary)',
          },
          '&.Mui-focused fieldset': {
            borderColor: 'var(--color-primary)',
          },
        }
      }
    };

    switch (field.type) {
      case 'Input Field':
        return (
          <TextField
            {...commonTextFieldProps}
            key={field.id}
            label={field.label}
            type="text"
            placeholder={`Enter your ${field.label.toLowerCase()}`}
            onChange={(e) => handleFieldChange(participantKey, field.id, e.target.value)}
          />
        );

      case 'Email':
        return (
          <TextField
            {...commonTextFieldProps}
            key={field.id}
            label={field.label}
            type="email"
            placeholder={`Enter your ${field.label.toLowerCase()}`}
            onChange={(e) => handleFieldChange(participantKey, field.id, e.target.value)}
          />
        );

      case 'Phone Number':
        return (
          <TextField
            {...commonTextFieldProps}
            key={field.id}
            label={field.label}
            type="tel"
            placeholder="Enter your phone number"
            onChange={(e) => handleFieldChange(participantKey, field.id, e.target.value)}
          />
        );

      case 'Textarea':
        return (
          <TextField
            {...commonTextFieldProps}
            key={field.id}
            label={field.label}
            multiline
            rows={4}
            placeholder={`Enter your ${field.label.toLowerCase()}`}
            onChange={(e) => handleFieldChange(participantKey, field.id, e.target.value)}
          />
        );

      case 'Number Field':
        return (
          <TextField
            {...commonTextFieldProps}
            key={field.id}
            label={field.label}
            type="number"
            placeholder={`Enter ${field.label.toLowerCase()}`}
            onChange={(e) => handleFieldChange(participantKey, field.id, e.target.value)}
          />
        );

      case 'Select Menu':
        return (
          <TextField
            {...commonTextFieldProps}
            key={field.id}
            select
            label={field.label}
            onChange={(e) => handleFieldChange(participantKey, field.id, e.target.value)}
          >
            <MenuItem value="" disabled>
              Choose {field.label}
            </MenuItem>
            {field.options?.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        );

      case 'Radio Button':
        return (
          <FormControl key={field.id} error={hasError} sx={{ width: '100%' }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              {field.label}
            </Typography>
            <RadioGroup
              value={value || ''}
              onChange={(e) => handleFieldChange(participantKey, field.id, e.target.value)}
              sx={{ gap: 1 }}
            >
              {field.options?.map((option) => (
                <Paper 
                  key={option}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid var(--border-color)',
                    background: value === option ? 'var(--color-primary-light)' : 'var(--color-bg)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: 'var(--color-primary)',
                      background: 'var(--color-primary-light)'
                    }
                  }}
                >
                  <FormControlLabel
                    value={option}
                    control={<Radio sx={{ color: 'var(--color-primary)' }} />}
                    label={<Typography sx={{ fontWeight: 500 }}>{option}</Typography>}
                    sx={{ margin: 0, width: '100%' }}
                  />
                </Paper>
              ))}
            </RadioGroup>
            {hasError && (
              <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                {validationErrors[errorKey]}
              </Typography>
            )}
          </FormControl>
        );

      case 'Checkbox':
        return (
          <FormControl key={field.id} error={hasError} sx={{ width: '100%' }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              {field.label}
            </Typography>
            <Grid container spacing={2}>
              {field.options?.map((option) => (
                <Grid item xs={12} sm={6} key={option}>
                  <Paper 
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: '1px solid var(--border-color)',
                      background: (value || []).includes(option) ? 'var(--color-primary-light)' : 'var(--color-bg)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      '&:hover': {
                        borderColor: 'var(--color-primary)',
                        background: 'var(--color-primary-light)'
                      }
                    }}
                    onClick={() => {
                      const checked = !(value || []).includes(option);
                      handleCheckboxChange(participantKey, field.id, option, checked);
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={(value || []).includes(option)}
                          onChange={(e) => handleCheckboxChange(participantKey, field.id, option, e.target.checked)}
                          sx={{ color: 'var(--color-primary)' }}
                        />
                      }
                      label={<Typography sx={{ fontWeight: 500 }}>{option}</Typography>}
                      sx={{ margin: 0, width: '100%', pointerEvents: 'none' }}
                    />
                  </Paper>
                </Grid>
              ))}
            </Grid>
            {hasError && (
              <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                {validationErrors[errorKey]}
              </Typography>
            )}
          </FormControl>
        );

      case 'URL':
        return (
          <TextField
            {...commonTextFieldProps}
            key={field.id}
            label={field.label}
            type="url"
            placeholder="https://example.com"
            onChange={(e) => handleFieldChange(participantKey, field.id, e.target.value)}
          />
        );

      case 'Date':
        return (
          <TextField
            {...commonTextFieldProps}
            key={field.id}
            label={field.label}
            type="date"
            InputLabelProps={{ shrink: true }}
            onChange={(e) => handleFieldChange(participantKey, field.id, e.target.value)}
          />
        );

      case 'Label':
        return (
          <Typography 
            key={field.id}
            variant="body1" 
            sx={{ 
              color: 'var(--color-text)',
              fontSize: '1.1rem',
              lineHeight: 1.6,
              fontWeight: 500,
              p: 2,
              background: 'var(--color-primary-light)',
              borderRadius: 2,
              border: '1px solid var(--color-primary)'
            }}
          >
            {field.text || field.label}
          </Typography>
        );

      default:
        return (
          <TextField
            {...commonTextFieldProps}
            key={field.id}
            label={field.label}
            type="text"
            placeholder={`Enter ${field.label.toLowerCase()}`}
            onChange={(e) => handleFieldChange(participantKey, field.id, e.target.value)}
          />
        );
    }
  };

  // Debug logging
  console.log('Current state:', {
    registrationForm: !!registrationForm,
    formFields: registrationForm?.fields?.length,
    formDataKeys: Object.keys(formData),
    selectedTicketsLength: selectedTickets.length
  });

  const hasValidForm = registrationForm && registrationForm.fields && registrationForm.fields.length > 0;
  const hasFormData = Object.keys(formData).length > 0;

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
        <CircularProgress size={60} sx={{ color: '#6366f1' }} />
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
            <IconButton 
              onClick={() => navigate(`/event/${eventId}/tickets`)}
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
                fontWeight: 700
              }}>
                Participant Details
              </Typography>
              <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                Fill details for {getTotalTickets()} ticket{getTotalTickets() > 1 ? 's' : ''}
              </Typography>
            </Box>
          </Box>

          {/* Progress Bar */}
          {hasValidForm && (
            <Card sx={{ 
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 3
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2" sx={{ 
                    color: 'rgba(255,255,255,0.8)',
                    fontWeight: 500,
                    minWidth: 'fit-content'
                  }}>
                    Form Progress:
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={completionProgress} 
                    sx={{ 
                      flex: 1,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      '& .MuiLinearProgress-bar': {
                        background: 'linear-gradient(45deg, #fbbf24, #f472b6)',
                        borderRadius: 4
                      }
                    }}
                  />
                  <Typography variant="body2" sx={{ 
                    color: 'white',
                    fontWeight: 600,
                    minWidth: 'fit-content'
                  }}>
                    {Math.round(completionProgress)}%
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={6}>
          {/* Forms */}
          <Grid item xs={12} md={8}>
            {Object.keys(validationErrors).length > 0 && (
              <Alert severity="error" sx={{ mb: 4, borderRadius: 3 }}>
                Please fill in all required fields before continuing.
              </Alert>
            )}

            {!hasValidForm ? (
              <Alert severity="info" sx={{ borderRadius: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  No Registration Form Available
                </Typography>
                <Typography variant="body2">
                  This event doesn't have a registration form set up yet. 
                  You can proceed directly to payment.
                </Typography>
              </Alert>
            ) : !hasFormData ? (
              <Alert severity="warning" sx={{ borderRadius: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Loading Form Data...
                </Typography>
                <Typography variant="body2">
                  Please wait while we prepare the participant forms.
                </Typography>
              </Alert>
            ) : (
              <Stack spacing={3}>
                {Object.entries(formData).map(([participantKey, data], index) => (
                  <Accordion
                    key={participantKey}
                    expanded={expandedPanels[participantKey] || false}
                    onChange={handlePanelChange(participantKey)}
                    sx={{
                      borderRadius: '16px !important',
                      border: '1px solid var(--border-color)',
                      background: 'var(--color-card-bg)',
                      '&:before': { display: 'none' },
                      boxShadow: 'var(--shadow-sm)',
                      '&.Mui-expanded': {
                        boxShadow: 'var(--shadow-lg)',
                        borderColor: 'var(--color-primary)'
                      }
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMore />}
                      sx={{ borderRadius: '16px' }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                        <Avatar sx={{
                          width: 40,
                          height: 40,
                          background: 'var(--gradient-primary)',
                          color: 'white',
                          fontWeight: 700
                        }}>
                          {index + 1}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ 
                            fontFamily: 'var(--font-heading)',
                            fontWeight: 600
                          }}>
                            Participant {index + 1}
                          </Typography>
                          <Chip 
                            label={data.tierName}
                            size="small"
                            sx={{ 
                              background: 'var(--color-primary)',
                              color: 'white',
                              fontWeight: 600,
                              mt: 0.5
                            }}
                          />
                        </Box>
                        {/* Completion indicator */}
                        {registrationForm?.fields?.every(field => 
                          field.type === 'Label' || 
                          (field.type === 'Checkbox' ? 
                            (data.responses[field.id] && data.responses[field.id].length > 0) :
                            data.responses[field.id]
                          )
                        ) && (
                          <CheckCircle sx={{ color: 'var(--color-success)', fontSize: 24 }} />
                        )}
                      </Box>
                    </AccordionSummary>
                    
                    <AccordionDetails sx={{ p: 4, pt: 0 }}>
                      <Stack spacing={3}>
                        {registrationForm?.fields?.map((field) => (
                          <Box key={field.id}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                              {getFieldIcon(field.type)}
                              <Typography variant="h6" sx={{ 
                                fontWeight: 600,
                                color: 'var(--color-text)'
                              }}>
                                {field.label}
                                {field.mandatory && field.type !== 'Label' && (
                                  <Chip 
                                    label="Required" 
                                    size="small" 
                                    sx={{ 
                                      ml: 2, 
                                      background: 'var(--color-error)',
                                      color: 'white',
                                      fontSize: '0.7rem'
                                    }} 
                                  />
                                )}
                              </Typography>
                            </Box>
                            {renderFormField(field, participantKey, data.responses[field.id])}
                          </Box>
                        ))}
                      </Stack>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Stack>
            )}
          </Grid>

          {/* Summary Sidebar */}
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              borderRadius: 4,
              background: 'var(--color-card-bg)',
              border: '1px solid var(--border-color)',
              position: 'sticky',
              top: 24
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
                  <Assignment sx={{ fontSize: 24 }} />
                  Form Progress
                </Typography>

                {hasFormData && (
                  <Stack spacing={2} sx={{ mb: 4 }}>
                    {Object.entries(formData).map(([participantKey, data], index) => {
                      const isComplete = !registrationForm?.fields || registrationForm.fields.every(field => 
                        field.type === 'Label' || 
                        (field.type === 'Checkbox' ? 
                          (data.responses[field.id] && data.responses[field.id].length > 0) :
                          data.responses[field.id]
                        )
                      );
                      
                      return (
                        <Box key={participantKey} sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          p: 2,
                          borderRadius: 2,
                          background: isComplete ? 'var(--color-success-bg)' : 'var(--color-warning-bg)',
                          border: `1px solid ${isComplete ? 'var(--color-success)' : 'var(--color-warning)'}`
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Person sx={{ fontSize: 18 }} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              Participant {index + 1}
                            </Typography>
                          </Box>
                          {isComplete ? (
                            <CheckCircle sx={{ color: 'var(--color-success)', fontSize: 20 }} />
                          ) : (
                            <Typography variant="caption" sx={{ 
                              color: 'var(--color-warning)',
                              fontWeight: 600
                            }}>
                              Incomplete
                            </Typography>
                          )}
                        </Box>
                      );
                    })}
                  </Stack>
                )}

                <Divider sx={{ my: 3 }} />

                <Typography variant="body2" sx={{ 
                  color: 'var(--color-text-secondary)',
                  mb: 3,
                  textAlign: 'center'
                }}>
                  {hasValidForm ? 
                    'Complete all forms to proceed to payment' : 
                    'No registration form required for this event'
                  }
                </Typography>

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handleContinue}
                  disabled={hasValidForm && (Object.keys(validationErrors).length > 0 || !hasFormData)}
                  sx={{
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    borderRadius: '50px',
                    background: 'var(--gradient-primary)',
                    '&:hover': {
                      background: 'var(--gradient-primary)',
                      transform: 'translateY(-2px)'
                    },
                    '&:disabled': {
                      background: 'var(--color-text-secondary)',
                      color: 'white'
                    }
                  }}
                >
                  Continue to Payment
                </Button>

                {/* Security Notice */}
                <Box sx={{ 
                  mt: 3,
                  p: 2,
                  borderRadius: 2,
                  background: 'var(--surface-1)',
                  border: '1px solid var(--border-color)',
                  textAlign: 'center'
                }}>
                  <Security sx={{ color: 'var(--color-success)', fontSize: 20, mb: 1 }} />
                  <Typography variant="caption" sx={{ 
                    color: 'var(--color-text-secondary)',
                    display: 'block'
                  }}>
                    🔒 Your information is secure and encrypted
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}