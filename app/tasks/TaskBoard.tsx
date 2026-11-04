"use client";

import { useState } from "react";
import type { Task, CreateTaskInput } from "@/lib/schemas";
import TaskList from "./TaskList";
import NewTaskForm from "./NewTaskForm";
import FilterBar, { type Filter } from "./FilterBar";

export default function TaskBoard({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [filter, setFilter] = useState<Filter>("all");

  function handleAddTask(input: CreateTaskInput) {
    setTasks([
      ...tasks,
      {
        id: tasks.length + 1,
        title: input.title,
        done: input.status === "done",
        dueDate: input.dueDate || undefined,
        status: input.status,
      },
    ]);
  }

  function handleToggleTask(id: number) {
    setTasks(
      tasks.map((task) => (task.id === id ? { ...task, done: !task.done } : task))
    );
  }

  // The empty message says "below", so the form stays on screen in that state.
  return (
    <main>
      <h2>All tasks</h2>

      <div aria-live="polite">
        {tasks.length === 0 && <p>No tasks yet. Add your first one below.</p>}
      </div>

      <NewTaskForm onAddTask={handleAddTask} />

      {tasks.length > 0 && (
        <>
          <FilterBar filter={filter} onFilterChange={setFilter} />
          <TaskList
            tasks={tasks}
            filter={filter}
            onToggleTask={handleToggleTask}
          />
        </>
      )}
    </main>
  );
}
