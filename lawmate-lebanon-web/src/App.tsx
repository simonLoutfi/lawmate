
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import ChatBot from "./components/ChatBot";
import Index from "./pages/Index";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Documents from "./pages/Documents";
import AskAI from "./pages/AskAI";
import ContractReview from "./pages/services/ContractReview";
import DocumentDrafting from "./pages/services/DocumentDrafting";
import GeneralGuide from "./pages/services/GeneralGuide";
import MokhtarNetwork from "./pages/MokhtarNetwork";
import Lawyers from "./pages/network/Lawyers";
import Mokhtars from "./pages/network/Mokhtars";
import NotFound from "./pages/NotFound";
import DocumentEditor from './pages/DocumentEditor';

const queryClient = new QueryClient();

// Type definitions
interface ProtectedRouteProps {
  children?: React.ReactNode;
  requiredRole?: string | null;
}

interface PublicRouteProps {
  children?: React.ReactNode;
}

// Protected Route Component
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole = null }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.userType !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children || <Outlet />;
};

// Public Route Component (only for non-authenticated users)
const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children || <Outlet />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen flex flex-col">
              <Navigation />
              <main className="flex-1">
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/features" element={<Features />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/about" element={<About />} />
                  
                  {/* Auth routes (only for non-authenticated users) */}
                  <Route element={<PublicRoute />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                  </Route>

                  {/* Protected routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/documents" element={<Documents />} />
                    <Route path="/ask" element={<AskAI />} />
                    <Route path="/services/document" element={<DocumentDrafting />} />
                    <Route path="/services/general-guide" element={<GeneralGuide />} />
                    <Route path="/services/guide/:documentId" element={<GeneralGuide />} />
                    <Route path="/mokhtar-network" element={<MokhtarNetwork />} />
                    <Route path="/network/lawyers" element={<Lawyers />} />
                    <Route path="/network/mokhtars" element={<Mokhtars />} />
                    <Route path="/documents/:id" element={<DocumentEditor />} />
                  </Route>

                  {/* 404 Route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <ChatBot />
              <Footer />
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
