import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  MessageCircle,
  PackageCheck,
  Truck,
  X,
} from "lucide-react";

import toast from "react-hot-toast";
import api from "../services/api";

const COLORS = {
  forest: "#173F35",
  forestHover: "#245747",
  cream: "#F7F5EF",
  creamDeep: "#EDE9DD",
  ink: "#26332E",
  muted: "#77766E",
  border: "#E4E2DA",
  white: "#FFFFFF",
  green: "#16834A",
};

const initialForm = {
  courier_id: "",
  tracking_number: "",
  tracking_url: "",
  dispatch_date: "",
  shipment_status: "Pending",
  notes: "",
};

const statuses = [
  "Pending",
  "Shipped",
  "In Transit",
  "Out for Delivery",
  "Delivered",
];

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    backgroundColor: COLORS.white,
    fontSize: "0.9rem",
  },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: COLORS.forest,
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: COLORS.forest,
  },
};

const primaryButtonSx = {
  textTransform: "none",
  borderRadius: 2,
  px: 2,
  backgroundColor: COLORS.forest,
  "&:hover": {
    backgroundColor: COLORS.forestHover,
  },
};

export default function TrackingDialog({
  open,
  onClose,
  order,
  customer,
}) {
  const [couriers, setCouriers] = useState([]);
  const [form, setForm] = useState(initialForm);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [existingTracking, setExistingTracking] = useState(false);

  const groupId = order?.purchase_group_id;

  useEffect(() => {
    if (!open) return;

    if (!groupId) {
      setError(
        "This purchase does not have a purchase group ID. Tracking cannot be saved."
      );
      setCouriers([]);
      setForm(initialForm);
      setExistingTracking(false);
      return;
    }

    let cancelled = false;

    const loadData = async () => {
      setLoading(true);
      setError("");
      setCouriers([]);
      setForm(initialForm);
      setExistingTracking(false);

      try {
        const [courierResponse, trackingResponse] = await Promise.all([
          api.get("/api/admin/courier-services"),
          api.get(
            `/api/admin/customer-purchase-tracking/${groupId}`
          ),
        ]);

        if (cancelled) return;

        if (courierResponse.data?.success === false) {
          throw new Error("Unable to load courier services.");
        }

        if (trackingResponse.data?.success === false) {
          throw new Error("Unable to load tracking details.");
        }

        const courierList = courierResponse.data?.couriers || [];
        const tracking = trackingResponse.data?.tracking || null;

        let availableCouriers = [...courierList];

        // Keep the previously selected courier visible even if inactive.
        if (
          tracking?.courier_id &&
          !availableCouriers.some(
            (courier) =>
              String(courier.id) === String(tracking.courier_id)
          )
        ) {
          availableCouriers.push({
            id: tracking.courier_id,
            courier_name: tracking.courier_name || "Previously selected courier",
            tracking_url_template: tracking.tracking_url || "",
            is_active: false,
          });
        }

        setCouriers(availableCouriers);

        if (tracking) {
          setExistingTracking(true);

          setForm({
            courier_id: String(tracking.courier_id || ""),
            tracking_number: tracking.tracking_number || "",
            tracking_url: tracking.tracking_url || "",
            dispatch_date: tracking.dispatch_date || "",
            shipment_status: tracking.shipment_status || "Pending",
            notes: tracking.notes || "",
          });
        }
      } catch (err) {
        if (cancelled) return;

        setError(
          err.response?.data?.detail ||
            err.response?.data?.message ||
            err.message ||
            "Unable to load tracking details."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [open, groupId]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => {
      const updated = {
        ...previous,
        [name]: value,
      };

      if (name === "courier_id") {
        const selectedCourier = couriers.find(
          (courier) => String(courier.id) === String(value)
        );

        updated.tracking_url =
          selectedCourier?.tracking_url_template || "";
      }

      return updated;
    });
  };

  const handleSave = async () => {
    if (!groupId) {
      toast.error("Purchase group ID is missing.");
      return;
    }

    if (!form.courier_id) {
      toast.error("Please select a courier partner.");
      return;
    }

    if (!form.tracking_number.trim()) {
      toast.error("Please enter the tracking / AWB number.");
      return;
    }

    if (!form.tracking_url.trim()) {
      toast.error("Please enter the tracking URL.");
      return;
    }

    try {
      const parsedUrl = new URL(form.tracking_url.trim());

      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        toast.error("Tracking URL must start with HTTP or HTTPS.");
        return;
      }
    } catch {
      toast.error("Please enter a valid tracking URL.");
      return;
    }

    const payload = {
      purchase_group_id: groupId,
      courier_id: Number(form.courier_id),
      tracking_number: form.tracking_number.trim(),
      tracking_url: form.tracking_url.trim(),
      dispatch_date: form.dispatch_date || null,
      shipment_status: form.shipment_status,
      notes: form.notes.trim(),
    };

    setSaving(true);

    try {
      if (existingTracking) {
        await api.put(
          `/api/admin/customer-purchase-tracking/${groupId}`,
          payload
        );
      } else {
        await api.post(
          "/api/admin/customer-purchase-tracking",
          payload
        );
      }

      toast.success(
        existingTracking
          ? "Tracking details updated successfully."
          : "Tracking details saved successfully."
      );

      onClose(true);
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Unable to save tracking details.";

      toast.error(
        typeof message === "string"
          ? message
          : JSON.stringify(message)
      );
    } finally {
      setSaving(false);
    }
  };

  const handleWhatsApp = () => {
    if (!existingTracking) {
      toast.error("Save the tracking details before sharing.");
      return;
    }

    if (!form.tracking_number.trim() || !form.tracking_url.trim()) {
      toast.error("Tracking number or URL is missing.");
      return;
    }

    const rawPhone = String(customer?.phone || "").trim();
    let phone = rawPhone.replace(/\D/g, "");

    if (!phone) {
      toast.error("Customer phone number is unavailable.");
      return;
    }

    // Assumes a 10-digit number is an Indian mobile number.
    if (phone.length === 10) {
      phone = `91${phone}`;
    } else if (phone.startsWith("0") && phone.length === 11) {
      phone = `91${phone.slice(1)}`;
    }

    const selectedCourier = couriers.find(
      (courier) => String(courier.id) === String(form.courier_id)
    );

    const customerName =
      customer?.customer_name ||
      customer?.full_name ||
      "Customer";

    const message = [
      `Hello ${customerName},`,
      "",
      "Your Jeeva Herbs order shipment details:",
      `Courier: ${selectedCourier?.courier_name || "Courier"}`,
      `Tracking Number: ${form.tracking_number}`,
      `Shipment Status: ${form.shipment_status}`,
      `Tracking Link: ${form.tracking_url}`,
      "",
      "Thank you for choosing Jeeva Herbs!",
    ].join("\n");

    const whatsappUrl =
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        if (!saving) onClose(false);
      }}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: "hidden",
          m: { xs: 1, sm: 3 },
          width: "100%",
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          backgroundColor: COLORS.forest,
          color: COLORS.white,
          px: 2.5,
          py: 2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2,
              backgroundColor: "rgba(255,255,255,0.13)",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <Truck size={23} />
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                fontFamily: "Georgia, serif",
                fontWeight: 700,
                fontSize: "1.15rem",
              }}
            >
              Shipment Tracking
            </Typography>

            <Typography sx={{ fontSize: "0.8rem", opacity: 0.8 }}>
              Manage courier and delivery details
            </Typography>
          </Box>

          <Button
            onClick={() => onClose(false)}
            disabled={saving}
            aria-label="Close tracking dialog"
            sx={{
              minWidth: 36,
              width: 36,
              height: 36,
              color: COLORS.white,
            }}
          >
            <X size={20} />
          </Button>
        </Stack>
      </DialogTitle>

      {/* Form content */}
      <DialogContent
        sx={{
          backgroundColor: COLORS.cream,
          p: { xs: 2, sm: 2.5 },
        }}
      >
        {order && (
          <Box
            sx={{
              backgroundColor: COLORS.creamDeep,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 2.5,
              p: 1.75,
              mb: 2.5,
              mt: 0.5,
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
              spacing={1}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    color: COLORS.forest,
                    fontSize: "1rem",
                    overflowWrap: "anywhere",
                  }}
                >
                  {customer?.customer_name ||
                    customer?.full_name ||
                    "Customer"}
                </Typography>

                <Typography
                  sx={{
                    color: COLORS.muted,
                    fontSize: "0.85rem",
                    mt: 0.4,
                  }}
                >
                  {customer?.phone || "No phone number"}
                </Typography>

                <Typography
                  sx={{
                    color: COLORS.muted,
                    fontSize: "0.82rem",
                    mt: 0.5,
                  }}
                >
                  Purchase date: {order.purchase_date || "—"}
                </Typography>
              </Box>

              <Typography
                sx={{
                  backgroundColor: COLORS.white,
                  color: COLORS.forest,
                  borderRadius: 5,
                  px: 1.25,
                  py: 0.65,
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  whiteSpace: "nowrap",
                }}
              >
                ₹{Number(order.grand_total || 0).toFixed(2)}
              </Typography>
            </Stack>
          </Box>
        )}

        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              py: 5,
            }}
          >
            <CircularProgress sx={{ color: COLORS.forest }} />
          </Box>
        ) : (
          <Stack spacing={2}>
            {error && (
              <Alert severity="error">
                {error}
              </Alert>
            )}

            {/* Courier dropdown */}
            <TextField
              select
              fullWidth
              required
              label="Courier Partner"
              name="courier_id"
              value={form.courier_id}
              onChange={handleChange}
              sx={fieldSx}
              disabled={!!error}
              helperText={
                couriers.length === 0 && !error
                  ? "No active couriers found. Add a courier in Master Data."
                  : ""
              }
            >
              {couriers.map((courier) => (
                <MenuItem
                  key={courier.id}
                  value={String(courier.id)}
                >
                  {courier.courier_name}
                  {courier.is_active === false ? " (Inactive)" : ""}
                </MenuItem>
              ))}
            </TextField>

            {/* Tracking number */}
            <TextField
              fullWidth
              required
              label="Tracking Number / AWB"
              name="tracking_number"
              value={form.tracking_number}
              onChange={handleChange}
              placeholder="Enter shipment tracking number"
              sx={fieldSx}
              disabled={!!error}
            />

            {/* Tracking URL */}
            <TextField
              fullWidth
              required
              label="Tracking URL"
              name="tracking_url"
              value={form.tracking_url}
              onChange={handleChange}
              placeholder="https://..."
              helperText="Check that the URL opens the correct courier tracking page."
              sx={fieldSx}
              disabled={!!error}
            />

            {/* Dispatch date and status */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
            >
              <TextField
                fullWidth
                type="date"
                label="Dispatch Date"
                name="dispatch_date"
                value={form.dispatch_date}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                sx={fieldSx}
                disabled={!!error}
              />

              <TextField
                select
                fullWidth
                label="Shipment Status"
                name="shipment_status"
                value={form.shipment_status}
                onChange={handleChange}
                sx={fieldSx}
                disabled={!!error}
              >
                {statuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

            {/* Notes */}
            <TextField
              fullWidth
              multiline
              minRows={2}
              label="Notes (Optional)"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Additional shipment details..."
              sx={fieldSx}
              disabled={!!error}
            />

            {existingTracking && !error && (
              <Alert severity="info">
                Existing tracking details found. Saving will update this record.
              </Alert>
            )}
          </Stack>
        )}
      </DialogContent>

      {/* Footer buttons */}
      <DialogActions
        sx={{
          p: 2,
          gap: 1,
          flexWrap: "wrap",
          backgroundColor: COLORS.white,
          borderTop: `1px solid ${COLORS.border}`,
        }}
      >
        <Button
          variant="outlined"
          startIcon={<MessageCircle size={17} />}
          onClick={handleWhatsApp}
          disabled={
            loading ||
            saving ||
            !existingTracking ||
            !!error
          }
          sx={{
            textTransform: "none",
            borderRadius: 2,
            borderColor: COLORS.green,
            color: COLORS.green,
            mr: "auto",
          }}
        >
          WhatsApp
        </Button>

        <Button
          onClick={() => onClose(false)}
          disabled={saving}
          sx={{
            textTransform: "none",
            color: COLORS.muted,
          }}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          startIcon={
            saving ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <PackageCheck size={17} />
            )
          }
          onClick={handleSave}
          disabled={loading || saving || !!error}
          sx={primaryButtonSx}
        >
          {saving
            ? "Saving..."
            : existingTracking
              ? "Update Tracking"
              : "Save Tracking"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}