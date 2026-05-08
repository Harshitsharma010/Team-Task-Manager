import { useState } from "react";
import { NavLink, useNavigate, Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./AppShell.css";

const NAV = [
  {
    to: "/dashboard", label: "Overview", icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
      </svg>
    )
  },
  {
    to: "/projects", label: "Projects", icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
      </svg>
    )
  },
  {
    to: "/tasks", label: "My Tasks", icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
      </svg>
    )
  },
];

const PAGE_TITLES = {
  "/dashboard": "Overview",
  "/projects": "Projects",
  "/tasks": "My Tasks",
};

export default function AppShell() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) return (
    <div className="shell-loader">
      <span className="shell-loader__dot" />
      <span className="shell-loader__dot" />
      <span className="shell-loader__dot" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;

  const initials = user?.name
    ? user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const handleLogout = () => { logout(); navigate("/login"); };

  const currentTitle = PAGE_TITLES[location.pathname] || "Nexus";

  return (
    <div className="shell">
      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div className="shell-mobile-overlay" onClick={() => setMobileOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`shell-sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="shell-brand">
          <div className="shell-brand__mark">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L18 6V14L10 18L2 14V6L10 2Z" fill="none" stroke="var(--cyan)" strokeWidth="1.5"/>
              <path d="M10 6L14 8.5V13.5L10 16L6 13.5V8.5L10 6Z" fill="var(--cyan)" opacity="0.4"/>
            </svg>
          </div>
          <span className="shell-brand__name">Nexus</span>
          <span className="shell-brand__version">v2</span>
        </div>

        <nav className="shell-nav" role="navigation" aria-label="Main navigation">
          <span className="shell-nav__section-label">Workspace</span>
          {NAV.map(({ to, label, icon }) => (
            <NavLink
              key={to} to={to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `shell-nav__item${isActive ? " shell-nav__item--active" : ""}`
              }
            >
              <span className="shell-nav__icon" aria-hidden="true">{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="shell-user">
          <div className="avatar" style={{ background: user?.avatar_color || "#38bdf8" }} aria-label={user?.name}>
            {initials}
          </div>
          <div className="shell-user__info">
            <span className="shell-user__name">{user?.name}</span>
            <span className="shell-user__role">member</span>
          </div>
          <button className="shell-user__logout" onClick={handleLogout} aria-label="Sign out">
            <svg width="13" height="13" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 7.5h8M10 4.5l3 3-3 3M9 2H3a1 1 0 00-1 1v9a1 1 0 001 1h6"/>
            </svg>
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="shell-content">
        <header className="shell-topbar">
          <div className="shell-topbar__left">
            <button className="shell-mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8">
                {mobileOpen ? <path d="M3 3l12 12M15 3L3 15"/> : <path d="M2 4h14M2 9h14M2 14h14"/>}
              </svg>
            </button>
            <span className="shell-topbar__breadcrumb">nexus / {currentTitle.toLowerCase()}</span>
          </div>
          <div className="shell-topbar__right">
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div className="avatar avatar--sm" style={{ background: user?.avatar_color || "#38bdf8" }}>
                {initials}
              </div>
              <span style={{ fontSize: "0.82rem", color: "var(--fg-2)", fontWeight: 500 }}>
                {user?.name?.split(" ")[0]}
              </span>
            </div>
          </div>
        </header>

        <main className="shell-page" id="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
