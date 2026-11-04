import { useState } from "react";
import { CreateTaskSchema, type CreateTaskInput } from "@/lib/schemas";

function NewTaskForm({ onAddTask }: { onAddTask: (task: CreateTaskInput) => void }) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState("open");
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validate before doing anything else — the single source of truth.
    const result = CreateTaskSchema.safeParse({ title, dueDate, status });

    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors);
      return;
    }

    setErrors({});
    onAddTask(result.data);
    setTitle("");
    setDueDate("");
    setStatus("open");
  }

  return (
    <form onSubmit={handleSubmit} className="new-task-form">
      <div className="field">
        <label htmlFor="title">Task title</label>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? "title-error" : undefined}
        />
        {errors.title && (
          <p id="title-error" className="error">
            {errors.title[0]}
          </p>
        )}
      </div>

      <div className="field">
        <label htmlFor="dueDate">Due date</label>
        <input
          id="dueDate"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          aria-invalid={!!errors.dueDate}
          aria-describedby={errors.dueDate ? "dueDate-error" : undefined}
        />
        {errors.dueDate && (
          <p id="dueDate-error" className="error">
            {errors.dueDate[0]}
          </p>
        )}
      </div>

      <div className="field">
        <label htmlFor="status">Status</label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="open">Open</option>
          <option value="doing">Doing</option>
          <option value="done">Done</option>
        </select>
      </div>

      {/* Disabling is a convenience only — the Zod check above is the real guard. */}
      <button type="submit" disabled={title.trim() === ""}>
        Add task
      </button>
    </form>
  );
}

export default NewTaskForm;
