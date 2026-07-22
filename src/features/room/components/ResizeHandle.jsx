export function ResizeHandle({
  label,
  panel,
  width,
  min,
  max,
  className,
  onPointerDown,
  onResizeBy,
  onReset,
}) {
  function handleKeyDown(event) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    onResizeBy(panel, event.key === "ArrowLeft" ? 16 : -16);
  }

  return (
    <div
      role="separator"
      aria-label={label}
      aria-orientation="vertical"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={Math.round(width)}
      tabIndex={0}
      className={`group hidden w-2.5 shrink-0 touch-none cursor-col-resize items-center justify-center outline-none ${className}`}
      onPointerDown={(event) => onPointerDown(panel, event)}
      onDoubleClick={() => onReset(panel)}
      onKeyDown={handleKeyDown}
      title={`${label}. Drag or use arrow keys. Double-click to reset.`}
    >
      <span className="h-12 w-1 rounded-full bg-secondary/40 transition group-hover:bg-secondary group-focus-visible:bg-secondary" />
    </div>
  );
}
