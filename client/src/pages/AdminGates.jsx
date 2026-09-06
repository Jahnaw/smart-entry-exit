import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import AdminShell from "../components/AdminShell";
import "../styles/admin.css";

import {
  getAllGates,
  createGate,
  updateGate,
  deleteGate,
  getGateQrCode,
  getActiveHostels,
} from "../services/api";

const AdminGates = () => {
  const { token } = useAuth();

  const [gates, setGates] = useState([]);
  const [hostels, setHostels] = useState([]);

  const [loading, setLoading] = useState(true);
  const [hostelsLoading, setHostelsLoading] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    type: "MAIN",
    hostelId: "",
    latitude: "",
    longitude: "",
    radius: "50",
  });

  const [editingGate, setEditingGate] = useState(null);
  const [qrCode, setQrCode] = useState(null);

  // ==========================================
  // LOAD GATES
  // ==========================================

  const loadGates = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAllGates(token);

      setGates(data.gates);
    } catch (error) {
      console.error("Load gates error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOAD HOSTELS
  // ==========================================

  const loadHostels = async () => {
    try {
      setHostelsLoading(true);

      const data = await getActiveHostels();

      setHostels(data.hostels);
    } catch (error) {
      console.error("Load hostels error:", error);

      setError(error.message);
    } finally {
      setHostelsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadGates();
      loadHostels();
    }
  }, [token]);

  // ==========================================
  // HANDLE FORM CHANGE
  // ==========================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));

    // If gate type changes to MAIN,
    // remove hostel selection.
    if (name === "type" && value === "MAIN") {
      setForm((currentForm) => ({
        ...currentForm,
        hostelId: "",
      }));
    }
  };

  // ==========================================
  // RESET FORM
  // ==========================================

  const resetForm = () => {
    setForm({
      name: "",
      type: "MAIN",
      hostelId: "",
      latitude: "",
      longitude: "",
      radius: "50",
    });

    setEditingGate(null);
  };

  // ==========================================
  // START EDITING
  // ==========================================

  const handleEdit = (gate) => {
    setEditingGate(gate);

    setForm({
      name: gate.name,
      type: gate.type,
      hostelId: gate.hostelId || "",
      latitude: gate.latitude,
      longitude: gate.longitude,
      radius: gate.radius,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ==========================================
  // CREATE OR UPDATE GATE
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setError("");
      setSuccess("");

      if (editingGate) {
        const data = await updateGate({
          token,
          id: editingGate.id,
          name: form.name,
          type: form.type,
          hostelId: form.type === "HOSTEL" ? form.hostelId : undefined,
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
          radius: Number(form.radius),
        });

        setGates((currentGates) =>
          currentGates.map((currentGate) =>
            currentGate.id === editingGate.id ? data.gate : currentGate,
          ),
        );

        setSuccess("Gate updated successfully.");
      } else {
        const data = await createGate({
          token,
          name: form.name,
          type: form.type,
          hostelId: form.type === "HOSTEL" ? form.hostelId : undefined,
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
          radius: Number(form.radius),
        });

        setGates((currentGates) => [...currentGates, data.gate]);

        setSuccess("Gate created successfully.");
      }

      resetForm();
    } catch (error) {
      console.error("Save gate error:", error);

      setError(error.message);
    }
  };

  // ==========================================
  // DELETE GATE
  // ==========================================

  const handleDelete = async (gate) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${gate.name}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await deleteGate({
        token,
        id: gate.id,
      });

      setGates((currentGates) =>
        currentGates.filter((currentGate) => currentGate.id !== gate.id),
      );

      setSuccess("Gate deleted successfully.");
    } catch (error) {
      console.error("Delete gate error:", error);

      setError(error.message);
    }
  };

  // ==========================================
  // ACTIVATE / DEACTIVATE
  // ==========================================

  const handleToggleStatus = async (gate) => {
    try {
      setError("");
      setSuccess("");

      const data = await updateGate({
        token,
        id: gate.id,
        name: gate.name,
        type: gate.type,
        hostelId: gate.type === "HOSTEL" ? gate.hostelId : undefined,
        latitude: gate.latitude,
        longitude: gate.longitude,
        radius: gate.radius,
        active: !gate.active,
      });

      setGates((currentGates) =>
        currentGates.map((currentGate) =>
          currentGate.id === gate.id ? data.gate : currentGate,
        ),
      );

      setSuccess(
        `Gate ${data.gate.active ? "activated" : "deactivated"} successfully.`,
      );
    } catch (error) {
      console.error("Toggle gate error:", error);

      setError(error.message);
    }
  };

  // ==========================================
  // SHOW QR
  // ==========================================

  const handleShowQr = async (gate) => {
    try {
      setError("");
      setSuccess("");

      const data = await getGateQrCode({
        token,
        id: gate.id,
      });

      setQrCode({
        name: gate.name,
        image: data.qrCode,
      });
    } catch (error) {
      console.error("QR code error:", error);

      setError(error.message);
    }
  };

  return (
    <AdminShell
      title="Gate Management"
      subtitle="Administration / Gate Configuration & Geofencing"
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

      {/* CREATE / EDIT GATE PANEL */}
      <div className="admin-panel">
        <div className="admin-panel-header">
          <div className="admin-panel-title-area">
            <span className="admin-panel-eyebrow">Gate Configuration</span>
            <h3 className="admin-panel-title">
              {editingGate ? `Editing: ${editingGate.name}` : "Create New Gate Point"}
            </h3>
          </div>
        </div>

        <div className="admin-panel-body">
          <form onSubmit={handleSubmit}>
            <div className="admin-form-grid">
              {/* Gate Name */}
              <div className="admin-form-group">
                <label className="admin-form-label" htmlFor="name">
                  Gate Name *
                </label>
                <input
                  id="name"
                  name="name"
                  className="admin-input"
                  type="text"
                  placeholder="e.g. Main Entrance Gate"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Gate Type */}
              <div className="admin-form-group">
                <label className="admin-form-label" htmlFor="type">
                  Gate Category *
                </label>
                <select
                  id="type"
                  name="type"
                  className="admin-select"
                  value={form.type}
                  onChange={handleChange}
                  required
                >
                  <option value="MAIN">Campus Main Gate</option>
                  <option value="HOSTEL">Hostel Gate</option>
                </select>
              </div>

              {/* Hostel Selector (if Hostel gate) */}
              {form.type === "HOSTEL" && (
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
                    disabled={hostelsLoading}
                  >
                    <option value="">
                      {hostelsLoading ? "Loading hostels..." : "Select hostel"}
                    </option>
                    {hostels.map((hostel) => (
                      <option key={hostel._id} value={hostel._id}>
                        {hostel.name} ({hostel.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Latitude */}
              <div className="admin-form-group">
                <label className="admin-form-label" htmlFor="latitude">
                  GPS Latitude *
                </label>
                <input
                  id="latitude"
                  name="latitude"
                  className="admin-input"
                  type="number"
                  step="any"
                  placeholder="e.g. 30.3165"
                  value={form.latitude}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Longitude */}
              <div className="admin-form-group">
                <label className="admin-form-label" htmlFor="longitude">
                  GPS Longitude *
                </label>
                <input
                  id="longitude"
                  name="longitude"
                  className="admin-input"
                  type="number"
                  step="any"
                  placeholder="e.g. 78.0322"
                  value={form.longitude}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Geofence Radius */}
              <div className="admin-form-group">
                <label className="admin-form-label" htmlFor="radius">
                  Geofence Radius (meters) *
                </label>
                <input
                  id="radius"
                  name="radius"
                  className="admin-input"
                  type="number"
                  min="10"
                  max="500"
                  placeholder="e.g. 50"
                  value={form.radius}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="admin-form-actions">
              <button type="submit" className="admin-btn-primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                <span>{editingGate ? "Update Gate" : "Save Gate Point"}</span>
              </button>

              {editingGate && (
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={resetForm}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* QR CODE PREVIEW MODAL / PANEL */}
      {qrCode && (
        <div className="admin-panel" style={{ border: "2px solid #BFDBFE" }}>
          <div className="admin-panel-header" style={{ background: "#EFF6FF" }}>
            <div className="admin-panel-title-area">
              <span className="admin-panel-eyebrow">QR Code Token</span>
              <h3 className="admin-panel-title">{qrCode.name} Entrance Token</h3>
            </div>
            <button
              type="button"
              className="admin-btn-secondary"
              onClick={() => setQrCode(null)}
              style={{ padding: "6px 12px", fontSize: "12px" }}
            >
              Close
            </button>
          </div>
          <div className="admin-qr-card-content">
            <div className="admin-qr-image-wrapper">
              <img
                src={qrCode.image}
                alt={`${qrCode.name} QR Code`}
                className="admin-qr-image"
              />
            </div>
            <p style={{ fontSize: "13px", color: "var(--admin-text-secondary)", margin: 0 }}>
              Print and place this QR code securely at the gate entry/exit barrier.
            </p>
            <div className="admin-qr-actions">
              <button
                type="button"
                className="admin-btn-primary"
                onClick={() => window.print()}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect width="12" height="8" x="6" y="14" />
                </svg>
                <span>Print QR Code</span>
              </button>
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => setQrCode(null)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXISTING GATES TABLE PANEL */}
      <div className="admin-panel">
        <div className="admin-panel-header">
          <div className="admin-panel-title-area">
            <span className="admin-panel-eyebrow">Configured Entrance Points</span>
            <h3 className="admin-panel-title">All Campus Gates ({gates.length})</h3>
          </div>
        </div>

        <div className="admin-panel-body" style={{ padding: 0 }}>
          {loading && (
            <div className="admin-empty-state">
              <p>Loading gate locations...</p>
            </div>
          )}

          {!loading && gates.length === 0 && (
            <div className="admin-empty-state">
              <p>No gates created yet. Use the form above to add your first campus gate.</p>
            </div>
          )}

          {!loading && gates.length > 0 && (
            <div className="admin-table-wrapper" style={{ border: "none", borderRadius: 0 }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Gate Name</th>
                    <th>Type</th>
                    <th>Associated Hostel</th>
                    <th>GPS Coordinates</th>
                    <th>Geofence</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {gates.map((gate) => (
                    <tr key={gate.id}>
                      <td>
                        <span className="admin-table-primary-text">{gate.name}</span>
                      </td>
                      <td>
                        <span className="admin-table-secondary-text">
                          {gate.type === "HOSTEL" ? "Hostel Gate" : "Campus Main Gate"}
                        </span>
                      </td>
                      <td>
                        <span className="admin-table-secondary-text">
                          {gate.type === "HOSTEL" && gate.hostel
                            ? `${gate.hostel.name} (${gate.hostel.code})`
                            : "Campus Perimeter"}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: "monospace", fontSize: "12px", color: "var(--admin-text-secondary)" }}>
                          {gate.latitude}, {gate.longitude}
                        </span>
                      </td>
                      <td>
                        <span className="admin-badge neutral">{gate.radius}m</span>
                      </td>
                      <td>
                        <span
                          className={`admin-badge ${
                            gate.active ? "active" : "inactive"
                          }`}
                        >
                          {gate.active ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </td>
                      <td>
                        <div className="admin-table-actions" style={{ justifyContent: "flex-end" }}>
                          <button
                            type="button"
                            className="admin-btn-action"
                            onClick={() => handleEdit(gate)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="admin-btn-action"
                            onClick={() => handleToggleStatus(gate)}
                          >
                            {gate.active ? "Deactivate" : "Activate"}
                          </button>
                          <button
                            type="button"
                            className="admin-btn-action primary"
                            onClick={() => handleShowQr(gate)}
                          >
                            QR Code
                          </button>
                          <button
                            type="button"
                            className="admin-btn-action danger"
                            onClick={() => handleDelete(gate)}
                          >
                            Delete
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
    </AdminShell>
  );
};

export default AdminGates;
