import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import AppNavbar from "@/components/AppNavbar";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import ModuleDetail from "@/pages/ModuleDetail";
import LessonDetail from "@/pages/LessonDetail";
import Quiz from "@/pages/Quiz";
import Admin from "@/pages/Admin";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminModules from "@/pages/admin/AdminModules";
import AdminAnalytics from "@/pages/admin/AdminAnalytics";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const ProtectedLayout = ({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) => (
  <ProtectedRoute adminOnly={adminOnly}>
    <div className="pb-16">{children}</div>
    <AppNavbar />
  </ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/home" element={<ProtectedLayout><Home /></ProtectedLayout>} />
            <Route path="/dashboard" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
            <Route path="/profile" element={<ProtectedLayout><Profile /></ProtectedLayout>} />
            <Route path="/modules/:moduleId" element={<ProtectedLayout><ModuleDetail /></ProtectedLayout>} />
            <Route path="/modules/:moduleId/lessons/:lessonId" element={<ProtectedLayout><LessonDetail /></ProtectedLayout>} />
            <Route path="/quiz/:moduleId" element={<ProtectedLayout><Quiz /></ProtectedLayout>} />
            <Route path="/admin" element={<ProtectedLayout adminOnly><Admin /></ProtectedLayout>}>
              <Route index element={<Navigate to="/admin/users" replace />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="modules" element={<AdminModules />} />
              <Route path="analytics" element={<AdminAnalytics />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
