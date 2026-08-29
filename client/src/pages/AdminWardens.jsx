import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";

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

  const [loadingHostels, setLoadingHostels] =
    useState(true);

  const [loadingWardens, setLoadingWardens] =
    useState(true);

  const [loading, setLoading] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState(null);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

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

      const data =
        await getActiveHostels();

      setHostels(
        data.hostels || []
      );
    } catch (error) {
      console.error(
        "Load hostels error:",
        error
      );

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

      const data =
        await getAllWardens(token);

      setWardens(
        data.wardens || []
      );
    } catch (error) {
      console.error(
        "Load wardens error:",
        error
      );

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
    const {
      name,
      value,
    } = event.target;

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
      setError(
        "Please select a hostel."
      );

      return;
    }

    try {
      setLoading(true);

      const data =
        await createWarden({
          token,
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone,
          hostelId: form.hostelId,
        });

      setSuccess(
        `Warden ${data.warden.name} created successfully.`
      );

      // Clear form
      setForm({
        name: "",
        email: "",
        password: "",
        phone: "",
        hostelId: "",
      });

      // Refresh Warden list
      await loadWardens();
    } catch (error) {
      console.error(
        "Create warden error:",
        error
      );

      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // DELETE WARDEN
  // ==========================================

  const handleDelete = async (
    warden
  ) => {
    const confirmed =
      window.confirm(
        `Are you sure you want to remove ${warden.name}?`
      );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      setDeletingId(
        warden.id
      );

      await deleteWarden({
        token,
        id: warden.id,
      });

      setSuccess(
        `${warden.name} was removed successfully.`
      );

      // Remove from UI immediately
      setWardens(
        (currentWardens) =>
          currentWardens.filter(
            (item) =>
              item.id !== warden.id
          )
      );
    } catch (error) {
      console.error(
        "Delete warden error:",
        error
      );

      setError(error.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="dashboard-page">

      {/* ======================================
          HEADER
      ====================================== */}

      <header className="dashboard-header">

        <div>
          <h1>
            Smart Entry-Exit
          </h1>

          <p>
            Warden Management
          </p>
        </div>

        <a
          href="/admin/dashboard"
          className="admin-back-link"
        >
          Dashboard
        </a>

      </header>

      <main className="dashboard-content">

        {/* ======================================
            CREATE WARDEN
        ====================================== */}

        <section className="history-card">

          <div className="section-header">
            <div>

              <p className="small-text">
                Administration
              </p>

              <h2>
                Create Warden
              </h2>

            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {success && (
            <div className="success-message">
              {success}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
          >

            {/* NAME */}

            <div className="form-group">

              <label htmlFor="name">
                Full Name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                placeholder="Enter warden name"
                value={form.name}
                onChange={handleChange}
                required
              />

            </div>

            {/* EMAIL */}

            <div className="form-group">

              <label htmlFor="email">
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter warden email"
                value={form.email}
                onChange={handleChange}
                required
              />

            </div>

            {/* PHONE */}

            <div className="form-group">

              <label htmlFor="phone">
                Phone Number
              </label>

              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Enter phone number"
                value={form.phone}
                onChange={handleChange}
              />

            </div>

            {/* PASSWORD */}

            <div className="form-group">

              <label htmlFor="password">
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                placeholder="Create password"
                value={form.password}
                onChange={handleChange}
                minLength={8}
                required
              />

            </div>

            {/* HOSTEL */}

            <div className="form-group">

              <label htmlFor="hostelId">
                Hostel
              </label>

              <select
                id="hostelId"
                name="hostelId"
                value={form.hostelId}
                onChange={handleChange}
                required
                disabled={
                  loadingHostels
                }
              >

                <option value="">
                  {loadingHostels
                    ? "Loading hostels..."
                    : "Select hostel"}
                </option>

                {hostels.map(
                  (hostel) => (
                    <option
                      key={hostel._id}
                      value={
                        hostel._id
                      }
                    >
                      {hostel.name} (
                      {hostel.code})
                    </option>
                  )
                )}

              </select>

            </div>

            {/* SUBMIT */}

            <button
              type="submit"
              className="primary-button"
              disabled={
                loading ||
                loadingHostels
              }
            >
              {loading
                ? "Creating Warden..."
                : "Create Warden"}
            </button>

          </form>

        </section>

        {/* ======================================
            EXISTING WARDENS
        ====================================== */}

        <section className="history-card">

          <div className="section-header">

            <div>

              <p className="small-text">
                Administration
              </p>

              <h2>
                Existing Wardens
              </h2>

            </div>

          </div>

          {loadingWardens && (
            <p className="history-empty">
              Loading wardens...
            </p>
          )}

          {!loadingWardens &&
            wardens.length === 0 && (
              <p className="history-empty">
                No wardens have been created yet.
              </p>
            )}

          {!loadingWardens &&
            wardens.length > 0 && (

              <div className="history-list">

                {wardens.map(
                  (warden) => (

                    <div
                      className="history-item"
                      key={warden.id}
                    >

                      <div className="history-details">

                        <h3>
                          {warden.name}
                        </h3>

                        <p>
                          Email:{" "}
                          {warden.email}
                        </p>

                        {warden.phone && (
                          <p>
                            Phone:{" "}
                            {warden.phone}
                          </p>
                        )}

                        <p>
                          Hostel:{" "}
                          {warden.hostel
                            ? `${warden.hostel.name} (${warden.hostel.code})`
                            : "No hostel assigned"}
                        </p>

                        <p>
                          Role:{" "}
                          {warden.role}
                        </p>

                      </div>

                      <div className="history-action">

                        <button
                          type="button"
                          className="logout-button"
                          onClick={() =>
                            handleDelete(
                              warden
                            )
                          }
                          disabled={
                            deletingId ===
                            warden.id
                          }
                        >
                          {deletingId ===
                          warden.id
                            ? "Removing..."
                            : "Remove"}
                        </button>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

        </section>

        {/* ======================================
            PERMISSIONS
        ====================================== */}

        <section className="history-card">

          <div className="section-header">

            <div>

              <p className="small-text">
                Access Control
              </p>

              <h2>
                Warden Permissions
              </h2>

            </div>

          </div>

          <div className="admin-info-list">

            <p>
              • Each Warden is assigned
              to one hostel.
            </p>

            <p>
              • Wardens can view
              information for their
              assigned hostel.
            </p>

            <p>
              • Wardens cannot create
              other Wardens.
            </p>

            <p>
              • Admin can remove
              Wardens.
            </p>

          </div>

        </section>

      </main>

    </div>
  );
};

export default AdminWardens;