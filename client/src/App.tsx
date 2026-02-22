import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import NotFound from "@/pages/not-found";

import Dashboard from "@/pages/Dashboard";
import NewAssessment from "@/pages/NewAssessment";
import PredictionReport from "@/pages/PredictionReport";
import Reports from "@/pages/Reports";
import Patients from "@/pages/Patients";
import Login from "@/pages/Login";
import Register from "@/pages/Register";

function Router() {
  // Skip authentication for now - direct access to all routes
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/" component={Dashboard} />
      <Route path="/assess" component={NewAssessment} />
      <Route path="/reports" component={Reports} />
      <Route path="/predictions/:id" component={PredictionReport} />
      <Route path="/patients" component={Patients} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
