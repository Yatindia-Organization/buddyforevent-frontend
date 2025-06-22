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
} from '@mui/material'
import { useGlobalInfo } from '../../../contexts/globalContext'
import { API_ROUTE } from '../../../lib/config'

export default function SingleParticipation() {
  const { event: eventId } = useGlobalInfo()
  const [schema, setSchema] = useState(null)
  const [values, setValues] = useState({})
  const [loading, setLoading] = useState(true)

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  })

  useEffect(() => {
    if (!eventId) return

    fetch(`${API_ROUTE}/api/v1/event/registration-form/eventId/${eventId}`)
      .then((r) => r.json())
      .then((forms) => {
        if (!forms.length) {
          setSchema(null)
        } else {
          const form = forms[0]
          setSchema(form)
          const initial = { visitorCount: 0 }
          form.fields.forEach((f) => {
            initial[f.id] = f.type === 'Checkbox' ? false : ''
          })
          setValues(initial)
        }
      })
      .finally(() => setLoading(false))
  }, [eventId])

  const handleChange = (id, val) => {
    setValues((v) => ({ ...v, [id]: val }))
  }

  const handleSubmit = () => {
    if (!schema) return

    const responses = schema.fields.map((f) => ({
      fieldId: f.id,
      value: values[f.id],
    }))
    const visitorCount = Number(values.visitorCount) || 0

    fetch(`${API_ROUTE}/api/v1/event/form-submission`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventId,
        formId: schema._id,
        responses,
        visitorCount,
      }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text())
        return res.json()
      })
      .then((data) => {
        console.log('Submitted:', data)
        setSnackbar({
          open: true,
          message: 'Registration submitted successfully!',
          severity: 'success',
        })
        // Optionally clear or reset form here:
        // setValues(prev => ({ ...prev, visitorCount: 0 }))
      })
      .catch((err) => {
        console.error(err)
        setSnackbar({
          open: true,
          message: `Submission failed: ${err.message}`,
          severity: 'error',
        })
      })
  }

  const handleCloseSnackbar = () => {
    setSnackbar((s) => ({ ...s, open: false }))
  }

  if (loading) return <Typography>Loading…</Typography>
  if (!schema)
    return (
      <Box p={4} textAlign="center">
        <Typography variant="h6">No registration form found.</Typography>
        <Button
          variant="contained"
          color="primary"
          href="/event-dashboard/participant-registration"
        >
          Build a Registration Form
        </Button>
      </Box>
    )

  return (
    <Box display="flex" justifyContent="center" p={3}>
      <Paper elevation={3} sx={{ width: '100%', maxWidth: 400 }}>
        <Box p={3}>
          <Typography variant="h6" gutterBottom color="#9A93B3">
            {schema.title || 'Register'}
          </Typography>
          <Typography variant="body2" mb={2}>
            {schema.description}
          </Typography>

          <Stack spacing={2}>
            {schema.fields.map((f) => {
              const common = {
                key: f.id,
                fullWidth: true,
                size: 'small',
                margin: 'dense',
                variant: 'outlined',
              }
              switch (f.type) {
                case 'Input Field':
                case 'Email':
                  return (
                    <TextField
                      {...common}
                      type={f.type === 'Email' ? 'email' : 'text'}
                      label={f.label}
                      value={values[f.id]}
                      onChange={(e) =>
                        handleChange(f.id, e.target.value)
                      }
                    />
                  )
                case 'Textarea':
                  return (
                    <TextField
                      {...common}
                      multiline
                      rows={3}
                      label={f.label}
                      value={values[f.id]}
                      onChange={(e) =>
                        handleChange(f.id, e.target.value)
                      }
                    />
                  )
                case 'Number Field':
                  return (
                    <TextField
                      {...common}
                      type="number"
                      label={f.label}
                      InputProps={{ inputProps: { min: 0 } }}
                      value={values[f.id]}
                      onChange={(e) =>
                        handleChange(f.id, e.target.value)
                      }
                    />
                  )
                case 'Select Menu':
                  return (
                    <TextField
                      {...common}
                      select
                      label={f.label}
                      value={values[f.id]}
                      onChange={(e) =>
                        handleChange(f.id, e.target.value)
                      }
                    >
                      {f.options.map((o) => (
                        <MenuItem key={o} value={o}>
                          {o}
                        </MenuItem>
                      ))}
                    </TextField>
                  )
                case 'Checkbox':
                  return (
                    <FormControlLabel
                      key={f.id}
                      control={
                        <Checkbox
                          size="small"
                          checked={values[f.id]}
                          onChange={(e) =>
                            handleChange(f.id, e.target.checked)
                          }
                        />
                      }
                      label={f.label}
                      sx={{ mt: 1 }}
                    />
                  )
                default:
                  return null
              }
            })}

            {/* Additional Visitors */}
            <TextField
              fullWidth
              size="small"
              margin="dense"
              variant="outlined"
              type="number"
              label="Additional Visitors"
              helperText="Enter extra guests (0 if none)."
              InputProps={{ inputProps: { min: 0 } }}
              value={values.visitorCount}
              onChange={(e) =>
                handleChange('visitorCount', e.target.value)
              }
            />
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Box display="flex" justifyContent="flex-end" gap={1}>
            <Button size="small">Cancel</Button>
            <Button
              size="small"
              variant="contained"
              onClick={handleSubmit}
            >
              Proceed
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
