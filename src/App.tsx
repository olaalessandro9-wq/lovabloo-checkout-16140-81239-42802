import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ThemeProvider } from "@/providers/theme";
import AppShell from "./layouts/AppShell";
import Index from "./pages/Index";
import Produtos from "./pages/Produtos";
import ProductEdit from "./pages/ProductEdit";
import Afiliados from "./pages/Afiliados";
import CheckoutCustomizer from "./pages/CheckoutCustomizer";
import Auth from "./pages/Auth";
import PublicCheckout from "./pages/PublicCheckout";
import PaymentLinkRedirect from "./pages/PaymentLinkRedirect";
import NotFound from "./pages/NotFound";
import EmBreve from "./pages/EmBreve";
import Integracoes from "./pages/Integracoes";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <BrowserRouter>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Public routes without sidebar */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/c/:slug" element={<PaymentLinkRedirect />} />
            <Route path="/pay/:slug" element={<PublicCheckout />} />
            <Route path="*" element={<NotFound />} />
            
            {/* Protected routes with AppShell (sidebar) */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AppShell />
                </ProtectedRoute>
              }
            >
              <Route index element={<Index />} />
              <Route path="produtos" element={<Produtos />} />
              <Route path="produtos/editar" element={<ProductEdit />} />
              <Route path="produtos/checkout/personalizar" element={<CheckoutCustomizer />} />
              <Route path="afiliados" element={<Afiliados />} />
              <Route path="financeiro" element={<EmBreve titulo="Financeiro" />} />
              <Route path="integracoes" element={<Integracoes />} />
            </Route>
          </Routes>
        </TooltipProvider>
      </BrowserRouter>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
