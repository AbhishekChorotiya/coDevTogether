import { ChevronDown } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
const Dropdown = ({
  options = ["Blue", "Red", "Dark"],
  placeholder = "Blue",
  selected = "",
  setSelected = () => {},
}) => {
  const [open, setOpen] = useState(false);

  const divRef = useRef(null);
  const dropdownRef = useRef(null);
  const handleClickOutside = (event) => {
    if (divRef.current && !divRef.current.contains(event.target)) {
      setOpen(false);
      return;
    }
    if (dropdownRef.current && dropdownRef.current.contains(event.target)) {
      setOpen(true);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <div className="border w-28 bg-background cursor-pointer border-primary px-3 py-1 rounded-[4px] relative">
      <div
        className="flex items-center gap-2 z-0 justify-between"
        ref={dropdownRef}
      >
        <span
          className={`${selected ? "text-primary" : "text-secondary"} text-xs`}
        >
          {selected
            ? `${selected.charAt(0).toUpperCase()}${selected.slice(1)}`
            : placeholder}
        </span>
        <ChevronDown className="w-5 text-primary" />
      </div>
      {open && (
        <div
          ref={divRef}
          className="w-full left-0 z-[1000] overflow-hidden rounded-[10px] border border-secondary bg-background absolute top-[calc(100%+5px)] flex flex-col"
        >
          {options.map((option, i) => (
            <div
              key={i}
              className="flex items-center text-primary hover:bg-secondary hover:text-foreground p-4 justify-between"
              onClick={() => {
                setSelected(option.toLowerCase());
                setOpen(false);
              }}
            >
              <span className="text-sm">{option}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
