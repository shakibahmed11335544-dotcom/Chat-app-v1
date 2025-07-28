import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { MessagingProvider } from "./contexts/MessagingContext";
import { Layout } from "./components/Layout";
import Index from "./pages/Index";
import ChatInterface from "./pages/ChatInterface";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

// Placeholder pages
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
        <span className="text-2xl font-semibold text-muted-foreground">{title[0]}</span>
      </div>
      <h2 className="text-2xl font-semibold mb-4">{title} Coming Soon</h2>
      <p className="text-muted-foreground max-w-md">
        This feature is under development. Continue prompting to help build out this section of GoponKotha!
      </p>
    </div>
  );
}

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center animate-bounce-in">
          <span className="text-xl font-semibold text-primary-foreground">G</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Main App Routes Component
function AppRoutes() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <Login />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/" replace /> : <Register />}
        />

        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout>
              <Index />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/chat/:id" element={
          <ProtectedRoute>
            <Layout>
              <ChatInterface />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/groups" element={
          <ProtectedRoute>
            <Layout>
              <PlaceholderPage title="Groups" />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/starred" element={
          <ProtectedRoute>
            <Layout>
              <PlaceholderPage title="Starred Messages" />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/archived" element={
          <ProtectedRoute>
            <Layout>
              <PlaceholderPage title="Archived Chats" />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/calls" element={
          <ProtectedRoute>
            <Layout>
              <PlaceholderPage title="Call History" />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Layout>
              <Settings />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <AuthProvider>
        <MessagingProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </MessagingProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
