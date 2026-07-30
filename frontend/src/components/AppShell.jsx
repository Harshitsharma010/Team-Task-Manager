import { useEffect, useState } from "react";
import { NavLink, useNavigate, Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./AppShell.css";

const NAV = [
  {
    to: "/dashboard",
    label: "Dashboard",
    meta: "Workspace overview",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    to: "/projects",
    label: "Projects",
    meta: "Team workspaces",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      </svg>
    ),
  },
  {
    to: "/tasks",
    label: "My Tasks",
    meta: "Assigned to you",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
];

const PAGE_TITLES = {
  "/dashboard": "Dashboard",
  "/projects": "Projects",
  "/tasks": "My Tasks",
};

export default function AppShell() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === "Escape") setMobileOpen(false);
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [mobileOpen]);

  if (loading) {
    return (
      <div className="shell-loader" aria-label="Loading workspace" role="status">
        <span />
        <span />
        <span />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const initials = user?.name
    ? user.name.split(" ").map((name) => name[0]).join("").slice(0, 2).toUpperCase()
    : "NX";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const currentTitle = PAGE_TITLES[location.pathname] || "Project";

  return (
    <div className="shell">
      <a className="skip-link" href="#main-content">Skip to content</a>

      {mobileOpen && (
        <button
          className="shell-mobile-overlay"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`shell-sidebar ${mobileOpen ? "open" : ""}`} id="workspace-navigation">
        <div className="shell-brand">
          <span className="brand-mark" aria-hidden="true">N</span>
          <div>
            <strong>Nexus</strong>
            <span>Team workspace</span>
          </div>
          {user.demo && <span className="status-pill blue">Demo</span>}
        </div>

        <nav className="shell-nav" aria-label="Main navigation">
          <span className="shell-nav__section-label">Workspace</span>
          {NAV.map(({ to, label, meta, icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `shell-nav__item${isActive ? " shell-nav__item--active" : ""}`}
            >
              <span className="shell-nav__icon" aria-hidden="true">{icon}</span>
              <span className="shell-nav__text">
                <strong>{label}</strong>
                <small>{meta}</small>
              </span>
            </NavLink>
          ))}
        </nav>

        <div className="shell-user">
          <div className="avatar" style={{ background: user?.avatar_color || "#167a5b" }} aria-label={user?.name}>
            {initials}
          </div>
          <div className="shell-user__info">
            <span className="shell-user__name">{user?.name}</span>
            <span className="shell-user__role">{user.demo ? "Demo admin" : "Workspace member"}</span>
          </div>
          <button className="shell-user__logout" onClick={handleLogout} aria-label="Sign out" title="Sign out">
            <svg viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M5 7.5h8M10 4.5l3 3-3 3M9 2H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h6" />
            </svg>
          </button>
        </div>
      </aside>

      <div className="shell-content">
        <header className="shell-topbar">
          <div className="shell-topbar__left">
            <button
              className="shell-mobile-toggle"
              onClick={() => setMobileOpen((open) => !open)}
              aria-label="Toggle navigation"
              aria-controls="workspace-navigation"
              aria-expanded={mobileOpen}
            >
              <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                {mobileOpen ? <path d="M3 3l12 12M15 3 3 15" /> : <path d="M2 4h14M2 9h14M2 14h14" />}
              </svg>
            </button>
            <div>
              <span className="shell-topbar__breadcrumb">Team workspace</span>
              <h1>{currentTitle}</h1>
            </div>
          </div>
          <div className="shell-topbar__user">
            <div className="avatar-sm" style={{ background: user?.avatar_color || "#167a5b" }}>{initials}</div>
            <span>{user?.name?.split(" ")[0]}</span>
          </div>
        </header>

        <main className="shell-page" id="main-content" tabIndex="-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
