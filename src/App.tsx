import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import AppNavbar from "@/components/AppNavbar";
import AdminLayout from "@/components/AdminLayout";
import HelpButton from "@/components/HelpButton";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import ModuleDetail from "@/pages/ModuleDetail";
import LessonDetail from "@/pages/LessonDetail";
import Quiz from "@/pages/Quiz";
import Leaderboard from "@/pages/Leaderboard";
import AdminOverview from "@/pages/admin/AdminOverview";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminModules from "@/pages/admin/AdminModules";
import AdminAnalytics from "@/pages/admin/AdminAnalytics";
import NotFound from "@/pages/NotFound";
import { AnimatePresence } from "framer-motion";

const queryClient = new QueryClient();

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <div className="pb-20">{children}</div>
    <AppNavbar />
    <HelpButton />
  </ProtectedRoute>
);

const AdminRoute = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute adminOnly>
    <AdminLayout>{children}</AdminLayout>
  </ProtectedRoute>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<ProtectedLayout><Home /></ProtectedLayout>} />
        <Route path="/dashboard" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
        <Route path="/profile" element={<ProtectedLayout><Profile /></ProtectedLayout>} />
        <Route path="/leaderboard" element={<ProtectedLayout><Leaderboard /></ProtectedLayout>} />
        <Route path="/modules/:moduleId" element={<ProtectedLayout><ModuleDetail /></ProtectedLayout>} />
        <Route path="/modules/:moduleId/lessons/:lessonId" element={<ProtectedLayout><LessonDetail /></ProtectedLayout>} />
        <Route path="/quiz/:moduleId" element={<ProtectedLayout><Quiz /></ProtectedLayout>} />
        <Route path="/admin" element={<AdminRoute><AdminOverview /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
        <Route path="/admin/modules" element={<AdminRoute><AdminModules /></AdminRoute>} />
        <Route path="/admin/analytics" element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AnimatedRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
