import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { AuthProvider } from "./context/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Address from "./pages/Address";

import AddProduct from "./pages/admin/AddProduct";
import EditProduct from "./pages/admin/EditProduct";
import AdminDashboard from "./pages/admin/AdminDashboard";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

import { CartProvider } from "./context/CartContext";
import Orders from "./pages/admin/Orders";
import CustomerOrders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";

import Account from "./pages/Account";
import OrderSuccess from "./pages/OrderSuccess";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminCustomerDetails from "./pages/admin/AdminCustomerDetails";
import AISupportChat from "./components/AISupportChat";
import MasterDataPage from "./pages/admin/MasterDataPage";
import CustomerTypesPage from "./pages/admin/CustomerTypesPage";
import SupermarketsPage from "./pages/admin/SupermarketsPage";
import CustomersPage from "./pages/admin/CustomersPage";
import CustomerPurchasesPage from "./pages/admin/CustomerPurchasesPage";
import MySupportTickets from "./pages/MySupportTickets";
import AdminSupportTickets from "./pages/admin/AdminSupportTickets";
import CustomerPurchaseHistoryPage from "./pages/admin/CustomerPurchaseHistoryPage";
import CourierServicesPage from "./pages/admin/CourierServicesPage";



function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>

          <Toaster
            position="top-right"
            toastOptions={{ duration: 3000 }}
          />

          <Routes>

            {/* Public */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:slug" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />

            {/* Customer Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/account" element={<Account />} />
              <Route path="/account/addresses" element={<Address />} />
              <Route path="/orders" element={<CustomerOrders />} />
              <Route path="/orders/:order_number" element={<OrderDetails />} />
              <Route path="/order-success/:order_number" element={<OrderSuccess />} />
              <Route path="/my-support-tickets" element={<MySupportTickets />} />

            </Route>

            {/* Admin Protected Routes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/orders" element={<Orders />} />
              <Route path="/products/add" element={<AddProduct />} />
              <Route path="/products/edit/:id" element={<EditProduct />} />
              <Route path="/admin/customers" element={<AdminCustomers />} />
              <Route path="/admin/customers/:customerId" element={<AdminCustomerDetails />} />
              <Route path="/admin/reviews" element={<AdminReviews />} />
              <Route path="/admin/master-data" element={<MasterDataPage />} />
              <Route path="/admin/master-data/customer-types" element={<CustomerTypesPage />} />
              <Route path="/admin/master-data/supermarkets" element={<SupermarketsPage />} />
              <Route path="/admin/master-data/customers" element={<CustomersPage />} />
              <Route path="/admin/master-data/purchases" element={<CustomerPurchasesPage />} />
              <Route path="/admin/support-tickets" element={<AdminSupportTickets />} />
              <Route path="/admin/master-data/purchase-history" element={<CustomerPurchaseHistoryPage />} />
              <Route path="/admin/master-data/courier-services" element={<CourierServicesPage />} />


            </Route>

            {/* Fallback */}
            <Route path="*" element={<Home />} />

          </Routes>
          {/* AI Customer Support - available across pages */}
          <AISupportChat />

        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;