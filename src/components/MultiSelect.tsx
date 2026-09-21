import { useEffect, useRef, useState } from "react";

export interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  invalid?: boolean;
  id?: string;
}

/**
 * Accessible multi-select "combo box": a dropdown trigger that opens a panel of
 * checkbox-style options. Selected values render as chips inside the trigger.
 */
export default function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select all that apply",
  invalid = false,
  id,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggle = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value],
    );
  };

  const selectedOptions = options.filter((o) => selected.includes(o.value));

  return (
    <div className="combo" ref={rootRef}>
      <button
        type="button"
        id={id}
        className={`combo-trigger${open ? " open" : ""}${
          invalid ? " invalid" : ""
        }`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {selectedOptions.length === 0 ? (
          <span className="placeholder">{placeholder}</span>
        ) : (
          <span className="chips">
            {selectedOptions.map((o) => (
              <span className="chip" key={o.value}>
                {o.label}
              </span>
            ))}
          </span>
        )}
        <svg
          className="combo-caret"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="combo-panel" role="listbox" aria-multiselectable="true">
          {options.map((o) => {
            const checked = selected.includes(o.value);
            return (
              <div
                key={o.value}
                className={`combo-option${checked ? " checked" : ""}`}
                role="option"
                aria-selected={checked}
                onClick={() => toggle(o.value)}
              >
                <span className="box" aria-hidden="true">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#04121f"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </span>
                <span>{o.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
