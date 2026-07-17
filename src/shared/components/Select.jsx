export function Select({ label, value, options, onChange, className = "" }) {
  return (
    <label className={`flex items-center gap-2 text-xs text-primary ${className}`}>
      <span className="sr-only">{label}</span>
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 min-w-28 rounded border border-primary bg-background px-3 text-xs font-medium text-primary outline-none focus-visible:ring-2 focus-visible:ring-secondary"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
