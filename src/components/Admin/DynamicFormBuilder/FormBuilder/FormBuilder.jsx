import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Box, Stack, Typography, Paper, Button, CircularProgress, Snackbar, Alert } from '@mui/material';
import DraggableField from '../DraggableField/DraggableField';
import FieldSettings from '../FieldSettings/FieldSettings';
import ToolboxField from '../ToolboxField/ToolboxField';
import { getDefaultFieldSchema } from '../../../../lib/config/getDefaultFieldSchema';
import { API_ROUTE } from '../../../../lib/config';
import { useGlobalInfo } from '../../../../contexts/globalContext';

const FIELD_TYPES = [
  { type: 'Input Field', icon: '🔤' },
  { type: 'Email', icon: '📧' },
  { type: 'Phone Number', icon: '📞' },
  { type: 'Textarea', icon: '📝' },
  { type: 'Number Field', icon: '🔢' },
  { type: 'Select Menu', icon: '📋' },
  { type: 'Radio Button', icon: '🔘' },
  { type: 'Checkbox', icon: '☑️' },
  { type: 'URL', icon: '🔗' },
  { type: 'Date', icon: '📅' },
  { type: 'Label', icon: '🏷️' },
  { type: 'Terms & Condition', icon: '📜' },
  { type: 'Custom ID', icon: '🆔' },
];

export default function FormBuilder() {
  const { event: eventId } = useGlobalInfo();
  const [fields, setFields] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [finalSchema, setFinalSchema] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formExists, setFormExists] = useState(false);
  const [isPublicEvent, setIsPublicEvent] = useState(false);
  const [mandatoryFieldsAdded, setMandatoryFieldsAdded] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });

  // Check if event is public
  useEffect(() => {
    if (!eventId) { setLoading(false); return; }

    (async () => {
      try {
        const res = await fetch(`${API_ROUTE}/api/v1/event/eventid/${eventId}`);
        if (res.ok) {
          const eventData = await res.json();
          setIsPublicEvent(eventData.data.public_event);
        }
      } catch (error) {
        console.error('Error checking event type:', error);
      }
    })();
  }, [eventId]);

  // fetch existing form
  useEffect(() => {
    if (!eventId) { setLoading(false); return; }

    (async () => {
      try {
        const res = await fetch(`${API_ROUTE}/api/v1/event/registration-form/eventId/${eventId}`);
        if (res.status === 404) {
          setFormExists(false);
          // If public event and no existing form, add mandatory fields
          if (isPublicEvent && !mandatoryFieldsAdded) {
            const emailField = getDefaultFieldSchema('Email');
            const phoneField = getDefaultFieldSchema('Phone Number');
            setFields([emailField, phoneField]);
            setMandatoryFieldsAdded(true);
          }
        } else if (res.ok) {
          const data = await res.json();
          setFields(data.fields || []);
          setFormExists(true);
        } else {
          const err = await res.json();
          throw new Error(err.message || 'Fetch failed');
        }
      } catch (error) {
        setSnackbar({ open: true, message: error.message, severity: 'error' });
      } finally {
        setLoading(false);
      }
    })();
  }, [eventId, isPublicEvent, mandatoryFieldsAdded]);

  const handleDropFromToolbox = (e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('field-type');
    setFields([...fields, getDefaultFieldSchema(type)]);
  };

  const handleReorder = ({ destination, source }) => {
    if (!destination) return;
    const arr = Array.from(fields);
    const [m] = arr.splice(source.index, 1);
    arr.splice(destination.index, 0, m);
    setFields(arr);
  };

  const handleSaveField = (updated) => {
    setFields(fields.map(f => f.id === updated.id ? updated : f));
    setEditingId(null);
  };

  const handleDeleteField = (fieldId) => {
    const fieldToDelete = fields.find(f => f.id === fieldId);
    
    // For public events, prevent deletion if it would leave no email or phone
    if (isPublicEvent && (fieldToDelete.type === 'Email' || fieldToDelete.type === 'Phone Number')) {
      const remainingFields = fields.filter(f => f.id !== fieldId);
      const hasEmail = remainingFields.some(f => f.type === 'Email');
      const hasPhone = remainingFields.some(f => f.type === 'Phone Number');
      
      if (!hasEmail && !hasPhone) {
        setSnackbar({ 
          open: true, 
          message: 'For public events, at least one contact field (Email or Phone Number) must remain.', 
          severity: 'warning' 
        });
        return;
      }
    }
    
    setFields(fields.filter(f => f.id !== fieldId));
  };

  const handleProceed = async () => {
    if (fields.some(f => !f.label.trim())) {
      setSnackbar({ open: true, message: 'All fields need a label.', severity: 'error' });
      return;
    }
    setFinalSchema(fields);
    try {
      const res = await fetch(`${API_ROUTE}/api/v1/event/registration-form`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, fields })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || `Error ${res.status}`);
      }
      setFormExists(true);
      setSnackbar({ open: true, message: 'Form saved!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    }
  };

  const handleCancel = () => {
    setFields([]); setEditingId(null); setFinalSchema(null);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (formExists && !finalSchema) {
    return (
      <Box p={4}>
        <Typography variant="h6" color="textSecondary">
          A form already exists for this event.
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Typography variant="body2" sx={{ color: 'var(--color-primary)' }} mb={3}>
        Participants will receive email, SMS & WhatsApp after registering.
      </Typography>

      {/* Public Event Notice */}
      {isPublicEvent && (
        <Box sx={{ 
          mb: 3, 
          p: 2, 
          bgcolor: 'rgba(33, 150, 243, 0.1)', 
          border: '1px solid rgba(33, 150, 243, 0.3)',
          borderRadius: 1 
        }}>
          <Typography variant="body2" sx={{ color: 'var(--color-primary)' }}>
            📢 For public events, Email and Phone Number fields are mandatory. At least one must remain in your form.
          </Typography>
        </Box>
      )}

      {/* TOOLBOX */}
      <Typography variant="h6" gutterBottom>Add New Field</Typography>
      <Stack direction="row" spacing={2} flexWrap="wrap" mb={4}>
        {FIELD_TYPES.map(({ type, icon }) => (
          <ToolboxField
            key={type}
            type={type}
            icon={icon}
            onDragStart={e => e.dataTransfer.setData('field-type', type)}
          />
        ))}
      </Stack>

      {/* DESIGN AREA */}
      <Typography variant="h6" gutterBottom>Form Designer</Typography>
      <Box
        onDrop={handleDropFromToolbox}
        onDragOver={e => e.preventDefault()}
        sx={{
          minHeight: 300,
          border: '2px dashed',
          borderColor: 'text.secondary',
          bgcolor: 'var(--color-card-bg)',
          p: 2,
          borderRadius: 1
        }}
      >
        <DragDropContext onDragEnd={handleReorder}>
          <Droppable droppableId="fields">
            {(prov) => (
              <Box ref={prov.innerRef} {...prov.droppableProps}>
                {fields.map((f, i) => (
                  <Draggable key={f.id} draggableId={f.id} index={i}>
                    {(p) => (
                      <Box
                        ref={p.innerRef}
                        {...p.draggableProps}
                        {...p.dragHandleProps}
                        mb={2}
                      >
                        <Paper sx={{ p:2 }}>
                          <DraggableField
                            field={f}
                            onConfigure={() => setEditingId(f.id)}
                            onDelete={() => handleDeleteField(f.id)}
                          />
                          {editingId === f.id && (
                            <FieldSettings
                              field={f}
                              onSave={handleSaveField}
                              onCancel={() => setEditingId(null)}
                            />
                          )}
                        </Paper>
                      </Box>
                    )}
                  </Draggable>
                ))}
                {prov.placeholder}
                {fields.length === 0 && (
                  <Typography color="textSecondary">Drag fields here…</Typography>
                )}
              </Box>
            )}
          </Droppable>
        </DragDropContext>
      </Box>

      {/* ACTIONS */}
      {fields.length > 0 && (
        <Stack direction="row" spacing={2} mt={3}>
          <Button variant="contained" color="primary" onClick={handleProceed}>
            Proceed
          </Button>
          <Button variant="outlined" color="primary" onClick={handleCancel}>
            Cancel
          </Button>
        </Stack>
      )}

      {/* FINAL SCHEMA */}
      {finalSchema && (
        <Box mt={4}>
          <Typography variant="subtitle1" gutterBottom>Final JSON Schema:</Typography>
          <Paper sx={{ p:2, maxHeight: 300, overflow: 'auto', bgcolor: 'var(--color-card-bg)' }}>
            <pre style={{ margin: 0, color: 'var(--color-text)' }}>
              {JSON.stringify(finalSchema, null, 2)}
            </pre>
          </Paper>
        </Box>
      )}

      {/* SNACKBAR */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar(s => ({ ...s, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}