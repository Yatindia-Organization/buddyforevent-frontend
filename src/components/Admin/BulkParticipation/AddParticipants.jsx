import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import {
    Box,
    Button,
    Typography,
    Paper,
    Snackbar,
    Alert,
    Stack
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { API_ROUTE } from '../../../lib/config';
import { useGlobalInfo } from '../../../contexts/globalContext';

export default function AddParticipants() {
    const context = useGlobalInfo();

    const [excelData, setExcelData] = useState([]);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

    const [columnName] = useState({
        eventId: "475asdfasdfa46d1fa78sd7f",
        userId: "798465sdfa6sdf6as",
        fields: [
            { label: "Name" },
            { label: "Email" },
            { label: "City", options: ["Hyd", "Chennai", "Delhi"] },
            { label: "Gender", options: ["Male", "Female"] }
        ]
    });

    const handleSnackbarClose = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const showToast = (message, severity = 'info') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];

        if (!file || !/\.(xls|xlsx)$/i.test(file.name)) {
            showToast("Invalid file format. Please upload an Excel file (.xls or .xlsx)", 'error');
            return;
        }

        // if (file.size > 1 * 1024 * 1024) {
        //     showToast("File size exceeds 1MB limit.", 'error');
        //     return;
        // }

        const reader = new FileReader();
        reader.onload = (evt) => {
            const data = new Uint8Array(evt.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            const headers = rawData[0];
            const rows = rawData.slice(1);

            const requiredHeaders = columnName.fields.map(f => f.label);
            const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

            if (missingHeaders.length > 0) {
                showToast(`Missing required headers: ${missingHeaders.join(', ')}`, 'error');
                return;
            }

            const jsonData = rows.map((row) =>
                headers.reduce((acc, header, i) => {
                    acc[header] = row[i];
                    return acc;
                }, {})
            );

            setExcelData(jsonData);

            const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

            fetch(`${API_ROUTE}/api/v1/event/form-submission/event/${context?.eventId}/form/<formId>/upload-csv`, {
                method: 'POST',
                headers: { 'Content-Type': 'text/csv' },
                body: csvContent,
            })
                .then(res => {
                    if (res.ok) {
                        showToast("File uploaded successfully!", 'success');
                    } else {
                        showToast("Upload failed. Please try again.", 'error');
                    }
                })
                .catch((err) => {
                    console.error("Upload error:", err);
                    showToast("Upload failed. Server error.", 'error');
                });
        };

        reader.readAsArrayBuffer(file);
    };

    const handleDownloadTemplate = () => {
        const headers = columnName.fields.map(f => f.label);
        const ws = XLSX.utils.aoa_to_sheet([headers]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");

        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/octet-stream' });
        saveAs(blob, "participants_template.xlsx");
    };

    return (
        <Box sx={{ maxWidth: 1000 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#5D5C8D' }}>
                Bulk Registration
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
                Issue tickets to your Participants without asking them to register online.
            </Typography>
            <Typography variant="caption" sx={{ color: 'red', mb: 3, display: 'block' }}>
                Participants will receive email, SMS and WhatsApp notifications after registration.
            </Typography>

            <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                    NOTE: Please download and use the sample CSV file.
                </Typography>
                <Button onClick={handleDownloadTemplate} variant="text" sx={{ textTransform: 'none', mb: 2 }}>
                    Download sample CSV
                </Button>
                <Typography variant="caption" sx={{ color: 'red', mb: 2, display: 'block' }}>
                    Fill the downloaded file and upload it with your participant data.
                </Typography>

                <Box
                    sx={{
                        border: '2px dashed #b3b3ff',
                        borderRadius: 2,
                        p: 4,
                        textAlign: 'center',
                        bgcolor: '#fafafa',
                        mb: 3
                    }}
                >
                    <input
                        accept=".xlsx,.xls"
                        id="upload-excel"
                        type="file"
                        hidden
                        onChange={handleFileUpload}
                    />
                    <label htmlFor="upload-excel">
                        <CloudUploadIcon sx={{ fontSize: 48, color: '#b3b3ff' }} />
                        <Typography
                            variant="body1"
                            component="div"
                            sx={{ cursor: 'pointer', color: '#007bff', textDecoration: 'underline' }}
                        >
                            Click to upload File
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            or drag and drop
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                            Max file size: 1 MB
                        </Typography>
                    </label>
                </Box>
            </Paper>

            {excelData.length > 0 && (
                <Box>
                    <Typography variant="h6" sx={{ mt: 2 }}>
                        Uploaded Preview:
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f9f9f9', maxHeight: 300, overflow: 'auto' }}>
                        <pre>{JSON.stringify(excelData, null, 2)}</pre>
                    </Paper>
                </Box>
            )}

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
