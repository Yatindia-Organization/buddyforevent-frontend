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
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import DeleteIcon from "@mui/icons-material/Delete";
import { API_ROUTE } from "../../../lib/config";
import { useGlobalInfo } from "../../../contexts/globalContext";

export default function TicketRegistrationForm({ eventName }) {
  const { event: eventId } = useGlobalInfo();
  const [tiers, setTiers] = useState([]);
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  // fetch existing tiers
  useEffect(() => {
    if (!eventId) return;
    fetch(`${API_ROUTE}/api/v1/event/ticket-tiers/${eventId}`)
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
      const res = await fetch(
        `${API_ROUTE}/api/v1/event/ticket-tiers/${eventId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ticket_tiers: payload }),
        }
      );
      if (!res.ok) throw new Error(await res.text());
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div className="min-h-screen p-8 bg-bg text-text font-sans">
        {!isEditing ? (
          <Box p={6} borderRadius={2} sx={{ bgcolor: "var(--color-card-bg)" }}>
            <Typography className="text-lg font-heading mb-4">
              Ticket tiers for event{" "}
              {eventName && <strong className="font-semibold">{eventName}</strong>}
            </Typography>

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
                      <TableCell>{t.price}</TableCell>
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
          </Box>
        ) : (
          <Box p={6} borderRadius={2} sx={{ bgcolor: "var(--color-card-bg)" }}>
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
          </Box>
        )}
      </div>
    </LocalizationProvider>
  );
}
