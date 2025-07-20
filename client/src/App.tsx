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

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
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
        </>
      )}
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
