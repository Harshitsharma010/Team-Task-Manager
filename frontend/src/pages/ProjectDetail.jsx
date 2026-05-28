import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import TaskModal from "../components/TaskModal";
import "./ProjectDetail.css";

const COLUMNS = [
  { key: "todo", label: "To Do", tone: "blue" },
  { key: "inprogress", label: "In Progress", tone: "blue" },
  { key: "review", label: "Review", tone: "amber" },
  { key: "done", label: "Done", tone: "green" },
];

function isOverdue(task) {
  return task.due_date && task.status !== "done" && new Date(task.due_date) < new Date();
}

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function TaskCard({ task, isAdmin, onEdit, onDelete, onDragStart }) {
  return (
    <article
      className={`board-task ${isOverdue(task) ? "board-task--overdue" : ""}`}
      draggable
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", task.id);
        onDragStart(task.id);
      }}
      onClick={() => onEdit(task)}
    >
      <div className="board-task__top">
        <span className={`priority-badge priority-${task.priority}`}>{task.priority}</span>
        {isAdmin && (
          <button className="task-delete" onClick={(event) => { event.stopPropagation(); onDelete(task.id); }} aria-label="Delete task">
            ×
          </button>
        )}
      </div>
      <h3>{task.title}</h3>
      {task.description && <p>{task.description}</p>}
      <div className="board-task__meta">
        {task.assigned_name ? (
          <span className="avatar" style={{ background: task.assigned_color || "#67d8ff" }} title={task.assigned_name}>
            {task.assigned_name[0]}
          </span>
        ) : <span className="status-pill">Unassigned</span>}
        <span className={isOverdue(task) ? "status-pill rose" : "muted"}>
          {isOverdue(task) ? "Overdue" : formatDate(task.due_date) || "No date"}
        </span>
        {task.comment_count > 0 && <span className="chip">{task.comment_count} notes</span>}
      </div>
    </article>
  );
}

function AddMemberForm({ projectId, onAdded }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAdd = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post(`/projects/${projectId}/members`, { email });
      setEmail("");
      onAdded();
    } catch (err) {
      setError(err.response?.data?.message || "User not found.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="member-add" onSubmit={handleAdd}>
      <div>
        <span className="eyebrow">Invite member</span>
        <h3>Add a teammate</h3>
      </div>
      {error && <div className="alert-error">{error}</div>}
      <div className="member-add__row">
        <input className="input" type="email" placeholder="colleague@company.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
        <button className="btn-primary" type="submit" disabled={loading}>{loading ? <span className="spinner" /> : "Add"}</button>
      </div>
    </form>
  );
}

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("board");
  const [query, setQuery] = useState("");
  const [modalTask, setModalTask] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [projectRes, taskRes, memberRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/projects/${id}/tasks`),
        api.get(`/projects/${id}/members`),
      ]);
      setProject(projectRes.data);
      setTasks(taskRes.data);
      setMembers(memberRes.data);
    } catch (err) {
      if (err.response?.status === 404) navigate("/projects");
      else setError("Failed to load project workspace.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let alive = true;
    Promise.all([
      api.get(`/projects/${id}`),
      api.get(`/projects/${id}/tasks`),
      api.get(`/projects/${id}/members`),
    ])
      .then(([projectRes, taskRes, memberRes]) => {
        if (!alive) return;
        setProject(projectRes.data);
        setTasks(taskRes.data);
        setMembers(memberRes.data);
      })
      .catch((err) => {
        if (!alive) return;
        if (err.response?.status === 404) navigate("/projects");
        else setError("Failed to load project workspace.");
      })
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [id, navigate]);

  const isAdmin = useMemo(() => members.some((member) => (
    member.user_id?.toString() === user?.id?.toString() && member.role === "admin"
  )), [members, user?.id]);

  const filteredTasks = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tasks;
    return tasks.filter((task) => [
      task.title,
      task.description,
      task.assigned_name,
      task.priority,
      task.status,
    ].filter(Boolean).some((value) => value.toLowerCase().includes(q)));
  }, [tasks, query]);

  const grouped = useMemo(() => COLUMNS.reduce((acc, column) => {
    acc[column.key] = filteredTasks.filter((task) => task.status === column.key);
    return acc;
  }, {}), [filteredTasks]);

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((current) => current.filter((task) => task.id !== taskId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete task.");
    }
  };

  const handleDrop = async (status) => {
    if (!dragging) return;
    const previous = tasks;
    setTasks((current) => current.map((task) => task.id === dragging ? { ...task, status } : task));
    setDragging(null);
    try {
      await api.patch(`/tasks/${dragging}`, { status });
    } catch (err) {
      setTasks(previous);
      alert(err.response?.data?.message || "Failed to move task.");
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm("Remove this member?")) return;
    try {
      await api.delete(`/projects/${id}/members/${memberId}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove member.");
    }
  };

  if (loading) {
    return <div className="detail-loading"><span className="spinner" /></div>;
  }

  if (error) return <div className="alert-error">{error}</div>;

  return (
    <div className="project-detail page-enter">
      <section className="detail-hero">
        <div className="detail-hero__main">
          <button className="detail-back" onClick={() => navigate("/projects")}>Back to projects</button>
          <div className="detail-title-row">
            <span className="detail-color" style={{ background: project?.color || "#67d8ff" }} />
            <div>
              <span className="eyebrow">Project workspace</span>
              <h2>{project?.name}</h2>
              {project?.description && <p>{project.description}</p>}
            </div>
          </div>
        </div>
        <div className="detail-actions">
          <span className={`status-pill ${isAdmin ? "green" : "blue"}`}>{isAdmin ? "Admin" : "Member"}</span>
          {isAdmin && <button className="btn-primary" onClick={() => setModalTask({})}>Add task</button>}
        </div>
      </section>

      <div className="detail-tabs" role="tablist">
        <button className={tab === "board" ? "active" : ""} onClick={() => setTab("board")}>Board</button>
        <button className={tab === "members" ? "active" : ""} onClick={() => setTab("members")}>Team ({members.length})</button>
      </div>

      {tab === "board" && (
        <>
          <div className="board-toolbar">
            <input className="input" type="search" placeholder="Search by title, owner, priority, or status" value={query} onChange={(event) => setQuery(event.target.value)} />
            <span className="chip">{filteredTasks.length} tasks</span>
          </div>

          <section className="kanban-board" aria-label="Project Kanban board">
            {COLUMNS.map((column) => (
              <div
                className="kanban-col"
                key={column.key}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => handleDrop(column.key)}
              >
                <div className="kanban-col__header">
                  <div>
                    <h3>{column.label}</h3>
                    <span className={`status-pill ${column.tone}`}>{grouped[column.key]?.length || 0}</span>
                  </div>
                  {isAdmin && <button onClick={() => setModalTask({ status: column.key })} aria-label={`Add ${column.label} task`}>+</button>}
                </div>
                <div className="kanban-col__cards">
                  {grouped[column.key]?.length ? grouped[column.key].map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      isAdmin={isAdmin}
                      onEdit={setModalTask}
                      onDelete={handleDeleteTask}
                      onDragStart={setDragging}
                    />
                  )) : <div className="kanban-empty">No tasks here</div>}
                </div>
              </div>
            ))}
          </section>
        </>
      )}

      {tab === "members" && (
        <section className="members-grid">
          <div className="members-list">
            {members.map((member) => (
              <article className="member-row" key={member.user_id}>
                <span className="avatar" style={{ background: member.avatar_color }}>{member.name[0]}</span>
                <div>
                  <strong>{member.name}</strong>
                  <span>{member.email}</span>
                </div>
                <span className={`status-pill ${member.role === "admin" ? "green" : "blue"}`}>{member.role}</span>
                {isAdmin && member.user_id?.toString() !== user?.id?.toString() && (
                  <button className="btn-ghost" onClick={() => handleRemoveMember(member.user_id)}>Remove</button>
                )}
              </article>
            ))}
          </div>
          {isAdmin && <AddMemberForm projectId={id} onAdded={load} />}
        </section>
      )}

      {modalTask !== null && (
        <TaskModal
          task={modalTask}
          projectId={id}
          members={members}
          isAdmin={isAdmin}
          currentUser={user}
          onClose={() => setModalTask(null)}
          onSaved={() => { setModalTask(null); load(); }}
        />
      )}
    </div>
  );
}
