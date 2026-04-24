import { FormEvent, useEffect, useMemo, useState } from "react";
import "./App.css";

type Todo = {
  id: number;
  text: string;
  completed: boolean;
};

type Filter = "all" | "active" | "completed";
const STORAGE_KEY = "todo-app-items";

export default function App() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        return [];
      }
      const parsed = JSON.parse(saved) as unknown;
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed
        .map((item, index) => {
          if (!item || typeof item !== "object") {
            return null;
          }
          const raw = item as Partial<Todo>;
          const text = typeof raw.text === "string" ? raw.text.trim() : "";
          if (!text) {
            return null;
          }
          return {
            id: typeof raw.id === "number" ? raw.id : Date.now() + index,
            text,
            completed: Boolean(raw.completed),
          };
        })
        .filter((todo): todo is Todo => todo !== null);
    } catch {
      return [];
    }
  });
  const [newTodoText, setNewTodoText] = useState("");
  const [editingTodoId, setEditingTodoId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [searchText, setSearchText] = useState("");

  const completedCount = useMemo(
    () => todos.filter((todo) => todo.completed).length,
    [todos]
  );
  const filteredTodos = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase();
    return todos.filter((todo) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "active" && !todo.completed) ||
        (filter === "completed" && todo.completed);
      const matchesSearch =
        normalizedSearch.length === 0 ||
        todo.text.toLowerCase().includes(normalizedSearch);
      return matchesFilter && matchesSearch;
    });
  }, [todos, filter, searchText]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  const handleCreateTodo = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedText = newTodoText.trim();

    if (!trimmedText) {
      return;
    }

    setTodos((prevTodos) => [
      ...prevTodos,
      {
        id: Date.now(),
        text: trimmedText,
        completed: false,
      },
    ]);
    setNewTodoText("");
  };

  const handleDeleteTodo = (id: number) => {
    setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
    if (editingTodoId === id) {
      setEditingTodoId(null);
      setEditingText("");
    }
  };

  const handleToggleCompleted = (id: number) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const handleStartEdit = (todo: Todo) => {
    setEditingTodoId(todo.id);
    setEditingText(todo.text);
  };

  const handleUpdateTodo = (id: number) => {
    const trimmedText = editingText.trim();

    if (!trimmedText) {
      return;
    }

    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id ? { ...todo, text: trimmedText } : todo
      )
    );
    setEditingTodoId(null);
    setEditingText("");
  };

  const handleCancelEdit = () => {
    setEditingTodoId(null);
    setEditingText("");
  };
  const handleClearCompleted = () => {
    setTodos((prevTodos) => prevTodos.filter((todo) => !todo.completed));
  };
  const handleToggleAll = () => {
    const shouldMarkCompleted = completedCount !== todos.length;
    setTodos((prevTodos) =>
      prevTodos.map((todo) => ({ ...todo, completed: shouldMarkCompleted }))
    );
  };

  return (
    <main className="todo-app">
      <section className="todo-card">
        <h1>Todo Application</h1>
        <p className="todo-stats">
          Total: {todos.length} | Completed: {completedCount}
        </p>

        <form className="todo-create-form" onSubmit={handleCreateTodo}>
          <input
            type="text"
            value={newTodoText}
            onChange={(event) => setNewTodoText(event.target.value)}
            placeholder="Create a new todo"
            aria-label="Create a new todo"
          />
          <button type="submit">Create</button>
        </form>

        <div className="toolbar">
          <div className="filter-group">
            <button
              type="button"
              className={filter === "all" ? "ghost active-filter" : "ghost"}
              onClick={() => setFilter("all")}
            >
              All
            </button>
            <button
              type="button"
              className={filter === "active" ? "ghost active-filter" : "ghost"}
              onClick={() => setFilter("active")}
            >
              Active
            </button>
            <button
              type="button"
              className={
                filter === "completed" ? "ghost active-filter" : "ghost"
              }
              aria-pressed={filter === "completed"}
              onClick={() => setFilter("completed")}
            >
              Completed
            </button>
          </div>
          <input
            type="text"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search todos"
            aria-label="Search todos"
          />
        </div>

        {todos.length > 0 && (
          <div className="bulk-actions">
            <button type="button" className="ghost" onClick={handleToggleAll}>
              {completedCount === todos.length
                ? "Mark all as active"
                : "Mark all as completed"}
            </button>
            <button
              type="button"
              className="danger"
              onClick={handleClearCompleted}
              disabled={completedCount === 0}
            >
              Clear completed
            </button>
          </div>
        )}

        {todos.length === 0 ? (
          <p className="empty-state">No todos yet. Create your first one.</p>
        ) : filteredTodos.length === 0 ? (
          <p className="empty-state">
            {filter === "completed"
              ? "No completed todos yet."
              : "No todos match your current filter."}
          </p>
        ) : (
          <ul className="todo-list">
            {filteredTodos.map((todo) => (
              <li key={todo.id} className="todo-item">
                {editingTodoId === todo.id ? (
                  <div className="todo-edit-row">
                    <input
                      type="text"
                      value={editingText}
                      onChange={(event) => setEditingText(event.target.value)}
                      aria-label="Edit todo text"
                    />
                    <button type="button" onClick={() => handleUpdateTodo(todo.id)}>
                      Update
                    </button>
                    <button type="button" className="ghost" onClick={handleCancelEdit}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="todo-view-row">
                    <label>
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => handleToggleCompleted(todo.id)}
                      />
                      <span className={todo.completed ? "completed" : ""}>
                        {todo.text}
                      </span>
                    </label>
                    <div className="todo-actions">
                      <button
                        type="button"
                        className="ghost"
                        onClick={() => handleStartEdit(todo)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="danger"
                        onClick={() => handleDeleteTodo(todo.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
