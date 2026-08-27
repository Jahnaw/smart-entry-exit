import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import GateQR from "./pages/GateQR";

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
          <Route
            path="/"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/signup"
            element={<Signup />}
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
  path="/gate-qr"
  element={<GateQR />}
/>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;