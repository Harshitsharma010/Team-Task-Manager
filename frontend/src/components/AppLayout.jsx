import { useState, useEffect } from "react";
import { Navigate, Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./AppLayout.css";

const NAV = [
  { to: "/dashboard", label: "Overview",  short: "OVR" },
  { to: "/projects",  label: "Projects",  short: "PRJ" },
  { to: "/tasks",     label: "My Tasks",  short: "TSK" },
];

export default function AppLayout() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  if (loading) return (
    <div className="app-boot">
      <div className="app-boot__logo">
        <span className="app-boot__mark" />
        <span>NEXUS</span>
      </div>
      <span className="spinner" />
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;

  const initials = user?.name
    ? user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div className="app-shell">
      {/* ── Command Bar ── */}
      <header className={`cmdbar ${scrolled ? "cmdbar--elevated" : ""}`}>
        <div className="cmdbar__left">
          <div className="cmdbar__logo">
            <span className="cmdbar__logo-mark" />
            <span className="cmdbar__logo-text">NEXUS</span>
          </div>
          <div className="cmdbar__sep" />
          <nav className="cmdbar__nav">
            {NAV.map(({ to, label, short }) => (
              <NavLink key={to} to={to} className={({ isActive }) =>
                "cmdbar__link" + (isActive ? " cmdbar__link--active" : "")
              }>
                <span className="cmdbar__link-label">{label}</span>
                <span className="cmdbar__link-short">{short}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="cmdbar__right">
          <div className="cmdbar__user" onClick={() => setMenuOpen(!menuOpen)}>
            <div className="avatar" style={{ background: user?.avatar_color || "#00d9e8" }}>
              {initials}
            </div>
            <span className="cmdbar__username">{user?.name?.split(" ")[0]}</span>
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
              <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>

          {menuOpen && (
            <>
              <div className="cmdbar__overlay" onClick={() => setMenuOpen(false)} />
              <div className="cmdbar__dropdown">
                <div className="cmdbar__dropdown-user">
                  <div className="avatar avatar--lg" style={{ background: user?.avatar_color || "#00d9e8" }}>
                    {initials}
                  </div>
                  <div>
                    <p className="cmdbar__dd-name">{user?.name}</p>
                    <p className="cmdbar__dd-role mono">member</p>
                  </div>
                </div>
                <div className="divider" style={{ margin: "0.5rem 0" }} />
                <button className="cmdbar__dd-item cmdbar__dd-item--danger" onClick={handleLogout}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button className="cmdbar__mobile-btn" onClick={() => setMenuOpen(!menuOpen)}>
          <span className={`cmdbar__hamburger ${menuOpen ? "open" : ""}`} />
        </button>
      </header>

      {/* ── Mobile nav drawer ── */}
      {menuOpen && (
        <div className="mobile-drawer">
          <nav className="mobile-drawer__nav">
            {NAV.map(({ to, label }) => (
              <NavLink key={to} to={to} className={({ isActive }) =>
                "mobile-drawer__link" + (isActive ? " active" : "")
              }>
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="divider" />
          <div className="mobile-drawer__user">
            <div className="avatar" style={{ background: user?.avatar_color || "#00d9e8" }}>{initials}</div>
            <span>{user?.name}</span>
          </div>
          <button className="mobile-drawer__logout" onClick={handleLogout}>Sign out</button>
        </div>
      )}

      {/* ── Page canvas ── */}
      <main className="app-canvas">
        <Outlet />
      </main>
    </div>
  );
}
