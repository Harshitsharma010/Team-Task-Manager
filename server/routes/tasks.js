const router = require("express").Router();
const auth   = require("../middleware/auth");
const { Task, Project, Comment } = require("../initDB");

// ─── Helper ───────────────────────────────────────────────────
const isProjectAdmin = (project, userId) =>
  project.members.some(
    (m) => m.user.toString() === userId.toString() && m.role === "admin"
  );

const isProjectMember = (project, userId) =>
  project.members.some((m) => m.user.toString() === userId.toString());

const VALID_STATUS = ["todo", "inprogress", "review", "done"];

// ─── GET /api/tasks/mine ──────────────────────────────────────
// Get all tasks assigned to the logged-in user
router.get("/mine", auth, async (req, res) => {
  try {
    const tasks = await Task.find({ assigned_to: req.user._id })
      .populate("project", "name color")
      .populate("assigned_to", "name avatar_color")
      .lean();

    const result = tasks.map((t) => ({
      id:           t._id,
      title:        t.title,
      description:  t.description,
      status:       t.status,
      priority:     t.priority,
      due_date:     t.due_date,
      project_id:   t.project?._id,
      project_name: t.project?.name || "Unknown",
      project_color: t.project?.color,
    }));

    res.json(result);
  } catch (err) {
    console.error("Get my tasks error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/tasks/:id/comments
// Project members can read discussion history for a task
router.get("/:id/comments", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).lean();
    if (!task) return res.status(404).json({ message: "Task not found" });

    const project = await Project.findById(task.project).lean();
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (!isProjectMember(project, req.user._id))
      return res.status(403).json({ message: "Access denied" });

    const comments = await Comment.find({ task: task._id })
      .sort({ createdAt: -1 })
      .populate("author", "name avatar_color")
      .lean();

    res.json(comments.map((comment) => ({
      id: comment._id.toString(),
      body: comment.body,
      created_at: comment.createdAt,
      author_id: comment.author?._id?.toString(),
      author_name: comment.author?.name || "Team member",
      author_color: comment.author?.avatar_color || "#38bdf8",
    })));
  } catch (err) {
    console.error("Get comments error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/tasks/:id/comments
// Project members can add comments to keep task context with the work
router.post("/:id/comments", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const project = await Project.findById(task.project);
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (!isProjectMember(project, req.user._id))
      return res.status(403).json({ message: "Access denied" });

    const body = req.body.body?.trim();
    if (!body) return res.status(400).json({ message: "Comment cannot be empty" });

    const comment = await Comment.create({
      task: task._id,
      project: project._id,
      author: req.user._id,
      body,
    });

    const populated = await comment.populate("author", "name avatar_color");

    res.status(201).json({
      id: populated._id.toString(),
      body: populated.body,
      created_at: populated.createdAt,
      author_id: populated.author?._id?.toString(),
      author_name: populated.author?.name || "Team member",
      author_color: populated.author?.avatar_color || "#38bdf8",
    });
  } catch (err) {
    console.error("Create comment error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ─── PATCH /api/tasks/:id ─────────────────────────────────────
// Admin: update anything | Member: update only status of their own task
router.patch("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const project = await Project.findById(task.project);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const admin = isProjectAdmin(project, req.user._id);
    const isAssigned = task.assigned_to?.toString() === req.user._id.toString();

    // Must be admin OR assigned member
    if (!admin && !isAssigned)
      return res.status(403).json({ message: "Access denied" });

    if (admin) {
      // Admin can update everything
      const { title, description, status, priority, due_date, assigned_to } = req.body;
      if (title)       task.title       = title;
      if (description !== undefined) task.description = description;
      if (status) {
        if (!VALID_STATUS.includes(status))
          return res.status(400).json({ message: "Invalid task status" });
        task.status = status;
      }
      if (priority)    task.priority    = priority;
      if (due_date     !== undefined) task.due_date    = due_date || null;
      if (assigned_to  !== undefined) task.assigned_to = assigned_to || null;
    } else {
      // Member can only update status
      if (req.body.status) {
        if (!VALID_STATUS.includes(req.body.status))
          return res.status(400).json({ message: "Invalid task status" });
        task.status = req.body.status;
      }
    }

    await task.save();
    const updated = await task.populate("assigned_to", "name avatar_color");

    res.json({
      id:             updated._id,
      title:          updated.title,
      description:    updated.description,
      status:         updated.status,
      priority:       updated.priority,
      due_date:       updated.due_date,
      assigned_to:    updated.assigned_to?._id || null,
      assigned_name:  updated.assigned_to?.name || null,
      assigned_color: updated.assigned_to?.avatar_color || null,
    });
  } catch (err) {
    console.error("Update task error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ─── DELETE /api/tasks/:id ────────────────────────────────────
// Only admins can delete tasks
router.delete("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const project = await Project.findById(task.project);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (!isProjectAdmin(project, req.user._id))
      return res.status(403).json({ message: "Only admins can delete tasks" });

    await Comment.deleteMany({ task: task._id });
    await task.deleteOne();
    res.json({ message: "Task deleted" });
  } catch (err) {
    console.error("Delete task error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
