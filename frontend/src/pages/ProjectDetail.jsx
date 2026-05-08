import React, { Component } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import TaskModal from "../components/TaskModal";
import "./ProjectDetail.css";

const COLUMNS = [
  { key: "todo",       label: "To Do",      dot: "dot-todo" },
  { key: "inprogress", label: "In Progress", dot: "dot-progress" },
  { key: "done",       label: "Done",        dot: "dot-done" },
];

function TaskCard({ task, isAdmin, onEdit, onDelete }) {
  const overdue = task.due_date && task.status !== "done" && new Date(task.due_date) < new Date();
  return (
    <div className="task-card" onClick={() => onEdit(task)}>
      <div className="task-card__top">
        <span className={`priority-badge priority-${task.priority}`}>{task.priority}</span>
        {isAdmin && (
          <button className="task-card__del"
            onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}>✕</button>
        )}
      </div>
      <p className="task-card__title">{task.title}</p>
      {task.description && <p className="task-card__desc">{task.description}</p>}
      <div className="task-card__footer">
        {task.assigned_name && (
          <span className="task-card__avatar"
            style={{ background: task.assigned_color || "#38bdf8" }}
            title={task.assigned_name}>
            {task.assigned_name[0].toUpperCase()}
          </span>
        )}
        {task.due_date && (
          <span className={`task-card__due ${overdue ? "task-card__due--overdue" : ""}`}>
            {overdue ? "⚑ " : ""}
            {new Date(task.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </span>
        )}
      </div>
    </div>
  );
}

class AddMemberForm extends Component {
  constructor(props) {
    super(props);
    this.state = { email: "", loading: false, error: "" };
    this.handleAdd = this.handleAdd.bind(this);
  }

  async handleAdd(e) {
    e.preventDefault();
    this.setState({ error: "", loading: true });
    try {
      await api.post(`/projects/${this.props.projectId}/members`, { email: this.state.email });
      this.setState({ email: "" });
      this.props.onAdded();
    } catch (err) {
      this.setState({ error: err.response?.data?.message || "User not found." });
    } finally {
      this.setState({ loading: false });
    }
  }

  render() {
    const { email, loading, error } = this.state;
    return (
      <div className="add-member-form">
        <h4>Add a team member</h4>
        {error && <div className="alert-error" style={{ marginBottom: "0.75rem" }}>{error}</div>}
        <form onSubmit={this.handleAdd}>
          <div className="add-member-row">
            <input
              type="email" placeholder="colleague@company.com" value={email}
              onChange={(e) => this.setState({ email: e.target.value })} required
            />
            <button type="submit" className="btn-accent" disabled={loading}>
              {loading ? <span className="spinner" /> : "Add"}
            </button>
          </div>
        </form>
      </div>
    );
  }
}

function ProjectDetail(props) {
  const { id }   = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  return <ProjectDetailClass id={id} user={user} navigate={navigate} {...props} />;
}

class ProjectDetailClass extends Component {
  constructor(props) {
    super(props);
    this.state = {
      project: null, tasks: [], members: [],
      loading: true, modalTask: null, tab: "board",
    };
    this.load               = this.load.bind(this);
    this.handleDeleteTask   = this.handleDeleteTask.bind(this);
    this.handleRemoveMember = this.handleRemoveMember.bind(this);
  }

  componentDidMount() { this.load(); }

  componentDidUpdate(prevProps) {
    if (prevProps.id !== this.props.id) this.load();
  }

  async load() {
    try {
      const [pRes, tRes, mRes] = await Promise.all([
        api.get(`/projects/${this.props.id}`),
        api.get(`/projects/${this.props.id}/tasks`),
        api.get(`/projects/${this.props.id}/members`),
      ]);
      this.setState({ project: pRes.data, tasks: tRes.data, members: mRes.data });
    } catch (err) {
      if (err.response?.status === 404) this.props.navigate("/projects");
    } finally {
      this.setState({ loading: false });
    }
  }

  async handleDeleteTask(taskId) {
    if (!window.confirm("Delete this task?")) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      this.setState((prev) => ({ tasks: prev.tasks.filter((x) => x.id !== taskId) }));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete task.");
    }
  }

  async handleRemoveMember(memberId) {
    if (!window.confirm("Remove this member?")) return;
    try {
      await api.delete(`/projects/${this.props.id}/members/${memberId}`);
      this.load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove member.");
    }
  }

  render() {
    const { user, id } = this.props;
    const { project, tasks, members, loading, modalTask, tab } = this.state;

    const isAdmin = members.find(
      (m) => m.user_id?.toString() === user?.id?.toString() ||
             m.user_id?.toString() === user?._id?.toString()
    )?.role === "admin";

    const grouped = COLUMNS.reduce((acc, col) => {
      acc[col.key] = tasks.filter((t) => t.status === col.key);
      return acc;
    }, {});

    if (loading) return (
      <div className="detail-loading">
        <span className="spinner" style={{ width: 28, height: 28, borderWidth: 2 }} />
      </div>
    );

    return (
      <div className="project-detail page-enter">
        {/* ── Header ── */}
        <div className="detail-header">
          <div className="detail-header__left">
            <div
              className="detail-color-dot"
              style={{ background: project?.color, color: project?.color }}
            />
            <div className="detail-header__text">
              <button className="detail-back" onClick={() => this.props.navigate("/projects")}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M8 2L4 6l4 4"/>
                </svg>
                Projects
              </button>
              <h1 className="detail-title">{project?.name}</h1>
              {project?.description && <p className="detail-desc">{project.description}</p>}
            </div>
          </div>
          <div className="detail-header__actions">
            {isAdmin && (
              <button className="btn-accent" onClick={() => this.setState({ modalTask: {} })}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="6" y1="1" x2="6" y2="11"/><line x1="1" y1="6" x2="11" y2="6"/>
                </svg>
                Add Task
              </button>
            )}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="detail-tabs">
          <button
            className={`detail-tab ${tab === "board" ? "detail-tab--active" : ""}`}
            onClick={() => this.setState({ tab: "board" })}
          >Board</button>
          <button
            className={`detail-tab ${tab === "members" ? "detail-tab--active" : ""}`}
            onClick={() => this.setState({ tab: "members" })}
          >Team ({members.length})</button>
        </div>

        {/* ── Board ── */}
        {tab === "board" && (
          <div className="kanban-board">
            {COLUMNS.map((col) => (
              <div key={col.key} className="kanban-col">
                <div className="kanban-col__header">
                  <div className="kanban-col__title-row">
                    <span className={`kanban-col__dot ${col.dot}`} />
                    <span className="kanban-col__label">{col.label}</span>
                    <span className="kanban-col__count">{grouped[col.key].length}</span>
                  </div>
                  {isAdmin && (
                    <button className="kanban-col__add"
                      onClick={() => this.setState({ modalTask: { status: col.key } })}
                      title={`Add to ${col.label}`}
                    >+</button>
                  )}
                </div>
                <div className="kanban-col__cards">
                  {grouped[col.key].length === 0 && (
                    <div className="kanban-col__empty">
                      <span>No tasks</span>
                    </div>
                  )}
                  {grouped[col.key].map((t) => (
                    <TaskCard key={t.id} task={t} isAdmin={isAdmin}
                      onEdit={(task) => this.setState({ modalTask: task })}
                      onDelete={this.handleDeleteTask} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Members ── */}
        {tab === "members" && (
          <div className="detail-members">
            <div className="members-list">
              {members.map((m) => (
                <div key={m.user_id} className="member-row">
                  <div className="avatar" style={{ background: m.avatar_color }}>
                    {m.name[0].toUpperCase()}
                  </div>
                  <div className="member-row__info">
                    <span className="member-row__name">{m.name}</span>
                    <span className="member-row__email">{m.email}</span>
                  </div>
                  <span className={`member-row__badge member-row__badge--${m.role}`}>{m.role}</span>
                  {isAdmin && m.user_id?.toString() !== user?.id?.toString() && (
                    <button className="member-row__remove" onClick={() => this.handleRemoveMember(m.user_id)}>
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            {isAdmin && <AddMemberForm projectId={id} onAdded={this.load} />}
          </div>
        )}

        {/* ── Modal ── */}
        {modalTask !== null && (
          <TaskModal
            task={modalTask} projectId={id} members={members}
            isAdmin={isAdmin} currentUser={user}
            onClose={() => this.setState({ modalTask: null })}
            onSaved={() => { this.setState({ modalTask: null }); this.load(); }}
          />
        )}
      </div>
    );
  }
}

export default ProjectDetail;
