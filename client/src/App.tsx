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
import Patients from "@/pages/Patients";
import Login from "@/pages/Login";
import Register from "@/pages/Register";

function Router() {
  const { doctor, isLoading } = useAuth();

  if (isLoading) {
    return null; // Loading handled by ProtectedRoute
  }

  if (!doctor) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route>
          <Redirect to="/login" />
        </Route>
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/login">
        <Redirect to="/" />
      </Route>
      <Route path="/register">
        <Redirect to="/" />
      </Route>
      <Route path="/">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/assess">
        <ProtectedRoute>
          <NewAssessment />
        </ProtectedRoute>
      </Route>
      <Route path="/predictions/:id">
        <ProtectedRoute>
          <PredictionReport />
        </ProtectedRoute>
      </Route>
      <Route path="/patients">
        <ProtectedRoute>
          <Patients />
        </ProtectedRoute>
      </Route>
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
