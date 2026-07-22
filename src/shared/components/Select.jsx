import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

function OptionVisual({ option }) {
  if (option.swatch) {
    return (
      <span
        className="size-6 shrink-0 rounded-full border-2 border-background shadow-sm ring-1 ring-foreground"
        style={{ backgroundColor: option.swatch }}
        aria-hidden="true"
      />
    );
  }

  return (
    <span className="flex h-6 min-w-7 shrink-0 items-center justify-center rounded bg-foreground px-1.5 font-mono text-[10px] font-bold text-primary" aria-hidden="true">
      {option.badge || option.label.slice(0, 2).toUpperCase()}
    </span>
  );
}

export function Select({
  label,
  value,
  options,
  onChange,
  className = "",
  compactOnMobile = false,
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const optionRefs = useRef([]);
  const listboxId = useId();
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const selectedOption = options[selectedIndex] || options[0];

  useEffect(() => {
    if (!open) return undefined;

    function closeOnOutsidePointer(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    }

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, [open]);

  useEffect(() => {
    if (open) optionRefs.current[activeIndex]?.focus();
  }, [activeIndex, open]);

  function openMenu(index = selectedIndex) {
    setActiveIndex(index);
    setOpen(true);
  }

  function closeMenu({ restoreFocus = false } = {}) {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  }

  function selectOption(option) {
    onChange(option.value);
    closeMenu({ restoreFocus: true });
  }

  function handleTriggerKeyDown(event) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      const nextIndex = (selectedIndex + direction + options.length) % options.length;
      openMenu(nextIndex);
    }
    if (event.key === "Escape") closeMenu();
  }

  function handleOptionKeyDown(event) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((current) => (current + direction + options.length) % options.length);
      return;
    }
    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      setActiveIndex(event.key === "Home" ? 0 : options.length - 1);
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectOption(options[activeIndex]);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu({ restoreFocus: true });
      return;
    }
    if (event.key === "Tab") setOpen(false);
  }

  if (!selectedOption) return null;

  return (
    <div ref={rootRef} className={`relative text-primary ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        className={`group flex h-11 items-center gap-2 rounded-lg border border-foreground bg-background px-2.5 text-left shadow-sm transition hover:border-secondary hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary ${
          compactOnMobile ? "min-w-16 sm:min-w-36" : "min-w-36"
        }`}
        aria-label={`${label}: ${selectedOption.label}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        onClick={() => (open ? closeMenu() : openMenu())}
        onKeyDown={handleTriggerKeyDown}
      >
        <OptionVisual option={selectedOption} />
        <span className={`min-w-0 flex-1 leading-tight ${compactOnMobile ? "hidden sm:block" : ""}`}>
          <span className="block text-[9px] font-semibold uppercase tracking-wider text-secondary">
            {label}
          </span>
          <span className="block truncate text-xs font-semibold text-primary">
            {selectedOption.label}
          </span>
        </span>
        <ChevronsUpDown className={`size-4 shrink-0 text-secondary transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>

      {open && (
        <div
          id={listboxId}
          role="listbox"
          aria-label={label}
          className="absolute right-0 top-[calc(100%+0.4rem)] z-[80] min-w-52 overflow-hidden rounded-xl border border-foreground bg-background p-1.5 shadow-2xl"
          onKeyDown={handleOptionKeyDown}
        >
          {options.map((option, index) => {
            const selected = option.value === value;
            return (
              <button
                key={option.value}
                ref={(element) => {
                  optionRefs.current[index] = element;
                }}
                type="button"
                role="option"
                aria-selected={selected}
                tabIndex={activeIndex === index ? 0 : -1}
                className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left outline-none transition ${
                  selected
                    ? "bg-foreground text-primary"
                    : "text-primary hover:bg-foreground focus-visible:bg-foreground"
                }`}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectOption(option)}
              >
                <OptionVisual option={option} />
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold">{option.label}</span>
                  {option.hint && (
                    <span className="block text-[10px] text-secondary">{option.hint}</span>
                  )}
                </span>
                <Check className={`size-4 text-secondary ${selected ? "opacity-100" : "opacity-0"}`} aria-hidden="true" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
