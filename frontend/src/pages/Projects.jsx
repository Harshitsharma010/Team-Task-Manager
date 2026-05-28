import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import "./Projects.css";

const PROJECT_COLORS = ["#67d8ff", "#4ade80", "#fbbf24", "#fb7185", "#a78bfa", "#38bdf8"];

function ProjectCard({ project }) {
  const progress = project.total_tasks > 0 ? Math.round((project.done_tasks / project.total_tasks) * 100) : 0;

  return (
    <Link to={`/projects/${project.id}`} className="project-card">
      <span className="project-card__bar" style={{ background: project.color }} />
      <div className="project-card__head">
        <span className={`status-pill ${project.role === "admin" ? "green" : "blue"}`}>{project.role}</span>
        <span className="chip">{project.member_count} members</span>
      </div>
      <div>
        <h3>{project.name}</h3>
        <p>{project.description || "No description yet."}</p>
      </div>
      <div className="project-card__bottom">
        <div className="project-progress">
          <i style={{ width: `${progress}%`, background: project.color }} />
        </div>
        <div className="project-card__meta">
          <span>{progress}% complete</span>
          <span>{project.total_tasks} tasks</span>
        </div>
      </div>
    </Link>
  );
}

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", description: "", color: PROJECT_COLORS[0] });

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/projects");
      setProjects(data);
    } catch {
      setError("Failed to load projects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let alive = true;
    api.get("/projects")
      .then(({ data }) => alive && setProjects(data))
      .catch(() => alive && setError("Failed to load projects."))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) return;
    setCreating(true);
    setError("");
    try {
      await api.post("/projects", form);
      setForm({ name: "", description: "", color: PROJECT_COLORS[0] });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create project.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="projects page-enter">
      <section className="projects-hero">
        <div>
          <span className="eyebrow">Workspaces</span>
          <h2>Projects with roles, progress, and team context.</h2>
          <p>Each project is a protected collaboration space with members, task workflow, and delivery state.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm((value) => !value)}>
          {showForm ? "Cancel" : "New project"}
        </button>
      </section>

      {showForm && (
        <form className="new-project-form" onSubmit={handleCreate}>
          <div className="field">
            <label>Project name</label>
            <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Website redesign" required />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="What is this project about?" />
          </div>
          <div>
            <p className="field-label">Color tag</p>
            <div className="color-picker">
              {PROJECT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`color-dot ${form.color === color ? "selected" : ""}`}
                  style={{ background: color }}
                  onClick={() => setForm((current) => ({ ...current, color }))}
                  aria-label={`Choose project color ${color}`}
                />
              ))}
            </div>
          </div>
          <button className="btn-primary" type="submit" disabled={creating}>{creating ? <span className="spinner" /> : "Create project"}</button>
        </form>
      )}

      {error && <div className="alert-error">{error}</div>}

      {loading ? (
        <div className="projects-grid">
          <div className="skeleton project-skeleton" />
          <div className="skeleton project-skeleton" />
          <div className="skeleton project-skeleton" />
        </div>
      ) : projects.length ? (
        <div className="projects-grid">
          {projects.map((project) => <ProjectCard key={project.id} project={project} />)}
        </div>
      ) : (
        <div className="projects-empty">
          <span className="status-pill blue">Empty</span>
          <h3>No projects yet</h3>
          <p>Create a project to start a protected workspace with tasks and members.</p>
        </div>
      )}
    </div>
  );
}
