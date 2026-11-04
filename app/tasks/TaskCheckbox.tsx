type TaskCheckboxProps = {
  done: boolean;
  onToggle: () => void;
  label: string;
};

function TaskCheckbox({ done, onToggle, label }: TaskCheckboxProps) {
  // Without a label the checkbox announces only "checkbox" to a screen reader;
  // aria-label ties it to the specific task it toggles.
  return (
    <input
      type="checkbox"
      checked={done}
      onChange={onToggle}
      aria-label={`Mark "${label}" as done`}
    />
  );
}

export default TaskCheckbox;
