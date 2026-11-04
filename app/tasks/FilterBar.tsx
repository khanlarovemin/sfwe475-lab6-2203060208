export type Filter = "all" | "done" | "open";

const filters: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "done", label: "Done" },
  { value: "open", label: "Open" },
];

type FilterBarProps = {
  filter: Filter;
  onFilterChange: (filter: Filter) => void;
};

function FilterBar({ filter, onFilterChange }: FilterBarProps) {
  return (
    <div>
      {filters.map(({ value, label }) => (
        <button
          key={value}
          style={{ fontWeight: value === filter ? "bold" : "normal" }}
          onClick={() => onFilterChange(value)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export default FilterBar;
