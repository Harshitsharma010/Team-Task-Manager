const DB_KEY = "nexus_mock_db_v1";
const MOSS = "#317a4f";
const GOLD = "#a36a00";
const LEAF = "#3e8a55";
const PLUM = "#8253a6";

const demoUsers = [
  { id: "u_admin", name: "Aisha Sharma", email: "demo.admin@nexus.dev", password: "nexus-demo", avatar_color: MOSS, demo: true },
  { id: "u_dev", name: "Dev Kapoor", email: "demo.dev@nexus.dev", password: "nexus-demo", avatar_color: GOLD, demo: true },
  { id: "u_maya", name: "Maya Rao", email: "demo.maya@nexus.dev", password: "nexus-demo", avatar_color: LEAF, demo: true },
  { id: "u_rohan", name: "Rohan Patel", email: "demo.rohan@nexus.dev", password: "nexus-demo", avatar_color: PLUM, demo: true },
];

const daysFromNow = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(12, 0, 0, 0);
  return date.toISOString();
};

const createSeedDb = () => ({
  users: demoUsers.map((user) => ({ ...user })),
  projects: [
    {
      id: "p_demo",
      name: "Nexus Hiring Demo",
      description: "A recruiter-ready workspace showing RBAC, analytics, Kanban workflow, comments, and overdue tracking.",
      color: MOSS,
      created_by: "u_admin",
      members: [
        { user: "u_admin", role: "admin", joinedAt: daysFromNow(-12) },
        { user: "u_dev", role: "member", joinedAt: daysFromNow(-11) },
        { user: "u_maya", role: "member", joinedAt: daysFromNow(-10) },
        { user: "u_rohan", role: "member", joinedAt: daysFromNow(-9) },
      ],
    },
  ],
  tasks: [
    {
      id: "t_1",
      project: "p_demo",
      title: "Surface overdue detection in dashboard metrics",
      description: "Expose overdue risk and due-soon counts so the dashboard feels operational.",
      status: "review",
      priority: "high",
      due_date: daysFromNow(-2),
      assigned_to: "u_maya",
      created_by: "u_admin",
      updatedAt: daysFromNow(-1),
    },
    {
      id: "t_2",
      project: "p_demo",
      title: "QA drag-and-drop persistence across project board",
      description: "Persist status changes and reflect movement in dashboard analytics.",
      status: "inprogress",
      priority: "medium",
      due_date: daysFromNow(0),
      assigned_to: "u_admin",
      created_by: "u_admin",
      updatedAt: daysFromNow(0),
    },
    {
      id: "t_3",
      project: "p_demo",
      title: "Add protected route fallback for expired sessions",
      description: "Redirect safely while preserving the user's intended destination.",
      status: "todo",
      priority: "high",
      due_date: daysFromNow(3),
      assigned_to: "u_dev",
      created_by: "u_admin",
      updatedAt: daysFromNow(1),
    },
    {
      id: "t_4",
      project: "p_demo",
      title: "Improve project member invitation empty state",
      description: "Make the member flow explain next steps when a workspace is quiet.",
      status: "inprogress",
      priority: "low",
      due_date: daysFromNow(5),
      assigned_to: "u_rohan",
      created_by: "u_admin",
      updatedAt: daysFromNow(1),
    },
    {
      id: "t_5",
      project: "p_demo",
      title: "Document admin/member role rules in onboarding",
      description: "Show why only admins can create, assign, and remove project tasks.",
      status: "todo",
      priority: "medium",
      due_date: daysFromNow(7),
      assigned_to: "u_admin",
      created_by: "u_admin",
      updatedAt: daysFromNow(2),
    },
    {
      id: "t_6",
      project: "p_demo",
      title: "Ship responsive My Tasks filter view",
      description: "Turn task rows into scan-friendly cards on small screens.",
      status: "done",
      priority: "low",
      due_date: daysFromNow(-1),
      assigned_to: "u_maya",
      created_by: "u_admin",
      updatedAt: daysFromNow(-1),
    },
    {
      id: "t_7",
      project: "p_demo",
      title: "Review deployment copy for recruiter demo flow",
      description: "Make the first-run experience explain the engineering signal quickly.",
      status: "review",
      priority: "high",
      due_date: daysFromNow(1),
      assigned_to: "u_dev",
      created_by: "u_admin",
      updatedAt: daysFromNow(0),
    },
    {
      id: "t_8",
      project: "p_demo",
      title: "Create activity timeline for task discussions",
      description: "Capture comments so tasks feel like collaboration objects, not static cards.",
      status: "done",
      priority: "medium",
      due_date: daysFromNow(-4),
      assigned_to: "u_rohan",
      created_by: "u_admin",
      updatedAt: daysFromNow(-3),
    },
  ],
  comments: [
    {
      id: "c_1",
      task: "t_1",
      project: "p_demo",
      author: "u_admin",
      body: "This is the card recruiters should notice first: analytics, overdue state, and a real review workflow.",
      created_at: daysFromNow(-1),
    },
    {
      id: "c_2",
      task: "t_1",
      project: "p_demo",
      author: "u_maya",
      body: "Dashboard copy updated. The next pass should confirm mobile spacing and empty states.",
      created_at: daysFromNow(0),
    },
    {
      id: "c_3",
      task: "t_2",
      project: "p_demo",
      author: "u_dev",
      body: "Drag movement should optimistically update the UI and then persist through the API.",
      created_at: daysFromNow(0),
    },
  ],
});

const readDb = () => {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    localStorage.removeItem(DB_KEY);
  }
  const db = createSeedDb();
  writeDb(db);
  return db;
};

const writeDb = (db) => {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};

const parseBody = (data) => {
  if (!data) return {};
  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch {
      return {};
    }
  }
  return data;
};

const id = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;

const currentUser = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    return user?.id || null;
  } catch {
    return null;
  }
};

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  avatar_color: user.avatar_color,
  demo: Boolean(user.demo),
});

const userById = (db, userId) => db.users.find((user) => user.id === userId);
const projectById = (db, projectId) => db.projects.find((project) => project.id === projectId);
const taskById = (db, taskId) => db.tasks.find((task) => task.id === taskId);

const userProjectIds = (db, userId) => db.projects
  .filter((project) => project.members.some((member) => member.user === userId))
  .map((project) => project.id);

const decorateTask = (db, task) => {
  const assigned = userById(db, task.assigned_to);
  const project = projectById(db, task.project);
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    due_date: task.due_date,
    project_id: task.project,
    project_name: project?.name || "Unknown",
    project_color: project?.color,
    assigned_to: assigned?.id || null,
    assigned_name: assigned?.name || null,
    assigned_color: assigned?.avatar_color || null,
    created_by: task.created_by,
    updated_at: task.updatedAt,
    comment_count: db.comments.filter((comment) => comment.task === task.id).length,
  };
};

const dashboard = (db, userId) => {
  const projectIds = userProjectIds(db, userId);
  const tasks = db.tasks.filter((task) => projectIds.includes(task.project));
  const now = new Date();
  const weekOut = new Date();
  weekOut.setDate(weekOut.getDate() + 7);
  const overdueTasks = tasks.filter((task) => task.due_date && task.status !== "done" && new Date(task.due_date) < now);
  const assignedCounts = tasks.reduce((acc, task) => {
    if (task.assigned_to) acc[task.assigned_to] = (acc[task.assigned_to] || 0) + 1;
    return acc;
  }, {});

  return {
    totalTasks: tasks.length,
    done: tasks.filter((task) => task.status === "done").length,
    inProgress: tasks.filter((task) => task.status === "inprogress").length,
    review: tasks.filter((task) => task.status === "review").length,
    todo: tasks.filter((task) => task.status === "todo").length,
    overdue: overdueTasks.length,
    dueSoon: tasks.filter((task) => task.due_date && task.status !== "done" && new Date(task.due_date) >= now && new Date(task.due_date) <= weekOut).length,
    perUser: Object.entries(assignedCounts).map(([memberId, task_count]) => {
      const user = userById(db, memberId);
      return { id: memberId, name: user?.name || "Team member", avatar_color: user?.avatar_color || MOSS, task_count };
    }),
    overdueTasks: overdueTasks.map((task) => ({
      id: task.id,
      title: task.title,
      priority: task.priority,
      due_date: task.due_date,
      project_name: projectById(db, task.project)?.name || "Unknown",
    })),
    recentActivity: db.comments
      .filter((comment) => projectIds.includes(comment.project))
      .slice()
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 4)
      .map((comment) => {
        const author = userById(db, comment.author);
        const task = taskById(db, comment.task);
        return {
          id: comment.id,
          type: "comment",
          body: comment.body,
          created_at: comment.created_at,
          author_name: author?.name || "Team member",
          author_color: author?.avatar_color || MOSS,
          task_title: task?.title || "Task",
          task_status: task?.status || "todo",
        };
      }),
  };
};

const response = (config, data, status = 200) => ({
  data,
  status,
  statusText: status >= 400 ? "Error" : "OK",
  headers: { "x-nexus-local-fallback": "true" },
  config,
  request: null,
});

const errorResponse = (config, message, status = 400) => {
  const err = new Error(message);
  err.response = response(config, { message }, status);
  throw err;
};

export function shouldUseMockFallback(error) {
  if (!import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCK_FALLBACK !== "true") return false;
  return !error.response || error.response.status === 502 || error.code === "ERR_NETWORK";
}

export async function mockRequest(config) {
  const db = readDb();
  const method = (config.method || "get").toLowerCase();
  const body = parseBody(config.data);
  const path = new URL(config.url || "", "http://nexus.local").pathname.replace(/^\/api/, "");
  const userId = currentUser() || "u_admin";

  if (method === "post" && path === "/auth/demo") {
    const seeded = createSeedDb();
    writeDb(seeded);
    const user = seeded.users[0];
    return response(config, { token: `mock-token-${user.id}`, user: publicUser(user) });
  }

  if (method === "post" && path === "/auth/signup") {
    if (!body.name || !body.email || !body.password) errorResponse(config, "Name, email and password are required", 400);
    if (db.users.some((user) => user.email.toLowerCase() === body.email.toLowerCase())) errorResponse(config, "Email already registered", 400);
    const user = {
      id: id("u"),
      name: body.name,
      email: body.email.toLowerCase(),
      password: body.password,
      avatar_color: body.avatar_color || MOSS,
    };
    db.users.push(user);
    writeDb(db);
    return response(config, { token: `mock-token-${user.id}`, user: publicUser(user) }, 201);
  }

  if (method === "post" && path === "/auth/login") {
    const user = db.users.find((item) => item.email.toLowerCase() === body.email?.toLowerCase());
    if (!user || user.password !== body.password) errorResponse(config, "Invalid email or password", 400);
    return response(config, { token: `mock-token-${user.id}`, user: publicUser(user) });
  }

  if (method === "get" && path === "/dashboard") {
    return response(config, dashboard(db, userId));
  }

  if (method === "get" && path === "/projects") {
    const data = db.projects
      .filter((project) => project.members.some((member) => member.user === userId))
      .map((project) => {
        const projectTasks = db.tasks.filter((task) => task.project === project.id);
        const membership = project.members.find((member) => member.user === userId);
        return {
          id: project.id,
          name: project.name,
          description: project.description,
          color: project.color,
          role: membership?.role || "member",
          total_tasks: projectTasks.length,
          done_tasks: projectTasks.filter((task) => task.status === "done").length,
          member_count: project.members.length,
        };
      });
    return response(config, data);
  }

  if (method === "post" && path === "/projects") {
    const project = {
      id: id("p"),
      name: body.name,
      description: body.description || "",
      color: body.color || MOSS,
      created_by: userId,
      members: [{ user: userId, role: "admin", joinedAt: new Date().toISOString() }],
    };
    db.projects.push(project);
    writeDb(db);
    return response(config, {
      id: project.id,
      name: project.name,
      description: project.description,
      color: project.color,
      role: "admin",
      total_tasks: 0,
      done_tasks: 0,
      member_count: 1,
    }, 201);
  }

  const projectMatch = path.match(/^\/projects\/([^/]+)$/);
  if (method === "get" && projectMatch) {
    const project = projectById(db, projectMatch[1]);
    if (!project) errorResponse(config, "Project not found", 404);
    return response(config, {
      id: project.id,
      name: project.name,
      description: project.description,
      color: project.color,
      created_by: project.created_by,
    });
  }

  const membersMatch = path.match(/^\/projects\/([^/]+)\/members$/);
  if (method === "get" && membersMatch) {
    const project = projectById(db, membersMatch[1]);
    if (!project) errorResponse(config, "Project not found", 404);
    return response(config, project.members.map((member) => {
      const user = userById(db, member.user);
      return {
        user_id: user?.id,
        name: user?.name || "Team member",
        email: user?.email || "",
        avatar_color: user?.avatar_color || MOSS,
        role: member.role,
        joined_at: member.joinedAt,
      };
    }));
  }

  if (method === "post" && membersMatch) {
    const project = projectById(db, membersMatch[1]);
    if (!project) errorResponse(config, "Project not found", 404);
    let invited = db.users.find((user) => user.email.toLowerCase() === body.email?.toLowerCase());
    if (!invited) {
      invited = {
        id: id("u"),
        name: body.email?.split("@")[0] || "New teammate",
        email: body.email,
        password: "nexus-demo",
        avatar_color: PLUM,
      };
      db.users.push(invited);
    }
    if (!project.members.some((member) => member.user === invited.id)) {
      project.members.push({ user: invited.id, role: "member", joinedAt: new Date().toISOString() });
    }
    writeDb(db);
    return response(config, { message: "Member added" }, 201);
  }

  const removeMemberMatch = path.match(/^\/projects\/([^/]+)\/members\/([^/]+)$/);
  if (method === "delete" && removeMemberMatch) {
    const project = projectById(db, removeMemberMatch[1]);
    if (!project) errorResponse(config, "Project not found", 404);
    project.members = project.members.filter((member) => member.user !== removeMemberMatch[2]);
    writeDb(db);
    return response(config, { message: "Member removed" });
  }

  const projectTasksMatch = path.match(/^\/projects\/([^/]+)\/tasks$/);
  if (method === "get" && projectTasksMatch) {
    return response(config, db.tasks.filter((task) => task.project === projectTasksMatch[1]).map((task) => decorateTask(db, task)));
  }

  if (method === "post" && projectTasksMatch) {
    const task = {
      id: id("t"),
      project: projectTasksMatch[1],
      title: body.title,
      description: body.description || "",
      status: body.status || "todo",
      priority: body.priority || "medium",
      due_date: body.due_date || null,
      assigned_to: body.assigned_to || null,
      created_by: userId,
      updatedAt: new Date().toISOString(),
    };
    db.tasks.push(task);
    writeDb(db);
    return response(config, decorateTask(db, task), 201);
  }

  if (method === "get" && path === "/tasks/mine") {
    return response(config, db.tasks.filter((task) => task.assigned_to === userId).map((task) => decorateTask(db, task)));
  }

  const taskPatchMatch = path.match(/^\/tasks\/([^/]+)$/);
  if (method === "patch" && taskPatchMatch) {
    const task = taskById(db, taskPatchMatch[1]);
    if (!task) errorResponse(config, "Task not found", 404);
    Object.assign(task, {
      title: body.title ?? task.title,
      description: body.description ?? task.description,
      status: body.status ?? task.status,
      priority: body.priority ?? task.priority,
      due_date: body.due_date !== undefined ? body.due_date : task.due_date,
      assigned_to: body.assigned_to !== undefined ? body.assigned_to : task.assigned_to,
      updatedAt: new Date().toISOString(),
    });
    writeDb(db);
    return response(config, decorateTask(db, task));
  }

  if (method === "delete" && taskPatchMatch) {
    db.tasks = db.tasks.filter((task) => task.id !== taskPatchMatch[1]);
    db.comments = db.comments.filter((comment) => comment.task !== taskPatchMatch[1]);
    writeDb(db);
    return response(config, { message: "Task deleted" });
  }

  const commentsMatch = path.match(/^\/tasks\/([^/]+)\/comments$/);
  if (method === "get" && commentsMatch) {
    const comments = db.comments
      .filter((comment) => comment.task === commentsMatch[1])
      .slice()
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .map((comment) => {
        const author = userById(db, comment.author);
        return {
          id: comment.id,
          body: comment.body,
          created_at: comment.created_at,
          author_id: author?.id,
          author_name: author?.name || "Team member",
          author_color: author?.avatar_color || MOSS,
        };
      });
    return response(config, comments);
  }

  if (method === "post" && commentsMatch) {
    const task = taskById(db, commentsMatch[1]);
    if (!task) errorResponse(config, "Task not found", 404);
    const comment = {
      id: id("c"),
      task: task.id,
      project: task.project,
      author: userId,
      body: body.body,
      created_at: new Date().toISOString(),
    };
    db.comments.push(comment);
    writeDb(db);
    const author = userById(db, userId);
    return response(config, {
      id: comment.id,
      body: comment.body,
      created_at: comment.created_at,
      author_id: author?.id,
      author_name: author?.name || "Team member",
      author_color: author?.avatar_color || MOSS,
    }, 201);
  }

  errorResponse(config, `Local fallback route not implemented: ${method.toUpperCase()} ${path}`, 404);
}
