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
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Chip,
  Avatar,
  Stack,
  Divider,
  LinearProgress,
  Fade,
  Paper
} from '@mui/material';
import { 
  ArrowBack,
  Person,
  Email,
  Phone,
  ArrowForward,
  CheckCircle,
  Schedule,
  LocationOn,
  Business,
  Security,
  AutoAwesome,
  Description,
  Assignment,
  Link,
  Numbers,
  TextFields,
  CalendarToday,
  CheckBox,
  RadioButtonChecked,
  List,
  Label
} from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';
import { API_ROUTE } from '../../lib/config';

export default function RegistrationForm() {
  const { eventId } = useParams();
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState(null);
  const [formFields, setFormFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [completionProgress, setCompletionProgress] = useState(0);

  useEffect(() => {
    fetchEventAndForm();
  }, [eventId]);

  useEffect(() => {
    calculateProgress();
  }, [formData, formFields]);

 const fetchEventAndForm = async () => {
  try {
    const token = localStorage.getItem('token');
    
    // Fetch event details first
    const eventResponse = await fetch(`${API_ROUTE}/api/v1/event/eventid/${eventId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!eventResponse.ok) throw new Error('Event not found');
    const eventData = await eventResponse.json();
    setEvent(eventData.data);

    // Fetch registration form by eventId (using correct route)
    const formResponse = await fetch(`${API_ROUTE}/api/v1/event/registration-form/eventId/${eventId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (formResponse.ok) {
      const formData = await formResponse.json();
      console.log('Form data received:', formData); // Debug log
      
      if (formData && formData.length > 0) {
        setRegistrationForm(formData[0]); // Use first form
        console.log('Registration form set:', formData[0]); // Debug log
      } else {
        console.log('No registration form found for this event');
        setRegistrationForm(null);
      }
    } else {
      console.log('Failed to fetch registration form, status:', formResponse.status);
      setRegistrationForm(null);
    }

    // Initialize form data structure
    initializeFormData();
  } catch (error) {
    console.error('Error fetching data:', error);
    setRegistrationForm(null);
  } finally {
    setLoading(false);
  }
};

  const calculateProgress = () => {
    if (formFields.length === 0) return;
    
    const filledFields = formFields.filter(field => {
      // FIXED: Use correct field types and exclude Label from progress
      if (field.type === 'Checkbox') {
        return formData[field.id] && formData[field.id].length > 0;
      }
      if (field.type === 'Label') {
        return true; // Labels don't need to be filled
      }
      return formData[field.id] && formData[field.id].toString().trim() !== '';
    });
    
    const totalFields = formFields.filter(field => field.type !== 'Label').length;
    const progress = totalFields > 0 ? (filledFields.length / totalFields) * 100 : 0;
    setCompletionProgress(progress);
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const validateForm = () => {
    const newErrors = {};
    
    formFields.forEach(field => {
      // FIXED: Use correct field types for validation
      if (field.mandatory && field.type !== 'Checkbox' && field.type !== 'Label') {
        if (!formData[field.id] || formData[field.id].toString().trim() === '') {
          newErrors[field.id] = `${field.label} is required`;
        }
      }
      
      if (field.mandatory && field.type === 'Checkbox') {
        if (!formData[field.id] || formData[field.id].length === 0) {
          newErrors[field.id] = `Please select at least one ${field.label}`;
        }
      }

      // FIXED: Use correct field types for validation
      if (field.type === 'Email' && formData[field.id]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData[field.id])) {
          newErrors[field.id] = 'Please enter a valid email address';
        }
      }

      if (field.type === 'Phone Number' && formData[field.id]) {
        const phoneRegex = /^[+]?[\d\s\-\(\)]+$/;
        if (!phoneRegex.test(formData[field.id]) || formData[field.id].length < 10) {
          newErrors[field.id] = 'Please enter a valid phone number';
        }
      }

      // URL validation
      if (field.type === 'URL' && formData[field.id]) {
        try {
          new URL(formData[field.id]);
        } catch {
          newErrors[field.id] = 'Please enter a valid URL';
        }
      }

      // Number validation
      if (field.type === 'Number Field' && formData[field.id]) {
        const num = Number(formData[field.id]);
        if (isNaN(num)) {
          newErrors[field.id] = 'Please enter a valid number';
        } else {
          if (field.minValue && num < Number(field.minValue)) {
            newErrors[field.id] = `Minimum value is ${field.minValue}`;
          }
          if (field.maxValue && num > Number(field.maxValue)) {
            newErrors[field.id] = `Maximum value is ${field.maxValue}`;
          }
        }
      }

      // Max length validation
      if (field.maxLength && formData[field.id] && formData[field.id].toString().length > parseInt(field.maxLength)) {
        newErrors[field.id] = `Maximum ${field.maxLength} characters allowed`;
      }

      // Date validation
      if (field.type === 'Date' && formData[field.id]) {
        const inputDate = new Date(formData[field.id]);
        if (field.minDate && inputDate < new Date(field.minDate)) {
          newErrors[field.id] = `Date must be after ${field.minDate}`;
        }
        if (field.maxDate && inputDate > new Date(field.maxDate)) {
          newErrors[field.id] = `Date must be before ${field.maxDate}`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (fieldId, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
    
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors(prev => ({
        ...prev,
        [fieldId]: undefined
      }));
    }
  };

  const handleCheckboxChange = (fieldId, option, checked) => {
    setFormData(prev => {
      const currentValues = prev[fieldId] || [];
      if (checked) {
        return {
          ...prev,
          [fieldId]: [...currentValues, option]
        };
      } else {
        return {
          ...prev,
          [fieldId]: currentValues.filter(val => val !== option)
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showSnackbar('Please fill in all required fields correctly', 'error');
      return;
    }

    setSubmitting(true);
    
    try {
      // Convert form data to API format
      const responses = formFields.map(field => ({
        fieldId: field.id,
        value: formData[field.id]
      }));

      // FIXED: Extract participant name using correct field type
      const nameField = formFields.find(f => 
        f.type === 'Input Field' && 
        (f.label.toLowerCase().includes('name') || f.label.toLowerCase().includes('naam'))
      );
      const participantName = nameField ? formData[nameField.id] : '';

      const submissionData = {
        formId: eventId,
        eventId: eventId,
        responses: responses,
        participant: participantName
      };
const token = localStorage.getItem('token');
      const response = await fetch(`${API_ROUTE}/api/v1/form/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submissionData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit form');
      }

      const result = await response.json();
      showSnackbar('Registration submitted successfully! 🎉', 'success');
      
      // Navigate to ticket selection with submission ID
      setTimeout(() => {
        navigate(`/event/${eventId}/tickets`, { 
          state: { 
            submissionId: result.data._id,
            participantName: participantName
          } 
        });
      }, 2000);

    } catch (error) {
      console.error('Error submitting form:', error);
      showSnackbar(error.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // FIXED: Updated getFieldIcon to use correct field types
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
      case 'Custom ID': return <Assignment sx={{ fontSize: 20, color: 'var(--color-primary)' }} />;
      default: return <Assignment sx={{ fontSize: 20, color: 'var(--color-primary)' }} />;
    }
  };

  const renderField = (field, index) => {
    if (field.invisible) return null;

    return (
      <Fade in timeout={600 + index * 100} key={field.id}>
        <Card 
          sx={{ 
            mb: 3,
            borderRadius: 3,
            border: errors[field.id] ? '2px solid var(--color-error)' : '1px solid var(--border-color)',
            background: 'var(--color-card-bg)',
            transition: 'all 0.3s ease',
            '&:hover': {
              borderColor: 'var(--color-primary)',
              boxShadow: 'var(--shadow-md)'
            }
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              {getFieldIcon(field.type)}
              <Typography 
                variant="h5" 
                sx={{ 
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  color: 'var(--color-text)',
                  flex: 1,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                {field.label}
                {field.mandatory && field.type !== 'Label' && (
                  <Chip 
                    label="Required" 
                    size="small" 
                    sx={{ 
                      ml: 2, 
                      background: 'var(--color-error)',
                      color: 'white',
                      fontSize: '0.7rem',
                      height: 24,
                      textTransform: 'uppercase',
                      fontWeight: 600
                    }} 
                  />
                )}
              </Typography>
            </Box>

            {field.description && (
              <Typography 
                variant="h6" 
                sx={{ 
                  color: 'var(--color-text)',
                  mb: 3,
                  fontWeight: 500,
                  lineHeight: 1.6,
                  fontSize: '1.1rem'
                }}
              >
                {field.description}
              </Typography>
            )}

            {(() => {
              const commonTextFieldProps = {
                fullWidth: true,
                variant: "outlined",
                value: formData[field.id] || '',
                error: !!errors[field.id],
                helperText: errors[field.id],
                inputProps: {
                  maxLength: field.maxLength || undefined
                },
                sx: {
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    background: 'var(--color-bg)',
                    transition: 'all 0.3s ease',
                    '& fieldset': {
                      borderColor: 'var(--border-color)',
                      borderWidth: '2px'
                    },
                    '&:hover fieldset': {
                      borderColor: 'var(--color-primary)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'var(--color-primary)',
                      boxShadow: '0 0 0 4px rgba(99, 102, 241, 0.1)'
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: 'var(--color-text)',
                    fontSize: '1rem',
                    padding: '16px'
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: 'var(--color-text-secondary)',
                    opacity: 0.7
                  }
                }
              };

              // FIXED: Use correct field types in switch statement
              switch (field.type) {
                case 'Input Field':
                  return (
                    <TextField
                      {...commonTextFieldProps}
                      type="text"
                      placeholder={`Enter your ${field.label.toLowerCase()}`}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                    />
                  );

                case 'Email':
                  return (
                    <TextField
                      {...commonTextFieldProps}
                      type="email"
                      placeholder={`Enter your ${field.label.toLowerCase()}`}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                    />
                  );

                case 'Phone Number':
                  return (
                    <TextField
                      {...commonTextFieldProps}
                      type="tel"
                      placeholder="Enter your phone number"
                      onChange={(e) => handleInputChange(field.id, e.target.value.replace(/\D/g, ''))}
                      helperText={errors[field.id] || "Digits only"}
                    />
                  );

                case 'Textarea':
                  return (
                    <TextField
                      {...commonTextFieldProps}
                      multiline
                      rows={4}
                      placeholder={`Enter your ${field.label.toLowerCase()}`}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                    />
                  );

                case 'Number Field':
                  return (
                    <TextField
                      {...commonTextFieldProps}
                      type="number"
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      InputProps={{
                        inputProps: {
                          min: field.minValue || undefined,
                          max: field.maxValue || undefined
                        }
                      }}
                    />
                  );

                case 'Select Menu':
                  return (
                    <TextField
                      {...commonTextFieldProps}
                      select
                      placeholder={`Choose ${field.label}`}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
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
                    <FormControl error={!!errors[field.id]} sx={{ width: '100%' }}>
                      <RadioGroup
                        value={formData[field.id] || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        sx={{ gap: 1 }}
                      >
                        {field.options?.map((option) => (
                          <Paper 
                            key={option}
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              border: '1px solid var(--border-color)',
                              background: formData[field.id] === option ? 'var(--color-primary-light)' : 'var(--color-bg)',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                borderColor: 'var(--color-primary)',
                                background: 'var(--color-primary-light)'
                              }
                            }}
                          >
                            <FormControlLabel
                              value={option}
                              control={
                                <Radio 
                                  sx={{ 
                                    color: 'var(--color-primary)',
                                    '&.Mui-checked': {
                                      color: 'var(--color-primary)'
                                    }
                                  }} 
                                />
                              }
                              label={
                                <Typography sx={{ 
                                  color: 'var(--color-text)',
                                  fontWeight: 500
                                }}>
                                  {option}
                                </Typography>
                              }
                              sx={{ margin: 0, width: '100%' }}
                            />
                          </Paper>
                        ))}
                      </RadioGroup>
                      {errors[field.id] && (
                        <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                          {errors[field.id]}
                        </Typography>
                      )}
                    </FormControl>
                  );

                case 'Checkbox':
                  return (
                    <FormControl error={!!errors[field.id]} sx={{ width: '100%' }}>
                      <Grid container spacing={2}>
                        {field.options?.map((option) => (
                          <Grid item xs={12} sm={6} key={option}>
                            <Paper 
                              sx={{
                                p: 2,
                                borderRadius: 2,
                                border: '1px solid var(--border-color)',
                                background: (formData[field.id] || []).includes(option) ? 'var(--color-primary-light)' : 'var(--color-bg)',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer',
                                '&:hover': {
                                  borderColor: 'var(--color-primary)',
                                  background: 'var(--color-primary-light)'
                                }
                              }}
                              onClick={() => {
                                const checked = !(formData[field.id] || []).includes(option);
                                handleCheckboxChange(field.id, option, checked);
                              }}
                            >
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={(formData[field.id] || []).includes(option)}
                                    onChange={(e) => handleCheckboxChange(field.id, option, e.target.checked)}
                                    sx={{ 
                                      color: 'var(--color-primary)',
                                      '&.Mui-checked': {
                                        color: 'var(--color-primary)'
                                      }
                                    }}
                                  />
                                }
                                label={
                                  <Typography sx={{ 
                                    color: 'var(--color-text)',
                                    fontWeight: 500
                                  }}>
                                    {option}
                                  </Typography>
                                }
                                sx={{ margin: 0, width: '100%', pointerEvents: 'none' }}
                              />
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                      {errors[field.id] && (
                        <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                          {errors[field.id]}
                        </Typography>
                      )}
                    </FormControl>
                  );

                case 'URL':
                  return (
                    <TextField
                      {...commonTextFieldProps}
                      type="url"
                      placeholder="https://example.com"
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                    />
                  );

                case 'Date':
                  return (
                    <TextField
                      {...commonTextFieldProps}
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      inputProps={{
                        min: field.minDate || undefined,
                        max: field.maxDate || undefined
                      }}
                    />
                  );

                case 'Label':
                  return (
                    <Typography 
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

                case 'Terms & Condition':
                  return (
                    <FormControl error={!!errors[field.id]} sx={{ width: '100%' }}>
                      <Paper sx={{
                        p: 3,
                        borderRadius: 2,
                        border: '1px solid var(--border-color)',
                        background: 'var(--color-bg)',
                        maxHeight: 200,
                        overflowY: 'auto',
                        mb: 2
                      }}>
                        <Typography variant="body2" sx={{ color: 'var(--color-text)', lineHeight: 1.6 }}>
                          {field.text || 'Terms and conditions content...'}
                        </Typography>
                      </Paper>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={!!formData[field.id]}
                            onChange={(e) => handleInputChange(field.id, e.target.checked)}
                            sx={{ 
                              color: 'var(--color-primary)',
                              '&.Mui-checked': {
                                color: 'var(--color-primary)'
                              }
                            }}
                          />
                        }
                        label={
                          <Typography sx={{ color: 'var(--color-text)', fontWeight: 500 }}>
                            I agree to the terms and conditions
                          </Typography>
                        }
                      />
                      {errors[field.id] && (
                        <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                          {errors[field.id]}
                        </Typography>
                      )}
                    </FormControl>
                  );

                case 'Custom ID':
                  return (
                    <TextField
                      {...commonTextFieldProps}
                      type="text"
                      placeholder="Enter custom ID"
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      helperText={errors[field.id] || field.customValue || "Enter your custom identifier"}
                    />
                  );

                default:
                  return (
                    <TextField
                      {...commonTextFieldProps}
                      type="text"
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                    />
                  );
              }
            })()}
          </CardContent>
        </Card>
      </Fade>
    );
  };

  if (loading) {
    return (
      <Box 
        sx={{ 
          minHeight: '100vh',
          background: theme === 'dark' 
            ? 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)'
            : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Card sx={{ 
          p: 6, 
          borderRadius: 4,
          textAlign: 'center',
          background: 'var(--color-card-bg)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-xl)'
        }}>
          <CircularProgress size={60} thickness={4} sx={{ color: 'var(--color-primary)', mb: 3 }} />
          <Typography variant="h6" sx={{ 
            fontFamily: 'var(--font-heading)',
            fontWeight: 600,
            color: 'var(--color-text)',
            mb: 1
          }}>
            Loading Registration Form
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
            Please wait while we prepare your form...
          </Typography>
        </Card>
      </Box>
    );
  }

  if (!event) {
    return (
      <Box 
        sx={{ 
          minHeight: '100vh',
          background: theme === 'dark' 
            ? 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)'
            : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Container maxWidth="md">
          <Card sx={{ 
            p: 6, 
            borderRadius: 4,
            textAlign: 'center',
            background: 'var(--color-card-bg)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-xl)'
          }}>
            <Assignment sx={{ 
              fontSize: 100, 
              color: 'var(--color-text-secondary)', 
              mb: 3,
              opacity: 0.6
            }} />
            <Typography variant="h4" sx={{ 
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              color: 'var(--color-text)',
              mb: 2
            }}>
              Event Not Found
            </Typography>
            <Typography variant="body1" sx={{ 
              color: 'var(--color-text-secondary)',
              mb: 4
            }}>
              We couldn't find the event you're trying to register for.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/events')}
              sx={{
                background: 'var(--gradient-primary)',
                borderRadius: '50px',
                textTransform: 'none',
                fontWeight: 600,
                px: 4,
                py: 1.5
              }}
            >
              Back to Events
            </Button>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        background: theme === 'dark' 
          ? 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)'
          : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        fontFamily: 'var(--font-base)'
      }}
    >
      {/* Header */}
      <Box 
        sx={{ 
          background: theme === 'dark'
            ? 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          py: 4,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '-30%',
            right: '-10%',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            animation: 'float 6s ease-in-out infinite'
          }}
        />
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
            <IconButton 
              onClick={() => navigate(`/event/${eventId}/details`)}
              sx={{ 
                color: 'white',
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  background: 'rgba(255,255,255,0.2)',
                  transform: 'scale(1.05)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              <ArrowBack />
            </IconButton>
            <Box>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontFamily: 'var(--font-heading)',
                  fontSize: { xs: '1.8rem', md: '2.5rem' },
                  fontWeight: 800,
                  color: 'white',
                  letterSpacing: '-0.02em',
                  mb: 0.5
                }}
              >
                Event Registration
              </Typography>
              <Typography 
                variant="h6"
                sx={{ 
                  color: 'rgba(255,255,255,0.9)',
                  fontWeight: 400
                }}
              >
                {event.name}
              </Typography>
            </Box>
          </Box>

          {/* Quick Event Info */}
          <Grid container spacing={3} sx={{ maxWidth: '600px' }}>
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Schedule sx={{ color: '#fbbf24', fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  {new Date(event.start_date).toLocaleDateString()}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn sx={{ color: '#10b981', fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  {event.location}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Security sx={{ color: '#f472b6', fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  Secure Registration
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Progress Stepper */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Card sx={{ 
          borderRadius: 3,
          background: 'var(--color-card-bg)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-md)',
          mb: 4
        }}>
          <CardContent sx={{ p: 4 }}>
            <Stepper activeStep={0} sx={{ mb: 3 }}>
              <Step>
                <StepLabel 
                  StepIconComponent={() => (
                    <Avatar sx={{ 
                      background: 'var(--gradient-primary)',
                      width: 32,
                      height: 32,
                      fontSize: '0.9rem'
                    }}>
                      1
                    </Avatar>
                  )}
                >
                  <Typography sx={{ fontWeight: 600, color: 'var(--color-text)' }}>
                    Registration
                  </Typography>
                </StepLabel>
              </Step>
              <Step>
                <StepLabel>Ticket Selection</StepLabel>
              </Step>
              <Step>
                <StepLabel>Payment</StepLabel>
              </Step>
              <Step>
                <StepLabel>Confirmation</StepLabel>
              </Step>
            </Stepper>
            
            {/* Progress Bar */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" sx={{ 
                color: 'var(--color-text-secondary)',
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
                  backgroundColor: 'var(--surface-2)',
                  '& .MuiLinearProgress-bar': {
                    background: 'var(--gradient-primary)',
                    borderRadius: 4
                  }
                }}
              />
              <Typography variant="body2" sx={{ 
                color: 'var(--color-primary)',
                fontWeight: 600,
                minWidth: 'fit-content'
              }}>
                {Math.round(completionProgress)}%
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>

      {/* Registration Form */}
      <Container maxWidth="md" sx={{ pb: 8 }}>
        <Card sx={{ 
          borderRadius: 4,
          background: 'var(--color-card-bg)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden'
        }}>
          <Box sx={{ 
            background: 'var(--gradient-primary)',
            p: 4,
            textAlign: 'center'
          }}>
            <AutoAwesome sx={{ fontSize: 48, color: 'white', mb: 2 }} />
            <Typography 
              variant="h4" 
              sx={{ 
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                color: 'white',
                mb: 1
              }}
            >
              Registration Form
            </Typography>
            <Typography 
              variant="body1"
              sx={{ 
                color: 'rgba(255,255,255,0.9)',
                maxWidth: '400px',
                mx: 'auto'
              }}
            >
              Please fill in your details to complete your event registration
            </Typography>
          </Box>

          <CardContent sx={{ p: 4 }}>
            {formFields.length === 0 ? (
              <Alert 
                severity="info" 
                sx={{ 
                  borderRadius: 3,
                  fontSize: '1rem',
                  '& .MuiAlert-message': {
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }
                }}
              >
                <Description />
                No registration form found for this event. Please contact the event organizer for assistance.
              </Alert>
            ) : (
              <form onSubmit={handleSubmit}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 600,
                    color: 'var(--color-text)',
                    mb: 4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}
                >
                  <Assignment sx={{ color: 'var(--color-primary)' }} />
                  Personal Information
                  <Chip 
                    label={`${formFields.filter(f => f.type !== 'Label').length} fields`}
                    size="small"
                    sx={{ 
                      background: 'var(--color-primary-light)',
                      color: 'var(--color-primary)',
                      fontWeight: 600
                    }}
                  />
                </Typography>

                {formFields.map((field, index) => renderField(field, index))}

                {/* Form Actions */}
                <Card sx={{ 
                  mt: 4,
                  background: 'var(--surface-1)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 3
                }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <CheckCircle sx={{ color: 'var(--color-success)', fontSize: 24 }} />
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontFamily: 'var(--font-heading)',
                          fontWeight: 600,
                          color: 'var(--color-text)'
                        }}
                      >
                        Ready to Submit?
                      </Typography>
                    </Box>
                    
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'var(--color-text-secondary)',
                        mb: 4,
                        lineHeight: 1.6
                      }}
                    >
                      Please review your information above. Once submitted, you'll proceed to ticket selection and receive your confirmation details.
                    </Typography>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between">
                      <Button
                        variant="outlined"
                        size="large"
                        onClick={() => navigate(`/event/${eventId}/details`)}
                        sx={{
                          borderColor: 'var(--border-color)',
                          color: 'var(--color-text-secondary)',
                          borderRadius: '50px',
                          textTransform: 'none',
                          fontWeight: 600,
                          px: 4,
                          py: 1.5,
                          '&:hover': {
                            borderColor: 'var(--color-primary)',
                            color: 'var(--color-primary)',
                            background: 'transparent'
                          }
                        }}
                      >
                        Back to Details
                      </Button>
                      
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={submitting}
                        endIcon={
                          submitting ? 
                          <CircularProgress size={20} sx={{ color: 'white' }} /> : 
                          <ArrowForward />
                        }
                        sx={{
                          background: 'var(--gradient-primary)',
                          borderRadius: '50px',
                          textTransform: 'none',
                          fontWeight: 700,
                          fontSize: '1.1rem',
                          px: 4,
                          py: 1.5,
                          minWidth: '180px',
                          boxShadow: 'var(--shadow-lg)',
                          '&:hover': {
                            background: 'var(--gradient-primary)',
                            transform: 'translateY(-2px)',
                            boxShadow: 'var(--shadow-xl)'
                          },
                          '&:disabled': {
                            background: 'var(--color-text-secondary)',
                            color: 'white'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {submitting ? 'Submitting...' : 'Continue to Tickets'}
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Security Notice */}
        <Card sx={{ 
          mt: 4,
          borderRadius: 3,
          background: 'var(--surface-1)',
          border: '1px solid var(--border-color)'
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, textAlign: 'center' }}>
              <Security sx={{ color: 'var(--color-success)', fontSize: 24 }} />
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'var(--color-text-secondary)',
                  flex: 1
                }}
              >
                🔒 Your information is secure and encrypted. We respect your privacy and will only use your data for event-related communications.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ 
            width: '100%',
            borderRadius: 2,
            fontWeight: 500
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Global Styles for Animations */}
      <Box
        sx={{
          '@keyframes float': {
            '0%, 100%': { 
              transform: 'translateY(0px) rotate(0deg)' 
            },
            '50%': { 
              transform: 'translateY(-15px) rotate(2deg)' 
            }
          }
        }}
      />
    </Box>
  );
}