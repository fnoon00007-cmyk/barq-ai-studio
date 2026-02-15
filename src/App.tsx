import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { lazy, Suspense, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { NavigationProgress } from "@/components/NavigationProgress";
import PageLoader from "@/components/PageLoader";

// Lazy-loaded pages for code splitting
const LandingPage = lazy(() => import("./pages/LandingPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const BuilderPage = lazy(() => import("./pages/BuilderPage"));
const ProjectsPage = lazy(() => import("./pages/ProjectsPage"));
const BrandSettingsPage = lazy(() => import("./pages/BrandSettingsPage"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const ProjectDashboardPage = lazy(() => import("./pages/ProjectDashboardPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function AuthGuard() {
  const [user, setUser] = useState<any>(undefined);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (user === undefined) {
    return <PageLoader />;
  }

  if (!user) return <Navigate to="/auth" replace />;

  return <Outlet />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <NavigationProgress />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            
            {/* Protected routes */}
            <Route element={<AuthGuard />}>
              <Route path="/builder" element={<BuilderPage />} />
              <Route path="/builder/:projectId" element={<BuilderPage />} />
              <Route path="/auth/github/callback" element={<BuilderPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/project/:projectId" element={<ProjectDashboardPage />} />
              <Route path="/settings" element={<BrandSettingsPage />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
