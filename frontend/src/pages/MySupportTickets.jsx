import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    Box,
    Container,
    Typography,
    Card,
    Button,
    Chip,
    CircularProgress,
    Alert,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Divider,
} from "@mui/material";
import {
    ArrowLeft,
    Ticket,
    RefreshCw,
    X,
} from "lucide-react";

import api from "../services/api";
import { colors, fonts } from "../theme/brand";

function MySupportTickets() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [detailsError, setDetailsError] = useState("");
    const [detailsOpen, setDetailsOpen] = useState(false);

    async function fetchTickets() {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/api/support/tickets");

            setTickets(
                Array.isArray(response.data) ? response.data : []
            );
        } catch (err) {
            console.error("Failed to fetch support tickets:", err);

            setError(
                err.response?.data?.detail ||
                "Unable to load your support tickets. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchTickets();
    }, []);

    async function handleViewTicket(ticketId) {
        setDetailsOpen(true);
        setDetailsLoading(true);
        setDetailsError("");
        setSelectedTicket(null);

        try {
            const response = await api.get(
                `/api/support/tickets/${ticketId}`
            );

            setSelectedTicket(response.data);
        } catch (err) {
            console.error("Failed to fetch ticket details:", err);

            setDetailsError(
                err.response?.data?.detail ||
                "Unable to load ticket details. Please try again."
            );
        } finally {
            setDetailsLoading(false);
        }
    }

    function getStatusColor(status) {
        switch ((status || "").toLowerCase()) {
            case "open":
                return {
                    backgroundColor: "#fff0d9",
                    color: "#945600",
                };

            case "in_progress":
                return {
                    backgroundColor: "#e5efff",
                    color: "#2458a6",
                };

            case "resolved":
                return {
                    backgroundColor: "#e2f5e8",
                    color: "#216e39",
                };

            case "closed":
                return {
                    backgroundColor: "#eeeeee",
                    color: "#555555",
                };

            default:
                return {
                    backgroundColor: "#f1f1f1",
                    color: "#555555",
                };
        }
    }

    function getPriorityColor(priority) {
        switch ((priority || "").toLowerCase()) {
            case "urgent":
                return "error";

            case "high":
                return "warning";

            case "medium":
                return "info";

            case "low":
                return "success";

            default:
                return "default";
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

    if (loading) {
        return (
            <Box
                sx={{
                    minHeight: "70vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: colors.creamDeep,
                }}
            >
                <CircularProgress sx={{ color: colors.forest }} />
            </Box>
        );
    }

    return (
        <Box
            sx={{
                minHeight: "100vh",
                backgroundColor: colors.creamDeep,
                py: { xs: 4, md: 6 },
            }}
        >
            <Container maxWidth="md">
                {/* HEADER */}
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

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: { xs: "flex-start", sm: "center" },
                        flexDirection: { xs: "column", sm: "row" },
                        gap: 2,
                        mb: 4,
                    }}
                >
                    <Box>
                        <Typography
                            sx={{
                                fontFamily: fonts.display,
                                fontSize: { xs: "1.8rem", md: "2.2rem" },
                                fontWeight: 700,
                                color: colors.forest,
                            }}
                        >
                            My Support Tickets
                        </Typography>

                        <Typography
                            sx={{
                                color: colors.inkSoft,
                                mt: 0.5,
                            }}
                        >
                            Track your reported issues and their status.
                        </Typography>
                    </Box>

                    <Button
                        onClick={fetchTickets}
                        startIcon={<RefreshCw size={16} />}
                        variant="outlined"
                        sx={{
                            borderColor: colors.forest,
                            color: colors.forest,
                            textTransform: "none",
                            borderRadius: "10px",
                        }}
                    >
                        Refresh
                    </Button>
                </Box>

                {/* ERROR */}
                {error && (
                    <Alert
                        severity="error"
                        sx={{ mb: 3, borderRadius: "12px" }}
                        action={
                            <Button
                                color="inherit"
                                size="small"
                                onClick={fetchTickets}
                            >
                                Retry
                            </Button>
                        }
                    >
                        {error}
                    </Alert>
                )}

                {/* EMPTY STATE */}
                {!error && tickets.length === 0 && (
                    <Card
                        elevation={0}
                        sx={{
                            border: `1px solid ${colors.line}`,
                            borderRadius: "16px",
                            backgroundColor: "#fff",
                            p: { xs: 4, md: 6 },
                            textAlign: "center",
                        }}
                    >
                        <Ticket
                            size={42}
                            color={colors.moss}
                        />

                        <Typography
                            sx={{
                                fontSize: "1.2rem",
                                fontWeight: 700,
                                color: colors.forest,
                                mt: 2,
                            }}
                        >
                            No support tickets yet
                        </Typography>

                        <Typography
                            sx={{
                                color: colors.inkSoft,
                                mt: 1,
                                mb: 3,
                            }}
                        >
                            If you have a problem with an order,
                            you can report it from Order Details.
                        </Typography>

                        <Button
                            component={Link}
                            to="/orders"
                            variant="contained"
                            sx={{
                                backgroundColor: colors.forest,
                                textTransform: "none",
                                borderRadius: "10px",
                                "&:hover": {
                                    backgroundColor: colors.moss,
                                },
                            }}
                        >
                            View My Orders
                        </Button>
                    </Card>
                )}

                {/* TICKET LIST */}
                <Stack spacing={2}>
                    {tickets.map((ticket) => (
                        <Card
                            key={ticket.ticket_number}
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
                                    alignItems: "flex-start",
                                    gap: 2,
                                    flexWrap: "wrap",
                                }}
                            >
                                <Box sx={{ flex: 1, minWidth: 200 }}>
                                    <Typography
                                        sx={{
                                            color: colors.moss,
                                            fontSize: "0.8rem",
                                            fontWeight: 700,
                                            mb: 0.5,
                                        }}
                                    >
                                        TICKET #{ticket.ticket_number}
                                    </Typography>

                                    <Typography
                                        sx={{
                                            fontSize: "1.1rem",
                                            fontWeight: 700,
                                            color: colors.forest,
                                            overflowWrap: "anywhere",
                                        }}
                                    >
                                        {ticket.subject}
                                    </Typography>

                                    <Typography
                                        sx={{
                                            color: colors.inkSoft,
                                            fontSize: "0.85rem",
                                            mt: 1,
                                        }}
                                    >
                                        Order: {ticket.order_number || "General enquiry"}
                                    </Typography>
                                </Box>

                                <Chip
                                    label={(ticket.status || "open")
                                        .replaceAll("_", " ")
                                        .toUpperCase()}
                                    size="small"
                                    sx={{
                                        ...getStatusColor(ticket.status),
                                        fontWeight: 700,
                                    }}
                                />
                            </Box>

                            <Stack
                                direction="row"
                                spacing={1}
                                useFlexGap
                                flexWrap="wrap"
                                sx={{ mt: 2 }}
                            >
                                <Chip
                                    label={`Category: ${ticket.category || "other"}`}
                                    variant="outlined"
                                    size="small"
                                />

                                <Chip
                                    label={`Priority: ${ticket.priority || "medium"}`}
                                    color={getPriorityColor(ticket.priority)}
                                    size="small"
                                />
                            </Stack>

                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    gap: 2,
                                    flexWrap: "wrap",
                                    mt: 2.5,
                                    pt: 2,
                                    borderTop: `1px solid ${colors.line}`,
                                }}
                            >
                                <Typography
                                    sx={{
                                        color: colors.inkSoft,
                                        fontSize: "0.85rem",
                                    }}
                                >
                                    Created: {formatDate(ticket.created_at)}
                                </Typography>

                                <Typography
                                    sx={{
                                        color: colors.inkSoft,
                                        fontSize: "0.85rem",
                                    }}
                                >
                                    Updated: {formatDate(ticket.updated_at)}
                                </Typography>
                            </Box>

                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    mt: 2,
                                }}
                            >
                                <Button
                                    variant="outlined"
                                    onClick={() => handleViewTicket(ticket.id)}
                                    sx={{
                                        borderColor: colors.forest,
                                        color: colors.forest,
                                        textTransform: "none",
                                        fontWeight: 600,
                                        borderRadius: "10px",
                                        "&:hover": {
                                            borderColor: colors.moss,
                                            backgroundColor: "#f3f7f2",
                                        },
                                    }}
                                >
                                    View Details
                                </Button>
                            </Box>
                        </Card>
                    ))}
                </Stack>

                {/* TICKET DETAILS DIALOG */}
                <Dialog
                    open={detailsOpen}
                    onClose={() => setDetailsOpen(false)}
                    fullWidth
                    maxWidth="sm"
                    PaperProps={{
                        sx: {
                            borderRadius: "18px",
                        },
                    }}
                >
                    <DialogTitle
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            color: colors.forest,
                            fontWeight: 700,
                        }}
                    >
                        Ticket Details

                        <IconButton
                            onClick={() => setDetailsOpen(false)}
                            aria-label="Close ticket details"
                        >
                            <X size={20} />
                        </IconButton>
                    </DialogTitle>

                    <Divider />

                    <DialogContent>
                        {detailsLoading && (
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    py: 5,
                                }}
                            >
                                <CircularProgress sx={{ color: colors.forest }} />
                            </Box>
                        )}

                        {!detailsLoading && detailsError && (
                            <Alert severity="error">
                                {detailsError}
                            </Alert>
                        )}

                        {!detailsLoading && selectedTicket && (
                            <Stack spacing={2.5} sx={{ pt: 1 }}>
                                <Box>
                                    <Typography
                                        sx={{
                                            fontSize: "0.8rem",
                                            color: colors.inkSoft,
                                        }}
                                    >
                                        Ticket Number
                                    </Typography>

                                    <Typography
                                        sx={{
                                            fontWeight: 700,
                                            color: colors.forest,
                                            overflowWrap: "anywhere",
                                        }}
                                    >
                                        {selectedTicket.ticket_number}
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography
                                        sx={{
                                            fontSize: "0.8rem",
                                            color: colors.inkSoft,
                                        }}
                                    >
                                        Subject
                                    </Typography>

                                    <Typography sx={{ fontWeight: 600 }}>
                                        {selectedTicket.subject}
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography
                                        sx={{
                                            fontSize: "0.8rem",
                                            color: colors.inkSoft,
                                        }}
                                    >
                                        Order Number
                                    </Typography>

                                    <Typography>
                                        {selectedTicket.order_number || "General enquiry"}
                                    </Typography>
                                </Box>

                                <Stack direction="row" spacing={1} flexWrap="wrap">
                                    <Chip
                                        label={`Category: ${selectedTicket.category || "other"}`}
                                        variant="outlined"
                                    />

                                    <Chip
                                        label={`Priority: ${selectedTicket.priority || "medium"}`}
                                        color={getPriorityColor(selectedTicket.priority)}
                                    />

                                    <Chip
                                        label={(selectedTicket.status || "open")
                                            .replaceAll("_", " ")
                                            .toUpperCase()}
                                        sx={getStatusColor(selectedTicket.status)}
                                    />
                                </Stack>

                                <Divider />

                                <Box>
                                    <Typography
                                        sx={{
                                            fontWeight: 700,
                                            color: colors.forest,
                                            mb: 1,
                                        }}
                                    >
                                        Your Problem
                                    </Typography>

                                    <Typography
                                        sx={{
                                            whiteSpace: "pre-wrap",
                                            overflowWrap: "anywhere",
                                            color: colors.inkSoft,
                                        }}
                                    >
                                        {selectedTicket.description || "No description provided."}
                                    </Typography>
                                </Box>

                                <Box
                                    sx={{
                                        backgroundColor: "#f3f7f2",
                                        borderRadius: "12px",
                                        p: 2,
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            fontWeight: 700,
                                            color: colors.forest,
                                            mb: 1,
                                        }}
                                    >
                                        AI Suggested Reply
                                    </Typography>

                                    <Typography
                                        sx={{
                                            whiteSpace: "pre-wrap",
                                            overflowWrap: "anywhere",
                                            color: colors.inkSoft,
                                        }}
                                    >
                                        {selectedTicket.ai_suggested_reply ||
                                            "No AI suggested reply available yet."}
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography
                                        sx={{
                                            fontWeight: 700,
                                            color: colors.forest,
                                            mb: 1,
                                        }}
                                    >
                                        Admin Reply
                                    </Typography>

                                    <Typography
                                        sx={{
                                            whiteSpace: "pre-wrap",
                                            overflowWrap: "anywhere",
                                            color: colors.inkSoft,
                                        }}
                                    >
                                        {selectedTicket.admin_reply ||
                                            "Our support team has not replied yet."}
                                    </Typography>
                                </Box>

                                {selectedTicket.resolution && (
                                    <Box>
                                        <Typography
                                            sx={{
                                                fontWeight: 700,
                                                color: colors.forest,
                                                mb: 1,
                                            }}
                                        >
                                            Resolution
                                        </Typography>

                                        <Typography
                                            sx={{
                                                whiteSpace: "pre-wrap",
                                                overflowWrap: "anywhere",
                                            }}
                                        >
                                            {selectedTicket.resolution}
                                        </Typography>
                                    </Box>
                                )}

                                <Divider />

                                <Typography
                                    sx={{
                                        fontSize: "0.85rem",
                                        color: colors.inkSoft,
                                    }}
                                >
                                    Created: {formatDate(selectedTicket.created_at)}
                                </Typography>

                                <Typography
                                    sx={{
                                        fontSize: "0.85rem",
                                        color: colors.inkSoft,
                                    }}
                                >
                                    Last Updated: {formatDate(selectedTicket.updated_at)}
                                </Typography>
                            </Stack>
                        )}
                    </DialogContent>

                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button
                            onClick={() => setDetailsOpen(false)}
                            sx={{
                                color: colors.forest,
                                textTransform: "none",
                                fontWeight: 600,
                            }}
                        >
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
}

export default MySupportTickets;