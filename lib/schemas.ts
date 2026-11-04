import { z } from "zod";

export const TaskSchema = z.object({
  id: z.number(),
  title: z.string(),
  done: z.boolean(),
  dueDate: z.string().optional(),
  status: z.enum(["open", "doing", "done"]).optional(),
});

export type Task = z.infer<typeof TaskSchema>;

// Strand 2 — the shape the NewTaskForm collects and validates before a task is created.
export const CreateTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  dueDate: z.string().optional(),
  status: z.enum(["open", "doing", "done"]),
});

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
