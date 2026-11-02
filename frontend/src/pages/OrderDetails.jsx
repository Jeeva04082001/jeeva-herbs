import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
    Box,
    Container,
    Typography,
    Card,
    Button,
    Chip,
    Divider,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    IconButton,
    Alert,
} from "@mui/material";
import {
    ArrowLeft,
    Package,
    MapPin,
    CreditCard,
    CheckCircle2,
    Circle,
    X,
} from "lucide-react";

import api from "../services/api";
import { colors, fonts } from "../theme/brand";

const steps = [
    {
        key: "pending",
        label: "Order Placed",
    },
    {
        key: "confirmed",
        label: "Confirmed",
    },
    {
        key: "packed",
        label: "Packed",
    },
    {
        key: "shipped",
        label: "Shipped",
    },
    {
        key: "delivered",
        label: "Delivered",
    },
];

function OrderDetails() {
    const { order_number } = useParams();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submittingTicket, setSubmittingTicket] = useState(false);
    const [ticketError, setTicketError] = useState("");
    const [ticketSuccess, setTicketSuccess] = useState("");

    const [reportDialogOpen, setReportDialogOpen] = useState(false);

    const [reportForm, setReportForm] = useState({
        category: "",
        subject: "",
        description: "",
    });

    useEffect(() => {
        fetchOrder();
    }, [order_number]);



    useEffect(() => {
        if (!order_number) return;

        const ws = new WebSocket("ws://localhost:8002/ws");

        ws.onopen = () => {
            console.log("Order WebSocket connected");
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                if (
                    data.type === "order_status_updated" &&
                    data.order_number === order_number
                ) {
                    console.log("Order status updated:", data.status);

                    setOrder((prev) => {
                        if (!prev) return prev;

                        return {
                            ...prev,
                            status: data.status,
                        };
                    });
                }
            } catch (error) {
                console.error("WebSocket message error:", error);
            }
        };

        ws.onerror = (error) => {
            console.error("Order WebSocket error:", error);
        };

        ws.onclose = () => {
            console.log("Order WebSocket disconnected");
        };

        return () => {
            ws.close();
        };
    }, [order_number]);

    async function fetchOrder() {
        try {
            setLoading(true);

            const response = await api.get(
                `/api/orders/${order_number}`
            );

            setOrder(response.data);
        } catch (error) {
            console.error("Failed to load order:", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmitTicket() {
        setTicketError("");
        setTicketSuccess("");

        if (!reportForm.category || !reportForm.subject.trim() || !reportForm.description.trim()) {
            setTicketError("Please fill in all required fields.");
            return;
        }

        try {
            setSubmittingTicket(true);

            const payload = {
                order_number: order.order_number,
                subject: reportForm.subject.trim(),
                description: reportForm.description.trim(),
                category: reportForm.category,
            };

            const response = await api.post(
                "/api/support/tickets",
                payload
            );

            setTicketSuccess(
                response.data?.message || "Your support ticket has been submitted successfully!"
            );

            setReportForm({
                category: "",
                subject: "",
                description: "",
            });

            setTimeout(() => {
                setReportDialogOpen(false);
                setTicketSuccess("");
            }, 2000);

            
        } catch (error) {
            console.error("Failed to create support ticket:", error);

            setTicketError(
                error.response?.data?.detail ||
                error.response?.data?.message ||
                "Unable to submit your ticket. Please try again."
            );
        } finally {
            setSubmittingTicket(false);
        }
    }

    function formatDate(dateString) {
        if (!dateString) return "-";

        return new Date(dateString).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    }

    function formatCurrency(value) {
        return `₹${Number(value || 0).toLocaleString("en-IN")}`;
    }

    function getStepIndex(status) {
        return steps.findIndex((step) => step.key === status);
    }

    if (loading) {
        return (
            <Box
                sx={{
                    minHeight: "100vh",
                    backgroundColor: colors.creamDeep,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <CircularProgress sx={{ color: colors.forest }} />
            </Box>
        );
    }

    if (!order) {
        return (
            <Box
                sx={{
                    minHeight: "100vh",
                    backgroundColor: colors.creamDeep,
                    py: 8,
                    textAlign: "center",
                }}
            >
                <Typography
                    sx={{
                        fontFamily: fonts.display,
                        fontSize: "1.8rem",
                        color: colors.forest,
                        fontWeight: 600,
                    }}
                >
                    Order not found
                </Typography>

                <Button
                    component={Link}
                    to="/orders"
                    startIcon={<ArrowLeft size={17} />}
                    sx={{
                        mt: 2,
                        color: colors.forest,
                    }}
                >
                    Back to My Orders
                </Button>
            </Box>
        );
    }

    const currentStep = getStepIndex(order.status);

    return (
        <Box
            sx={{
                minHeight: "100vh",
                backgroundColor: colors.creamDeep,
                py: { xs: 4, md: 6 },
            }}
        >
            <Container maxWidth="md">

                {/* BACK */}
                <Button
                    component={Link}
                    to="/orders"
                    startIcon={<ArrowLeft size={17} />}
                    sx={{
                        color: colors.forest,
                        mb: 3,
                        textTransform: "none",
                        fontWeight: 600,
                    }}
                >
                    Back to My Orders
                </Button>

                {/* HEADER */}
                <Card
                    elevation={0}
                    sx={{
                        border: `1px solid ${colors.line}`,
                        borderRadius: "16px",
                        backgroundColor: "#fff",
                        p: { xs: 2.5, md: 3 },
                        mb: 2,
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: "0.75rem",
                            letterSpacing: "0.1em",
                            color: colors.moss,
                            fontWeight: 600,
                            mb: 0.5,
                        }}
                    >
                        ORDER DETAILS
                    </Typography>

                    <Typography
                        sx={{
                            fontFamily: fonts.display,
                            fontSize: { xs: "1.5rem", md: "1.9rem" },
                            fontWeight: 700,
                            color: colors.forest,
                        }}
                    >
                        #{order.order_number}
                    </Typography>

                    <Typography
                        sx={{
                            color: colors.inkSoft,
                            mt: 0.5,
                        }}
                    >
                        {formatDate(order.created_at)}
                    </Typography>
                </Card>

                {/* ORDER TRACKING */}
                <Card
                    elevation={0}
                    sx={{
                        border: `1px solid ${colors.line}`,
                        borderRadius: "16px",
                        backgroundColor: "#fff",
                        p: { xs: 2.5, md: 3 },
                        mb: 2,
                    }}
                >
                    <Typography
                        sx={{
                            fontFamily: fonts.display,
                            fontSize: "1.3rem",
                            fontWeight: 600,
                            color: colors.forest,
                            mb: 3,
                        }}
                    >
                        Order Tracking
                    </Typography>

                    {order.status === "cancelled" ? (
                        <Chip
                            label="ORDER CANCELLED"
                            sx={{
                                backgroundColor: "rgba(161,92,51,0.12)",
                                color: colors.clay,
                                fontWeight: 700,
                            }}
                        />
                    ) : (
                        <Box>
                            {steps.map((step, index) => {
                                const completed = index <= currentStep;
                                const isCurrent = index === currentStep;

                                return (
                                    <Box
                                        key={step.key}
                                        sx={{
                                            display: "flex",
                                            alignItems: "flex-start",
                                            position: "relative",
                                            minHeight:
                                                index === steps.length - 1 ? 50 : 75,
                                        }}
                                    >
                                        {/* ICON */}
                                        <Box
                                            sx={{
                                                width: 30,
                                                height: 30,
                                                borderRadius: "50%",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                backgroundColor: completed
                                                    ? colors.forest
                                                    : colors.leafPale,
                                                color: completed
                                                    ? colors.cream
                                                    : colors.moss,
                                                zIndex: 1,
                                                flexShrink: 0,
                                            }}
                                        >
                                            {completed ? (
                                                <CheckCircle2 size={17} />
                                            ) : (
                                                <Circle size={15} />
                                            )}
                                        </Box>

                                        {/* CONNECTING LINE */}
                                        {index < steps.length - 1 && (
                                            <Box
                                                sx={{
                                                    position: "absolute",
                                                    left: 14,
                                                    top: 30,
                                                    width: 2,
                                                    height: 45,
                                                    backgroundColor:
                                                        index < currentStep
                                                            ? colors.forest
                                                            : colors.line,
                                                }}
                                            />
                                        )}

                                        {/* TEXT */}
                                        <Box sx={{ ml: 2 }}>
                                            <Typography
                                                sx={{
                                                    fontWeight: isCurrent ? 700 : 600,
                                                    color: completed
                                                        ? colors.forest
                                                        : colors.inkSoft,
                                                }}
                                            >
                                                {step.label}
                                            </Typography>

                                            {isCurrent && (
                                                <Typography
                                                    sx={{
                                                        fontSize: "0.8rem",
                                                        color: colors.moss,
                                                        mt: 0.2,
                                                    }}
                                                >
                                                    Current status
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Box>
                    )}
                </Card>

                {/* REPORT A PROBLEM */}
                <Card
                    elevation={0}
                    sx={{
                        border: `1px solid ${colors.line}`,
                        borderRadius: "16px",
                        backgroundColor: "#fff",
                        p: { xs: 2.5, md: 3 },
                        mt: 2,
                        mb: 2,
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 2,
                            flexWrap: "wrap",
                        }}
                    >
                        <Typography
                            sx={{
                                fontWeight: 600,
                                color: colors.forest,
                            }}
                        >
                            Need help with your order?
                        </Typography>

                        <Button
                            variant="contained"
                            onClick={() => setReportDialogOpen(true)}
                            sx={{
                                backgroundColor: colors.forest,
                                color: "#fff",
                                textTransform: "none",
                                fontWeight: 600,
                                borderRadius: "10px",
                                px: 3,
                                "&:hover": {
                                    backgroundColor: colors.moss,
                                },
                            }}
                        >
                            Report a Problem
                        </Button>
                    </Box>
                </Card>


                {/* REPORT A PROBLEM DIALOG */}
                <Dialog
                    open={reportDialogOpen}
                    onClose={() => setReportDialogOpen(false)}
                    fullWidth
                    maxWidth="sm"
                    PaperProps={{
                        sx: {
                            borderRadius: "18px",
                            p: { xs: 1, sm: 2 },
                        },
                    }}
                >
                    <DialogTitle
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            color: colors.forest,
                            fontWeight: 700,
                        }}
                    >
                        Report a Problem

                        <IconButton
                            onClick={() => setReportDialogOpen(false)}
                            aria-label="Close dialog"
                        >
                            <X size={20} />
                        </IconButton>
                    </DialogTitle>

                    <DialogContent>
                        <Typography
                            sx={{
                                color: colors.inkSoft,
                                mb: 2.5,
                                fontSize: "0.9rem",
                            }}
                        >
                            Tell us about the issue with your order.
                            Our support team will help you.
                        </Typography>

                        {/* ORDER NUMBER */}
                        <TextField
                            fullWidth
                            label="Order Number"
                            value={order.order_number || ""}
                            disabled
                            margin="normal"
                        />

                        {/* ISSUE CATEGORY */}
                        <TextField
                            select
                            fullWidth
                            label="Issue Type"
                            value={reportForm.category}
                            onChange={(e) =>
                                setReportForm((prev) => ({
                                    ...prev,
                                    category: e.target.value,
                                }))
                            }
                            margin="normal"
                            required
                        >
                            <MenuItem value="delivery">Delivery Issue</MenuItem>
                            <MenuItem value="product">Product Issue</MenuItem>
                            <MenuItem value="quality">Product Quality</MenuItem>
                            <MenuItem value="payment">Payment Issue</MenuItem>
                            <MenuItem value="order">Order Issue</MenuItem>
                            <MenuItem value="other">Other</MenuItem>
                        </TextField>

                        {/* SUBJECT */}
                        <TextField
                            fullWidth
                            label="Subject"
                            placeholder="Briefly describe your issue"
                            value={reportForm.subject}
                            onChange={(e) =>
                                setReportForm((prev) => ({
                                    ...prev,
                                    subject: e.target.value,
                                }))
                            }
                            margin="normal"
                            required
                        />

                        {/* DESCRIPTION */}
                        <TextField
                            fullWidth
                            label="Describe your problem"
                            placeholder="Please explain the issue in detail..."
                            value={reportForm.description}
                            onChange={(e) =>
                                setReportForm((prev) => ({
                                    ...prev,
                                    description: e.target.value,
                                }))
                            }
                            margin="normal"
                            multiline
                            rows={4}
                            required
                        />
                    </DialogContent>

                    {ticketError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {ticketError}
                        </Alert>
                    )}

                    {ticketSuccess && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            {ticketSuccess}
                        </Alert>
                    )}

                    <DialogActions
                        sx={{
                            px: 3,
                            pb: 2,
                            gap: 1,
                        }}
                    >
                        <Button
                            onClick={() => setReportDialogOpen(false)}
                            sx={{
                                color: colors.inkSoft,
                                textTransform: "none",
                            }}
                        >
                            Cancel
                        </Button>

                        <Button
                            variant="contained"
                            onClick={handleSubmitTicket}
                            disabled={submittingTicket || Boolean(ticketSuccess)}
                            sx={{
                                backgroundColor: colors.forest,
                                color: "#fff",
                                textTransform: "none",
                                fontWeight: 600,
                                borderRadius: "10px",
                                px: 3,
                                "&:hover": {
                                    backgroundColor: colors.moss,
                                },
                            }}
                        >
                            {submittingTicket ? (
                                <CircularProgress size={20} sx={{ color: "#fff" }} />
                            ) : ticketSuccess ? (
                                "Submitted"
                            ) : (
                                "Submit Ticket"
                            )}
                        </Button>


                    </DialogActions>
                </Dialog>



                {/* PRODUCTS */}
                <Card
                    elevation={0}
                    sx={{
                        border: `1px solid ${colors.line}`,
                        borderRadius: "16px",
                        backgroundColor: "#fff",
                        p: { xs: 2.5, md: 3 },
                        mb: 2,
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 2,
                        }}
                    >
                        <Package size={19} color={colors.moss} />

                        <Typography
                            sx={{
                                fontFamily: fonts.display,
                                fontSize: "1.3rem",
                                fontWeight: 600,
                                color: colors.forest,
                            }}
                        >
                            Products
                        </Typography>
                    </Box>

                    {order.items?.map((item) => (
                        <Box key={item.product_id}>
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    gap: 2,
                                    py: 1.5,
                                }}
                            >
                                <Box>
                                    <Typography
                                        sx={{
                                            fontWeight: 600,
                                            color: colors.forest,
                                        }}
                                    >
                                        {item.product_name}
                                    </Typography>

                                    <Typography
                                        sx={{
                                            fontSize: "0.85rem",
                                            color: colors.inkSoft,
                                            mt: 0.3,
                                        }}
                                    >
                                        Pack Size: {item.pack_size || "-"}
                                        {" • "}
                                        {formatCurrency(item.unit_price)} × {item.quantity}
                                    </Typography>
                                </Box>

                                <Typography
                                    sx={{
                                        fontWeight: 700,
                                        color: colors.forest,
                                    }}
                                >
                                    {formatCurrency(item.line_total)}
                                </Typography>
                            </Box>

                            <Divider />
                        </Box>
                    ))}
                </Card>

                {/* DELIVERY + PAYMENT */}
                <Card
                    elevation={0}
                    sx={{
                        border: `1px solid ${colors.line}`,
                        borderRadius: "16px",
                        backgroundColor: "#fff",
                        p: { xs: 2.5, md: 3 },
                        mb: 2,
                    }}
                >
                    <Box sx={{ display: "flex", gap: 1.5, mb: 2 }}>
                        <MapPin size={19} color={colors.moss} />

                        <Box>
                            <Typography
                                sx={{
                                    fontWeight: 700,
                                    color: colors.forest,
                                    mb: 0.5,
                                }}
                            >
                                Delivery Address
                            </Typography>

                            <Typography sx={{ color: colors.inkSoft }}>
                                {order.address}
                            </Typography>

                            <Typography sx={{ color: colors.inkSoft }}>
                                Pincode: {order.pincode}
                            </Typography>
                        </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: "flex", gap: 1.5 }}>
                        <CreditCard size={19} color={colors.moss} />

                        <Box>
                            <Typography
                                sx={{
                                    fontWeight: 700,
                                    color: colors.forest,
                                }}
                            >
                                Payment
                            </Typography>

                            <Typography
                                sx={{
                                    color: colors.inkSoft,
                                    textTransform: "uppercase",
                                    fontSize: "0.85rem",
                                    mt: 0.3,
                                }}
                            >
                                {order.payment_method}
                            </Typography>
                        </Box>
                    </Box>
                </Card>



                {/* TOTAL */}
                <Card
                    elevation={0}
                    sx={{
                        border: `1px solid ${colors.line}`,
                        borderRadius: "16px",
                        backgroundColor: "#fff",
                        p: { xs: 2.5, md: 3 },
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 1,
                        }}
                    >
                        <Typography color={colors.inkSoft}>
                            Subtotal
                        </Typography>

                        <Typography>
                            {formatCurrency(order.subtotal)}
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 2,
                        }}
                    >
                        <Typography color={colors.inkSoft}>
                            Delivery
                        </Typography>

                        <Typography>
                            {order.delivery_fee === 0
                                ? "FREE"
                                : formatCurrency(order.delivery_fee)}
                        </Typography>
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                        }}
                    >
                        <Typography
                            sx={{
                                fontWeight: 700,
                                color: colors.forest,
                                fontSize: "1.1rem",
                            }}
                        >
                            Total
                        </Typography>

                        <Typography
                            sx={{
                                fontWeight: 700,
                                color: colors.forest,
                                fontSize: "1.2rem",
                            }}
                        >
                            {formatCurrency(order.total)}
                        </Typography>
                    </Box>
                </Card>
            </Container>
        </Box>
    );
}

export default OrderDetails;