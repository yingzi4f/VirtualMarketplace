import { Switch, Route } from "wouter";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import ProductListing from "@/pages/product-listing";
import ProductDetails from "@/pages/product-details";
import CartPage from "@/pages/cart";
import CheckoutPage from "@/pages/checkout";
import UserProfile from "@/pages/user-profile";
import VendorDashboard from "@/pages/vendor-dashboard";
import VendorRegister from "@/pages/vendor-register";
import AdminDashboard from "@/pages/admin-dashboard";
import NotFound from "@/pages/not-found";
import { ProtectedRoute } from "@/lib/protected-route";
import { UserRole } from "@shared/schema";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/category/:slug" component={ProductListing} />
      <Route path="/search" component={ProductListing} />
      <Route path="/listing/:id" component={ProductDetails} />
      <Route path="/cart" component={CartPage} />
      <ProtectedRoute path="/checkout" component={CheckoutPage} />
      <ProtectedRoute path="/profile" component={UserProfile} />
      <ProtectedRoute path="/vendor/register" component={VendorRegister} />
      <ProtectedRoute path="/vendor" component={VendorDashboard} requiredRole={UserRole.VENDOR} />
      <ProtectedRoute path="/admin" component={AdminDashboard} requiredRole={UserRole.ADMIN} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Router />
      </main>
      <Footer />
    </div>
  );
}

export default App;
