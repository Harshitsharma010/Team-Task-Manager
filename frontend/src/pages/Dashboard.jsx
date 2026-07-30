import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import "./Dashboard.css";

const STATUS_META = [
  { key: "todo", label: "To do", tone: "slate" },
  { key: "inProgress", label: "In progress", tone: "blue" },
  { key: "review", label: "In review", tone: "amber" },
  { key: "done", label: "Completed", tone: "green" },
];

function SkeletonBlock({ className = "" }) {
  return <div className={`skeleton dash-skeleton ${className}`} />;
}

function SummaryMetric({ label, value, detail, tone = "neutral" }) {
  return (
    <div className={`summary-metric summary-metric--${tone}`}>
      <span className="summary-metric__dot" aria-hidden="true" />
      <div>
        <span>{label}</span>
        <strong>{value ?? 0}</strong>
        <small>{detail}</small>
      </div>
    </div>
  );
}

function SegmentBar({ todo = 0, inProgress = 0, review = 0, done = 0 }) {
  const totalTasks = todo + inProgress + review + done;
  const total = totalTasks || 1;
  const pct = (value) => `${(value / total) * 100}%`;

  return (
    <div
      className="segment-track"
      role="img"
      aria-label={`${todo} to do, ${inProgress} in progress, ${review} in review, and ${done} completed`}
    >
      <span className="seg-todo" style={{ width: pct(todo) }} />
      <span className="seg-progress" style={{ width: pct(inProgress) }} />
      <span className="seg-review" style={{ width: pct(review) }} />
      <span className="seg-done" style={{ width: pct(done) }} />
    </div>
  );
}

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    api.get("/dashboard")
      .then((response) => alive && setStats(response.data))
      .catch(() => alive && setError("We could not load the workspace overview. Try refreshing the page."))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  const health = useMemo(() => {
    if (!stats?.totalTasks) return 0;
    return Math.round((stats.done / stats.totalTasks) * 100);
  }, [stats]);

  if (loading) {
    return (
      <div className="dashboard page-enter">
        <div className="dashboard-header">
          <div>
            <SkeletonBlock className="dash-skeleton-title" />
            <SkeletonBlock className="dash-skeleton-copy" />
          </div>
        </div>
        <SkeletonBlock className="dash-skeleton-summary" />
        <div className="dashboard-grid">
          <SkeletonBlock className="dash-skeleton-panel" />
          <SkeletonBlock className="dash-skeleton-panel" />
        </div>
      </div>
    );
  }

  if (error) return <div className="alert-error" role="alert">{error}</div>;

  const firstName = user?.name?.split(" ")[0] || "there";
  const totalTasks = stats.totalTasks || 0;
  const openTasks = Math.max(totalTasks - (stats.done || 0), 0);
  const maxWorkload = Math.max(...(stats.perUser || []).map((member) => member.task_count), 1);
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="dashboard page-enter">
      <section className="dashboard-header">
        <div>
          <p className="dashboard-date">{today}</p>
          <h2>{getGreeting()}, {firstName}</h2>
          <p>
            {openTasks
              ? `${openTasks} open ${openTasks === 1 ? "task" : "tasks"} across your workspace. Start with work that is overdue or waiting for review.`
              : "Your workspace is clear. Review completed work or start the next project."}
          </p>
        </div>
        <div className="dashboard-actions">
          <Link className="btn-ghost" to="/tasks">Open my tasks</Link>
          <Link className="btn-primary" to="/projects">View projects</Link>
        </div>
      </section>

      <section className="summary-band" aria-label="Workspace status summary">
        <div className="summary-progress">
          <div className="summary-progress__top">
            <div>
              <span>Workspace progress</span>
              <strong>{health}%</strong>
            </div>
            <span>{stats.done || 0} of {totalTasks} completed</span>
          </div>
          <div className="summary-progress__track" aria-hidden="true">
            <i style={{ width: `${health}%` }} />
          </div>
        </div>
        <SummaryMetric
          label="Overdue"
          value={stats.overdue}
          detail={stats.overdue ? "Needs attention" : "On schedule"}
          tone={stats.overdue ? "danger" : "success"}
        />
        <SummaryMetric
          label="Due soon"
          value={stats.dueSoon}
          detail="Next 7 days"
          tone="warning"
        />
        <SummaryMetric
          label="In review"
          value={stats.review}
          detail={stats.review ? "Waiting for a pass" : "Queue is clear"}
          tone="info"
        />
      </section>

      <section className="dashboard-grid">
        <article className="dashboard-panel delivery-panel">
          <header className="dashboard-panel__header">
            <div>
              <span>Delivery overview</span>
              <h3>Work by status</h3>
            </div>
            <span className="dashboard-panel__count">{totalTasks} total</span>
          </header>

          {totalTasks ? (
            <>
              <div className="delivery-focus">
                <div>
                  <strong>{openTasks}</strong>
                  <span>open {openTasks === 1 ? "task" : "tasks"}</span>
                </div>
                <p>{stats.inProgress || 0} actively moving, {stats.review || 0} waiting for review</p>
              </div>

              <SegmentBar
                todo={stats.todo || 0}
                inProgress={stats.inProgress || 0}
                review={stats.review || 0}
                done={stats.done || 0}
              />

              <div className="status-breakdown">
                {STATUS_META.map(({ key, label, tone }) => {
                  const value = stats[key] || 0;
                  const percentage = Math.round((value / totalTasks) * 100);
                  return (
                    <div className="status-breakdown__row" key={key}>
                      <span className={`status-key status-key--${tone}`} aria-hidden="true" />
                      <strong>{label}</strong>
                      <span>{value} {value === 1 ? "task" : "tasks"}</span>
                      <span>{percentage}%</span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="dashboard-empty">
              <strong>No tasks yet</strong>
              <p>Create a project task to start tracking delivery.</p>
              <Link to="/projects">Go to projects</Link>
            </div>
          )}
        </article>

        <article className="dashboard-panel attention-panel">
          <header className="dashboard-panel__header">
            <div>
              <span>Priority queue</span>
              <h3>Needs attention</h3>
            </div>
            <span className={`dashboard-panel__count ${stats.overdue ? "dashboard-panel__count--danger" : ""}`}>
              {stats.overdue || 0}
            </span>
          </header>

          <div className="attention-list">
            {stats.overdueTasks?.length ? stats.overdueTasks.slice(0, 4).map((task) => (
              <div className="attention-row" key={task.id}>
                <div>
                  <span>{task.project_name}</span>
                  <strong>{task.title}</strong>
                </div>
                <time dateTime={task.due_date}>{formatDate(task.due_date)}</time>
              </div>
            )) : (
              <div className="dashboard-empty dashboard-empty--compact">
                <span className="empty-check" aria-hidden="true">✓</span>
                <strong>No overdue work</strong>
                <p>Everything is currently on schedule.</p>
              </div>
            )}
          </div>

          <Link className="panel-link" to="/tasks">
            Review assigned tasks
            <span aria-hidden="true">→</span>
          </Link>
        </article>

        <article className="dashboard-panel workload-panel">
          <header className="dashboard-panel__header">
            <div>
              <span>Team capacity</span>
              <h3>Assigned workload</h3>
            </div>
            <span className="dashboard-panel__count">{stats.perUser?.length || 0} members</span>
          </header>

          <div className="workload-list">
            {stats.perUser?.length ? stats.perUser
              .slice()
              .sort((a, b) => b.task_count - a.task_count)
              .map((member) => {
                const percentage = Math.max((member.task_count / maxWorkload) * 100, 8);
                return (
                  <div className="workload-row" key={member.id}>
                    <span className="avatar" style={{ background: member.avatar_color }}>{member.name[0]}</span>
                    <div className="workload-row__person">
                      <strong>{member.name}</strong>
                      <span>{member.task_count} assigned</span>
                    </div>
                    <div className="workload-track" aria-label={`${member.name} has ${member.task_count} assigned tasks`}>
                      <i style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              }) : (
                <div className="dashboard-empty dashboard-empty--compact">
                  <strong>No assigned work</strong>
                  <p>Assign a task to see team capacity.</p>
                </div>
              )}
          </div>
        </article>

        <article className="dashboard-panel activity-panel">
          <header className="dashboard-panel__header">
            <div>
              <span>Recent collaboration</span>
              <h3>Team activity</h3>
            </div>
          </header>

          <div className="activity-list">
            {stats.recentActivity?.length ? stats.recentActivity.map((item) => (
              <div className="activity-row" key={item.id}>
                <span className="avatar-sm" style={{ background: item.author_color }}>
                  {item.author_name[0]}
                </span>
                <div>
                  <p><strong>{item.author_name}</strong> commented</p>
                  <blockquote>{item.body}</blockquote>
                  <span>{item.task_title}</span>
                </div>
              </div>
            )) : (
              <div className="dashboard-empty dashboard-empty--compact">
                <strong>No recent activity</strong>
                <p>Task comments will appear here.</p>
              </div>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
