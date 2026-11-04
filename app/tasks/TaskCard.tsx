import Link from "next/link";
import type { Task } from "@/lib/schemas";
import TaskCheckbox from "./TaskCheckbox";

type TaskCardProps = Pick<Task, "id" | "title" | "done" | "dueDate"> & {
  onToggle: () => void;
};

function TaskCard({ id, title, done, dueDate, onToggle }: TaskCardProps) {
  return (
    <div className="task-card">
      <h3>
        <Link href={`/tasks/${id}`}>{title}</Link>
      </h3>
      <TaskCheckbox done={done} onToggle={onToggle} label={title} />
      {dueDate && <p>Due: {dueDate}</p>}
    </div>
  );
}

export default TaskCard;
