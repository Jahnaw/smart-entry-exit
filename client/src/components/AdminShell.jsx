import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/admin.css";

const AdminShell = ({
  title,
  subtitle,
  portalType = "admin", // "admin" | "warden" | "guard"
  hostelInfo,
  children,
}) => {
  const { student, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const getInitials = (name) => {
    if (!name) return "AD";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const adminNavItems = [
    {
      label: "Dashboard",
      path: "/admin/dashboard",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="7" height="7" x="3" y="3" rx="1" />
          <rect width="7" height="7" x="14" y="3" rx="1" />
          <rect width="7" height="7" x="14" y="14" rx="1" />
          <rect width="7" height="7" x="3" y="14" rx="1" />
        </svg>
      ),
    },
    {
      label: "Gate Management",
      path: "/admin/gates",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 21h18" />
          <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
          <path d="M9 10h.01" />
          <path d="M15 10h.01" />
          <path d="M9 14h.01" />
          <path d="M15 14h.01" />
        </svg>
      ),
    },
    {
      label: "Students",
      path: "/admin/students",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      label: "Attendance Logs",
      path: "/admin/attendance",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 2v4" />
          <path d="M16 2v4" />
          <rect width="18" height="18" x="3" y="4" rx="2" />
          <path d="M3 10h18" />
          <path d="m9 16 2 2 4-4" />
        </svg>
      ),
    },
    {
      label: "Wardens",
      path: "/admin/wardens",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
          <polygon points="12 2 15 8 9 8" fill="currentColor" stroke="none" opacity="0.3"/>
        </svg>
      ),
    },
    {
      label: "Guards",
      path: "/admin/guards",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      ),
    },
  ];

  const wardenNavItems = [
    {
      label: "Dashboard",
      path: "/warden/dashboard",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="7" height="7" x="3" y="3" rx="1" />
          <rect width="7" height="7" x="14" y="3" rx="1" />
          <rect width="7" height="7" x="14" y="14" rx="1" />
          <rect width="7" height="7" x="3" y="14" rx="1" />
        </svg>
      ),
    },
    {
      label: "Hostel Students",
      path: "/warden/students",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      label: "Attendance Records",
      path: "/warden/attendance",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 2v4" />
          <path d="M16 2v4" />
          <rect width="18" height="18" x="3" y="4" rx="2" />
          <path d="M3 10h18" />
          <path d="m9 16 2 2 4-4" />
        </svg>
      ),
    },
  ];

  const guardNavItems = [
    {
      label: "Gate Station",
      path: "/guard/dashboard",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      ),
    },
  ];

  let navItems = adminNavItems;
  let portalTitle = "Admin Portal";
  let roleLabel = "Administrator";

  if (portalType === "warden") {
    navItems = wardenNavItems;
    portalTitle = "Warden Portal";
    roleLabel = "Hostel Warden";
  } else if (portalType === "guard") {
    navItems = guardNavItems;
    portalTitle = "Guard Portal";
    roleLabel = "Campus Guard";
  }

  return (
    <div className="admin-app">
      {/* Mobile Overlay */}
      <div
        className={`admin-sidebar-overlay ${mobileOpen ? "open" : ""}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`admin-sidebar ${mobileOpen ? "open" : ""}`}>
        {/* Brand Header */}
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-logo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="7" height="7" x="3" y="3" rx="1.5" />
              <rect width="7" height="7" x="14" y="3" rx="1.5" />
              <rect width="7" height="7" x="14" y="14" rx="1.5" />
              <rect width="7" height="7" x="3" y="14" rx="1.5" />
            </svg>
          </div>
          <div className="admin-sidebar-brand-text">
            <h2 className="admin-sidebar-title">SmartEntry</h2>
            <span className="admin-sidebar-portal-tag">{portalTitle}</span>
          </div>
        </div>

        {/* User Card */}
        <div className="admin-sidebar-user">
          <div className="admin-user-avatar">
            {getInitials(student?.name)}
          </div>
          <h3 className="admin-user-name">{student?.name || "Portal User"}</h3>
          {hostelInfo && (
            <span style={{ fontSize: "11.5px", color: "var(--admin-text-secondary)", marginTop: "2px" }}>
              {hostelInfo}
            </span>
          )}
          <span className="admin-user-role-badge">{roleLabel}</span>
        </div>

        {/* Navigation Links */}
        <nav className="admin-sidebar-nav">
          <span className="admin-nav-heading">Main Navigation</span>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`admin-nav-item ${isActive ? "active" : ""}`}
                onClick={() => setMobileOpen(false)}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Logout */}
        <div className="admin-sidebar-footer">
          <button className="admin-logout-btn" onClick={logout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" x2="9" y1="12" y2="12" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="admin-main-area">
        {/* Topbar */}
        <header className="admin-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <button
              className="admin-mobile-toggle"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" x2="21" y1="6" y2="6" />
                <line x1="3" x2="21" y1="12" y2="12" />
                <line x1="3" x2="21" y1="18" y2="18" />
              </svg>
            </button>

            <div className="admin-topbar-left">
              <h1 className="admin-topbar-title">{title}</h1>
              {subtitle && (
                <div className="admin-topbar-breadcrumb">
                  {subtitle}
                </div>
              )}
            </div>
          </div>

          <div className="admin-topbar-right">
            <div className="admin-topbar-pill">
              <span className="admin-topbar-pill-dot" />
              <span>Live System</span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="admin-content-container">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminShell;
