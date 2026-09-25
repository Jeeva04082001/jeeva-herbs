import {
    Drawer,
    Box,
    Typography,
    IconButton,
    Divider,
    Button,
} from "@mui/material";

import { X, Minus, Plus } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

function CartDrawer({ open, onClose }) {

    const navigate = useNavigate();
    const {
        cartItems,
        updateQuantity,
        removeFromCart,
    } = useCart();

    const subtotal = cartItems.reduce(
        (total, item) => total + Number(item.price) * item.quantity,
        0
    );

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: {
                        xs: "100%",
                        sm: 420,
                    },
                    backgroundColor: "#f7f1e3",
                },
            }}
        >
            <Box
                sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                {/* Header */}
                <Box
                    sx={{
                        px: 3,
                        py: 2.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: "1.4rem",
                            fontWeight: 700,
                            color: "#14342a",
                        }}
                    >
                        Your Cart
                    </Typography>

                    <IconButton onClick={onClose}>
                        <X size={22} />
                    </IconButton>
                </Box>

                <Divider />

                {/* Cart Items */}
                <Box
                    sx={{
                        flex: 1,
                        overflowY: "auto",
                        px: 3,
                        py: 2,
                    }}
                >
                    {cartItems.length === 0 ? (
                        <Typography
                            sx={{
                                textAlign: "center",
                                color: "#5c554a",
                                mt: 8,
                            }}
                        >
                            Your cart is empty
                        </Typography>
                    ) : (
                        cartItems.map((item) => (
                            <Box
                                key={item.cartKey}
                                sx={{
                                    py: 2,
                                    borderBottom: "1px solid rgba(20,52,42,0.1)",
                                }}
                            >
                                {/* Product name */}
                                <Typography
                                    sx={{
                                        fontWeight: 600,
                                        color: "#14342a",
                                    }}
                                >
                                    {item.name}
                                </Typography>

                                {/* Pack Size */}
                                <Typography
                                    sx={{
                                        fontSize: "0.8rem",
                                        color: "#3f6b4a",
                                        fontWeight: 600,
                                        mt: 0.5,
                                    }}
                                >
                                    Pack Size: {item.unit}
                                </Typography>

                                {/* Price */}
                                <Typography
                                    sx={{
                                        fontSize: "0.9rem",
                                        color: "#5c554a",
                                        mt: 0.5,
                                    }}
                                >
                                    ₹{Number(item.price).toFixed(2)}
                                </Typography>

                                {/* Quantity + Remove */}
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        mt: 1.5,
                                    }}
                                >
                                    {/* Quantity */}
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            border: "1px solid rgba(20,52,42,0.25)",
                                            borderRadius: "8px",
                                            overflow: "hidden",
                                        }}
                                    >
                                        <IconButton
                                            size="small"
                                            onClick={() =>
                                                updateQuantity(
                                                    item.cartKey,
                                                    item.quantity - 1
                                                )
                                            }
                                            sx={{
                                                color: "#14342a",
                                                borderRadius: 0,
                                            }}
                                        >
                                            <Minus size={15} />
                                        </IconButton>

                                        <Typography
                                            sx={{
                                                px: 1.2,
                                                fontSize: "0.9rem",
                                                fontWeight: 600,
                                                minWidth: 25,
                                                textAlign: "center",
                                            }}
                                        >
                                            {item.quantity}
                                        </Typography>

                                        <IconButton
                                            size="small"
                                            disabled={item.quantity >= item.stock}
                                            onClick={() =>
                                                updateQuantity(
                                                    item.cartKey,
                                                    item.quantity + 1
                                                )
                                            }
                                            sx={{
                                                color: "#14342a",
                                                borderRadius: 0,
                                            }}
                                        >
                                            <Plus size={15} />
                                        </IconButton>
                                    </Box>

                                    {/* Item total */}
                                    <Typography
                                        sx={{
                                            fontWeight: 700,
                                            color: "#14342a",
                                        }}
                                    >
                                        ₹
                                        {(
                                            Number(item.price) * item.quantity
                                        ).toFixed(2)}
                                    </Typography>

                                    {/* Remove */}
                                    <Button
                                        onClick={() =>
                                            removeFromCart(item.cartKey)
                                        }
                                        sx={{
                                            color: "#b23b3b",
                                            fontSize: "0.7rem",
                                            minWidth: "auto",
                                            px: 0,
                                        }}
                                    >
                                        Remove
                                    </Button>
                                </Box>
                            </Box>
                        ))
                    )}
                </Box>

                {/* Bottom */}
                {cartItems.length > 0 && (
                    <Box
                        sx={{
                            borderTop: "1px solid rgba(20,52,42,0.12)",
                            p: 3,
                            backgroundColor: "#fff",
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                mb: 2,
                            }}
                        >
                            <Typography>Subtotal</Typography>

                            <Typography
                                sx={{
                                    fontWeight: 700,
                                    color: "#14342a",
                                }}
                            >
                                ₹{subtotal.toFixed(2)}
                            </Typography>
                        </Box>

                        <Button
                            fullWidth
                            variant="contained"
                            onClick={() => {
                                onClose();
                                navigate("/cart");
                            }}
                            sx={{
                                backgroundColor: "#14342a",
                                py: 1.4,
                                mb: 1,
                                "&:hover": {
                                    backgroundColor: "#0e261e",
                                },
                            }}
                        >
                            VIEW CART
                        </Button>

                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => {
                                onClose();
                                navigate("/checkout");
                            }}
                            sx={{
                                borderColor: "#14342a",
                                color: "#14342a",
                                py: 1.4,
                                "&:hover": {
                                    borderColor: "#14342a",
                                    backgroundColor: "rgba(20,52,42,0.04)",
                                },
                            }}
                        >
                            CHECKOUT
                        </Button>
                    </Box>
                )}
            </Box>
        </Drawer>
    );
}

export default CartDrawer;