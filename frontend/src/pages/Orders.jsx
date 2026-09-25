import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
    Box,
    Container,
    Typography,
    Card,
    Chip,
    IconButton,
    Skeleton,
    Tooltip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Rating,
    Divider,
    Stack,
} from "@mui/material";

import {
    ClipboardList,
    RefreshCw,
    Eye,
    Package,
    Star,
} from "lucide-react";

import api from "../services/api";
import { colors, fonts } from "../theme/brand";

const RADIUS = "18px";


/* ========================================================= */
/* STATUS STYLE */
/* ========================================================= */

function getStatusStyle(status) {
    switch (status) {
        case "pending":
            return {
                background: "rgba(201,154,62,0.15)",
                color: colors.clay,
            };

        case "confirmed":
            return {
                background: "rgba(63,107,74,0.12)",
                color: colors.moss,
            };

        case "packed":
            return {
                background: "rgba(20,52,42,0.10)",
                color: colors.forest,
            };

        case "shipped":
            return {
                background: "rgba(63,107,74,0.16)",
                color: colors.moss,
            };

        case "delivered":
            return {
                background: "rgba(63,107,74,0.20)",
                color: colors.forest,
            };

        case "cancelled":
            return {
                background: "rgba(161,92,51,0.12)",
                color: colors.clay,
            };

        default:
            return {
                background: colors.leafPale,
                color: colors.forest,
            };
    }
}


/* ========================================================= */
/* STATUS CHIP */
/* ========================================================= */

function StatusChip({ status }) {
    const style = getStatusStyle(status);

    return (
        <Chip
            label={status?.replace("_", " ").toUpperCase()}
            size="small"
            sx={{
                backgroundColor: style.background,
                color: style.color,
                fontWeight: 700,
                fontSize: "0.68rem",
                letterSpacing: "0.03em",
                borderRadius: "999px",
                height: 27,
                px: 0.4,
            }}
        />
    );
}


/* ========================================================= */
/* ORDERS PAGE */
/* ========================================================= */

function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    /* ================= REVIEW STATES ================= */

    const [reviewProduct, setReviewProduct] = useState(null);
    const [reviewOrder, setReviewOrder] = useState(null);

    // Review product selector
    const [reviewSelectorOrder, setReviewSelectorOrder] = useState(null);
    const [reviewSelectorOpen, setReviewSelectorOpen] = useState(false);

    const [reviewDialogOpen, setReviewDialogOpen] = useState(false);

    const [reviewRating, setReviewRating] = useState(0);
    const [reviewText, setReviewText] = useState("");
    const [reviewSubmitting, setReviewSubmitting] = useState(false);


    /* ========================================================= */
    /* FETCH ORDERS + WEBSOCKET */
    /* ========================================================= */

    useEffect(() => {
        fetchOrders();

        const ws = new WebSocket("ws://localhost:8002/ws");

        ws.onopen = () => {
            console.log("Order WebSocket connected");
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                console.log("WebSocket event:", data);

                if (data.type === "order_status_updated") {
                    setOrders((currentOrders) =>
                        currentOrders.map((order) =>
                            order.order_number === data.order_number
                                ? {
                                    ...order,
                                    status: data.status,
                                }
                                : order
                        )
                    );
                }
            } catch (error) {
                console.error(
                    "WebSocket message error:",
                    error
                );
            }
        };

        ws.onerror = (error) => {
            console.error(
                "Order WebSocket error:",
                error
            );
        };

        ws.onclose = () => {
            console.log(
                "Order WebSocket disconnected"
            );
        };

        return () => {
            ws.close();
        };
    }, []);


    /* ========================================================= */
    /* FETCH ORDERS */
    /* ========================================================= */

    async function fetchOrders() {
        try {
            setLoading(true);

            const response = await api.get(
                "/api/orders"
            );

            setOrders(response.data);
        } catch (error) {
            console.error(
                "Failed to load orders:",
                error
            );
        } finally {
            setLoading(false);
        }
    }


    /* ========================================================= */
    /* OPEN REVIEW SELECTOR */
    /* ========================================================= */

    function handleOpenReviewSelector(order) {
        if (!order || order.status !== "delivered") return;

        setReviewSelectorOrder(order);
        setReviewSelectorOpen(true);
    }

    /* ========================================================= */
    /* OPEN REVIEW */
    /* ========================================================= */

    function handleWriteReview(item, order) {
        setReviewSelectorOpen(false);
        setReviewSelectorOrder(null);

        setReviewProduct(item);
        setReviewOrder(order);
        setReviewProduct(item);
        setReviewOrder(order);

        // Already reviewed
        if (item.reviewed && item.review) {
            setReviewRating(
                item.review.rating || 0
            );

            setReviewText(
                item.review.review || ""
            );
        } else {
            // New review
            setReviewRating(0);
            setReviewText("");
        }

        setReviewDialogOpen(true);
    }


    /* ========================================================= */
    /* SUBMIT REVIEW */
    /* ========================================================= */

    async function handleSubmitReview() {
        if (
            !reviewProduct ||
            !reviewOrder ||
            reviewRating === 0
        ) {
            return;
        }

        try {
            setReviewSubmitting(true);

            let response;

            // ==========================================
            // EDIT EXISTING REVIEW
            // ==========================================

            if (
                reviewProduct.reviewed &&
                reviewProduct.review?.id
            ) {
                response = await api.put(
                    `/api/reviews/${reviewProduct.review.id}`,
                    {
                        product_id:
                            reviewProduct.product_id,

                        order_number:
                            reviewOrder.order_number,

                        rating: reviewRating,

                        review: reviewText.trim(),
                    }
                );
            }

            // ==========================================
            // CREATE NEW REVIEW
            // ==========================================

            else {
                response = await api.post(
                    "/api/reviews",
                    {
                        product_id:
                            reviewProduct.product_id,

                        order_number:
                            reviewOrder.order_number,

                        rating: reviewRating,

                        review: reviewText.trim(),
                    }
                );
            }

            const savedReview =
                response.data.review;

            // ==========================================
            // UPDATE UI IMMEDIATELY
            // ==========================================

            setOrders((currentOrders) =>
                currentOrders.map((order) =>
                    order.order_number ===
                        reviewOrder.order_number
                        ? {
                            ...order,

                            items: order.items.map(
                                (orderItem) =>
                                    orderItem.product_id ===
                                        reviewProduct.product_id
                                        ? {
                                            ...orderItem,

                                            reviewed: true,

                                            review: {
                                                id:
                                                    savedReview.id,

                                                rating:
                                                    savedReview.rating,

                                                review:
                                                    savedReview.review ||
                                                    "",
                                            },
                                        }
                                        : orderItem
                            ),
                        }
                        : order
                )
            );

            // ==========================================
            // SUCCESS MESSAGE
            // ==========================================

            alert(
                reviewProduct.reviewed
                    ? "Review updated successfully!"
                    : "Review submitted successfully!"
            );

            // ==========================================
            // CLOSE DIALOG
            // ==========================================

            setReviewDialogOpen(false);

            setReviewProduct(null);
            setReviewOrder(null);

            setReviewRating(0);
            setReviewText("");
        } catch (error) {
            console.error(
                "Failed to save review:",
                error
            );

            alert(
                error.response?.data?.detail ||
                "Failed to save review."
            );
        } finally {
            setReviewSubmitting(false);
        }
    }

    /* ========================================================= */
    /* FORMAT DATE */
    /* ========================================================= */

    function formatDate(dateString) {
        if (!dateString) return "-";

        return new Date(
            dateString
        ).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    }


    /* ========================================================= */
    /* FORMAT CURRENCY */
    /* ========================================================= */

    function formatCurrency(value) {
        return `₹${Number(
            value || 0
        ).toLocaleString("en-IN")}`;
    }

    function getGroupedItems(order) {
        const grouped = {};

        (order.items || []).forEach((item) => {
            const productId = item.product_id;

            if (!grouped[productId]) {
                grouped[productId] = {
                    product_id: item.product_id,
                    product_name: item.product_name,
                    items: [],
                    reviewed: item.reviewed || false,
                    review: item.review || null,
                };
            }

            grouped[productId].items.push({
                variant_id: item.variant_id,
                pack_size: item.pack_size,
                quantity: item.quantity,
            });

            // If any item already has a review,
            // use that review for the product.
            if (item.reviewed) {
                grouped[productId].reviewed = true;
                grouped[productId].review = item.review;
            }
        });

        return Object.values(grouped);
    }

    /* ========================================================= */
    /* UI */
    /* ========================================================= */

    return (
        <Box
            sx={{
                width: "100%",
                minHeight: "100vh",

                backgroundColor:
                    colors.creamDeep,

                py: {
                    xs: 3,
                    sm: 4,
                    md: 5,
                },

                "@keyframes orderSpin": {
                    from: {
                        transform: "rotate(0deg)",
                    },
                    to: {
                        transform: "rotate(360deg)",
                    },
                },
            }}
        >
            {/* ================================================= */}
            {/* CONTENT */}
            {/* ================================================= */}

            <Container
                maxWidth="xl"
                sx={{
                    width: "100%",
                    maxWidth: "1500px",
                    px: {
                        xs: 1.2,
                        sm: 2,
                        md: 2.5,
                    },
                }}
            >
                {/* ================================================= */}
                {/* HEADER */}
                {/* ================================================= */}

                <Box
                    sx={{
                        display: "flex",
                        justifyContent:
                            "space-between",
                        alignItems: {
                            xs: "flex-start",
                            sm: "center",
                        },

                        gap: 2,

                        mb: {
                            xs: 3,
                            md: 4,
                        },
                    }}
                >
                    <Box>
                        <Typography
                            sx={{
                                fontSize: "0.72rem",
                                fontWeight: 700,
                                letterSpacing:
                                    "0.14em",
                                textTransform:
                                    "uppercase",
                                color: colors.moss,
                                mb: 0.6,
                            }}
                        >
                            Your Account
                        </Typography>

                        <Typography
                            sx={{
                                fontFamily:
                                    fonts.display,

                                fontWeight: 600,

                                fontSize: {
                                    xs: "1.8rem",
                                    sm: "2rem",
                                    md: "2.35rem",
                                },

                                lineHeight: 1.15,

                                color:
                                    colors.forest,
                            }}
                        >
                            My Orders
                        </Typography>

                        <Typography
                            sx={{
                                fontSize: {
                                    xs: "0.82rem",
                                    md: "0.9rem",
                                },

                                color:
                                    colors.inkSoft,

                                mt: 0.7,
                            }}
                        >
                            View and track your
                            Jeeva Herbs orders.
                        </Typography>
                    </Box>


                    {/* REFRESH */}

                    <Tooltip title="Refresh orders">
                        <span>
                            <IconButton
                                onClick={
                                    fetchOrders
                                }
                                disabled={loading}
                                sx={{
                                    width: 44,
                                    height: 44,

                                    backgroundColor:
                                        colors.forest,

                                    color:
                                        colors.cream,

                                    borderRadius:
                                        "12px",

                                    "&:hover": {
                                        backgroundColor:
                                            "#0e261e",
                                    },

                                    "&:disabled": {
                                        backgroundColor:
                                            colors.forest,

                                        color:
                                            colors.cream,

                                        opacity: 0.6,
                                    },
                                }}
                            >
                                <RefreshCw
                                    size={18}
                                    style={{
                                        animation:
                                            loading
                                                ? "orderSpin 0.9s linear infinite"
                                                : "none",
                                    }}
                                />
                            </IconButton>
                        </span>
                    </Tooltip>
                </Box>


                {/* ================================================= */}
                {/* TOTAL ORDERS */}
                {/* ================================================= */}

                <Card
                    elevation={0}
                    sx={{
                        width: "100%",

                        border: `1px solid ${colors.line}`,

                        borderRadius:
                            RADIUS,

                        backgroundColor:
                            "#fff",

                        p: {
                            xs: 1.6,
                            sm: 1.8,
                            md: 2,
                        },

                        mb: 2,

                        display: "flex",

                        alignItems: "center",

                        gap: 1.5,
                    }}
                >
                    <Box
                        sx={{
                            width: 42,
                            height: 42,

                            borderRadius:
                                "11px",

                            display: "flex",

                            alignItems:
                                "center",

                            justifyContent:
                                "center",

                            backgroundColor:
                                colors.leafPale,

                            color:
                                colors.moss,

                            flexShrink: 0,
                        }}
                    >
                        <ClipboardList
                            size={20}
                        />
                    </Box>

                    <Box>
                        <Typography
                            sx={{
                                fontSize:
                                    "0.78rem",

                                color:
                                    colors.inkSoft,
                            }}
                        >
                            Total Orders
                        </Typography>

                        <Typography
                            sx={{
                                fontSize:
                                    "1.25rem",

                                fontWeight: 700,

                                color:
                                    colors.forest,

                                lineHeight: 1.2,

                                mt: 0.2,
                            }}
                        >
                            {loading
                                ? "..."
                                : orders.length}
                        </Typography>
                    </Box>
                </Card>


                {/* ================================================= */}
                {/* LOADING */}
                {/* ================================================= */}

                {loading ? (
                    <Box
                        sx={{
                            display: "grid",
                            gap: 2,
                        }}
                    >
                        {[1, 2, 3].map(
                            (item) => (
                                <Card
                                    key={item}
                                    elevation={0}
                                    sx={{
                                        border: `1px solid ${colors.line}`,
                                        borderRadius:
                                            RADIUS,

                                        backgroundColor:
                                            "#fff",

                                        p: 2.5,
                                    }}
                                >
                                    <Skeleton
                                        variant="text"
                                        width="20%"
                                    />

                                    <Skeleton
                                        variant="text"
                                        width="45%"
                                    />

                                    <Skeleton
                                        variant="text"
                                        width="30%"
                                    />
                                </Card>
                            )
                        )}
                    </Box>
                ) : orders.length === 0 ? (

                    /* ================================================= */
                    /* EMPTY STATE */
                    /* ================================================= */

                    <Card
                        elevation={0}
                        sx={{
                            border: `1px solid ${colors.line}`,

                            borderRadius:
                                RADIUS,

                            backgroundColor:
                                "#fff",

                            p: {
                                xs: 4,
                                md: 6,
                            },

                            textAlign:
                                "center",
                        }}
                    >
                        <Package
                            size={44}
                            color={
                                colors.moss
                            }
                        />

                        <Typography
                            sx={{
                                fontFamily:
                                    fonts.display,

                                fontSize:
                                    "1.3rem",

                                fontWeight: 600,

                                color:
                                    colors.forest,

                                mt: 2,
                            }}
                        >
                            No orders yet
                        </Typography>

                        <Typography
                            sx={{
                                color:
                                    colors.inkSoft,

                                mt: 0.5,

                                mb: 2,
                            }}
                        >
                            Your orders will
                            appear here.
                        </Typography>

                        <Button
                            component={Link}
                            to="/products"
                            variant="contained"
                            sx={{
                                backgroundColor:
                                    colors.forest,

                                borderRadius:
                                    "10px",

                                textTransform:
                                    "none",

                                fontWeight: 600,

                                px: 3,

                                "&:hover": {
                                    backgroundColor:
                                        "#0e261e",
                                },
                            }}
                        >
                            Shop Products
                        </Button>
                    </Card>

                ) : (

                    /* ================================================= */
                    /* ORDER LIST */
                    /* ================================================= */

                    <Box
                        sx={{
                            display: "grid",
                            gap: 1.4,
                        }}
                    >
                        {orders.map((order) => {
                            const groupedItems = getGroupedItems(order);

                            // Review summary for the compact order row.
                            // Reviews are product-level, so different pack sizes of the
                            // same product still count as one review.
                            const reviewedItems = groupedItems.filter(
                                (item) => item.reviewed && item.review
                            );

                            const unreviewedItems = groupedItems.filter(
                                (item) => !item.reviewed
                            );

                            const averageReviewedRating =
                                reviewedItems.length > 0
                                    ? reviewedItems.reduce(
                                          (sum, item) =>
                                              sum + Number(item.review?.rating || 0),
                                          0
                                      ) / reviewedItems.length
                                    : 0;

                            return (
                                <Card
                                    key={order.order_number}
                                    elevation={0}
                                    sx={{
                                        border: `1px solid ${colors.line}`,
                                        borderRadius: "14px",
                                        backgroundColor: "#fff",
                                        overflow: "hidden",
                                        transition:
                                            "transform 0.18s ease, box-shadow 0.18s ease",
                                        "&:hover": {
                                            transform:
                                                "translateY(-1px)",
                                            boxShadow:
                                                "0 7px 20px rgba(20,52,42,0.07)",
                                        },
                                    }}
                                >
                                    <Box
                                        sx={{
                                            px: {
                                                xs: 1.4,
                                                sm: 1.8,
                                                md: 2.2,
                                            },
                                            py: {
                                                xs: 1.4,
                                                sm: 1.55,
                                            },
                                            display: "grid",
                                            gridTemplateColumns: {
                                                xs: "1fr",
                                                sm: "1.05fr 2.05fr 0.65fr 0.8fr auto auto",
                                            },
                                            alignItems: "center",
                                            columnGap: {
                                                xs: 1.5,
                                                sm: 1.8,
                                                md: 2.2,
                                            },
                                            rowGap: 1.2,
                                        }}
                                    >
                                        {/* ORDER ID */}
                                        <Box
                                            sx={{
                                                minWidth: 0,
                                            }}
                                        >
                                            <Typography
                                                sx={{
                                                    fontSize: "0.64rem",
                                                    fontWeight: 700,
                                                    letterSpacing: "0.11em",
                                                    color: colors.inkSoft,
                                                    mb: 0.25,
                                                }}
                                            >
                                                ORDER ID
                                            </Typography>

                                            <Typography
                                                sx={{
                                                    fontWeight: 800,
                                                    fontSize: {
                                                        xs: "0.88rem",
                                                        sm: "0.92rem",
                                                    },
                                                    color: colors.forest,
                                                    whiteSpace: "nowrap",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                }}
                                                title={`#${order.order_number}`}
                                            >
                                                #{order.order_number}
                                            </Typography>

                                            <Typography
                                                sx={{
                                                    fontSize: "0.69rem",
                                                    color: colors.inkSoft,
                                                    mt: 0.15,
                                                }}
                                            >
                                                {formatDate(
                                                    order.created_at
                                                )}
                                            </Typography>
                                        </Box>

                                        {/* PRODUCT */}
                                        <Box
                                            sx={{
                                                minWidth: 0,
                                            }}
                                        >
                                            <Typography
                                                sx={{
                                                    fontSize: "0.64rem",
                                                    fontWeight: 700,
                                                    letterSpacing: "0.11em",
                                                    color: colors.inkSoft,
                                                    mb: 0.25,
                                                }}
                                            >
                                                PRODUCT
                                            </Typography>

                                            <Typography
                                                sx={{
                                                    fontWeight: 700,
                                                    fontSize: {
                                                        xs: "0.78rem",
                                                        sm: "0.84rem",
                                                    },
                                                    color: colors.forest,
                                                    lineHeight: 1.35,
                                                    whiteSpace: "normal",
                                                    overflow: "visible",
                                                    wordBreak: "normal",
                                                }}
                                            >
                                                {groupedItems.length > 0
                                                    ? groupedItems
                                                          .map(
                                                              (item) =>
                                                                  item.product_name
                                                          )
                                                          .join(" • ")
                                                    : "-"}
                                            </Typography>

                                            <Typography
                                                sx={{
                                                    fontSize: "0.68rem",
                                                    color: colors.inkSoft,
                                                    mt: 0.15,
                                                }}
                                            >
                                                {groupedItems.length}{" "}
                                                {groupedItems.length === 1
                                                    ? "product"
                                                    : "products"}
                                            </Typography>
                                        </Box>

                                        {/* TOTAL */}
                                        <Box
                                            sx={{
                                                minWidth: 0,
                                            }}
                                        >
                                            <Typography
                                                sx={{
                                                    fontSize: "0.64rem",
                                                    fontWeight: 700,
                                                    letterSpacing: "0.11em",
                                                    color: colors.inkSoft,
                                                    mb: 0.25,
                                                }}
                                            >
                                                TOTAL
                                            </Typography>

                                            <Typography
                                                sx={{
                                                    fontWeight: 800,
                                                    fontSize: {
                                                        xs: "0.95rem",
                                                        sm: "1rem",
                                                    },
                                                    color: colors.forest,
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {formatCurrency(order.total)}
                                            </Typography>
                                        </Box>

                                        {/* STATUS */}
                                        <Box>
                                            <Typography
                                                sx={{
                                                    fontSize: "0.64rem",
                                                    fontWeight: 700,
                                                    letterSpacing: "0.11em",
                                                    color: colors.inkSoft,
                                                    mb: 0.25,
                                                }}
                                            >
                                                STATUS
                                            </Typography>

                                            <StatusChip
                                                status={order.status}
                                            />
                                        </Box>

                                        {/* VIEW ORDER */}
                                        <Button
                                            component={Link}
                                            to={`/orders/${order.order_number}`}
                                            variant="outlined"
                                            size="small"
                                            startIcon={<Eye size={14} />}
                                            sx={{
                                                borderColor: colors.line,
                                                color: colors.forest,
                                                borderRadius: "8px",
                                                textTransform: "none",
                                                fontWeight: 700,
                                                minHeight: 32,
                                                px: 1.2,
                                                whiteSpace: "nowrap",
                                                "&:hover": {
                                                    borderColor: colors.moss,
                                                    backgroundColor:
                                                        colors.leafPale,
                                                },
                                            }}
                                        >
                                            View Order
                                        </Button>

                                        {/* REVIEW */}
                                        {order.status === "delivered" ? (
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "flex-end",
                                                    gap: 0.6,
                                                    minWidth: 0,
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {reviewedItems.length > 0 && (
                                                    <Rating
                                                        value={averageReviewedRating}
                                                        precision={0.1}
                                                        readOnly
                                                        size="small"
                                                        sx={{
                                                            fontSize: "0.95rem",
                                                        }}
                                                    />
                                                )}

                                                {reviewedItems.length > 0 && (
                                                    <Typography
                                                        component="span"
                                                        sx={{
                                                            fontSize: "0.68rem",
                                                            fontWeight: 700,
                                                            color: colors.inkSoft,
                                                        }}
                                                    >
                                                        {reviewedItems.length}/
                                                        {groupedItems.length}
                                                    </Typography>
                                                )}

                                                <Button
                                                    variant="text"
                                                    size="small"
                                                    // startIcon={
                                                    //     <Star size={14} />
                                                    // }
                                                    onClick={() =>
                                                        handleOpenReviewSelector(
                                                            order
                                                        )
                                                    }
                                                    sx={{
                                                        minWidth: "auto",
                                                        px: 0.5,
                                                        color: colors.moss,
                                                        textTransform: "none",
                                                        fontWeight: 700,
                                                        fontSize: "0.76rem",
                                                        whiteSpace: "nowrap",
                                                    }}
                                                >
                                                    {unreviewedItems.length === 0
                                                        ? "Edit"
                                                        : reviewedItems.length > 0
                                                        ? "Review"
                                                        : "Review"}
                                                </Button>
                                            </Box>
                                        ) : (
                                            <Box sx={{ minWidth: 62 }} />
                                        )}
                                    </Box>
                                </Card>
                            );
                        })}
                    </Box>
                )}


                {/* ================================================= */}
                {/* REVIEW PRODUCT SELECTOR */}
                {/* ================================================= */}

                <Dialog
                    open={reviewSelectorOpen}
                    onClose={() => {
                        if (!reviewSubmitting) {
                            setReviewSelectorOpen(false);
                            setReviewSelectorOrder(null);
                        }
                    }}
                    fullWidth
                    maxWidth="sm"
                    PaperProps={{
                        sx: {
                            borderRadius: "18px",
                            overflow: "hidden",
                        },
                    }}
                >
                    <DialogTitle
                        sx={{
                            fontFamily: fonts.display,
                            fontWeight: 600,
                            color: colors.forest,
                            pb: 0.5,
                        }}
                    >
                        Review Your Products
                    </DialogTitle>

                    <DialogContent sx={{ pt: "12px !important" }}>
                        <Typography
                            sx={{
                                fontSize: "0.82rem",
                                color: colors.inkSoft,
                                mb: 1.8,
                            }}
                        >
                            Select the product you want to review.
                        </Typography>

                        <Stack spacing={0.9}>
                            {reviewSelectorOrder &&
                                getGroupedItems(reviewSelectorOrder).map(
                                    (item) => (
                                        <Box
                                            key={item.product_id}
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent:
                                                    "space-between",
                                                gap: 1.5,
                                                p: 1.25,
                                                borderRadius: "11px",
                                                border:
                                                    "1px solid rgba(20,52,42,0.08)",
                                                backgroundColor: "#faf9f5",
                                            }}
                                        >
                                            <Box sx={{ minWidth: 0 }}>
                                                <Typography
                                                    sx={{
                                                        fontWeight: 700,
                                                        color: colors.forest,
                                                        fontSize: "0.9rem",
                                                    }}
                                                >
                                                    {item.product_name}
                                                </Typography>

                                                <Typography
                                                    sx={{
                                                        fontSize: "0.72rem",
                                                        color: colors.inkSoft,
                                                        mt: 0.2,
                                                    }}
                                                >
                                                    {item.items
                                                        .map(
                                                            (variant) =>
                                                                `${variant.pack_size || "-"} × ${variant.quantity}`
                                                        )
                                                        .join(" • ")}
                                                </Typography>
                                            </Box>

                                            <Button
                                                variant="text"
                                                size="small"
                                                onClick={() =>
                                                    handleWriteReview(
                                                        item,
                                                        reviewSelectorOrder
                                                    )
                                                }
                                                sx={{
                                                    flexShrink: 0,
                                                    minWidth: "auto",
                                                    px: 0.6,
                                                    color: colors.moss,
                                                    textTransform: "none",
                                                    fontWeight: 700,
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {item.reviewed ? (
                                                    <Stack
                                                        direction="row"
                                                        alignItems="center"
                                                        spacing={0.5}
                                                    >
                                                        <Rating
                                                            value={
                                                                item.review
                                                                    ?.rating ||
                                                                0
                                                            }
                                                            readOnly
                                                            size="small"
                                                            sx={{
                                                                fontSize:
                                                                    "0.95rem",
                                                            }}
                                                        />
                                                        <span>Edit</span>
                                                    </Stack>
                                                ) : (
                                                    <>
                                                        <Star
                                                            size={13}
                                                            style={{
                                                                marginRight: 5,
                                                            }}
                                                        />
                                                        Review
                                                    </>
                                                )}
                                            </Button>
                                        </Box>
                                    )
                                )}
                        </Stack>
                    </DialogContent>

                    <DialogActions
                        sx={{
                            px: 2.5,
                            pb: 2.2,
                        }}
                    >
                        <Button
                            onClick={() => {
                                setReviewSelectorOpen(false);
                                setReviewSelectorOrder(null);
                            }}
                            sx={{
                                color: colors.inkSoft,
                                textTransform: "none",
                                fontWeight: 600,
                            }}
                        >
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog
                    open={
                        reviewDialogOpen
                    }
                    onClose={() => {
                        if (
                            !reviewSubmitting
                        ) {
                            setReviewDialogOpen(
                                false
                            );
                        }
                    }}
                    fullWidth
                    maxWidth="sm"
                    PaperProps={{
                        sx: {
                            borderRadius:
                                "18px",

                            overflow:
                                "hidden",
                        },
                    }}
                >
                    <DialogTitle
                        sx={{
                            fontFamily: fonts.display,
                            fontWeight: 600,
                            color: colors.forest,
                            pb: 1,
                        }}
                    >
                        {reviewProduct?.reviewed
                            ? "Edit Your Review"
                            : "Write a Review"}
                    </DialogTitle>


                    <DialogContent>

                        {/* PRODUCT */}

                        <Box
                            sx={{
                                p: 2,

                                mb: 2.5,

                                borderRadius:
                                    "12px",

                                backgroundColor:
                                    colors.leafPale,
                            }}
                        >
                            <Typography
                                sx={{
                                    fontSize:
                                        "0.7rem",

                                    fontWeight:
                                        700,

                                    letterSpacing:
                                        "0.08em",

                                    color:
                                        colors.inkSoft,

                                    mb: 0.4,
                                }}
                            >
                                PRODUCT
                            </Typography>

                            <Typography
                                sx={{
                                    fontWeight:
                                        700,

                                    color:
                                        colors.forest,
                                }}
                            >
                                {
                                    reviewProduct?.product_name
                                }
                            </Typography>

                            {reviewProduct?.pack_size && (
                                <Typography
                                    sx={{
                                        fontSize:
                                            "0.77rem",

                                        color:
                                            colors.inkSoft,

                                        mt: 0.3,
                                    }}
                                >
                                    Pack Size:{" "}
                                    {
                                        reviewProduct.pack_size
                                    }
                                </Typography>
                            )}
                        </Box>


                        {/* RATING */}

                        <Typography
                            sx={{
                                fontSize:
                                    "0.85rem",

                                fontWeight:
                                    600,

                                color:
                                    colors.forest,

                                mb: 1,
                            }}
                        >
                            Your Rating
                        </Typography>

                        <Rating
                            value={
                                reviewRating
                            }
                            onChange={(
                                event,
                                newValue
                            ) => {
                                setReviewRating(
                                    newValue ||
                                    0
                                );
                            }}
                            size="large"
                        />


                        {/* REVIEW */}

                        <TextField
                            fullWidth
                            multiline
                            minRows={4}
                            label="Your Review"
                            placeholder="Share your experience with this product..."
                            value={
                                reviewText
                            }
                            onChange={(
                                event
                            ) => {
                                setReviewText(
                                    event
                                        .target
                                        .value
                                );
                            }}
                            sx={{
                                mt: 3,
                            }}
                        />
                    </DialogContent>


                    {/* ACTIONS */}

                    <DialogActions
                        sx={{
                            px: 3,
                            pb: 3,
                            gap: 1,
                        }}
                    >
                        <Button
                            onClick={() =>
                                setReviewDialogOpen(
                                    false
                                )
                            }
                            disabled={
                                reviewSubmitting
                            }
                            sx={{
                                color:
                                    colors.inkSoft,

                                textTransform:
                                    "none",

                                fontWeight:
                                    600,
                            }}
                        >
                            Cancel
                        </Button>


                        <Button
                            variant="contained"
                            onClick={
                                handleSubmitReview
                            }
                            disabled={
                                reviewRating ===
                                0 ||
                                reviewSubmitting
                            }
                            sx={{
                                backgroundColor:
                                    colors.forest,

                                borderRadius:
                                    "10px",

                                textTransform:
                                    "none",

                                fontWeight:
                                    700,

                                px: 2.5,

                                "&:hover": {
                                    backgroundColor:
                                        "#0e261e",
                                },
                            }}
                        >
                            {reviewSubmitting
                                ? "Saving..."
                                : reviewProduct?.reviewed
                                    ? "Update Review"
                                    : "Submit Review"}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
}


export default Orders;