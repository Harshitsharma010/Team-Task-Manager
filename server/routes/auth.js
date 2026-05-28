const router  = require("express").Router();
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");
const { User, Project, Task, Comment } = require("../initDB");

// ─── Helper: generate JWT ─────────────────────────────────────
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const demoUsers = [
  { key: "admin", name: "Aisha Sharma", email: "demo.admin@nexus.dev", avatar_color: "#38bdf8" },
  { key: "dev", name: "Dev Kapoor", email: "demo.dev@nexus.dev", avatar_color: "#fbbf24" },
  { key: "maya", name: "Maya Rao", email: "demo.maya@nexus.dev", avatar_color: "#34d399" },
  { key: "rohan", name: "Rohan Patel", email: "demo.rohan@nexus.dev", avatar_color: "#a78bfa" },
];

const daysFromNow = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(12, 0, 0, 0);
  return date;
};

async function upsertDemoUser({ name, email, avatar_color }) {
  const hashed = await bcrypt.hash("nexus-demo", 10);
  return User.findOneAndUpdate(
    { email },
    { name, email, avatar_color, password: hashed },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
}

async function seedDemoWorkspace() {
  const users = {};
  for (const user of demoUsers) {
    users[user.key] = await upsertDemoUser(user);
  }

  const project = await Project.findOneAndUpdate(
    { name: "Nexus Hiring Demo", created_by: users.admin._id },
    {
      name: "Nexus Hiring Demo",
      description: "A recruiter-ready workspace showing RBAC, analytics, Kanban workflow, comments, and overdue tracking.",
      color: "#38bdf8",
      created_by: users.admin._id,
      members: [
        { user: users.admin._id, role: "admin" },
        { user: users.dev._id, role: "member" },
        { user: users.maya._id, role: "member" },
        { user: users.rohan._id, role: "member" },
      ],
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  const oldTasks = await Task.find({ project: project._id }).select("_id").lean();
  await Comment.deleteMany({ task: { $in: oldTasks.map((task) => task._id) } });
  await Task.deleteMany({ project: project._id });

  const taskSpecs = [
    {
      title: "Surface overdue detection in dashboard metrics",
      description: "Expose overdue risk and due-soon counts so the dashboard feels operational.",
      status: "review",
      priority: "high",
      due_date: daysFromNow(-2),
      assigned_to: users.maya._id,
    },
    {
      title: "QA drag-and-drop persistence across project board",
      description: "Persist status changes and reflect movement in dashboard analytics.",
      status: "inprogress",
      priority: "medium",
      due_date: daysFromNow(0),
      assigned_to: users.admin._id,
    },
    {
      title: "Add protected route fallback for expired sessions",
      description: "Redirect safely while preserving the user's intended destination.",
      status: "todo",
      priority: "high",
      due_date: daysFromNow(3),
      assigned_to: users.dev._id,
    },
    {
      title: "Improve project member invitation empty state",
      description: "Make the member flow explain next steps when a workspace is quiet.",
      status: "inprogress",
      priority: "low",
      due_date: daysFromNow(5),
      assigned_to: users.rohan._id,
    },
    {
      title: "Document admin/member role rules in onboarding",
      description: "Show why only admins can create, assign, and remove project tasks.",
      status: "todo",
      priority: "medium",
      due_date: daysFromNow(7),
      assigned_to: users.admin._id,
    },
    {
      title: "Ship responsive My Tasks filter view",
      description: "Turn task rows into scan-friendly cards on small screens.",
      status: "done",
      priority: "low",
      due_date: daysFromNow(-1),
      assigned_to: users.maya._id,
    },
    {
      title: "Review deployment copy for recruiter demo flow",
      description: "Make the first-run experience explain the engineering signal quickly.",
      status: "review",
      priority: "high",
      due_date: daysFromNow(1),
      assigned_to: users.dev._id,
    },
    {
      title: "Create activity timeline for task discussions",
      description: "Capture comments so tasks feel like collaboration objects, not static cards.",
      status: "done",
      priority: "medium",
      due_date: daysFromNow(-4),
      assigned_to: users.rohan._id,
    },
  ];

  const tasks = await Task.insertMany(taskSpecs.map((task) => ({
    ...task,
    project: project._id,
    created_by: users.admin._id,
  })));

  await Comment.insertMany([
    {
      task: tasks[0]._id,
      project: project._id,
      author: users.admin._id,
      body: "This is the card recruiters should notice first: analytics, overdue state, and a real review workflow.",
    },
    {
      task: tasks[0]._id,
      project: project._id,
      author: users.maya._id,
      body: "Dashboard copy updated. The next pass should confirm mobile spacing and empty states.",
    },
    {
      task: tasks[1]._id,
      project: project._id,
      author: users.dev._id,
      body: "Drag movement should optimistically update the UI and then persist through the API.",
    },
  ]);

  return users.admin;
}

// ─── POST /api/auth/signup ────────────────────────────────────
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, avatar_color } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "Name, email and password are required" });

    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      avatar_color: avatar_color || "#6366f1",
    });

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id:           user._id.toString(),
        name:         user.name,
        email:        user.email,
        avatar_color: user.avatar_color,
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ─── POST /api/auth/login ─────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ message: "Invalid email or password" });

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id:           user._id.toString(),
        name:         user.name,
        email:        user.email,
        avatar_color: user.avatar_color,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/demo", async (req, res) => {
  try {
    const user = await seedDemoWorkspace();
    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id:           user._id.toString(),
        name:         user.name,
        email:        user.email,
        avatar_color: user.avatar_color,
        demo:         true,
      },
    });
  } catch (err) {
    console.error("Demo login error:", err);
    res.status(500).json({ message: "Could not prepare demo workspace" });
  }
});

module.exports = router;
