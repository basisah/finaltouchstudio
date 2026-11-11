import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import ProtectedRoute from "./components/ProtectedRoute";
import SessionTimeoutHandler from "./components/SessionTimeoutHandler";
import ScrollToTop from "./components/layout/ScrollToTop";
import { PageLoader } from "./components/ui";

// Each page is its own chunk, so visitors only download the code they open.
const LandingPage = lazy(() => import("./pages/LandingPage/LandingPage"));
const ItemsPage = lazy(() => import("./pages/ItemsPage/ItemsPage"));
const ItemDetailPage = lazy(() => import("./pages/ItemDetailPage/ItemDetailPage"));
const PackageDetailPage = lazy(() => import("./pages/PackageDetailPage/PackageDetailPage"));
const CartPage = lazy(() => import("./pages/CartPage/CartPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage/CheckoutPage"));
const BuildPage = lazy(() => import("./pages/BuildPage/BuildPage"));
const AboutPage = lazy(() => import("./pages/AboutPage/AboutPage"));
const CustomerLoginPage = lazy(() => import("./pages/CustomerLoginPage/CustomerLoginPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage/ProfilePage"));
const AdminLoginPage = lazy(() => import("./pages/AdminPage/LoginPage"));
const AdminPage = lazy(() => import("./pages/AdminPage/AdminPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage/NotFoundPage"));

export default function App() {
  return (
    <CartProvider>
      <Router>
        <ScrollToTop />
        <SessionTimeoutHandler />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/items" element={<ItemsPage />} />
            <Route path="/item/:id" element={<ItemDetailPage />} />
            <Route path="/package/:id" element={<PackageDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/build" element={<BuildPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/login" element={<CustomerLoginPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/khaledadmin" element={<AdminLoginPage />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </Router>
    </CartProvider>
  );
}
