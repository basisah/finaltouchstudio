import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AboutPage from "./pages/AboutPage/AboutPage";
import AdminPage from "./pages/AdminPage/AdminPage";
import LoginPage from "./pages/AdminPage/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { CartProvider } from "./context/CartContext";
import ItemsPage from "./pages/ItemsPage/ItemsPage";
import ItemDetailPage from "./pages/ItemDetailPage/ItemDetailPage";
import PackageDetail from "./pages/PackageDetail/PackageDetail";
import CheckoutPage from "./pages/CheckoutPage/CheckoutPage";
import CartPage from "./pages/CartPage/CartPage";
import CustomerLoginPage from "./pages/CustomerLoginPage/CustomerLoginPage";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import BuildPage from "./pages/BuildPage/BuildPage";
import SessionTimeoutHandler from "./components/SessionTimeoutHandler";


export default function App() {
  return (
    <CartProvider>
      <Router>
        <SessionTimeoutHandler />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/items" element={<ItemsPage />} />
          <Route path="/item/:id" element={<ItemDetailPage />} />
          <Route path="/package/:id" element={<PackageDetail />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<CustomerLoginPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/build" element={<BuildPage />} />
          <Route path="/khaledadmin" element={<LoginPage />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </CartProvider>
  );
}
