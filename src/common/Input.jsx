import Icons from "@/common/Icons";
import React from "react";

const Input = ({
  type = "text",
  id,
  label,
  required,
  options = [],
  startIcon,
  endIcon,
  size = "md",
  className = "",
  onChange,
  value = "",
  error,
  ...props
}) => {
  const sizes = {
    sm: "h-8 text-xs px-3",
    md: "h-9 text-sm px-3",
    lg: "h-10 text-sm px-4",
    xl: "h-12 text-base px-4",
  };

  const baseInputClasses = `
  w-full border ${error ? "border-red-500 ring-1 ring-red-500/20" : "border-gray-100"} 
  text-gray-800 outline-none 
  ${error ? "focus:border-red-500 focus:ring-2 focus:ring-red-500/20" : "focus:border-primary focus:ring-2 focus:ring-primary/10"} 
  bg-white rounded-sm shadow-sm truncate transition-all
  ${sizes[size]}
  ${startIcon ? "pl-10" : ""}
  ${endIcon ? "pr-10" : ""}
  ${className}
`;

  const textareaSizes = {
    sm: "text-xs px-3 py-2 min-h-[80px]",
    md: "text-sm px-3 py-2 min-h-[100px]",
    lg: "text-sm px-4 py-3 min-h-[120px]",
    xl: "text-base px-4 py-3 min-h-[140px]",
  };

  const textareaClasses = `
  w-full border ${error ? "border-red-500 ring-1 ring-red-500/20" : "border-gray-100"} 
  text-gray-800 outline-none 
  ${error ? "focus:border-red-500 focus:ring-2 focus:ring-red-500/20" : "focus:border-primary focus:ring-2 focus:ring-primary/10"} 
  bg-white rounded-sm shadow-sm resize-none transition-all
  ${textareaSizes[size]}
  ${className}
`;

  // ──----------- SELECT --------------------──
  if (type === "select") {
    return (
      <div className="flex flex-col gap-1 w-full">
        <div className="relative w-full">
          <select
            id={id}
            required={required}
            value={value}
            onChange={onChange}
            className={`${baseInputClasses} appearance-none cursor-pointer pr-8`}
            {...props}
          >
            <option value="">{label || "Select"}</option>
            {options.map((opt, i) => (
              <option key={i} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {/* Add Icon on the start */}
          {startIcon && (
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              {startIcon}
            </div>
          )}
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-500">
            <Icons name="ChevronDown" size={16} color="currentColor" />
          </div>
        </div>
        {error && (
          <span className="text-[11px] text-red-500 font-medium flex items-center gap-1 mt-0.5 animate-in fade-in slide-in-from-top-1">
            <Icons name="AlertCircle" size={12} />
            {error}
          </span>
        )}
      </div>
    );
  }

  // -------------------- DATE --------------------
  if (type === "date") {
    return (
      <div className="flex flex-col gap-1 w-full">
        <input
          type="date"
          id={id}
          required={required}
          value={value}
          onChange={onChange}
          className={baseInputClasses}
          {...props}
        />
        {error && (
          <span className="text-[11px] text-red-500 font-medium flex items-center gap-1 mt-0.5 animate-in fade-in slide-in-from-top-1">
            <Icons name="AlertCircle" size={12} />
            {error}
          </span>
        )}
      </div>
    );
  }

  // -------------------- TEXTAREA --------------------
  // ── TEXTAREA ──
  if (type === "textarea") {
    return (
      <div className="flex flex-col gap-1 w-full">
        <textarea
          id={id}
          required={required}
          value={value}
          onChange={onChange}
          rows={props.rows || 4}
          placeholder={label}
          className={textareaClasses}
          {...props}
        />
        {error && (
          <span className="text-[11px] text-red-500 font-medium flex items-center gap-1 mt-0.5 animate-in fade-in slide-in-from-top-1">
            <Icons name="AlertCircle" size={12} />
            {error}
          </span>
        )}
      </div>
    );
  }

  const handleKeyDown = (e) => {
    if (type === "number") {
      // block minus (-), plus (+), e (scientific notation)
      if (["e", "E", "+", "-"].includes(e.key)) {
        e.preventDefault();
      }
    }
  };

  // -------------------- DEFAULT INPUT --------------------
  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="relative w-full">
        <input
          type={type}
          id={id}
          placeholder={label}
          required={required}
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          min={type === "number" ? 0 : undefined}
          onWheel={(e) => e.target.blur()}
          className={baseInputClasses}
          {...props}
        />

        {startIcon && (
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            {startIcon}
          </div>
        )}

        {endIcon && (
          <div className="absolute inset-y-0 right-3 flex items-center">
            {endIcon}
          </div>
        )}
      </div>
      {error && (
        <span className="text-[11px] text-red-500 font-medium flex items-center gap-1 mt-0.5 animate-in fade-in slide-in-from-top-1">
          <Icons name="AlertCircle" size={12} />
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;
