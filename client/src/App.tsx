import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Homepage from "@/pages/Homepage";
import ProductListing from "@/pages/ProductListing";
import Cart from "@/pages/Cart";
import Account from "@/pages/Account";
import AIUpload from "@/pages/AIUpload";
import Landing from "@/pages/Landing";
import Wishlist from "@/pages/Wishlist";
import Contact from "@/pages/Contact";
import Blog from "@/pages/Blog";
import BlogDetail from "@/pages/BlogDetail";
import Error404 from "@/pages/Error404";
import MailSuccess from "@/pages/MailSuccess";
import SignIn from "@/pages/Auth/SignIn";
import SignUp from "@/pages/Auth/SignUp";
import AdminDashboard from "@/pages/Admin/Dashboard";
import AdminOrders from "@/pages/Admin/Orders";
import AdminProducts from "@/pages/Admin/Products";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {/* Public routes available to all users */}
      <Route path="/auth/signin" component={SignIn} />
      <Route path="/auth/signup" component={SignUp} />
      <Route path="/contact" component={Contact} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:id" component={BlogDetail} />
      <Route path="/mail-success" component={MailSuccess} />
      <Route path="/404" component={Error404} />
      
      {/* Main application routes */}
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/products" component={ProductListing} />
        </>
      ) : (
        <>
          <Route path="/" component={Homepage} />
          <Route path="/products" component={ProductListing} />
          <Route path="/cart" component={Cart} />
          <Route path="/account" component={Account} />
          <Route path="/upload" component={AIUpload} />
          <Route path="/wishlist" component={Wishlist} />
          
          {/* Admin routes (should include role checking in real app) */}
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/admin/dashboard" component={AdminDashboard} />
          <Route path="/admin/orders" component={AdminOrders} />
          <Route path="/admin/products" component={AdminProducts} />
        </>
      )}
      
      {/* 404 catch-all route */}
      <Route component={Error404} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
