
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TrainingManagement from "./pages/TrainingManagement";
import ComplianceTracker from "./pages/ComplianceTracker";
import OfficerDashboard from "./pages/OfficerDashboard";
import AvailableTrainings from "./pages/AvailableTrainings";
import Attendance from "./pages/Attendance";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/training-management" element={<TrainingManagement />} />
          <Route path="/compliance-tracker" element={<ComplianceTracker />} />
          <Route path="/officer-dashboard" element={<OfficerDashboard />} />
          <Route path="/available-trainings" element={<AvailableTrainings />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
