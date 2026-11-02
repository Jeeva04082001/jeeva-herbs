import { useEffect, useMemo, useState } from "react";
import {
    Box,
    Container,
    Typography,
    TextField,
    InputAdornment,
    Card,
    CardContent,
    Button,
    Chip,
    CircularProgress,
    Alert,
    Divider,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    MenuItem,
    IconButton,
} from "@mui/material";

import {
    Search,
    UserRound,
    Package,
    CalendarDays,
    Phone,
    PackageSearch,
    RefreshCw,
    X,
    Truck,
    MessageCircle,
    ExternalLink,
    ChevronDown,
    ChevronUp,
    MapPin,
    Save,
} from "lucide-react";

import toast from "react-hot-toast";
import { colors, fonts } from "../../theme/brand";
import api from "../../services/api";
import TrackingDialog from "../../components/TrackingDialog";

const TRACKING_STATUSES = [
    "Pending",
    "Shipped",
    "In Transit",
    "Out for Delivery",
    "Delivered",
];

const initialTrackingForm = {
    courier_name: "",
    tracking_number: "",
    tracking_url: "",
    dispatch_date: "",
    shipment_status: "Pending",
    notes: "",
};

function formatCurrency(value) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(Number(value || 0));
}

function formatDate(value) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

const fieldSx = {
    "& .MuiOutlinedInput-root": {
        borderRadius: 2,
        backgroundColor: "#fff",
    },
    "& .MuiInputLabel-root.Mui-focused": {
        color: colors.forest,
    },
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: colors.forest,
    },
};

const primaryButtonSx = {
    textTransform: "none",
    borderRadius: 2,
    backgroundColor: colors.forest,
    "&:hover": {
        backgroundColor: colors.forest,
        opacity: 0.92,
    },
};

function CustomerPurchaseHistoryPage() {
    const [search, setSearch] = useState("");
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [expandedCustomers, setExpandedCustomers] = useState([]);

    const [trackingOpen, setTrackingOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [trackingForm, setTrackingForm] = useState(initialTrackingForm);
    const [savingTracking, setSavingTracking] = useState(false);


    const fetchPurchaseHistory = async (searchValue = "") => {
        setLoading(true);
        setError("");

        try {
            const response = await api.get(
                "/api/admin/customer-purchase-history",
                {
                    params: {
                        search: searchValue.trim(),
                    },
                }
            );

            const data = response.data;

            if (!data?.success) {
                throw new Error("Unable to load customer purchase history.");
            }

            setCustomers(data.customers || []);
        } catch (err) {
            const message =
                err.response?.data?.detail ||
                err.response?.data?.message ||
                err.message ||
                "Failed to load purchase history.";

            setError(message);
            setCustomers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPurchaseHistory();
    }, []);

    const filteredCustomers = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) return customers;

        return customers.filter(
            (customer) =>
                customer.customer_name?.toLowerCase().includes(query) ||
                customer.phone?.toLowerCase().includes(query)
        );
    }, [customers, search]);

    const totalOrders = filteredCustomers.reduce(
        (sum, customer) => sum + (customer.orders?.length || 0),
        0
    );

    const toggleCustomer = (customerId) => {
        setExpandedCustomers((previous) =>
            previous.includes(customerId)
                ? previous.filter((id) => id !== customerId)
                : [...previous, customerId]
        );
    };

    const openTrackingModal = (customer, order) => {
        if (!order.purchase_group_id) {
            toast.error("Tracking requires a grouped purchase. This order has no group ID.");
            return;
        }

        setSelectedCustomer(customer);
        setSelectedOrder(order);

        // Reset the form when opening a new order.
        setTrackingForm(initialTrackingForm);
        setTrackingOpen(true);
    };

    const closeTrackingModal = () => {
        if (savingTracking) return;

        setTrackingOpen(false);
        setSelectedCustomer(null);
        setSelectedOrder(null);
        setTrackingForm(initialTrackingForm);
    };

    const updateTrackingField = (event) => {
        const { name, value } = event.target;

        setTrackingForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleTrackingSave = async () => {
        if (!trackingForm.courier_name.trim()) {
            toast.error("Enter the courier partner name.");
            return;
        }

        if (!trackingForm.tracking_number.trim()) {
            toast.error("Enter the tracking / AWB number.");
            return;
        }

        if (!selectedOrder?.purchase_group_id) {
            toast.error("Purchase group ID is missing.");
            return;
        }

        /*
          BACKEND INTEGRATION PENDING
    
          After creating the tracking model and API, replace this block
          with the actual POST/PUT request.
    
          Example only:
          await api.post("/api/admin/customer-purchase-tracking", {
            purchase_group_id: selectedOrder.purchase_group_id,
            ...trackingForm,
          });
    
          Do not mark tracking as saved until the backend confirms it.
        */

        toast("Tracking form is ready. Connect the backend API to save details.", {
            icon: "ℹ️",
        });
    };

    const handleWhatsAppShare = () => {
        if (!selectedCustomer?.phone) {
            toast.error("This customer does not have a phone number.");
            return;
        }

        if (!trackingForm.tracking_number.trim()) {
            toast.error("Enter the tracking number first.");
            return;
        }

        const phone = selectedCustomer.phone.replace(/\D/g, "");

        // Indian phone numbers without country code get +91.
        const internationalPhone =
            phone.length === 10 ? `91${phone}` : phone;

        const message = [
            `Hi ${selectedCustomer.customer_name || "Customer"}!`,
            "",
            "Your Jeeva Herbs order has been dispatched.",
            `Courier: ${trackingForm.courier_name || "Not specified"}`,
            `Tracking Number: ${trackingForm.tracking_number}`,
            trackingForm.tracking_url
                ? `Track your order: ${trackingForm.tracking_url}`
                : "",
            "",
            "Thank you for choosing Jeeva Herbs!",
        ]
            .filter(Boolean)
            .join("\n");

        const whatsappUrl = `https://wa.me/${internationalPhone}?text=${encodeURIComponent(
            message
        )}`;

        window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                backgroundColor: colors.creamDeep,
                py: { xs: 2, md: 3 },
            }}
        >
            <Container maxWidth="lg">
                {/* Page header */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: { xs: "flex-start", sm: "center" },
                        flexDirection: { xs: "column", sm: "row" },
                        gap: 2,
                        mb: 2.5,
                    }}
                >
                    <Box>
                        <Typography
                            sx={{
                                fontFamily: fonts.display,
                                fontSize: { xs: "1.45rem", md: "1.9rem" },
                                fontWeight: 700,
                                color: colors.forest,
                            }}
                        >
                            Customer Purchase History
                        </Typography>

                        <Typography
                            sx={{
                                color: colors.inkSoft,
                                fontSize: "0.9rem",
                                mt: 0.4,
                            }}
                        >
                            Manage customer orders and shipment tracking.
                        </Typography>
                    </Box>

                    <Button
                        variant="outlined"
                        startIcon={<RefreshCw size={16} />}
                        onClick={() => fetchPurchaseHistory(search)}
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
                </Box>

                {/* Compact search and summary */}
                <Card
                    elevation={0}
                    sx={{
                        borderRadius: 3,
                        border: `1px solid ${colors.line}`,
                        mb: 2.5,
                    }}
                >
                    <CardContent
                        sx={{
                            p: { xs: 1.5, sm: 2 },
                            "&:last-child": { pb: { xs: 1.5, sm: 2 } },
                        }}
                    >
                        <Stack
                            direction={{ xs: "column", sm: "row" }}
                            alignItems={{ xs: "stretch", sm: "center" }}
                            spacing={2}
                        >
                            <TextField
                                fullWidth
                                size="small"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search customer name or phone"
                                sx={fieldSx}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search size={18} />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <Stack
                                direction="row"
                                spacing={1}
                                sx={{ flexShrink: 0 }}
                            >
                                <Chip
                                    label={`${filteredCustomers.length} Customers`}
                                    sx={{
                                        backgroundColor: colors.creamDeep,
                                        color: colors.forest,
                                        fontWeight: 600,
                                    }}
                                />

                                <Chip
                                    label={`${totalOrders} Orders`}
                                    sx={{
                                        backgroundColor: "#E4F1E8",
                                        color: colors.forest,
                                        fontWeight: 600,
                                    }}
                                />
                            </Stack>
                        </Stack>
                    </CardContent>
                </Card>

                {error && (
                    <Alert
                        severity="error"
                        sx={{ mb: 2 }}
                        action={
                            <Button color="inherit" onClick={() => fetchPurchaseHistory(search)}>
                                Retry
                            </Button>
                        }
                    >
                        {error}
                    </Alert>
                )}

                {loading && (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                        <CircularProgress sx={{ color: colors.forest }} />
                    </Box>
                )}

                {!loading && !error && filteredCustomers.length === 0 && (
                    <Card
                        elevation={0}
                        sx={{
                            p: 4,
                            textAlign: "center",
                            borderRadius: 3,
                            border: `1px solid ${colors.line}`,
                        }}
                    >
                        <PackageSearch
                            size={38}
                            color={colors.forest}
                            style={{ marginBottom: 10 }}
                        />

                        <Typography
                            sx={{
                                fontFamily: fonts.display,
                                fontSize: "1.15rem",
                                fontWeight: 700,
                                color: colors.forest,
                            }}
                        >
                            No customers found
                        </Typography>

                        <Typography sx={{ color: colors.inkSoft, mt: 0.5 }}>
                            Try another name or phone number.
                        </Typography>
                    </Card>
                )}

                {/* Customer list */}
                {!loading &&
                    !error &&
                    filteredCustomers.map((customer) => {
                        const isExpanded = expandedCustomers.includes(
                            customer.customer_id
                        );

                        return (
                            <Card
                                key={customer.customer_id}
                                elevation={0}
                                sx={{
                                    mb: 1.5,
                                    borderRadius: 2.5,
                                    border: `1px solid ${colors.line}`,
                                    overflow: "hidden",
                                }}
                            >
                                <CardContent
                                    sx={{
                                        p: { xs: 1.5, sm: 2 },
                                        "&:last-child": { pb: { xs: 1.5, sm: 2 } },
                                    }}
                                >
                                    <Stack
                                        direction={{ xs: "column", sm: "row" }}
                                        justifyContent="space-between"
                                        alignItems={{ xs: "stretch", sm: "center" }}
                                        spacing={1.5}
                                    >
                                        <Box sx={{ minWidth: 0 }}>
                                            <Stack
                                                direction="row"
                                                alignItems="center"
                                                spacing={1}
                                            >
                                                <Box
                                                    sx={{
                                                        width: 36,
                                                        height: 36,
                                                        borderRadius: 2,
                                                        backgroundColor: colors.creamDeep,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    <UserRound size={19} color={colors.forest} />
                                                </Box>

                                                <Box sx={{ minWidth: 0 }}>
                                                    <Typography
                                                        sx={{
                                                            fontFamily: fonts.display,
                                                            fontWeight: 700,
                                                            fontSize: "1rem",
                                                            color: colors.forest,
                                                            overflowWrap: "anywhere",
                                                        }}
                                                    >
                                                        {customer.customer_name}
                                                    </Typography>

                                                    <Stack
                                                        direction="row"
                                                        spacing={0.7}
                                                        alignItems="center"
                                                        sx={{ mt: 0.3 }}
                                                    >
                                                        <Phone size={13} color={colors.inkSoft} />

                                                        <Typography
                                                            sx={{
                                                                fontSize: "0.82rem",
                                                                color: colors.inkSoft,
                                                            }}
                                                        >
                                                            {customer.phone || "No phone number"}
                                                        </Typography>
                                                    </Stack>
                                                </Box>
                                            </Stack>
                                        </Box>

                                        <Stack
                                            direction="row"
                                            spacing={1}
                                            alignItems="center"
                                            flexWrap="wrap"
                                            useFlexGap
                                        >
                                            <Chip
                                                size="small"
                                                label={`${customer.orders?.length || 0} orders`}
                                                sx={{
                                                    backgroundColor: colors.creamDeep,
                                                    color: colors.forest,
                                                    fontWeight: 600,
                                                }}
                                            />

                                            <Button
                                                size="small"
                                                variant={isExpanded ? "contained" : "outlined"}
                                                endIcon={
                                                    isExpanded ? (
                                                        <ChevronUp size={16} />
                                                    ) : (
                                                        <ChevronDown size={16} />
                                                    )
                                                }
                                                onClick={() => toggleCustomer(customer.customer_id)}
                                                sx={{
                                                    textTransform: "none",
                                                    borderRadius: 2,
                                                    borderColor: colors.forest,
                                                    color: isExpanded ? "#fff" : colors.forest,
                                                    backgroundColor: isExpanded
                                                        ? colors.forest
                                                        : "transparent",
                                                    ...primaryButtonSx,
                                                    ...(isExpanded
                                                        ? {}
                                                        : {
                                                            backgroundColor: "transparent",
                                                            "&:hover": {
                                                                backgroundColor: colors.creamDeep,
                                                            },
                                                        }),
                                                }}
                                            >
                                                {isExpanded ? "Hide Orders" : "View Orders"}
                                            </Button>
                                        </Stack>
                                    </Stack>

                                    {/* Expanded orders */}
                                    {isExpanded && (
                                        <>
                                            <Divider sx={{ my: 1.75 }} />

                                            {!customer.orders?.length ? (
                                                <Typography
                                                    sx={{ color: colors.inkSoft, fontSize: "0.9rem" }}
                                                >
                                                    No purchases recorded for this customer.
                                                </Typography>
                                            ) : (
                                                <Stack spacing={1.25}>
                                                    {customer.orders.map((order, index) => (
                                                        <Box
                                                            key={
                                                                order.purchase_group_id ||
                                                                `${customer.customer_id}-${index}`
                                                            }
                                                            sx={{
                                                                border: `1px solid ${colors.line}`,
                                                                borderRadius: 2,
                                                                p: { xs: 1.5, sm: 2 },
                                                                backgroundColor: "#FFFEFC",
                                                            }}
                                                        >
                                                            {/* Order heading */}
                                                            <Stack
                                                                direction="row"
                                                                justifyContent="space-between"
                                                                alignItems="flex-start"
                                                                spacing={1}
                                                            >
                                                                <Box>
                                                                    <Typography
                                                                        sx={{
                                                                            fontWeight: 700,
                                                                            fontSize: "0.95rem",
                                                                            color: colors.forest,
                                                                        }}
                                                                    >
                                                                        Purchase #{index + 1}
                                                                    </Typography>

                                                                    <Stack
                                                                        direction="row"
                                                                        alignItems="center"
                                                                        spacing={0.6}
                                                                        sx={{ mt: 0.35 }}
                                                                    >
                                                                        <CalendarDays
                                                                            size={14}
                                                                            color={colors.inkSoft}
                                                                        />

                                                                        <Typography
                                                                            sx={{
                                                                                fontSize: "0.8rem",
                                                                                color: colors.inkSoft,
                                                                            }}
                                                                        >
                                                                            {formatDate(order.purchase_date)}
                                                                        </Typography>
                                                                    </Stack>
                                                                </Box>

                                                                <Chip
                                                                    size="small"
                                                                    label={`${order.item_count || order.items?.length || 0} items`}
                                                                    sx={{ fontSize: "0.72rem" }}
                                                                />
                                                            </Stack>

                                                            <Divider sx={{ my: 1.25 }} />

                                                            {/* Product rows */}
                                                            <Stack spacing={1}>
                                                                {(order.items || []).map((item) => (
                                                                    <Stack
                                                                        key={item.purchase_id}
                                                                        direction="row"
                                                                        justifyContent="space-between"
                                                                        alignItems="flex-start"
                                                                        spacing={2}
                                                                    >
                                                                        <Box sx={{ minWidth: 0 }}>
                                                                            <Typography
                                                                                sx={{
                                                                                    fontWeight: 600,
                                                                                    fontSize: "0.9rem",
                                                                                    color: colors.ink,
                                                                                    overflowWrap: "anywhere",
                                                                                }}
                                                                            >
                                                                                {item.product_name}
                                                                            </Typography>

                                                                            <Typography
                                                                                sx={{
                                                                                    color: colors.inkSoft,
                                                                                    fontSize: "0.8rem",
                                                                                }}
                                                                            >
                                                                                {item.variant_unit
                                                                                    ? `${item.variant_unit} · `
                                                                                    : ""}
                                                                                Qty: {item.quantity} ×{" "}
                                                                                {formatCurrency(item.unit_price)}
                                                                            </Typography>
                                                                        </Box>

                                                                        <Typography
                                                                            sx={{
                                                                                fontWeight: 600,
                                                                                fontSize: "0.88rem",
                                                                                whiteSpace: "nowrap",
                                                                            }}
                                                                        >
                                                                            {formatCurrency(item.total_amount)}
                                                                        </Typography>
                                                                    </Stack>
                                                                ))}
                                                            </Stack>

                                                            {order.notes && (
                                                                <Box
                                                                    sx={{
                                                                        mt: 1.25,
                                                                        px: 1.25,
                                                                        py: 0.8,
                                                                        borderRadius: 1.5,
                                                                        backgroundColor: colors.creamDeep,
                                                                    }}
                                                                >
                                                                    <Typography
                                                                        sx={{
                                                                            fontSize: "0.8rem",
                                                                            color: colors.inkSoft,
                                                                        }}
                                                                    >
                                                                        <strong>Notes:</strong> {order.notes}
                                                                    </Typography>
                                                                </Box>
                                                            )}

                                                            <Divider sx={{ my: 1.25 }} />

                                                            {/* Order total and tracking action */}
                                                            <Stack
                                                                direction={{ xs: "column", sm: "row" }}
                                                                justifyContent="space-between"
                                                                alignItems={{ xs: "stretch", sm: "center" }}
                                                                spacing={1.25}
                                                            >
                                                                <Box>
                                                                    <Typography
                                                                        sx={{
                                                                            fontSize: "0.78rem",
                                                                            color: colors.inkSoft,
                                                                        }}
                                                                    >
                                                                        Order total
                                                                    </Typography>

                                                                    <Typography
                                                                        sx={{
                                                                            fontSize: "1.05rem",
                                                                            fontWeight: 700,
                                                                            color: colors.forest,
                                                                        }}
                                                                    >
                                                                        {formatCurrency(order.grand_total)}
                                                                    </Typography>
                                                                </Box>

                                                                <Button
                                                                    size="small"
                                                                    variant="outlined"
                                                                    startIcon={<Truck size={16} />}
                                                                    disabled={!order.purchase_group_id}
                                                                    onClick={() =>
                                                                        openTrackingModal(customer, order)
                                                                    }
                                                                    sx={{
                                                                        textTransform: "none",
                                                                        borderRadius: 2,
                                                                        borderColor: colors.forest,
                                                                        color: colors.forest,
                                                                        alignSelf: {
                                                                            xs: "flex-start",
                                                                            sm: "center",
                                                                        },
                                                                    }}
                                                                >
                                                                    Tracking Details
                                                                </Button>
                                                            </Stack>

                                                            {!order.purchase_group_id && (
                                                                <Typography
                                                                    sx={{
                                                                        mt: 1,
                                                                        fontSize: "0.75rem",
                                                                        color: colors.inkSoft,
                                                                    }}
                                                                >
                                                                    Tracking is unavailable for this older
                                                                    purchase because it has no group ID.
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    ))}
                                                </Stack>
                                            )}
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
            </Container>

            {/* Tracking details modal */}
            <TrackingDialog
                open={trackingOpen}
                order={selectedOrder}
                customer={selectedCustomer}
                onClose={(shouldRefresh) => {
                    setTrackingOpen(false);
                    setSelectedOrder(null);
                    setSelectedCustomer(null);

                    if (shouldRefresh) {
                        fetchCustomerPurchaseHistory();
                    }
                }}
            />


        </Box>
    );
}

export default CustomerPurchaseHistoryPage;