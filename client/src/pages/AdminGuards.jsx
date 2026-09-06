import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import AdminShell from "../components/AdminShell";
import "../styles/admin.css";

import { createGuard, getAllGuards, deleteGuard } from "../services/api";

const AdminGuards = () => {
  const { token } = useAuth();

  const [guards, setGuards] = useState([]);
  const [loadingGuards, setLoadingGuards] = useState(true);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  // ==========================================
  // LOAD GUARDS
  // ==========================================

  const loadGuards = async () => {
    try {
      setLoadingGuards(true);

      const data = await getAllGuards(token);

      setGuards(data.guards || []);
    } catch (error) {
      console.error("Load guards error:", error);

      setError(error.message);
    } finally {
      setLoadingGuards(false);
    }
  };

  useEffect(() => {
    if (!token) {
      return;
    }

    loadGuards();
  }, [token]);

  // ==========================================
  // FORM CHANGE
  // ==========================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  // ==========================================
  // CREATE GUARD
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    try {
      setLoading(true);

      const data = await createGuard({
        token,
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
      });

      setSuccess(`Guard ${data.guard.name} created successfully.`);

      setForm({
        name: "",
        email: "",
        password: "",
        phone: "",
      });

      await loadGuards();
    } catch (error) {
      console.error("Create guard error:", error);

      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // DELETE GUARD
  // ==========================================

  const handleDelete = async (guard) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove ${guard.name}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(guard.id);
      setError("");
      setSuccess("");

      await deleteGuard({
        token,
        id: guard.id,
      });

      setSuccess(`Guard ${guard.name} removed successfully.`);

      await loadGuards();
    } catch (error) {
      console.error("Delete guard error:", error);

      setError(error.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AdminShell
      title="Guard Management"
      subtitle="Administration / Campus Security Staff Directory"
      portalType="admin"
    >
      {error && (
        <div className="admin-alert-error">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" x2="12" y1="8" y2="12" />
            <line x1="12" x2="12" y1="16" y2="16.01" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="admin-alert-success">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{success}</span>
        </div>
      )}

      {/* CREATE GUARD PANEL */}
      <div className="admin-panel">
        <div className="admin-panel-header">
          <div className="admin-panel-title-area">
            <span className="admin-panel-eyebrow">Security Personnel</span>
            <h3 className="admin-panel-title">Add Campus Security Guard</h3>
          </div>
        </div>

        <div className="admin-panel-body">
          <form onSubmit={handleSubmit}>
            <div className="admin-form-grid">
              <div className="admin-form-group">
                <label className="admin-form-label" htmlFor="name">
                  Full Name *
                </label>
                <input
                  id="name"
                  name="name"
                  className="admin-input"
                  type="text"
                  placeholder="e.g. Bahadur Singh"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label" htmlFor="email">
                  Email Address *
                </label>
                <input
                  id="email"
                  name="email"
                  className="admin-input"
                  type="email"
                  placeholder="guard@smartentry.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label" htmlFor="phone">
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  className="admin-input"
                  type="tel"
                  placeholder="+91 91234 56789"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label" htmlFor="password">
                  Initial Password *
                </label>
                <input
                  id="password"
                  name="password"
                  className="admin-input"
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={form.password}
                  onChange={handleChange}
                  minLength={8}
                  required
                />
              </div>
            </div>

            <div className="admin-form-actions">
              <button
                type="submit"
                className="admin-btn-primary"
                disabled={loading}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
                <span>{loading ? "Creating Guard..." : "Create Guard Account"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* EXISTING GUARDS TABLE PANEL */}
      <div className="admin-panel">
        <div className="admin-panel-header">
          <div className="admin-panel-title-area">
            <span className="admin-panel-eyebrow">Active Security Team</span>
            <h3 className="admin-panel-title">Existing Guards ({guards.length})</h3>
          </div>
        </div>

        <div className="admin-panel-body" style={{ padding: 0 }}>
          {loadingGuards && (
            <div className="admin-empty-state">
              <p>Loading guard directory...</p>
            </div>
          )}

          {!loadingGuards && guards.length === 0 && (
            <div className="admin-empty-state">
              <p>No guards registered yet. Use the form above to onboard security guards.</p>
            </div>
          )}

          {!loadingGuards && guards.length > 0 && (
            <div className="admin-table-wrapper" style={{ border: "none", borderRadius: 0 }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Security Guard</th>
                    <th>Email Address</th>
                    <th>Phone Number</th>
                    <th>Role</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {guards.map((guard) => (
                    <tr key={guard.id}>
                      <td>
                        <span className="admin-table-primary-text">{guard.name}</span>
                      </td>
                      <td>
                        <span className="admin-table-secondary-text">{guard.email}</span>
                      </td>
                      <td>
                        <span className="admin-table-secondary-text">{guard.phone || "—"}</span>
                      </td>
                      <td>
                        <span className="admin-badge primary">{guard.role || "GUARD"}</span>
                      </td>
                      <td>
                        <div className="admin-table-actions" style={{ justifyContent: "flex-end" }}>
                          <button
                            type="button"
                            className="admin-btn-action danger"
                            onClick={() => handleDelete(guard)}
                            disabled={deletingId === guard.id}
                          >
                            {deletingId === guard.id ? "Removing..." : "Remove"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* PERMISSIONS INFO */}
      <div className="admin-panel">
        <div className="admin-panel-header">
          <div className="admin-panel-title-area">
            <span className="admin-panel-eyebrow">Security Scope</span>
            <h3 className="admin-panel-title">Guard Station Permissions</h3>
          </div>
        </div>
        <div className="admin-panel-body">
          <div className="admin-permission-list">
            <div className="admin-permission-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 14 14" />
              </svg>
              <span>Guards can inspect all active hostels and search real-time student occupancies.</span>
            </div>
            <div className="admin-permission-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 14 14" />
              </svg>
              <span>Guards can verify live student entry and exit status at entrance checkpoints.</span>
            </div>
            <div className="admin-permission-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 14 14" />
              </svg>
              <span>Guard stations operate without mandatory student hardware device bindings.</span>
            </div>
            <div className="admin-permission-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 14 14" />
              </svg>
              <span>Only Campus Administrators have authority to create or remove Security Guards.</span>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
};

export default AdminGuards;
