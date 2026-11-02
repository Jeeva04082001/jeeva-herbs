
import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  Button,
  TextField,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
  Alert,
  InputAdornment,
} from "@mui/material";

import {
  ArrowLeft,
  RefreshCw,
  Search,
  Headset,
  Eye,
  X,
  MessageSquare,
  Bot,
  Save,
} from "lucide-react";

import { Link } from "react-router-dom";
import api from "../../services/api";
import { colors, fonts } from "../../theme/brand";

const STATUS_OPTIONS = [
  "open",
  "in_progress",
  "escalated",
  "resolved",
  "closed",
];

const PRIORITY_OPTIONS = ["low", "medium", "high", "urgent"];

const STATUS_LABELS = {
  open: "Open",
  in_progress: "In Progress",
  escalated: "Escalated",
  resolved: "Resolved",
  closed: "Closed",
};

const PRIORITY_COLORS = {
  low: { color: "#287548", bg: "#E4F4E9" },
  medium: { color: "#8A6500", bg: "#FFF3CD" },
  high: { color: "#B45309", bg: "#FFEDD5" },
  urgent: { color: "#B91C1C", bg: "#FEE2E2" },
};

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({ status }) {
  const styles = {
    open: { color: "#92400E", bg: "#FEF3C7" },
    in_progress: { color: "#1D4ED8", bg: "#DBEAFE" },
    escalated: { color: "#7E22CE", bg: "#F3E8FF" },
    resolved: { color: "#166534", bg: "#DCFCE7" },
    closed: { color: "#475569", bg: "#E2E8F0" },
  };

  const style = styles[status] || styles.open;

  return (
    <Chip
      size="small"
      label={STATUS_LABELS[status] || status || "Unknown"}
      sx={{
        backgroundColor: style.bg,
        color: style.color,
        fontWeight: 600,
        borderRadius: "7px",
      }}
    />
  );
}

function PriorityBadge({ priority }) {
  const style = PRIORITY_COLORS[priority] || PRIORITY_COLORS.medium;

  return (
    <Chip
      size="small"
      label={priority || "medium"}
      sx={{
        backgroundColor: style.bg,
        color: style.color,
        fontWeight: 600,
        textTransform: "capitalize",
        borderRadius: "7px",
      }}
    />
  );
}

function AdminSupportTickets() {
  const [tickets, setTickets] = useState([]);
  console.log(tickets,'tickets-------------');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [editForm, setEditForm] = useState({
    status: "open",
    admin_reply: "",
    resolution: "",
  });

  async function fetchTickets() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/admin/support/tickets");

      setTickets(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (err) {
      console.error("Failed to fetch support tickets:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to load support tickets. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTickets();
  }, []);

  const filteredTickets = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return tickets.filter((ticket) => {
      const matchesSearch =
        !searchValue ||
        [
          ticket.ticket_number,
          ticket.customer,
          ticket.subject,
          ticket.order_number,
        ].some((value) =>
          String(value || "").toLowerCase().includes(searchValue)
        );

      const matchesStatus =
        statusFilter === "all" || ticket.status === statusFilter;

      const matchesPriority =
        priorityFilter === "all" ||
        ticket.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tickets, search, statusFilter, priorityFilter]);

  function openTicket(ticket) {
    setSelectedTicket(ticket);

    setEditForm({
      status: ticket.status || "open",
      admin_reply: ticket.admin_reply || "",
      resolution: ticket.resolution || "",
    });

    setError("");
    setSuccess("");
    setDetailsOpen(true);
  }

  async function handleSave() {
    if (!selectedTicket?.id) {
      setError("Ticket ID is missing. Cannot update this ticket.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        status: editForm.status,
        admin_reply: editForm.admin_reply,
        resolution: editForm.resolution,
      };

      await api.put(
        `/api/admin/support/tickets/${selectedTicket.id}`,
        payload
      );

      setSuccess("Support ticket updated successfully.");

      await fetchTickets();

      setSelectedTicket((previous) =>
        previous
          ? {
              ...previous,
              ...payload,
            }
          : previous
      );
    } catch (err) {
      console.error("Failed to update support ticket:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to update the ticket. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }



  

  const statCards = [
    {
      label: "Total Tickets",
      value: tickets.length,
    },
    {
      label: "Open",
      value: tickets.filter((ticket) => ticket.status === "open").length,
    },
    {
      label: "In Progress",
      value: tickets.filter(
        (ticket) => ticket.status === "in_progress"
      ).length,
    },
    {
      label: "Escalated",
      value: tickets.filter(
        (ticket) => ticket.status === "escalated"
      ).length,
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: colors.creamDeep,
        py: { xs: 3, md: 5 },
      }}
    >
      <Container maxWidth="xl">
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
            mb: 4,
          }}
        >
          <Box>
            <Button
              component={Link}
              to="/admin"
              startIcon={<ArrowLeft size={17} />}
              sx={{
                color: colors.forest,
                mb: 1,
                textTransform: "none",
              }}
            >
              Back to Dashboard
            </Button>

            <Typography
              sx={{
                fontSize: "0.75rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: colors.moss,
              }}
            >
              Customer Service
            </Typography>

            <Typography
              sx={{
                fontFamily: fonts.display,
                fontSize: { xs: "1.8rem", md: "2.3rem" },
                fontWeight: 700,
                color: colors.forest,
              }}
            >
              Support Tickets
            </Typography>

            <Typography sx={{ color: colors.inkSoft, mt: 0.5 }}>
              Manage customer issues, replies and resolutions.
            </Typography>
          </Box>

          <Button
            variant="contained"
            onClick={fetchTickets}
            disabled={loading}
            startIcon={
              loading ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <RefreshCw size={17} />
              )
            }
            sx={{
              backgroundColor: colors.forest,
              color: "#fff",
              borderRadius: "10px",
              px: 2.5,
              py: 1.2,
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#0e261e",
              },
            }}
          >
            Refresh Tickets
          </Button>
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3 }}
            onClose={() => setError("")}
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert
            severity="success"
            sx={{ mb: 3 }}
            onClose={() => setSuccess("")}
          >
            {success}
          </Alert>
        )}

        {/* Statistics */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, 1fr)",
              sm: "repeat(4, 1fr)",
            },
            gap: 2,
            mb: 3,
          }}
        >
          {statCards.map((stat) => (
            <Card
              key={stat.label}
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: "16px",
                border: `1px solid ${colors.line}`,
              }}
            >
              <Typography
                sx={{
                  color: colors.inkSoft,
                  fontSize: "0.85rem",
                  fontWeight: 600,
                }}
              >
                {stat.label}
              </Typography>

              <Typography
                sx={{
                  fontFamily: fonts.display,
                  fontSize: "2rem",
                  fontWeight: 700,
                  color: colors.forest,
                  mt: 0.5,
                }}
              >
                {loading ? "—" : stat.value}
              </Typography>
            </Card>
          ))}
        </Box>

        {/* Ticket list */}
        <Card
          elevation={0}
          sx={{
            border: `1px solid ${colors.line}`,
            borderRadius: "16px",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              p: 2.5,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              flexWrap: "wrap",
            }}
          >
            <Box
              sx={{
                width: 42,
                height: 42,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "12px",
                color: colors.forest,
                backgroundColor: colors.leafPale,
              }}
            >
              <Headset size={21} />
            </Box>

            <Box sx={{ flex: 1, minWidth: 160 }}>
              <Typography
                sx={{ fontWeight: 700, color: colors.forest }}
              >
                All Support Tickets
              </Typography>
              <Typography
                sx={{ color: colors.inkSoft, fontSize: "0.82rem" }}
              >
                {filteredTickets.length} ticket(s) found
              </Typography>
            </Box>

            <TextField
              size="small"
              placeholder="Search tickets..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              sx={{ minWidth: { xs: "100%", sm: 220 } }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={17} />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <TextField
              select
              size="small"
              label="Status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              sx={{ minWidth: 145 }}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              {STATUS_OPTIONS.map((status) => (
                <MenuItem key={status} value={status}>
                  {STATUS_LABELS[status]}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              size="small"
              label="Priority"
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value)}
              sx={{ minWidth: 130 }}
            >
              <MenuItem value="all">All Priorities</MenuItem>
              {PRIORITY_OPTIONS.map((priority) => (
                <MenuItem key={priority} value={priority}>
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <TableContainer sx={{ overflowX: "auto" }}>
            <Table sx={{ minWidth: 950 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#F8F6EF" }}>
                  {[
                    "Ticket",
                    "Customer",
                    "Subject",
                    "Category",
                    "Priority",
                    "Status",
                    "Created",
                    "Action",
                  ].map((heading) => (
                    <TableCell
                      key={heading}
                      sx={{
                        fontWeight: 700,
                        color: colors.forest,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {heading}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 7 }}>
                      <CircularProgress size={28} />
                      <Typography sx={{ mt: 1, color: colors.inkSoft }}>
                        Loading tickets...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : filteredTickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 7 }}>
                      <Headset size={34} color={colors.moss} />
                      <Typography
                        sx={{
                          mt: 1,
                          fontWeight: 600,
                          color: colors.forest,
                        }}
                      >
                        No support tickets found
                      </Typography>
                      <Typography
                        sx={{ color: colors.inkSoft, fontSize: "0.85rem" }}
                      >
                        Try changing the search or filter options.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTickets.map((ticket) => (
                    <TableRow
                      key={ticket.id}
                      hover
                      sx={{
                        "& td": {
                          borderColor: colors.line,
                        },
                      }}
                    >
                      <TableCell>
                        <Typography
                          sx={{
                            fontWeight: 700,
                            fontSize: "0.82rem",
                            color: colors.forest,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {ticket.ticket_number}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        {ticket.customer || "Deleted Customer"}
                      </TableCell>

                      <TableCell sx={{ maxWidth: 230 }}>
                        <Typography
                          sx={{
                            fontWeight: 600,
                            color: colors.ink,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {ticket.subject}
                        </Typography>

                        {ticket.order_number && (
                          <Typography
                            sx={{
                              fontSize: "0.76rem",
                              color: colors.inkSoft,
                              mt: 0.3,
                            }}
                          >
                            Order: {ticket.order_number}
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell>
                        <Typography
                          sx={{
                            fontSize: "0.82rem",
                            textTransform: "capitalize",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {ticket.category}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <PriorityBadge priority={ticket.priority} />
                      </TableCell>

                      <TableCell>
                        <StatusBadge status={ticket.status} />
                      </TableCell>

                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        <Typography sx={{ fontSize: "0.8rem" }}>
                          {formatDate(ticket.created_at)}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Eye size={15} />}
                          onClick={() => openTicket(ticket)}
                          sx={{
                            borderColor: colors.moss,
                            color: colors.forest,
                            textTransform: "none",
                            whiteSpace: "nowrap",
                            "&:hover": {
                              borderColor: colors.forest,
                              backgroundColor: colors.leafPale,
                            },
                          }}
                        >
                          Manage
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Container>

      {/* Ticket management dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => {
          if (!saving) setDetailsOpen(false);
        }}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: "18px",
            backgroundColor: "#FFFEFA",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 2,
            borderBottom: `1px solid ${colors.line}`,
            pb: 2,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontFamily: fonts.display,
                fontSize: "1.5rem",
                fontWeight: 700,
                color: colors.forest,
              }}
            >
              Manage Support Ticket
            </Typography>

            <Typography
              sx={{ color: colors.inkSoft, fontSize: "0.85rem", mt: 0.5 }}
            >
              {selectedTicket?.ticket_number}
            </Typography>
          </Box>

          <IconButton
            onClick={() => setDetailsOpen(false)}
            disabled={saving}
            size="small"
          >
            <X size={20} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          {selectedTicket && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
              {error && (
                <Alert severity="error" onClose={() => setError("")}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert severity="success" onClose={() => setSuccess("")}>
                  {success}
                </Alert>
              )}

              {/* Customer issue */}
              <Box>
                <Typography
                  sx={{ fontWeight: 700, color: colors.forest, mb: 1 }}
                >
                  Customer Issue
                </Typography>

                <Card
                  elevation={0}
                  sx={{
                    p: 2,
                    backgroundColor: "#F8F6EF",
                    border: `1px solid ${colors.line}`,
                    borderRadius: "12px",
                  }}
                >
                  <Typography sx={{ fontWeight: 700, mb: 1 }}>
                    {selectedTicket.subject}
                  </Typography>

                  <Typography
                    sx={{
                      color: colors.inkSoft,
                      whiteSpace: "pre-wrap",
                      overflowWrap: "anywhere",
                      lineHeight: 1.7,
                    }}
                  >
                    {selectedTicket.description || "No description provided."}
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      flexWrap: "wrap",
                      mt: 2,
                    }}
                  >
                    <Chip
                      size="small"
                      label={`Customer: ${selectedTicket.customer || "N/A"}`}
                    />

                    <Chip
                      size="small"
                      label={`Order: ${selectedTicket.order_number || "N/A"}`}
                    />

                    <Chip
                      size="small"
                      label={`Category: ${selectedTicket.category || "other"}`}
                    />
                  </Box>
                </Card>
              </Box>

              {/* AI suggested reply */}
              <Box>
                <Typography
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    fontWeight: 700,
                    color: colors.forest,
                    mb: 1,
                  }}
                >
                  <Bot size={19} />
                  AI Suggested Reply
                </Typography>

                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  value={selectedTicket.ai_suggested_reply || ""}
                  placeholder="No AI suggested reply available."
                  slotProps={{
                    input: {
                      readOnly: true,
                    },
                  }}
                />

                <Button
                  size="small"
                  onClick={() =>
                    setEditForm((previous) => ({
                      ...previous,
                      admin_reply:
                        selectedTicket.ai_suggested_reply || "",
                    }))
                  }
                  disabled={!selectedTicket.ai_suggested_reply || saving}
                  sx={{
                    mt: 1,
                    color: colors.forest,
                    textTransform: "none",
                  }}
                >
                  Use AI Reply
                </Button>
              </Box>

              {/* Admin reply */}
              <Box>
                <Typography
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    fontWeight: 700,
                    color: colors.forest,
                    mb: 1,
                  }}
                >
                  <MessageSquare size={18} />
                  Admin Reply
                </Typography>

                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  value={editForm.admin_reply}
                  onChange={(event) =>
                    setEditForm((previous) => ({
                      ...previous,
                      admin_reply: event.target.value,
                    }))
                  }
                  placeholder="Write a reply to the customer..."
                  disabled={saving}
                />
              </Box>

              {/* Status */}
              <TextField
                select
                fullWidth
                label="Ticket Status"
                value={editForm.status}
                onChange={(event) =>
                  setEditForm((previous) => ({
                    ...previous,
                    status: event.target.value,
                  }))
                }
                disabled={saving}
              >
                {STATUS_OPTIONS.map((status) => (
                  <MenuItem key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </MenuItem>
                ))}
              </TextField>

              {/* Resolution */}
              <Box>
                <Typography
                  sx={{ fontWeight: 700, color: colors.forest, mb: 1 }}
                >
                  Resolution Notes
                </Typography>

                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  value={editForm.resolution}
                  onChange={(event) =>
                    setEditForm((previous) => ({
                      ...previous,
                      resolution: event.target.value,
                    }))
                  }
                  placeholder="Describe how the issue was resolved..."
                  disabled={saving}
                />
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            p: 2.5,
            borderTop: `1px solid ${colors.line}`,
            gap: 1,
          }}
        >
          <Button
            onClick={() => setDetailsOpen(false)}
            disabled={saving}
            sx={{
              color: colors.inkSoft,
              textTransform: "none",
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving || !selectedTicket}
            startIcon={
              saving ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <Save size={17} />
              )
            }
            sx={{
              backgroundColor: colors.forest,
              borderRadius: "10px",
              px: 2.5,
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#0e261e",
              },
            }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AdminSupportTickets;
