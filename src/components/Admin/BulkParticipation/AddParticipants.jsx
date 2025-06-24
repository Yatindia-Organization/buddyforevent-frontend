import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  Box,
  Button,
  Typography,
  Paper,
  Snackbar,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { API_ROUTE } from "../../../lib/config";
import { useGlobalInfo } from "../../../contexts/globalContext";

export default function AddParticipants() {
  const { event: eventId } = useGlobalInfo();

  const [formExists, setFormExists] = useState(null);
  const [excelData, setExcelData] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [loading, setLoading] = useState(false);

  // 1) On mount, check for existing registration form
  useEffect(() => {
    if (!eventId) {
      setFormExists(false);
      return;
    }
    fetch(`${API_ROUTE}/api/v1/event/registration-form/eventId/${eventId}`)
      .then((res) => {
        if (res.status === 404) {
          setFormExists(false);
        } else if (res.ok) {
          setFormExists(true);
        } else {
          throw new Error("Unexpected response");
        }
      })
      .catch((err) => {
        console.error("Error checking form existence:", err);
        setFormExists(false);
      });
  }, [eventId]);

  const showToast = (message, severity = "info") => {
    setSnackbar({ open: true, message, severity });
  };
  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleDownloadTemplate = async () => {
    try {
      const res = await fetch(
        `${API_ROUTE}/api/v1/event/bulkRegistration/export-template/${eventId}`
      );
      if (!res.ok) throw new Error("Failed to download template");
      const blob = await res.blob();
      saveAs(blob, `template_${eventId}.xlsx`);
    } catch (err) {
      console.error(err);
      showToast("Error downloading template", "error");
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/\.(xls|xlsx)$/i.test(file.name)) {
      showToast("Invalid file format. Please upload .xls or .xlsx", "error");
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const wb = XLSX.read(data, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(ws, { defval: "" });
      setExcelData(json);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleGenerateTickets = async () => {
    if (!selectedFile) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch(
        `${API_ROUTE}/api/v1/event/bulkRegistration/import-template/${eventId}`,
        { method: "POST", body: formData }
      );
      const result = await res.json();
      if (!res.ok)
        throw new Error(result.error || "Failed to generate tickets");
      showToast(`Successfully generated ${result.count} tickets`, "success");

      setExcelData([]);
      setSelectedFile(null);
    } catch (err) {
      console.error(err);
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // 2) While we don’t yet know if the form exists, show a loader
  if (formExists === null) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  // 3) If no form exists, prompt to create one
  if (!formExists) {
    return (
      <Box sx={{ maxWidth: 600, mx: "auto", mt: 8, textAlign: "center" }}>
        <Typography variant="h6" gutterBottom>
          No registration form found
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Please create a registration form first before adding participants.
        </Typography>
      </Box>
    );
  }

  // 4) Otherwise, render the bulk‐upload UI
  return (
    <Box sx={{ maxWidth: 1000, mx: "auto" }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: "bold", color: "#5D5C8D" }}
      >
        Bulk Registration
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Issue tickets to your Participants without asking them to register
        online.
      </Typography>
      <Typography
        variant="caption"
        sx={{ color: "red", mb: 3, display: "block" }}
      >
        Participants will receive email, SMS and WhatsApp notifications after
        registration.
      </Typography>

      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="body2" sx={{ mb: 1 }}>
          NOTE: Please download and use the Sample Excel file.
        </Typography>
        <Button
          onClick={handleDownloadTemplate}
          variant="text"
          sx={{ textTransform: "none", mb: 2 }}
        >
          Download Sample Excel File
        </Button>
        <Typography
          variant="caption"
          sx={{ color: "red", mb: 2, display: "block" }}
        >
          Fill the downloaded file and upload it with your participant data.
        </Typography>

        <Box
          sx={{
            border: "2px dashed #b3b3ff",
            borderRadius: 2,
            p: 4,
            textAlign: "center",
            bgcolor: "#fafafa",
            mb: 3,
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
            <CloudUploadIcon sx={{ fontSize: 48, color: "#b3b3ff" }} />
            <Typography
              variant="body1"
              component="div"
              sx={{
                cursor: "pointer",
                color: "#007bff",
                textDecoration: "underline",
              }}
            >
              Click to upload File
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              or drag and drop
            </Typography>
            <Typography variant="caption" sx={{ display: "block", mt: 1 }}>
              Max file size: 1 MB
            </Typography>
          </label>
        </Box>

        {excelData.length > 0 && (
          <Box>
            <Typography variant="h6" sx={{ mt: 2 }}>
              Uploaded Preview:
            </Typography>
            <TableContainer component={Paper} sx={{ maxHeight: 300, mt: 1 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    {Object.keys(excelData[0]).map((key) => (
                      <TableCell key={key}>{key}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {excelData.map((row, idx) => (
                    <TableRow key={idx}>
                      {Object.values(row).map((val, i) => (
                        <TableCell key={i}>{val}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Button
              variant="contained"
              sx={{ mt: 3 }}
              onClick={handleGenerateTickets}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Generate Tickets"}
            </Button>
          </Box>
        )}
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
