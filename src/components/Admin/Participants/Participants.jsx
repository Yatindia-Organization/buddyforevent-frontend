import React, { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  Button,
  CircularProgress,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { API_ROUTE } from '../../../lib/config'
import { useGlobalInfo } from '../../../contexts/globalContext'

export default function Participants() {
  const { event: eventId } = useGlobalInfo()
  const navigate = useNavigate()

  const [formExists, setFormExists] = useState(null)       // null = checking...
  const [schema, setSchema]       = useState(null)
  const [rows, setRows]           = useState([])
  const [page, setPage]           = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [totalPages, setTotalPages]   = useState(1)
  const [searchText, setSearchText]   = useState('')

  // 1) Check for form existence & load schema
  useEffect(() => {
    if (!eventId) {
      setFormExists(false)
      return
    }

    fetch(`${API_ROUTE}/api/v1/event/registration-form/eventId/${eventId}`)
      .then(res => {
        if (res.status === 404) {
          setFormExists(false)
          return null
        }
        return res.json()
      })
      .then(forms => {
        if (forms && Array.isArray(forms) && forms.length > 0) {
          setSchema(forms[0])
          setFormExists(true)
        } else if (forms !== null) {
          // empty array or unexpected shape
          setFormExists(false)
        }
      })
      .catch(err => {
        console.error('Error fetching form schema:', err)
        setFormExists(false)
      })
  }, [eventId])

  // 2) Load participants when form exists
  useEffect(() => {
    if (!eventId || !formExists) return

    const params = new URLSearchParams({
      eventId,
      page: page.toString(),
      limit: rowsPerPage.toString(),
    })
    if (searchText.trim()) {
      params.set('q', searchText.trim())
    }

    fetch(`${API_ROUTE}/api/v1/event/participantSearch?${params}`)
      .then(r => r.json())
      .then(data => {
        setRows(data.results)
        setTotalPages(data.totalPages)
      })
      .catch(err => {
        console.error('Error fetching participants:', err)
      })
  }, [eventId, page, rowsPerPage, searchText, formExists])

  // Helper to render a response cell
  function renderValue(row, field) {
    const resp = row.responses.find(r => r.fieldId === field.id)
    if (!resp) return ''
    const val = resp.value
    if (typeof val === 'boolean') return val ? 'YES' : 'NO'
    if (val && typeof val === 'object') {
      const { text, hyperlink } = val
      if (text && hyperlink) {
        return (
          <a href={hyperlink} target="_blank" rel="noopener noreferrer">
            {text}
          </a>
        )
      }
      return JSON.stringify(val)
    }
    return val ?? ''
  }

  // --- RENDERING ---

  if (!eventId) {
    return (
      <Typography variant="body1" color="error">
        No event selected.
      </Typography>
    )
  }

  // still checking form existence?
  if (formExists === null) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    )
  }

  // no form → prompt to create one
  if (!formExists) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 8, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          No registration form found
        </Typography>
        <Typography variant="body2" sx={{ mb: 3 }}>
          Please create a registration form first before viewing participants.
        </Typography>
      </Box>
    )
  }

  // form exists but schema not loaded yet
  if (formExists && !schema) {
    return (
      <Typography>Loading form schema…</Typography>
    )
  }

  // everything's ready → show participants table
  return (
    <Box p={3}>
      <Typography variant="h6" gutterBottom>
        Participant Overview
      </Typography>

      {/* Search */}
      <Box mb={2} display="flex" gap={2} alignItems="center">
        <TextField
          size="small"
          label="Search"
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && setPage(1)}
        />
        <Button variant="contained" onClick={() => setPage(1)}>
          Go
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {schema.fields.map(f => (
                <TableCell key={f.id} sx={{ fontWeight: 'bold' }}>
                  {f.label}
                </TableCell>
              ))}
              <TableCell sx={{ fontWeight: 'bold' }}>Visitors</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Entry Time</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Exit Time</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Gift</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Food</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>QR Code</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(row => (
              <TableRow key={row._id}>
                {schema.fields.map(f => (
                  <TableCell key={f.id}>
                    {renderValue(row, f)}
                  </TableCell>
                ))}
                <TableCell>{row.visitorCount ?? 0}</TableCell>
                <TableCell>
                  {row.entryTime?.length
                    ? new Date(row.entryTime[0]).toLocaleTimeString()
                    : '—'}
                </TableCell>
                <TableCell>
                  {row.exitTime?.length
                    ? new Date(row.exitTime[0]).toLocaleTimeString()
                    : '—'}
                </TableCell>
                <TableCell>
                  {row.gift == null ? '—' : row.gift ? 'YES' : 'NO'}
                </TableCell>
                <TableCell>
                  {row.food == null ? '—' : row.food ? 'YES' : 'NO'}
                </TableCell>
                <TableCell>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => navigate(`/qr/${row._id}`)}
                    disabled={!row.qrcodeUrl}
                  >
                    View QR
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* pagination */}
      <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
        <Box display="flex" alignItems="center" gap={1}>
          <Typography>Page:</Typography>
          <Select
            size="small"
            value={page}
            onChange={e => setPage(Number(e.target.value))}
          >
            {Array.from({ length: totalPages }, (_, i) => (
              <MenuItem key={i+1} value={i+1}>{i+1}</MenuItem>
            ))}
          </Select>
          <Typography>of {totalPages}</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography>Rows per page:</Typography>
          <Select
            size="small"
            value={rowsPerPage}
            onChange={e => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
          >
            {[10, 25, 50].map(n => (
              <MenuItem key={n} value={n}>{n}</MenuItem>
            ))}
          </Select>
        </Box>
      </Box>
    </Box>
  )
}
