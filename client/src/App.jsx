import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import GateQR from "./pages/GateQR";
import AdminDashboard from "./pages/AdminDashboard";
import AdminGates from "./pages/AdminGates";
import AdminStudents from "./pages/AdminStudents";
import AdminAttendance from "./pages/AdminAttendance";
import AdminWardens from "./pages/AdminWardens";
import WardenDashboard from "./pages/WardenDashboard";
import WardenStudents from "./pages/WardenStudents";
import WardenAttendance from "./pages/WardenAttendance";
import GuardDashboard from "./pages/GuardDashboard";
import AdminGuards from "./pages/AdminGuards";

import { AuthProvider } from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* =========================
              DEFAULT
          ========================= */}

          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* =========================
              AUTH
          ========================= */}

          <Route path="/login" element={<Login />} />

          <Route path="/signup" element={<Signup />} />

          {/* =========================
              STUDENT
          ========================= */}

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route path="/gate-qr" element={<GateQR />} />

          {/* =========================
              ADMIN
          ========================= */}

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/gates"
            element={
              <ProtectedRoute>
                <AdminGates />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/students"
            element={
              <ProtectedRoute>
                <AdminStudents />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/attendance"
            element={
              <ProtectedRoute>
                <AdminAttendance />
              </ProtectedRoute>
            }
          />

          {/* =========================
              WARDEN MANAGEMENT
          ========================= */}

          <Route
            path="/admin/wardens"
            element={
              <ProtectedRoute>
                <AdminWardens />
              </ProtectedRoute>
            }
          />

          <Route
            path="/warden/dashboard"
            element={
              <ProtectedRoute>
                <WardenDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/warden/students"
            element={
              <ProtectedRoute>
                <WardenStudents />
              </ProtectedRoute>
            }
          />

          <Route
            path="/warden/attendance"
            element={
              <ProtectedRoute>
                <WardenAttendance />
              </ProtectedRoute>
            }
          />

          <Route
            path="/guard/dashboard"
            element={
              <ProtectedRoute>
                <GuardDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/guards"
            element={
              <ProtectedRoute>
                <AdminGuards />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
