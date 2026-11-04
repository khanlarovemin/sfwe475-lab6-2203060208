import type { Task } from "./schemas";

const sampleTasks: Task[] = [
  { id: 1, title: "Read Chapter 4", done: false },
  { id: 2, title: "Build NewTaskForm", done: false },
];

type MockOptions = { delayMs?: number; shouldFail?: boolean; empty?: boolean };

// Stands in for a real server until Week 5. It lets us control exactly when the
// request succeeds, fails, or returns nothing, so the UI can be forced through
// every real-world case on demand.
export function simulateFetchTasks(
  options: MockOptions = {}
): Promise<Task[]> {
  const { delayMs = 800, shouldFail = false, empty = false } = options;

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error("Mock server error"));
        return;
      }
      resolve(empty ? [] : sampleTasks);
    }, delayMs);
  });
}
