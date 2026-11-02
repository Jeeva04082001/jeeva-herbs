import { useEffect, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    InputAdornment,
    Stack,
    Switch,
    TextField,
    Typography,
} from "@mui/material";

import {
    ArrowLeft,
    ExternalLink,
    Package,
    Pencil,
    Plus,
    RefreshCw,
    Search,
    Truck,
    X,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../services/api";
import { colors, fonts } from "../../theme/brand";

const emptyForm = {
    courier_name: "",
    tracking_url_template: "",
    is_active: true,
};

const inputSx = {
    "& .MuiOutlinedInput-root": {
        borderRadius: 2,
        backgroundColor: "#fff",
    },
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: colors.forest,
    },
    "& .MuiInputLabel-root.Mui-focused": {
        color: colors.forest,
    },
};

const primaryButtonSx = {
    textTransform: "none",
    borderRadius: 2,
    backgroundColor: colors.forest,
    "&:hover": {
        backgroundColor: colors.forest,
        opacity: 0.9,
    },
};

export default function CourierServicesPage() {
    const navigate = useNavigate();

    const [couriers, setCouriers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingCourier, setEditingCourier] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    const fetchCouriers = async () => {
        setLoading(true);
        setError("");

        try {
            
            
            const response = await api.get("/api/admin/courier-services", {params: { include_inactive: true },});

            if (!response.data?.success) {
                throw new Error("Unable to load courier services.");
            }

            setCouriers(response.data.couriers || []);
        } catch (err) {
            const message =
                err.response?.data?.detail ||
                err.response?.data?.message ||
                err.message ||
                "Failed to load courier services.";

            setError(message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCouriers();
    }, []);

    const filteredCouriers = couriers.filter((courier) => {
        const query = search.trim().toLowerCase();

        return (
            !query ||
            courier.courier_name?.toLowerCase().includes(query) ||
            courier.tracking_url_template?.toLowerCase().includes(query)
        );
    });

    const openAddDialog = () => {
        setEditingCourier(null);
        setForm(emptyForm);
        setDialogOpen(true);
    };

    const openEditDialog = (courier) => {
        setEditingCourier(courier);

        setForm({
            courier_name: courier.courier_name || "",
            tracking_url_template: courier.tracking_url_template || "",
            is_active: courier.is_active ?? true,
        });

        setDialogOpen(true);
    };

    const closeDialog = () => {
        if (saving) return;

        setDialogOpen(false);
        setEditingCourier(null);
        setForm(emptyForm);
    };

    const handleFieldChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSave = async () => {
        if (!form.courier_name.trim()) {
            toast.error("Enter the courier name.");
            return;
        }

        if (form.tracking_url_template.trim()) {
            try {
                const parsedUrl = new URL(form.tracking_url_template.trim());

                if (!["http:", "https:"].includes(parsedUrl.protocol)) {
                    toast.error("Tracking URL must start with http:// or https://");
                    return;
                }
            } catch {
                toast.error("Enter a valid tracking URL.");
                return;
            }
        }

        const payload = {
            courier_name: form.courier_name.trim(),
            tracking_url_template: form.tracking_url_template.trim(),
            is_active: form.is_active,
        };

        setSaving(true);

        try {
            if (editingCourier) {
                await api.put(
                    `/api/admin/courier-services/${editingCourier.id}`,
                    payload
                );

                toast.success("Courier service updated.");
            } else {
                await api.post("/api/admin/courier-services", payload);

                toast.success("Courier service added.");
            }

            setDialogOpen(false);
            setEditingCourier(null);
            setForm(emptyForm);

            await fetchCouriers();
        } catch (err) {
            const message =
                err.response?.data?.detail ||
                err.response?.data?.message ||
                "Unable to save courier service.";

            toast.error(
                typeof message === "string" ? message : JSON.stringify(message)
            );
        } finally {
            setSaving(false);
        }
    };

    const handleStatusToggle = async (courier) => {
        try {
            await api.put(`/api/admin/courier-services/${courier.id}`, {
                courier_name: courier.courier_name,
                tracking_url_template: courier.tracking_url_template || "",
                is_active: !courier.is_active,
            });

            toast.success(
                courier.is_active
                    ? "Courier service deactivated."
                    : "Courier service activated."
            );

            await fetchCouriers();
        } catch (err) {
            const message =
                err.response?.data?.detail ||
                err.response?.data?.message ||
                "Unable to update courier status.";

            toast.error(message);
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                py: { xs: 2, md: 3 },
                backgroundColor: colors.creamDeep,
            }}
        >
            <Container maxWidth="lg">
                {/* Header */}
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "stretch", sm: "center" }}
                    spacing={2}
                    sx={{ mb: 3 }}
                >
                    <Box>
                        <Button
                            size="small"
                            startIcon={<ArrowLeft size={16} />}
                            onClick={() => navigate("/admin/master-data")}
                            sx={{
                                mb: 1,
                                color: colors.forest,
                                textTransform: "none",
                            }}
                        >
                            Back to Master Data
                        </Button>

                        <Stack direction="row" spacing={1.25} alignItems="center">
                            <Box
                                sx={{
                                    width: 44,
                                    height: 44,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderRadius: 2.5,
                                    backgroundColor: colors.forest,
                                    color: "#fff",
                                }}
                            >
                                <Truck size={23} />
                            </Box>

                            <Box>
                                <Typography
                                    sx={{
                                        fontFamily: fonts.display,
                                        fontSize: { xs: "1.45rem", md: "1.8rem" },
                                        fontWeight: 700,
                                        color: colors.forest,
                                    }}
                                >
                                    Courier Services
                                </Typography>

                                <Typography
                                    sx={{
                                        color: colors.inkSoft,
                                        fontSize: "0.88rem",
                                    }}
                                >
                                    Manage courier partners and tracking links.
                                </Typography>
                            </Box>
                        </Stack>
                    </Box>

                    <Stack direction="row" spacing={1}>
                        <Button
                            variant="outlined"
                            startIcon={<RefreshCw size={16} />}
                            onClick={fetchCouriers}
                            disabled={loading}
                            sx={{
                                textTransform: "none",
                                borderRadius: 2,
                                borderColor: colors.forest,
                                color: colors.forest,
                            }}
                        >
                            Refresh
                        </Button>

                        <Button
                            variant="contained"
                            startIcon={<Plus size={17} />}
                            onClick={openAddDialog}
                            sx={primaryButtonSx}
                        >
                            Add Courier
                        </Button>
                    </Stack>
                </Stack>

                {/* Search */}
                <Card
                    elevation={0}
                    sx={{
                        borderRadius: 3,
                        border: `1px solid ${colors.line}`,
                        mb: 2,
                    }}
                >
                    <CardContent sx={{ p: 2 }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search courier name or tracking URL..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            sx={inputSx}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search size={18} />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </CardContent>
                </Card>

                {/* Summary */}
                <Stack
                    direction="row"
                    spacing={1}
                    sx={{ mb: 2 }}
                    flexWrap="wrap"
                    useFlexGap
                >
                    <Chip
                        icon={<Package size={15} />}
                        label={`${couriers.length} active courier(s)`}
                        sx={{
                            backgroundColor: "#E3F0E7",
                            color: colors.forest,
                            fontWeight: 600,
                        }}
                    />
                </Stack>

                {error && (
                    <Alert
                        severity="error"
                        sx={{ mb: 2 }}
                        action={
                            <Button color="inherit" onClick={fetchCouriers}>
                                Retry
                            </Button>
                        }
                    >
                        {error}
                    </Alert>
                )}

                {loading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 7 }}>
                        <CircularProgress sx={{ color: colors.forest }} />
                    </Box>
                ) : !error && filteredCouriers.length === 0 ? (
                    <Card
                        elevation={0}
                        sx={{
                            borderRadius: 3,
                            border: `1px solid ${colors.line}`,
                            textAlign: "center",
                            py: 6,
                            px: 2,
                        }}
                    >
                        <Truck
                            size={38}
                            color={colors.forest}
                            style={{ marginBottom: 12 }}
                        />

                        <Typography
                            sx={{
                                fontFamily: fonts.display,
                                fontWeight: 700,
                                fontSize: "1.15rem",
                                color: colors.forest,
                            }}
                        >
                            {search ? "No matching courier" : "No courier services yet"}
                        </Typography>

                        <Typography
                            sx={{
                                color: colors.inkSoft,
                                fontSize: "0.9rem",
                                mt: 0.5,
                                mb: 2,
                            }}
                        >
                            Add courier details to use them in shipment tracking.
                        </Typography>

                        {!search && (
                            <Button
                                variant="contained"
                                startIcon={<Plus size={16} />}
                                onClick={openAddDialog}
                                sx={primaryButtonSx}
                            >
                                Add First Courier
                            </Button>
                        )}
                    </Card>
                ) : (
                    <Stack spacing={1.5}>
                        {filteredCouriers.map((courier) => (
                            <Card
                                key={courier.id}
                                elevation={0}
                                sx={{
                                    borderRadius: 2.5,
                                    border: `1px solid ${colors.line}`,
                                }}
                            >
                                <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                                    <Stack
                                        direction={{ xs: "column", sm: "row" }}
                                        alignItems={{ xs: "stretch", sm: "center" }}
                                        justifyContent="space-between"
                                        spacing={1.5}
                                    >
                                        <Stack
                                            direction="row"
                                            alignItems="center"
                                            spacing={1.5}
                                            sx={{ minWidth: 0 }}
                                        >
                                            <Box
                                                sx={{
                                                    width: 42,
                                                    height: 42,
                                                    borderRadius: 2,
                                                    flexShrink: 0,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    backgroundColor: colors.creamDeep,
                                                    color: colors.forest,
                                                }}
                                            >
                                                <Truck size={21} />
                                            </Box>

                                            <Box sx={{ minWidth: 0 }}>
                                                <Stack
                                                    direction="row"
                                                    alignItems="center"
                                                    spacing={1}
                                                    flexWrap="wrap"
                                                    useFlexGap
                                                >
                                                    <Typography
                                                        sx={{
                                                            fontWeight: 700,
                                                            color: colors.forest,
                                                            fontSize: "1rem",
                                                            overflowWrap: "anywhere",
                                                        }}
                                                    >
                                                        {courier.courier_name}
                                                    </Typography>

                                                    <Chip
                                                        size="small"
                                                        label="Active"
                                                        sx={{
                                                            height: 22,
                                                            fontSize: "0.7rem",
                                                            backgroundColor: "#E3F0E7",
                                                            color: colors.forest,
                                                        }}
                                                    />
                                                </Stack>

                                                {courier.tracking_url_template ? (
                                                    <Stack
                                                        direction="row"
                                                        alignItems="center"
                                                        spacing={0.5}
                                                        sx={{ mt: 0.6, minWidth: 0 }}
                                                    >
                                                        <ExternalLink
                                                            size={14}
                                                            color={colors.inkSoft}
                                                        />

                                                        <Typography
                                                            component="a"
                                                            href={courier.tracking_url_template}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            sx={{
                                                                fontSize: "0.8rem",
                                                                color: colors.inkSoft,
                                                                overflowWrap: "anywhere",
                                                                textDecoration: "none",
                                                                "&:hover": {
                                                                    textDecoration: "underline",
                                                                },
                                                            }}
                                                        >
                                                            {courier.tracking_url_template}
                                                        </Typography>
                                                    </Stack>
                                                ) : (
                                                    <Typography
                                                        sx={{
                                                            mt: 0.5,
                                                            fontSize: "0.8rem",
                                                            color: colors.inkSoft,
                                                        }}
                                                    >
                                                        No tracking URL configured
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Stack>

                                        <Stack
                                            direction="row"
                                            alignItems="center"
                                            justifyContent="flex-end"
                                            spacing={1}
                                        >
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                startIcon={<Pencil size={15} />}
                                                onClick={() => openEditDialog(courier)}
                                                sx={{
                                                    textTransform: "none",
                                                    borderRadius: 2,
                                                    borderColor: colors.forest,
                                                    color: colors.forest,
                                                }}
                                            >
                                                Edit
                                            </Button>

                                            <Divider
                                                orientation="vertical"
                                                flexItem
                                                sx={{ mx: 0.25 }}
                                            />

                                            <Switch
                                                size="small"
                                                checked={courier.is_active}
                                                onChange={() => handleStatusToggle(courier)}
                                                inputProps={{
                                                    "aria-label": `Toggle ${courier.courier_name}`,
                                                }}
                                                sx={{
                                                    "& .MuiSwitch-switchBase.Mui-checked": {
                                                        color: colors.forest,
                                                    },
                                                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                                                    {
                                                        backgroundColor: colors.forest,
                                                    },
                                                }}
                                            />
                                        </Stack>
                                    </Stack>
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                )}
            </Container>

            {/* Add/Edit Courier Dialog */}
            <Dialog
                open={dialogOpen}
                onClose={closeDialog}
                fullWidth
                maxWidth="sm"
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        m: { xs: 1.5, sm: 3 },
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        px: 2.5,
                        py: 2,
                        backgroundColor: colors.forest,
                        color: "#fff",
                    }}
                >
                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        spacing={1}
                    >
                        <Stack direction="row" spacing={1.25} alignItems="center">
                            <Truck size={22} />

                            <Box>
                                <Typography sx={{ fontWeight: 700, fontSize: "1.05rem" }}>
                                    {editingCourier ? "Edit Courier" : "Add Courier"}
                                </Typography>

                                <Typography sx={{ fontSize: "0.78rem", opacity: 0.8 }}>
                                    Configure shipment tracking details
                                </Typography>
                            </Box>
                        </Stack>

                        <IconButton
                            onClick={closeDialog}
                            disabled={saving}
                            sx={{ color: "#fff" }}
                            aria-label="Close dialog"
                        >
                            <X size={20} />
                        </IconButton>
                    </Stack>
                </DialogTitle>

                <DialogContent sx={{ p: 2.5 }}>
                    <Stack spacing={2.25} sx={{ pt: 0.5 }}>
                        <TextField
                            required
                            fullWidth
                            label="Courier Name"
                            name="courier_name"
                            value={form.courier_name}
                            onChange={handleFieldChange}
                            placeholder="e.g. India Post"
                            sx={inputSx}
                        />

                        <TextField
                            fullWidth
                            label="Tracking URL"
                            name="tracking_url_template"
                            value={form.tracking_url_template}
                            onChange={handleFieldChange}
                            placeholder="https://courier.example/track"
                            helperText="Enter the official courier tracking page URL."
                            sx={inputSx}
                        />

                        <Box
                            sx={{
                                p: 1.5,
                                borderRadius: 2,
                                backgroundColor: colors.creamDeep,
                            }}
                        >
                            <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                                spacing={2}
                            >
                                <Box>
                                    <Typography
                                        sx={{ fontWeight: 600, color: colors.forest }}
                                    >
                                        Active courier
                                    </Typography>

                                    <Typography
                                        sx={{ fontSize: "0.8rem", color: colors.inkSoft }}
                                    >
                                        Active couriers appear in the tracking dropdown.
                                    </Typography>
                                </Box>

                                <Switch
                                    checked={form.is_active}
                                    onChange={(event) =>
                                        setForm((previous) => ({
                                            ...previous,
                                            is_active: event.target.checked,
                                        }))
                                    }
                                    sx={{
                                        "& .MuiSwitch-switchBase.Mui-checked": {
                                            color: colors.forest,
                                        },
                                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                                        {
                                            backgroundColor: colors.forest,
                                        },
                                    }}
                                />
                            </Stack>
                        </Box>
                    </Stack>
                </DialogContent>

                <DialogActions sx={{ px: 2.5, pb: 2.5, gap: 1 }}>
                    <Button
                        onClick={closeDialog}
                        disabled={saving}
                        sx={{
                            textTransform: "none",
                            color: colors.inkSoft,
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
                                <Plus size={16} />
                            )
                        }
                        onClick={handleSave}
                        disabled={saving}
                        sx={primaryButtonSx}
                    >
                        {saving
                            ? "Saving..."
                            : editingCourier
                                ? "Update Courier"
                                : "Save Courier"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}