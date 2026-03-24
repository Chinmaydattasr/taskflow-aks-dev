const API_BASE = window.location.origin;
const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const taskTemplate = document.getElementById("taskTemplate");
const emptyState = document.getElementById("emptyState");
const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const pendingTasks = document.getElementById("pendingTasks");
const overdueTasks = document.getElementById("overdueTasks");
const taskCountLabel = document.getElementById("taskCountLabel");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const priorityFilter = document.getElementById("priorityFilter");
const refreshBtn = document.getElementById("refreshBtn");
const clearCompletedBtn = document.getElementById("clearCompletedBtn");

let tasks = [];

function formatDate(dateString) {
  if (!dateString) return "No due date";
  return new Date(dateString).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function isOverdue(task) {
  return task.status !== "Completed" && task.due_date && new Date(task.due_date) < new Date(new Date().toDateString());
}

function renderStats() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === "Completed").length;
  const pending = tasks.filter(t => t.status !== "Completed").length;
  const overdue = tasks.filter(isOverdue).length;
  totalTasks.textContent = total;
  completedTasks.textContent = completed;
  pendingTasks.textContent = pending;
  overdueTasks.textContent = overdue;
}

function getFilteredTasks() {
  const search = searchInput.value.trim().toLowerCase();
  return tasks.filter(task => {
    const text = [task.title, task.description || "", task.owner || "", task.priority].join(" ").toLowerCase();
    const matchesSearch = text.includes(search);
    const matchesStatus = statusFilter.value === "all" || task.status === statusFilter.value;
    const matchesPriority = priorityFilter.value === "all" || task.priority === priorityFilter.value;
    return matchesSearch && matchesStatus && matchesPriority;
  });
}

function renderTasks() {
  const filtered = getFilteredTasks();
  taskList.innerHTML = "";
  emptyState.style.display = filtered.length ? "none" : "block";
  taskCountLabel.textContent = `${filtered.length} task${filtered.length === 1 ? "" : "s"} loaded`;

  filtered.forEach(task => {
    const node = taskTemplate.content.cloneNode(true);
    const card = node.querySelector(".task-card");
    const priority = node.querySelector(".priority-badge");
    const status = node.querySelector(".status-badge");
    const date = node.querySelector(".task-date");
    const title = node.querySelector(".task-title");
    const description = node.querySelector(".task-description");
    const owner = node.querySelector(".task-owner");
    const created = node.querySelector(".task-created");
    const progressBtn = node.querySelector(".progress-btn");
    const completeBtn = node.querySelector(".complete-btn");
    const deleteBtn = node.querySelector(".delete-btn");

    priority.textContent = task.priority;
    priority.classList.add(`priority-${task.priority.toLowerCase()}`);
    status.textContent = task.status;
    status.classList.add(`status-${task.status.toLowerCase().replace(/\s+/g, '-')}`);
    date.textContent = formatDate(task.due_date);
    title.textContent = task.title;
    description.textContent = task.description || "No description added.";
    owner.textContent = `Owner: ${task.owner || "Not assigned"}`;
    created.textContent = `Created: ${formatDate(task.created_at)}`;

    if (isOverdue(task)) {
      card.style.outline = "1px solid rgba(239,68,68,.45)";
    }

    progressBtn.addEventListener("click", async () => {
      const nextStatus = task.status === "Pending" ? "In Progress" : task.status === "In Progress" ? "Completed" : "Pending";
      await updateTask(task.id, { ...task, status: nextStatus });
    });

    completeBtn.addEventListener("click", async () => {
      await updateTask(task.id, { ...task, status: "Completed" });
    });

    deleteBtn.addEventListener("click", async () => {
      await fetch(`${API_BASE}/api/tasks/${task.id}`, { method: "DELETE" });
      await loadTasks();
    });

    taskList.appendChild(node);
  });
}

async function loadTasks() {
  const response = await fetch(`${API_BASE}/api/tasks`);
  tasks = await response.json();
  renderStats();
  renderTasks();
}

async function updateTask(id, payload) {
  await fetch(`${API_BASE}/api/tasks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  await loadTasks();
}

taskForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = {
    title: document.getElementById("taskTitle").value.trim(),
    description: document.getElementById("taskDescription").value.trim(),
    priority: document.getElementById("taskPriority").value,
    status: document.getElementById("taskStatus").value,
    owner: document.getElementById("taskOwner").value.trim(),
    due_date: document.getElementById("taskDate").value || null
  };

  if (!payload.title) return;

  await fetch(`${API_BASE}/api/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  taskForm.reset();
  document.getElementById("taskPriority").value = "Medium";
  document.getElementById("taskStatus").value = "Pending";
  await loadTasks();
});

[searchInput, statusFilter, priorityFilter].forEach(el => el.addEventListener("input", renderTasks));
refreshBtn.addEventListener("click", loadTasks);
clearCompletedBtn.addEventListener("click", async () => {
  await fetch(`${API_BASE}/api/tasks/completed`, { method: "DELETE" });
  await loadTasks();
});

loadTasks().catch(err => {
  console.error(err);
  emptyState.style.display = "block";
  emptyState.querySelector("p").textContent = "Unable to connect to backend API. Check backend deployment and ingress path /api.";
});
