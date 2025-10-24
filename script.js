// To‑Do app with localStorage
// Key used to store tasks
const STORAGE_KEY = 'todo.tasks.v1';

// DOM elements
const newTaskForm = document.getElementById('new-task-form');
const newTaskInput = document.getElementById('new-task-input');
const taskListEl = document.getElementById('task-list');
const filters = Array.from(document.querySelectorAll('.filter'));
const clearCompletedBtn = document.getElementById('clear-completed');
const taskCountEl = document.getElementById('task-count');

let tasks = [];
let currentFilter = 'all'; // all | active | completed

// Load tasks from localStorage
function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    tasks = raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Erro ao ler localStorage', err);
    tasks = [];
  }
}

// Save tasks to localStorage
function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// Render tasks according to current filter
function renderTasks() {
  taskListEl.innerHTML = '';

  const filtered = tasks.filter(t => {
    if (currentFilter === 'active') return !t.completed;
    if (currentFilter === 'completed') return t.completed;
    return true;
  });

  if (filtered.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'task empty';
    empty.textContent = currentFilter === 'all' ? 'Nenhuma tarefa ainda. Adicione uma na caixa acima.' :
      currentFilter === 'active' ? 'Sem tarefas ativas.' : 'Sem tarefas concluídas.';
    empty.style.padding = '12px';
    empty.style.color = '#64748b';
    taskListEl.appendChild(empty);
  } else {
    for (const task of filtered) {
      taskListEl.appendChild(createTaskElement(task));
    }
  }

  updateCount();
}

// Create DOM element for a single task
function createTaskElement(task) {
  const li = document.createElement('li');
  li.className = 'task' + (task.completed ? ' completed' : '');
  li.dataset.id = task.id;

  // Checkbox
  const cb = document.createElement('button');
  cb.className = 'checkbox';
  cb.setAttribute('aria-label', task.completed ? 'Marcar como não concluída' : 'Marcar como concluída');
  cb.innerHTML = task.completed ? '✓' : '';
  cb.addEventListener('click', () => toggleComplete(task.id));
  li.appendChild(cb);

  // Content
  const content = document.createElement('div');
  content.className = 'content';

  const title = document.createElement('div');
  title.className = 'title';
  title.textContent = task.title;
  content.appendChild(title);

  const meta = document.createElement('div');
  meta.className = 'meta';
  meta.textContent = task.createdAt ? `criada em ${new Date(task.createdAt).toLocaleString()}` : '';
  content.appendChild(meta);

  li.appendChild(content);

  // Actions: edit, delete
  const actions = document.createElement('div');
  actions.className = 'actions';

  const editBtn = document.createElement('button');
  editBtn.className = 'icon-btn';
  editBtn.title = 'Editar tarefa';
  editBtn.innerHTML = '✏️';
  editBtn.addEventListener('click', () => editTask(task.id));
  actions.appendChild(editBtn);

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'icon-btn';
  deleteBtn.title = 'Deletar tarefa';
  deleteBtn.innerHTML = '🗑️';
  deleteBtn.addEventListener('click', () => deleteTask(task.id));
  actions.appendChild(deleteBtn);

  li.appendChild(actions);

  return li;
}

// Add new task
function addTask(title) {
  const trimmed = title.trim();
  if (!trimmed) return;

  const newTask = {
    id: 't_' + Date.now() + '_' + Math.random().toString(36).slice(2,7),
    title: trimmed,
    completed: false,
    createdAt: Date.now()
  };
  tasks.unshift(newTask); // newest first
  saveTasks();
  renderTasks();
}

// Toggle complete
function toggleComplete(id) {
  const t = tasks.find(x => x.id === id);
  if (!t) return;
  t.completed = !t.completed;
  saveTasks();
  renderTasks();
}

// Delete task
function deleteTask(id) {
  if (!confirm('Excluir esta tarefa?')) return;
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
}

// Edit task (inline)
function editTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  // Replace the title element with an input
  const li = taskListEl.querySelector(`li[data-id="${id}"]`);
  if (!li) return;

  const content = li.querySelector('.content');
  const titleEl = content.querySelector('.title');

  const input = document.createElement('input');
  input.type = 'text';
  input.value = task.title;
  input.className = 'edit-input';
  input.style.padding = '8px';
  input.style.borderRadius = '6px';
  input.style.border = '1px solid #cbd5e1';
  input.style.width = '100%';

  // Replace title with input
  content.replaceChild(input, titleEl);
  input.focus();
  input.setSelectionRange(input.value.length, input.value.length);

  function finishEdit(save) {
    if (save) {
      const val = input.value.trim();
      if (val) {
        task.title = val;
        saveTasks();
      } else {
        // if emptied, cancel or delete
      }
    }
    renderTasks();
  }

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') finishEdit(true);
    if (e.key === 'Escape') finishEdit(false);
  });

  input.addEventListener('blur', () => finishEdit(true));
}

// Clear completed tasks
function clearCompleted() {
  if (!confirm('Remover todas as tarefas concluídas?')) return;
  tasks = tasks.filter(t => !t.completed);
  saveTasks();
  renderTasks();
}

// Update task count and attach events
function updateCount() {
  taskCountEl.textContent = `${tasks.length} ${tasks.length === 1 ? 'tarefa' : 'tarefas'}`;
  // attach filter events
  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      filters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderTasks();
    });
  });
}

// Form submit
if (newTaskForm) {
  newTaskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = newTaskInput.value || '';
    addTask(val);
    newTaskInput.value = '';
  });
}

// Clear completed button
if (clearCompletedBtn) {
  clearCompletedBtn.addEventListener('click', clearCompleted);
}

// Init
loadTasks();
renderTasks();
