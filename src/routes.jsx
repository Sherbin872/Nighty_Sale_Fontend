// src/routes.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./utils/ProtectedRoute";
import AdminProtectedRoute from "./utils/adminProtectedRoute";

// Layouts
import MainLayout from "./components/layout/MainLayout.jsx";
import AuthLayout from "./components/layout/AuthLayout.jsx";
import AdminLayout from "./components/layout/AdminLayout.jsx";

// Public Pages
import Home from "./pages/Home/Home.jsx";
import Products from "./pages/Products/Products.jsx";
import ProductDetails from "./pages/ProductDetails/ProductDetails.jsx";
import Cart from "./pages/Cart/Cart.jsx";
import Login from "./pages/Login/Login.jsx";
import Register from "./pages/Register/Register.jsx";
import SearchPage from "./pages/Search/SearchPage.jsx";

// Protected Pages (Regular Users)
import Checkout from "./pages/Checkout/Checkout.jsx";
import OrderSuccess from "./pages/OrderSuccess/OrderSuccess.jsx";
import Orders from "./pages/Orders/Orders.jsx";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard.jsx";
import AdminProducts from "./pages/admin/Products.jsx";
import AdminOrders from "./pages/admin/Orders.jsx";
import AdminUsers from "./pages/admin/Users.jsx";
import AddEditProduct from "./pages/admin/AddEditProduct.jsx";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth pages (Login/Register) */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Admin routes */}
      <Route element={<AdminProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/products/add" element={<AddEditProduct />} />
          <Route path="/admin/products/edit/:id" element={<AddEditProduct />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/users" element={<AdminUsers />} />
        </Route>
      </Route>

      {/* Regular user routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/search" element={<SearchPage />} />

        {/* Protected routes for logged-in users */}
        <Route element={<ProtectedRoute />}>
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success/:id" element={<OrderSuccess />} />
          <Route path="/orders" element={<Orders />} />
        </Route>
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
