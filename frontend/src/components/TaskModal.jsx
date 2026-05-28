import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import "./TaskModal.css";

const STATUS_OPTIONS = [
  { value: "todo", label: "To Do" },
  { value: "inprogress", label: "In Progress" },
  { value: "review", label: "Review" },
  { value: "done", label: "Done" },
];

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

function formatDate(value) {
  if (!value) return "No due date";
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function TaskModal({ task, projectId, members, isAdmin, currentUser, onClose, onSaved }) {
  const isNew = !task?.id;
  const currentUserId = currentUser?.id || currentUser?._id;
  const canEdit = isAdmin || task?.assigned_to?.toString() === currentUserId?.toString();
  const [form, setForm] = useState({
    title: task?.title || "",
    description: task?.description || "",
    status: task?.status || "todo",
    priority: task?.priority || "medium",
    due_date: task?.due_date ? task.due_date.slice(0, 10) : "",
    assigned_to: task?.assigned_to || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");
  const [commentSaving, setCommentSaving] = useState(false);

  const assignedMember = useMemo(
    () => members.find((member) => member.user_id?.toString() === form.assigned_to?.toString()),
    [members, form.assigned_to]
  );

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    let alive = true;
    if (!isNew) {
      api.get(`/tasks/${task.id}/comments`)
        .then((response) => alive && setComments(response.data))
        .catch(() => alive && setComments([]));
    }
    return () => { alive = false; };
  }, [isNew, task?.id]);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = {
        ...form,
        assigned_to: form.assigned_to || null,
        due_date: form.due_date || null,
      };
      if (isNew) {
        await api.post(`/projects/${projectId}/tasks`, payload);
      } else {
        await api.patch(`/tasks/${task.id}`, isAdmin ? payload : { status: form.status });
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save task.");
    } finally {
      setSaving(false);
    }
  };

  const handleComment = async (event) => {
    event.preventDefault();
    if (!comment.trim() || isNew) return;
    setCommentSaving(true);
    try {
      const { data } = await api.post(`/tasks/${task.id}/comments`, { body: comment.trim() });
      setComments((current) => [data, ...current]);
      setComment("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add comment.");
    } finally {
      setCommentSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <section className="task-modal" role="dialog" aria-modal="true" aria-labelledby="task-modal-title">
        <header className="task-modal__head">
          <div>
            <span className="eyebrow">{isNew ? "Create task" : "Task detail"}</span>
            <h2 id="task-modal-title">{isNew ? "New task" : form.title}</h2>
            {!isNew && <p>{assignedMember?.name || "Unassigned"} · {formatDate(form.due_date || task?.due_date)}</p>}
          </div>
          <button className="task-modal__close" onClick={onClose} aria-label="Close task modal">×</button>
        </header>

        {error && <div className="alert-error task-modal__error">{error}</div>}

        <form className="task-modal__body" onSubmit={handleSubmit}>
          <div className="task-modal__main">
            <div className="field">
              <label>Title</label>
              <input name="title" value={form.title} onChange={handleChange} required disabled={!isNew && !isAdmin} />
            </div>

            <div className="field">
              <label>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Add context, acceptance notes, or implementation details"
                disabled={!isNew && !isAdmin}
              />
            </div>

            {!isNew && (
              <section className="comments-panel">
                <div className="panel-head compact">
                  <div>
                    <span className="eyebrow">Activity</span>
                    <h3>Comments and timeline</h3>
                  </div>
                  <span className="chip">{comments.length}</span>
                </div>
                <div className="comment-form">
                  <textarea
                    className="textarea"
                    placeholder="Add a note for the team"
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                  />
                  <button className="btn-primary" type="button" onClick={handleComment} disabled={commentSaving || !comment.trim()}>
                    {commentSaving ? <span className="spinner" /> : "Post comment"}
                  </button>
                </div>
                <div className="comment-list">
                  {comments.length ? comments.map((item) => (
                    <article className="comment-item" key={item.id}>
                      <span className="avatar" style={{ background: item.author_color }}>{item.author_name?.[0] || "N"}</span>
                      <div>
                        <strong>{item.author_name}</strong>
                        <p>{item.body}</p>
                        <small>{new Date(item.created_at).toLocaleString()}</small>
                      </div>
                    </article>
                  )) : <p className="empty-copy">No comments yet. Add context so the task tells its story.</p>}
                </div>
              </section>
            )}
          </div>

          <aside className="task-modal__side">
            <div className="field">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange} disabled={!canEdit}>
                {STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Priority</label>
              <select name="priority" value={form.priority} onChange={handleChange} disabled={!isNew && !isAdmin}>
                {PRIORITY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Due date</label>
              <input type="date" name="due_date" value={form.due_date} onChange={handleChange} disabled={!isNew && !isAdmin} />
            </div>
            <div className="field">
              <label>Assign to</label>
              <select name="assigned_to" value={form.assigned_to} onChange={handleChange} disabled={!isNew && !isAdmin}>
                <option value="">Unassigned</option>
                {members.map((member) => <option key={member.user_id} value={member.user_id}>{member.name}</option>)}
              </select>
            </div>
            <div className="role-card">
              <span className="eyebrow">Role access</span>
              <h3>{isAdmin ? "Admin controls enabled" : canEdit ? "Status updates enabled" : "Read-only task"}</h3>
              <p>{isAdmin ? "Admins can edit task metadata, assignment, dates, and priority." : "Members can update assigned task status and add comments."}</p>
            </div>
          </aside>

          {canEdit && (
            <footer className="task-modal__footer">
              <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? <span className="spinner" /> : isNew ? "Create task" : "Save changes"}
              </button>
            </footer>
          )}
        </form>
      </section>
    </div>
  );
}
