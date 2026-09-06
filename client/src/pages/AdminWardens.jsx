import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import AdminShell from "../components/AdminShell";
import "../styles/admin.css";

import {
  getActiveHostels,
  createWarden,
  getAllWardens,
  deleteWarden,
} from "../services/api";

const AdminWardens = () => {
  const { token } = useAuth();

  const [hostels, setHostels] = useState([]);
  const [wardens, setWardens] = useState([]);

  const [loadingHostels, setLoadingHostels] = useState(true);
  const [loadingWardens, setLoadingWardens] = useState(true);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    hostelId: "",
  });

  // ==========================================
  // LOAD HOSTELS
  // ==========================================

  const loadHostels = async () => {
    try {
      setLoadingHostels(true);

      const data = await getActiveHostels();

      setHostels(data.hostels || []);
    } catch (error) {
      console.error("Load hostels error:", error);

      setError(error.message);
    } finally {
      setLoadingHostels(false);
    }
  };

  // ==========================================
  // LOAD WARDENS
  // ==========================================

  const loadWardens = async () => {
    try {
      setLoadingWardens(true);

      const data = await getAllWardens(token);

      setWardens(data.wardens || []);
    } catch (error) {
      console.error("Load wardens error:", error);

      setError(error.message);
    } finally {
      setLoadingWardens(false);
    }
  };

  useEffect(() => {
    if (!token) {
      return;
    }

    loadHostels();
    loadWardens();
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
  // CREATE WARDEN
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.hostelId) {
      setError("Please select an assigned hostel.");
      return;
    }

    try {
      setLoading(true);

      const data = await createWarden({
        token,
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        hostelId: form.hostelId,
      });

      setSuccess(`Warden ${data.warden.name} created successfully.`);

      setForm({
        name: "",
        email: "",
        password: "",
        phone: "",
        hostelId: "",
      });

      await loadWardens();
    } catch (error) {
      console.error("Create warden error:", error);

      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // DELETE WARDEN
  // ==========================================

  const handleDelete = async (warden) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove warden ${warden.name}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(warden.id);
      setError("");
      setSuccess("");

      await deleteWarden({
        token,
        id: warden.id,
      });

      setSuccess(`Warden ${warden.name} removed successfully.`);

      await loadWardens();
    } catch (error) {
      console.error("Delete warden error:", error);

      setError(error.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AdminShell
      title="Warden Management"
      subtitle="Administration / Hostel Warden Directory & Access"
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

      {/* CREATE WARDEN PANEL */}
      <div className="admin-panel">
        <div className="admin-panel-header">
          <div className="admin-panel-title-area">
            <span className="admin-panel-eyebrow">Personnel Registration</span>
            <h3 className="admin-panel-title">Add Hostel Warden</h3>
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
                  placeholder="e.g. Dr. Ramesh Kumar"
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
                  placeholder="warden@smartentry.com"
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
                  placeholder="+91 98765 43210"
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

              <div className="admin-form-group">
                <label className="admin-form-label" htmlFor="hostelId">
                  Assigned Hostel *
                </label>
                <select
                  id="hostelId"
                  name="hostelId"
                  className="admin-select"
                  value={form.hostelId}
                  onChange={handleChange}
                  required
                  disabled={loadingHostels}
                >
                  <option value="">
                    {loadingHostels ? "Loading hostels..." : "Select assigned hostel"}
                  </option>
                  {hostels.map((hostel) => (
                    <option key={hostel._id} value={hostel._id}>
                      {hostel.name} ({hostel.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="admin-form-actions">
              <button
                type="submit"
                className="admin-btn-primary"
                disabled={loading || loadingHostels}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="19" x2="19" y1="8" y2="14" />
                  <line x1="22" x2="16" y1="11" y2="11" />
                </svg>
                <span>{loading ? "Creating Warden..." : "Create Warden Account"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* EXISTING WARDENS TABLE PANEL */}
      <div className="admin-panel">
        <div className="admin-panel-header">
          <div className="admin-panel-title-area">
            <span className="admin-panel-eyebrow">Active Staff</span>
            <h3 className="admin-panel-title">Existing Wardens ({wardens.length})</h3>
          </div>
        </div>

        <div className="admin-panel-body" style={{ padding: 0 }}>
          {loadingWardens && (
            <div className="admin-empty-state">
              <p>Loading warden roster...</p>
            </div>
          )}

          {!loadingWardens && wardens.length === 0 && (
            <div className="admin-empty-state">
              <p>No wardens assigned yet. Use the form above to add a warden.</p>
            </div>
          )}

          {!loadingWardens && wardens.length > 0 && (
            <div className="admin-table-wrapper" style={{ border: "none", borderRadius: 0 }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Warden</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Assigned Hostel</th>
                    <th>Role</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {wardens.map((warden) => (
                    <tr key={warden.id}>
                      <td>
                        <span className="admin-table-primary-text">{warden.name}</span>
                      </td>
                      <td>
                        <span className="admin-table-secondary-text">{warden.email}</span>
                      </td>
                      <td>
                        <span className="admin-table-secondary-text">{warden.phone || "—"}</span>
                      </td>
                      <td>
                        <span className="admin-badge neutral">
                          {warden.hostel
                            ? `${warden.hostel.name} (${warden.hostel.code})`
                            : "Unassigned"}
                        </span>
                      </td>
                      <td>
                        <span className="admin-badge primary">{warden.role || "WARDEN"}</span>
                      </td>
                      <td>
                        <div className="admin-table-actions" style={{ justifyContent: "flex-end" }}>
                          <button
                            type="button"
                            className="admin-btn-action danger"
                            onClick={() => handleDelete(warden)}
                            disabled={deletingId === warden.id}
                          >
                            {deletingId === warden.id ? "Removing..." : "Remove"}
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
            <span className="admin-panel-eyebrow">Security Protocol</span>
            <h3 className="admin-panel-title">Warden Permissions & Access Scope</h3>
          </div>
        </div>
        <div className="admin-panel-body">
          <div className="admin-permission-list">
            <div className="admin-permission-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 14 14" />
              </svg>
              <span>Each Warden is assigned to manage exactly one designated hostel.</span>
            </div>
            <div className="admin-permission-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 14 14" />
              </svg>
              <span>Wardens can view student rosters and live attendance logs for their assigned hostel only.</span>
            </div>
            <div className="admin-permission-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 14 14" />
              </svg>
              <span>Wardens cannot create, reconfigure, or delete other Warden or Guard accounts.</span>
            </div>
            <div className="admin-permission-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 14 14" />
              </svg>
              <span>Only Campus Administrators have authority to onboard or revoke Warden credentials.</span>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
};

export default AdminWardens;
