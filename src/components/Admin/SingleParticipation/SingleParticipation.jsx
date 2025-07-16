// src/components/Admin/SingleParticipation.jsx
import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  Paper,
  Checkbox,
  FormControlLabel,
  Stack,
  Divider,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useGlobalInfo } from '../../../contexts/globalContext'
import { API_ROUTE } from '../../../lib/config'

export default function SingleParticipation() {
  const { event: eventId } = useGlobalInfo()
  const navigate = useNavigate()

  const [schema, setSchema] = useState(null)
  const [ticketTiers, setTicketTiers] = useState([])
  const [values, setValues] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  // fetch form schema + tiers
  useEffect(() => {
    if (!eventId) return

    Promise.all([
      fetch(`${API_ROUTE}/api/v1/event/registration-form/eventId/${eventId}`).then(r => r.json()),
      fetch(`${API_ROUTE}/api/v1/event/ticket-tiers/${eventId}`).then(r => r.json()),
    ])
      .then(([formsRes, tiersRes]) => {
        const forms = Array.isArray(formsRes) ? formsRes : formsRes.data?.forms || []
        if (forms.length) {
          const form = forms[0]
          setSchema(form)
          // Initialize form values
          const initial = { tierName: '', visitorCount: 0 }
          form.fields.forEach(f => {
            initial[f.id] = ''           // every field starts blank
          })
          setValues(initial)
        }
        if (tiersRes.success) {
          setTicketTiers(tiersRes.data.ticket_tiers)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [eventId])

  const handleChange = (id, val) => {
    setValues(v => ({ ...v, [id]: val }))
  }

  const handleSubmit = () => {
    if (!schema || !values.tierName) {
      return setSnackbar({ open: true, message: 'Please select a ticket tier', severity: 'error' })
    }

    setSubmitting(true)
    const responses = schema.fields.map(f => ({ fieldId: f.id, value: values[f.id] }))
    const visitorCount = Number(values.visitorCount) || 0

    fetch(`${API_ROUTE}/api/v1/event/form-submission`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventId,
        formId: schema._id,
        responses,
        visitorCount,
        tierName: values.tierName,
      }),
    })
      .then(async res => {
        if (!res.ok) throw new Error(await res.text())
        return res.json()
      })
      .then(data => {
        setSnackbar({ open: true, message: 'Ticket created!', severity: 'success' })
        setTimeout(() => navigate(`/qr/${data._id}`), 1500)
      })
      .catch(err => {
        console.error(err)
        setSnackbar({ open: true, message: `Failed: ${err.message}`, severity: 'error' })
        setSubmitting(false)
      })
  }

  const handleCloseSnackbar = () => setSnackbar(s => ({ ...s, open: false }))

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
      <CircularProgress />
    </Box>
  )

  if (submitting) return (
    <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="100vh">
      <CircularProgress />
      <Typography mt={2}>Processing…</Typography>
    </Box>
  )

  if (!schema) return (
    <Box p={4} textAlign="center">
      <Typography variant="h6">No registration form found.</Typography>
      <Button variant="contained" color="primary" href="/event-dashboard/participant-registration">
        Build a Registration Form
      </Button>
    </Box>
  )

  return (
    <Box display="flex" justifyContent="center" p={3}>
      <Paper elevation={3} sx={{ width: '100%', maxWidth: 400 }}>
        <Box p={3}>
          <Typography variant="h5" gutterBottom color="#9A93B3">
            {schema.title || 'Register'}
          </Typography>
          <Typography variant="body1" mb={3}>
            {schema.description}
          </Typography>

          <Stack spacing={2}>
            {/* Ticket tier selector */}
            <TextField
              select
              label="Ticket Tier"
              value={values.tierName}
              onChange={e => handleChange('tierName', e.target.value)}
              fullWidth
              size="small"
            >
              <MenuItem value="">Select tier</MenuItem>
              {ticketTiers.map(t => (
                <MenuItem key={t._id} value={t.name}>
                  {t.name} — ₹{t.price} ({t.capacity} left)
                </MenuItem>
              ))}
            </TextField>

            {/* Dynamic fields */}
            {schema.fields.map(f => (
              <Box key={f.id}>
                {/* Label */}
                <Typography variant="subtitle1" gutterBottom>
                  {f.label}
                </Typography>
                {/* Description */}
                {f.description && (
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {f.description}
                  </Typography>
                )}

                {(() => {
                  const common = {
                    fullWidth: true,
                    size: 'small',
                    margin: 'dense',
                    variant: 'outlined',
                    value: values[f.id] ?? '',
                  }
                  switch (f.type) {
                    case 'Input Field':
                    case 'Email':
                      return (
                        <TextField
                          {...common}
                          type={f.type === 'Email' ? 'email' : 'text'}
                          onChange={e => handleChange(f.id, e.target.value)}
                        />
                      )
                    case 'Phone Number':
                      return (
                        <TextField
                          {...common}
                          type="tel"
                          helperText="Digits only"
                          onChange={e => handleChange(f.id, e.target.value.replace(/\D/g, ''))}
                        />
                      )
                    case 'Textarea':
                      return (
                        <TextField
                          {...common}
                          multiline
                          rows={3}
                          onChange={e => handleChange(f.id, e.target.value)}
                        />
                      )
                    case 'Number Field':
                      return (
                        <TextField
                          {...common}
                          type="number"
                          InputProps={{ inputProps: { min: 0 } }}
                          onChange={e => handleChange(f.id, e.target.value)}
                        />
                      )
                    case 'Select Menu':
                    case 'Radio Button':
                      return (
                        <TextField
                          {...common}
                          select
                          onChange={e => handleChange(f.id, e.target.value)}
                        >
                          {f.options.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                        </TextField>
                      )
                    case 'Checkbox':
                    case 'Terms & Condition':
                      return (
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={!!values[f.id]}
                              onChange={e => handleChange(f.id, e.target.checked)}
                            />
                          }
                          label=""
                        />
                      )
                    case 'URL':
                      return (
                        <TextField
                          {...common}
                          type="url"
                          onChange={e => handleChange(f.id, e.target.value)}
                        />
                      )
                    case 'Date':
                      return (
                        <TextField
                          {...common}
                          type="date"
                          InputLabelProps={{ shrink: true }}
                          onChange={e => handleChange(f.id, e.target.value)}
                        />
                      )
                    case 'Label':
                      // purely static label already above
                      return null
                    case 'Custom ID':
                      return (
                        <TextField
                          {...common}
                          onChange={e => handleChange(f.id, e.target.value)}
                        />
                      )
                    default:
                      return (
                        <TextField
                          {...common}
                          onChange={e => handleChange(f.id, e.target.value)}
                        />
                      )
                  }
                })()}
              </Box>
            ))}

            {/* Additional visitors */}
            <TextField
              fullWidth
              size="small"
              margin="dense"
              variant="outlined"
              type="number"
              label="Additional Visitors"
              helperText="Enter extra guests (0 if none)"
              InputProps={{ inputProps: { min: 0 } }}
              value={values.visitorCount}
              onChange={e => handleChange('visitorCount', e.target.value)}
            />
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Box display="flex" justifyContent="flex-end" gap={1}>
            <Button size="small" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button size="small" variant="contained" onClick={handleSubmit}>
              Proceed
            </Button>
          </Box>
        </Box>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
