// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import Navbar          from "./components/shared/Navbar";
import Login           from "./components/auth/Login";
import Register        from "./components/auth/Register";
import TrainerDashboard from "./components/trainer/TrainerDashboard";
import ClientDashboard  from "./components/client/ClientDashboard";

function PrivateRoute({ children, role }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Loading…</p>
      </div>
    );
  }

  if (!user || !profile) return <Navigate to="/login" replace />;
  if (role && profile.role !== role) {
    return <Navigate to={profile.role === "trainer" ? "/trainer" : "/client"} replace />;
  }
  return children;
}

function AppRoutes() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <>
      {user && profile && <Navbar />}
      <Routes>
        {/* Public */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Trainer */}
        <Route path="/trainer" element={
          <PrivateRoute role="trainer"><TrainerDashboard /></PrivateRoute>
        }/>

        {/* Client */}
        <Route path="/client" element={
          <PrivateRoute role="client"><ClientDashboard /></PrivateRoute>
        }/>

        {/* Root redirect */}
        <Route path="/" element={
          !user ? <Navigate to="/login" replace /> :
          profile?.role === "trainer" ? <Navigate to="/trainer" replace /> :
          <Navigate to="/client" replace />
        }/>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
