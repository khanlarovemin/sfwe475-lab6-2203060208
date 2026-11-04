import type { Task } from "@/lib/schemas";
import type { Filter } from "./FilterBar";
import TaskCard from "./TaskCard";

type TaskListProps = {
  tasks: Task[];
  filter: Filter;
  onToggleTask: (id: number) => void;
};

function TaskList({ tasks, filter, onToggleTask }: TaskListProps) {
  const visibleTasks = tasks.filter((task) => {
    if (filter === "done") return task.done;
    if (filter === "open") return !task.done;
    return true;
  });

  return (
    <div>
      {visibleTasks.map((task) => (
        <TaskCard
          key={task.id}
          id={task.id}
          title={task.title}
          done={task.done}
          dueDate={task.dueDate}
          onToggle={() => onToggleTask(task.id)}
        />
      ))}
    </div>
  );
}

export default TaskList;
