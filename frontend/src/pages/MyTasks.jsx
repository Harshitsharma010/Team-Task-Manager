import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import "./MyTasks.css";

const STATUS_OPTIONS = ["all", "todo", "inprogress", "review", "done"];
const STATUS_LABEL = {
  all: "All",
  todo: "To Do",
  inprogress: "In Progress",
  review: "Review",
  done: "Done",
};

function statusTone(status) {
  if (status === "done") return "green";
  if (status === "review") return "amber";
  if (status === "inprogress") return "blue";
  return "";
}

function isOverdue(task) {
  return task.due_date && task.status !== "done" && new Date(task.due_date) < new Date();
}

function formatDate(value) {
  if (!value) return "No due date";
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [priority, setPriority] = useState("all");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    api.get("/tasks/mine")
      .then(({ data }) => alive && setTasks(data))
      .catch(() => alive && setError("Failed to load your task queue."))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks.filter((task) => {
      const okStatus = filter === "all" || task.status === filter;
      const okPriority = priority === "all" || task.priority === priority;
      const okQuery = !q || [task.title, task.description, task.project_name, task.status, task.priority]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(q));
      return okStatus && okPriority && okQuery;
    });
  }, [tasks, filter, query, priority]);

  const handleStatusChange = async (taskId, status) => {
    const previous = tasks;
    setUpdating(taskId);
    setTasks((current) => current.map((task) => task.id === taskId ? { ...task, status } : task));
    try {
      await api.patch(`/tasks/${taskId}`, { status });
    } catch (err) {
      setTasks(previous);
      alert(err.response?.data?.message || "Failed to update status.");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="my-tasks page-enter">
      <section className="tasks-hero">
        <div>
          <span className="eyebrow">Personal queue</span>
          <h2>My Tasks</h2>
          <p>Search, filter, and update assigned work across every protected project you belong to.</p>
        </div>
        <span className="status-pill blue">{tasks.length} assigned</span>
      </section>

      <section className="tasks-toolbar">
        <input className="input" type="search" placeholder="Search task, project, status, or priority" value={query} onChange={(event) => setQuery(event.target.value)} />
        <select className="select" value={filter} onChange={(event) => setFilter(event.target.value)}>
          {STATUS_OPTIONS.map((status) => <option key={status} value={status}>{STATUS_LABEL[status]}</option>)}
        </select>
        <select className="select" value={priority} onChange={(event) => setPriority(event.target.value)}>
          <option value="all">All priority</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </section>

      <div className="filter-pills">
        {STATUS_OPTIONS.map((status) => (
          <button key={status} className={filter === status ? "active" : ""} onClick={() => setFilter(status)}>
            {STATUS_LABEL[status]}
            <span>{status === "all" ? tasks.length : tasks.filter((task) => task.status === status).length}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="tasks-list">
          <div className="skeleton task-skeleton" />
          <div className="skeleton task-skeleton" />
          <div className="skeleton task-skeleton" />
        </div>
      ) : error ? (
        <div className="alert-error">{error}</div>
      ) : filtered.length ? (
        <div className="tasks-list">
          {filtered.map((task) => (
            <article className={`task-row ${isOverdue(task) ? "task-row--overdue" : ""}`} key={task.id}>
              <div className="task-row__main">
                <span className="task-row__project">{task.project_name}</span>
                <h3>{task.title}</h3>
                {task.description && <p>{task.description}</p>}
                <div className="task-row__meta">
                  <span className={`priority-badge priority-${task.priority}`}>{task.priority}</span>
                  <span className={isOverdue(task) ? "status-pill rose" : "muted"}>{isOverdue(task) ? "Overdue" : formatDate(task.due_date)}</span>
                </div>
              </div>
              <select
                className={`status-select status-${task.status}`}
                value={task.status}
                onChange={(event) => handleStatusChange(task.id, event.target.value)}
                disabled={updating === task.id}
              >
                {STATUS_OPTIONS.filter((status) => status !== "all").map((status) => (
                  <option key={status} value={status}>{STATUS_LABEL[status]}</option>
                ))}
              </select>
              <span className={`status-pill ${statusTone(task.status)}`}>{STATUS_LABEL[task.status]}</span>
            </article>
          ))}
        </div>
      ) : (
        <div className="tasks-empty">
          <span className="status-pill blue">Empty</span>
          <h3>No tasks match that view</h3>
          <p>Clear search or switch filters. The queue stays honest instead of rendering a blank table.</p>
        </div>
      )}
    </div>
  );
}
