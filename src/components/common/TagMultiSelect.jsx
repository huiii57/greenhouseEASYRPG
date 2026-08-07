export default function TagMultiSelect({ options, selected, onChange }) {
  function toggle(option) {
    if (selected.includes(option)) {
      onChange(selected.filter((s) => s !== option));
    } else {
      onChange([...selected, option]);
    }
  }

  return (
    <div className="tag-multiselect">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          className={`tag-chip ${selected.includes(option) ? 'tag-chip--active' : ''}`}
          onClick={() => toggle(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
