import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { AuthPage } from "./pages/AuthPage";
import { DashboardPage } from "./pages/DashboardPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { AssumptionValidationPage } from "./pages/AssumptionValidationPage";
import { FutureSimulationPage } from "./pages/FutureSimulationPage";
import { PreferenceSlidersPage } from "./pages/PreferenceSlidersPage";
import { FutureSelectionPage } from "./pages/FutureSelectionPage";
import { GapPage } from "./pages/GapPage";
import { DecisionCompilerPage } from "./pages/DecisionCompilerPage";
import { RoadmapPage } from "./pages/RoadmapPage";
import { LifeExperimentPage } from "./pages/LifeExperimentPage";
import { ActionTrackingPage } from "./pages/ActionTrackingPage";
import { AccountabilityPage } from "./pages/AccountabilityPage";
import { ContinuousImprovementPage } from "./pages/ContinuousImprovementPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./styles.css";

function Guard({ children }: { children: React.ReactNode }) {
  return localStorage.getItem("futureos_token") ? <>{children}</> : <Navigate to="/login" replace />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route
            path="/"
            element={
              <Guard>
                <AppLayout />
              </Guard>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="onboarding" element={<OnboardingPage />} />
            <Route path="assumptions" element={<AssumptionValidationPage />} />
            <Route path="futures" element={<FutureSimulationPage />} />
            <Route path="preferences" element={<PreferenceSlidersPage />} />
            <Route path="future-selection" element={<FutureSelectionPage />} />
            <Route path="gap-analysis" element={<GapPage />} />
            <Route path="decision-compiler" element={<DecisionCompilerPage />} />
            <Route path="roadmap" element={<RoadmapPage />} />
            <Route path="experiments" element={<LifeExperimentPage />} />
            <Route path="progress" element={<ActionTrackingPage />} />
            <Route path="progress/:milestoneId" element={<ActionTrackingPage />} />
            <Route path="accountability" element={<AccountabilityPage />} />
            <Route path="continuous-improvement" element={<ContinuousImprovementPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);