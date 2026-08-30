import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

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
        type: "MAIN",
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
  // CREATE / UPDATE GATE
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    // Hostel gate must have hostel
    if (form.type === "HOSTEL" && !form.hostelId) {
      setError("Please select a hostel for the hostel gate.");

      return;
    }

    try {
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
          active: editingGate.active,
        });

        setGates((currentGates) =>
          currentGates.map((gate) =>
            gate.id === editingGate.id ? data.gate : gate,
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

        setGates((currentGates) => [data.gate, ...currentGates]);

        setSuccess("Gate created successfully.");
      }

      resetForm();
    } catch (error) {
      console.error("Save gate error:", error);

      setError(error.message);
    }
  };

  // ==========================================
  // EDIT
  // ==========================================

  const handleEdit = (gate) => {
    setError("");
    setSuccess("");
    setQrCode(null);

    setEditingGate(gate);

    setForm({
      name: gate.name,
      type: gate.type || "MAIN",
      hostelId: gate.hostelId || "",
      latitude: String(gate.latitude),
      longitude: String(gate.longitude),
      radius: String(gate.radius),
    });
  };

  // ==========================================
  // DELETE
  // ==========================================

  const handleDelete = async (gate) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${gate.name}"?`,
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

      if (editingGate?.id === gate.id) {
        resetForm();
      }
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
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>Smart Entry-Exit</h1>
          <p>Gate Management</p>
        </div>

        <a href="/admin/dashboard" className="admin-back-link">
          Dashboard
        </a>
      </header>

      <main className="dashboard-content">
        {/* ======================================
            CREATE / EDIT GATE
        ====================================== */}

        <section className="history-card">
          <div className="section-header">
            <div>
              <p className="small-text">Gate Management</p>

              <h2>{editingGate ? "Edit Gate" : "Create New Gate"}</h2>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleSubmit} className="gate-form">
            {/* GATE NAME */}

            <div className="gate-form-group">
              <label htmlFor="name">Gate Name</label>

              <input
                id="name"
                name="name"
                type="text"
                placeholder="e.g. Main Gate"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* GATE TYPE */}

            <div className="gate-form-group">
              <label htmlFor="type">Gate Type</label>

              <select
                id="type"
                name="type"
                value={form.type}
                onChange={handleChange}
                required
              >
                <option value="MAIN">Main Gate</option>

                <option value="HOSTEL">Hostel Gate</option>
              </select>
            </div>

            {/* HOSTEL */}

            {form.type === "HOSTEL" && (
              <div className="gate-form-group">
                <label htmlFor="hostelId">Hostel</label>

                <select
                  id="hostelId"
                  name="hostelId"
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

            {/* LATITUDE */}

            <div className="gate-form-group">
              <label htmlFor="latitude">Latitude</label>

              <input
                id="latitude"
                name="latitude"
                type="number"
                step="any"
                placeholder="e.g. 30.3165"
                value={form.latitude}
                onChange={handleChange}
                required
              />
            </div>

            {/* LONGITUDE */}

            <div className="gate-form-group">
              <label htmlFor="longitude">Longitude</label>

              <input
                id="longitude"
                name="longitude"
                type="number"
                step="any"
                placeholder="e.g. 78.0322"
                value={form.longitude}
                onChange={handleChange}
                required
              />
            </div>

            {/* RADIUS */}

            <div className="gate-form-group">
              <label htmlFor="radius">Geofence Radius (meters)</label>

              <input
                id="radius"
                name="radius"
                type="number"
                min="10"
                max="500"
                value={form.radius}
                onChange={handleChange}
                required
              />
            </div>

            <div className="gate-form-actions">
              <button type="submit" className="primary-button">
                {editingGate ? "Update Gate" : "Create Gate"}
              </button>

              {editingGate && (
                <button
                  type="button"
                  className="gate-cancel-button"
                  onClick={resetForm}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </section>

        {/* ======================================
            ALL GATES
        ====================================== */}

        <section className="history-card">
          <div className="section-header">
            <p className="small-text">Existing Gates</p>

            <h2>All Gates</h2>
          </div>

          {loading && <p className="history-empty">Loading gates...</p>}

          {!loading && gates.length === 0 && (
            <p className="history-empty">No gates created yet.</p>
          )}

          {!loading && gates.length > 0 && (
            <div className="admin-gates-table-wrapper">
              <div className="admin-gates-table">
                <div className="admin-gates-table-header">
                  <div>Gate</div>
                  <div>Type</div>
                  <div>Hostel</div>
                  <div>Location</div>
                  <div>Radius</div>
                  <div>Status</div>
                  <div>Actions</div>
                </div>

                {gates.map((gate) => (
                  <div className="admin-gates-table-row" key={gate.id}>
                    {/* Gate */}
                    <div className="admin-gate-name">
                      <strong>{gate.name}</strong>
                    </div>

                    {/* Type */}
                    <div className="admin-gate-type">
                      {gate.type === "HOSTEL" ? "Hostel Gate" : "Main Gate"}
                    </div>

                    {/* Hostel */}
                    <div className="admin-gate-hostel">
                      {gate.type === "HOSTEL" && gate.hostel
                        ? `${gate.hostel.name} (${gate.hostel.code})`
                        : "Campus"}
                    </div>

                    {/* Location */}
                    <div className="admin-gate-location">
                      <span>
                        {gate.latitude}, {gate.longitude}
                      </span>
                    </div>

                    {/* Radius */}
                    <div className="admin-gate-radius">{gate.radius}m</div>

                    {/* Status */}
                    <div>
                      <span
                        className={`gate-status ${
                          gate.active ? "active" : "inactive"
                        }`}
                      >
                        {gate.active ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="admin-gate-actions">
                      <button type="button" onClick={() => handleEdit(gate)}>
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleStatus(gate)}
                      >
                        {gate.active ? "Deactivate" : "Activate"}
                      </button>

                      <button type="button" onClick={() => handleShowQr(gate)}>
                        Show QR
                      </button>

                      <button type="button" onClick={() => handleDelete(gate)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ======================================
            QR CODE
        ====================================== */}

        {qrCode && (
          <section className="history-card admin-qr-card">
            <div className="section-header">
              <p className="small-text">Gate QR Code</p>

              <h2>{qrCode.name}</h2>
            </div>

            <img
              src={qrCode.image}
              alt={`${qrCode.name} QR Code`}
              className="admin-qr-image"
            />

            <button
              type="button"
              className="primary-button"
              onClick={() => window.print()}
            >
              Print QR Code
            </button>

            <button
              type="button"
              className="gate-cancel-button"
              onClick={() => setQrCode(null)}
            >
              Close QR
            </button>
          </section>
        )}
      </main>
    </div>
  );
};

export default AdminGates;
