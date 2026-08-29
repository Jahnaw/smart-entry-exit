import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";

import {
  createGuard,
  getAllGuards,
  deleteGuard,
} from "../services/api";

const AdminGuards = () => {
  const { token } = useAuth();

  const [guards, setGuards] =
    useState([]);

  const [loadingGuards, setLoadingGuards] =
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
  });

  // ==========================================
  // LOAD GUARDS
  // ==========================================

  const loadGuards = async () => {
    try {
      setLoadingGuards(true);

      const data =
        await getAllGuards(token);

      setGuards(
        data.guards || []
      );
    } catch (error) {
      console.error(
        "Load guards error:",
        error
      );

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
    const {
      name,
      value,
    } = event.target;

    setForm(
      (currentForm) => ({
        ...currentForm,
        [name]: value,
      })
    );
  };

  // ==========================================
  // CREATE GUARD
  // ==========================================

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    try {
      setLoading(true);

      const data =
        await createGuard({
          token,
          name: form.name,
          email: form.email,
          password:
            form.password,
          phone: form.phone,
        });

      setSuccess(
        `Guard ${data.guard.name} created successfully.`
      );

      setForm({
        name: "",
        email: "",
        password: "",
        phone: "",
      });

      await loadGuards();
    } catch (error) {
      console.error(
        "Create guard error:",
        error
      );

      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // DELETE GUARD
  // ==========================================

  const handleDelete = async (
    guard
  ) => {
    const confirmed =
      window.confirm(
        `Are you sure you want to remove ${guard.name}?`
      );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      setDeletingId(
        guard.id
      );

      await deleteGuard({
        token,
        id: guard.id,
      });

      setSuccess(
        `${guard.name} was removed successfully.`
      );

      setGuards(
        (currentGuards) =>
          currentGuards.filter(
            (item) =>
              item.id !== guard.id
          )
      );
    } catch (error) {
      console.error(
        "Delete guard error:",
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
            Guard Management
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
            CREATE GUARD
        ====================================== */}

        <section className="history-card">

          <div className="section-header">

            <div>

              <p className="small-text">
                Administration
              </p>

              <h2>
                Create Guard
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

            <div className="form-group">

              <label htmlFor="name">
                Full Name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                placeholder="Enter guard name"
                value={form.name}
                onChange={
                  handleChange
                }
                required
              />

            </div>

            <div className="form-group">

              <label htmlFor="email">
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter guard email"
                value={form.email}
                onChange={
                  handleChange
                }
                required
              />

            </div>

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
                onChange={
                  handleChange
                }
              />

            </div>

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
                onChange={
                  handleChange
                }
                minLength={8}
                required
              />

            </div>

            <button
              type="submit"
              className="primary-button"
              disabled={loading}
            >
              {loading
                ? "Creating Guard..."
                : "Create Guard"}
            </button>

          </form>

        </section>

        {/* ======================================
            EXISTING GUARDS
        ====================================== */}

        <section className="history-card">

          <div className="section-header">

            <div>

              <p className="small-text">
                Administration
              </p>

              <h2>
                Existing Guards
              </h2>

            </div>

          </div>

          {loadingGuards && (
            <p className="history-empty">
              Loading guards...
            </p>
          )}

          {!loadingGuards &&
            guards.length === 0 && (
              <p className="history-empty">
                No guards have been
                created yet.
              </p>
            )}

          {!loadingGuards &&
            guards.length > 0 && (

              <div className="history-list">

                {guards.map(
                  (guard) => (

                    <div
                      className="history-item"
                      key={guard.id}
                    >

                      <div className="history-details">

                        <h3>
                          {guard.name}
                        </h3>

                        <p>
                          Email:{" "}
                          {guard.email}
                        </p>

                        {guard.phone && (
                          <p>
                            Phone:{" "}
                            {guard.phone}
                          </p>
                        )}

                        <p>
                          Role:{" "}
                          {guard.role}
                        </p>

                      </div>

                      <div className="history-action">

                        <button
                          type="button"
                          className="logout-button"
                          onClick={() =>
                            handleDelete(
                              guard
                            )
                          }
                          disabled={
                            deletingId ===
                            guard.id
                          }
                        >
                          {deletingId ===
                          guard.id
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
                Guard Permissions
              </h2>

            </div>

          </div>

          <div className="admin-info-list">

            <p>
              • Guards can search
              for active hostels.
            </p>

            <p>
              • Guards can view
              students belonging
              to the selected
              hostel.
            </p>

            <p>
              • Guards can view
              student entry and
              exit status.
            </p>

            <p>
              • Guards do not
              require device
              verification.
            </p>

            <p>
              • Only Admin can
              create or remove
              Guards.
            </p>

          </div>

        </section>

      </main>

    </div>
  );
};

export default AdminGuards;