import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ThemeProvider } from "@/contexts/ThemeProvider";
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
          <Route path="/auth" element={<Auth />} />
          <Route path="/c/:slug" element={<PaymentLinkRedirect />} />
          <Route path="/pay/:slug" element={<PublicCheckout />} />
          <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/produtos" element={<ProtectedRoute><Produtos /></ProtectedRoute>} />
          <Route path="/produtos/editar" element={<ProtectedRoute><ProductEdit /></ProtectedRoute>} />
          <Route path="/produtos/checkout/personalizar" element={<ProtectedRoute><CheckoutCustomizer /></ProtectedRoute>} />
          <Route path="/afiliados" element={<ProtectedRoute><Afiliados /></ProtectedRoute>} />
          <Route path="/financeiro" element={<ProtectedRoute><EmBreve titulo="Financeiro" /></ProtectedRoute>} />
          <Route path="/integracoes" element={<ProtectedRoute><Integracoes /></ProtectedRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </TooltipProvider>
      </BrowserRouter>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
