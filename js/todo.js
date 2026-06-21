import { showToast } from "./main.js";
import { readJsonStorage, writeStorage } from "./storage.js";

const STORAGE_KEY = "technova-smart-tasks";

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const formatRelativeDate = (value) => {
  const date = new Date(value);
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
};

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const initTodoPage = () => {
  const form = document.querySelector("[data-todo-form]");
  const input = document.querySelector("[data-task-input]");
  const searchInput = document.querySelector("[data-task-search]");
  const taskList = document.querySelector("[data-task-list]");
  const emptyState = document.querySelector("[data-empty-state]");
  const emptyMessage = document.querySelector("[data-empty-message]");
  const statusText = document.querySelector("[data-task-status]");
  const taskCounter = document.querySelector("[data-task-counter]");
  const taskSubcounter = document.querySelector("[data-task-subcounter]");
  const totalCount = document.querySelector("[data-task-total]");
  const activeCount = document.querySelector("[data-task-active]");
  const completedCount = document.querySelector("[data-task-completed]");
  const progressBar = document.querySelector("[data-progress-bar]");
  const progressText = document.querySelector("[data-progress-text]");
  const filterButtons = document.querySelectorAll("[data-filter]");
  const markAllButton = document.querySelector("[data-mark-all-complete]");
  const clearCompletedButton = document.querySelector("[data-clear-completed]");
  const clearCompletedModal = document.querySelector("[data-clear-completed-modal]");
  const clearCompletedModalPanel = clearCompletedModal?.querySelector(".modal__panel");
  const clearCompletedModalCancelButtons = clearCompletedModal
    ? clearCompletedModal.querySelectorAll("[data-clear-completed-cancel]")
    : [];
  const clearCompletedModalConfirmButton = clearCompletedModal?.querySelector("[data-clear-completed-confirm]");
  const clearCompletedModalDefaultButton = clearCompletedModal?.querySelector("[data-clear-completed-cancel]");

  if (!form || !input || !searchInput || !taskList || !emptyState) return;

  let tasks = [];
  let activeFilter = "all";
  let searchQuery = "";
  let editingTaskId = null;
  let pendingFocusTaskId = null;
  let lastFocusedBeforeModal = null;

  const normalizeTask = (value) => value.trim().replace(/\s+/g, " ");

  const getFilteredTasks = () => {
    const query = searchQuery.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesFilter =
        activeFilter === "all" ||
        (activeFilter === "active" && !task.completed) ||
        (activeFilter === "completed" && task.completed);
      const matchesSearch = !query || task.title.toLowerCase().includes(query);
      return matchesFilter && matchesSearch;
    });
  };

  const updateStats = () => {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.completed).length;
    const active = total - completed;
    const percent = total ? Math.round((completed / total) * 100) : 0;

    if (totalCount) totalCount.textContent = String(total);
    if (activeCount) activeCount.textContent = String(active);
    if (completedCount) completedCount.textContent = String(completed);
    if (taskCounter) taskCounter.textContent = `${active} task${active === 1 ? "" : "s"} left`;
    if (taskSubcounter) taskSubcounter.textContent = `${completed} of ${total} completed`;
    if (progressBar) progressBar.style.width = `${percent}%`;
    if (progressText) progressText.textContent = `${percent}%`;
    if (markAllButton) markAllButton.disabled = total === 0 || completed === total;
  };

  const updateEmptyState = (filteredTasks) => {
    const hasTasks = tasks.length > 0;
    const hasVisibleTasks = filteredTasks.length > 0;
    const isSearching = searchQuery.trim().length > 0;
    const isFiltered = activeFilter !== "all";

    emptyState.hidden = hasVisibleTasks;

    if (!hasTasks) {
      if (emptyMessage) {
        emptyMessage.textContent = "Your smart task list will appear here once you start adding items.";
      }
      return;
    }

    if (!hasVisibleTasks && emptyMessage) {
      emptyMessage.textContent = isSearching || isFiltered
        ? "No tasks match the current search or filter."
        : "Your task list is empty right now.";
    }
  };

  const renderTaskItem = (task) => {
    const li = document.createElement("li");
    li.className = `todo-task${task.completed ? " is-completed" : ""}`;
    li.dataset.taskId = task.id;

    if (editingTaskId === task.id) {
      li.classList.add("todo-task--editing");
      li.innerHTML = `
        <form class="todo-task__edit-form" data-edit-form>
          <div class="field">
            <label class="sr-only" for="edit-${task.id}">Edit task</label>
            <input class="todo-task__edit-input" id="edit-${task.id}" name="task" type="text" value="${escapeHtml(task.title)}" maxlength="120" data-edit-input>
          </div>
          <div class="todo-task__edit-actions">
            <button class="btn btn--primary btn--small" type="submit">Save</button>
            <button class="btn btn--secondary btn--small" type="button" data-action="cancel-edit">Cancel</button>
          </div>
        </form>
      `;
      return li;
    }

    li.innerHTML = `
      <article>
        <div class="todo-task__main">
          <button class="todo-task__check" type="button" data-action="toggle-complete" aria-label="${task.completed ? "Mark task active" : "Mark task complete"}">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              ${task.completed
                ? '<path d="M5.5 12.5l4 4 9-9" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>'
                : '<circle cx="12" cy="12" r="7.5" fill="none" stroke="currentColor" stroke-width="1.7"/>'}
            </svg>
          </button>
          <div class="todo-task__content">
            <h3 class="todo-task__title">${escapeHtml(task.title)}</h3>
            <p class="todo-task__meta">Added ${formatRelativeDate(task.createdAt)}</p>
          </div>
        </div>
        <div class="todo-task__actions">
          <button class="btn btn--secondary btn--small" type="button" data-action="edit">Edit</button>
          <button class="btn btn--secondary btn--small" type="button" data-action="delete">Delete</button>
        </div>
      </article>
    `;

    return li;
  };

  const render = () => {
    const filteredTasks = getFilteredTasks();
    taskList.innerHTML = "";

    filteredTasks.forEach((task) => {
      taskList.append(renderTaskItem(task));
    });

    filterButtons.forEach((button) => {
      const isActive = button.dataset.filter === activeFilter;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    updateStats();
    updateEmptyState(filteredTasks);

    if (pendingFocusTaskId) {
      const targetInput = taskList.querySelector(`[data-task-id="${pendingFocusTaskId}"] [data-edit-input]`);
      if (targetInput) targetInput.focus();
      pendingFocusTaskId = null;
    }
  };

  const addTask = (title) => {
    const normalizedTitle = normalizeTask(title);
    if (!normalizedTitle) return false;

    tasks = [
      {
        id: createId(),
        title: normalizedTitle,
        completed: false,
        createdAt: new Date().toISOString()
      },
      ...tasks
    ];
    writeStorage(STORAGE_KEY, JSON.stringify(tasks));
    render();
    return true;
  };

  const updateTask = (taskId, patch) => {
    tasks = tasks.map((task) => (task.id === taskId ? { ...task, ...patch } : task));
    writeStorage(STORAGE_KEY, JSON.stringify(tasks));
    render();
  };

  const deleteTask = (taskId) => {
    tasks = tasks.filter((task) => task.id !== taskId);
    if (editingTaskId === taskId) editingTaskId = null;
    writeStorage(STORAGE_KEY, JSON.stringify(tasks));
    render();
  };

  const markAllComplete = () => {
    tasks = tasks.map((task) => ({ ...task, completed: true }));
    writeStorage(STORAGE_KEY, JSON.stringify(tasks));
    render();
  };

  const clearCompletedTasks = () => {
    tasks = tasks.filter((task) => !task.completed);
    if (editingTaskId && !tasks.some((task) => task.id === editingTaskId)) {
      editingTaskId = null;
    }
    writeStorage(STORAGE_KEY, JSON.stringify(tasks));
    render();
  };

  const closeClearCompletedModal = () => {
    if (!clearCompletedModal || clearCompletedModal.hidden) return;

    clearCompletedModal.classList.remove("is-open");
    document.body.classList.remove("modal-open");

    window.setTimeout(() => {
      clearCompletedModal.hidden = true;
      lastFocusedBeforeModal?.focus();
      lastFocusedBeforeModal = null;
    }, 180);
  };

  const openClearCompletedModal = () => {
    if (!clearCompletedModal || !clearCompletedModalPanel) return;

    lastFocusedBeforeModal = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    clearCompletedModal.hidden = false;
    document.body.classList.add("modal-open");
    window.requestAnimationFrame(() => clearCompletedModal.classList.add("is-open"));
    (clearCompletedModalDefaultButton || clearCompletedModalPanel).focus();
  };

  const confirmClearCompleted = () => {
    clearCompletedTasks();
    closeClearCompletedModal();
    if (statusText) statusText.textContent = "Completed tasks removed.";
    showToast("Completed tasks removed.", "success");
  };

  tasks = readJsonStorage(STORAGE_KEY, []);
  render();

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (addTask(input.value)) {
      input.value = "";
      input.focus();
      if (statusText) statusText.textContent = "Task added successfully.";
    } else if (statusText) {
      statusText.textContent = "Please enter a task before adding it.";
    }
  });

  searchInput.addEventListener("input", () => {
    searchQuery = searchInput.value;
    render();
  });

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter || "all";
      render();
    });
  });

  markAllButton?.addEventListener("click", markAllComplete);
  clearCompletedButton?.addEventListener("click", () => {
    const completedTasks = tasks.filter((task) => task.completed);
    if (completedTasks.length === 0) {
      showToast("No completed tasks to remove.", "info");
      if (statusText) statusText.textContent = "No completed tasks to remove.";
      return;
    }

    openClearCompletedModal();
  });

  clearCompletedModalCancelButtons.forEach((button) => {
    button.addEventListener("click", closeClearCompletedModal);
  });

  clearCompletedModalConfirmButton?.addEventListener("click", confirmClearCompleted);

  clearCompletedModal?.addEventListener("click", (event) => {
    if (event.target.closest("[data-clear-completed-cancel]")) {
      closeClearCompletedModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (!clearCompletedModal || clearCompletedModal.hidden) return;

    if (event.key === "Escape") {
      event.preventDefault();
      closeClearCompletedModal();
      return;
    }

    if (event.key !== "Tab" || !clearCompletedModalPanel) return;

    const focusable = [...clearCompletedModal.querySelectorAll("button, [href], [tabindex]:not([tabindex='-1'])")];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (!first || !last) return;

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  taskList.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-action]");
    const taskItem = event.target.closest("[data-task-id]");

    if (!taskItem) return;

    const taskId = taskItem.dataset.taskId;
    const task = tasks.find((entry) => entry.id === taskId);
    if (!task) return;

    const action = actionButton?.dataset.action;

    if (action === "toggle-complete") {
      updateTask(taskId, { completed: !task.completed });
      if (statusText) {
        statusText.textContent = task.completed ? "Task marked active." : "Task marked complete.";
      }
      return;
    }

    if (action === "edit") {
      editingTaskId = taskId;
      pendingFocusTaskId = taskId;
      render();
      return;
    }

    if (action === "delete") {
      deleteTask(taskId);
      if (statusText) statusText.textContent = "Task deleted.";
      return;
    }

    if (action === "cancel-edit") {
      editingTaskId = null;
      render();
    }
  });

  taskList.addEventListener("submit", (event) => {
    const editForm = event.target.closest("[data-edit-form]");
    if (!editForm) return;

    event.preventDefault();
    const taskItem = editForm.closest("[data-task-id]");
    if (!taskItem) return;

    const taskId = taskItem.dataset.taskId;
    const editInput = editForm.querySelector("[data-edit-input]");
    const nextTitle = normalizeTask(editInput?.value || "");

    if (!nextTitle) {
      if (statusText) statusText.textContent = "Task title cannot be empty.";
      return;
    }

    updateTask(taskId, { title: nextTitle });
    editingTaskId = null;
    if (statusText) statusText.textContent = "Task updated successfully.";
  });

  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY) return;
    tasks = readJsonStorage(STORAGE_KEY, []);
    render();
  });
};

initTodoPage();
