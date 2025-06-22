import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import DraggableField from '../DraggableField/DraggableField';
import FieldSettings from '../FieldSettings/FieldSettings';
import ToolboxField from '../ToolboxField/ToolboxField';
import { getDefaultFieldSchema } from '../../../../lib/config/getDefaultFieldSchema';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { Typography, CircularProgress } from '@mui/material';
import { API_ROUTE } from '../../../../lib/config';
import { useGlobalInfo } from '../../../../contexts/globalContext';

const FIELD_TYPES = [
  { type: 'Input Field', icon: '🔤' },
  { type: 'Email', icon: '📧' },
  { type: 'Textarea', icon: '📝' },
  { type: 'Number Field', icon: '🔢' },
  { type: 'Select Menu', icon: '📋' },
  { type: 'Radio Button', icon: '🔘' },
  { type: 'Checkbox', icon: '☑️' },
  { type: 'URL', icon: '🔗' },
  { type: 'File Upload', icon: '📁' },
  { type: 'Date', icon: '📅' },
  { type: 'Label', icon: '🏷️' },
  { type: 'Terms & Condition', icon: '📜' }
];

export default function FormBuilder() {
  const { event: eventId } = useGlobalInfo();
  const [fields, setFields] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [finalSchema, setFinalSchema] = useState(null);

  const [loading, setLoading] = useState(true);
  const [formExists, setFormExists] = useState(false);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });

  // Check for existing form on mount or when eventId changes
  useEffect(() => {
    if (!eventId) {
      setLoading(false);
      return;
    }

    const fetchForm = async () => {
      try {
        const res = await fetch(`${API_ROUTE}/api/v1/event/registration-form/eventId/${eventId}`);
        if (res.status === 404) {
          setFormExists(false);
        } else if (res.ok) {
          const data = await res.json();
          setFields(data.fields || []);
          setFormExists(true);
        } else {
          const err = await res.json();
          throw new Error(err.message || 'Failed to fetch form');
        }
      } catch (error) {
        console.error('Error fetching existing form:', error.message);
        setSnackbar({ open: true, message: error.message, severity: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [eventId]);

  const handleDropFromToolbox = (e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('field-type');
    const newField = getDefaultFieldSchema(type);
    setFields([...fields, newField]);
  };

  const handleReorder = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(fields);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setFields(reordered);
  };

  const handleSaveField = (updatedField) => {
    setFields(fields.map(f => (f.id === updatedField.id ? updatedField : f)));
    setEditingId(null);
  };

  const handleProceed = async () => {
    const hasEmptyLabel = fields.some(field => !field.label || field.label.trim() === '');
    if (hasEmptyLabel) {
      setSnackbar({ open: true, message: 'Add fields to the inputs.', severity: 'error' });
      return;
    }

    const schema = fields;
    setFinalSchema(schema);

    try {
      const body = { eventId, fields: schema };
      const response = await fetch(`${API_ROUTE}/api/v1/event/registration-form`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.message || `Creation failed: ${response.status}`);
      }

      await response.json();
      setFormExists(true);
      setSnackbar({ open: true, message: 'Form created successfully.', severity: 'success' });
    } catch (error) {
      console.error('Error submitting form:', error.message);
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    }
  };

  const handleCancel = () => {
    setFields([]);
    setEditingId(null);
    setFinalSchema(null);
  };

  if (loading) {
    return <div className="flex justify-center p-6"><CircularProgress /></div>;
  }

  if (formExists && !finalSchema) {
    return (
      <div className="p-6">
        <Typography variant="h6" color="textSecondary" gutterBottom>
          A registration form already exists for this event.
        </Typography>
        <Typography variant="body2" mb={2}>
          You cannot create a new form.
        </Typography>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Typography variant="body2" color="#E36A6C" mb={3}>
        Please note that the participants will be receiving email, SMS, and WhatsApp messages after the registration.
      </Typography>

      {/* Toolbox */}
      <h2 className="text-lg font-bold mb-4">Add New Field</h2>
      <div className="flex gap-2 flex-wrap mb-6">
        {FIELD_TYPES.map(({ type, icon }) => (
          <ToolboxField key={type} type={type} icon={icon} onDragStart={e => e.dataTransfer.setData('field-type', type)} />
        ))}
      </div>

      {/* Form Designer */}
      <h2 className="text-lg font-bold mb-2">Form Designer</h2>
      <div onDrop={handleDropFromToolbox} onDragOver={e => e.preventDefault()} className="min-h-[300px] border border-dashed p-4 rounded bg-gray-50">
        <DragDropContext onDragEnd={handleReorder}>
          <Droppable droppableId="form-fields">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {fields.map((field, index) => (
                  <Draggable key={field.id} draggableId={field.id} index={index}>
                    {(prov) => (
                      <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps} className="mb-2">
                        <DraggableField
                          field={field}
                          index={index}
                          onConfigure={() => setEditingId(field.id)}
                          onDelete={() => setFields(fields.filter(f => f.id !== field.id))}
                        />
                        {editingId === field.id && (
                          <FieldSettings
                            field={field}
                            onSave={handleSaveField}
                            onCancel={() => setEditingId(null)}
                          />
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
                {fields.length === 0 && <p className="text-gray-400">Drag fields here to build your form</p>}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* Proceed / Cancel buttons */}
      {fields.length > 0 && (
        <div className="flex gap-4 mt-4">
          <button onClick={handleProceed} className="bg-green-600 text-white px-4 py-2 rounded shadow">
            Proceed
          </button>
          <button onClick={handleCancel} className="text-red-500 px-4 py-2">
            Cancel
          </button>
        </div>
      )}

      {/* Final Schema Display */}
      {Array.isArray(finalSchema) && finalSchema.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Final JSON Schema (In Order)</h3>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-[400px]">
            {JSON.stringify(finalSchema, null, 2)}
          </pre>
        </div>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
