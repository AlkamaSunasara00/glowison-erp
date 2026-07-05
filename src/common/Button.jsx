import React from "react";
import clsx from "clsx";

const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  text = "",
  icon: Icon,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  iconPosition = "left",
  className = "",
  disabled = false,
}) => {
  const LIcon = LeftIcon || (iconPosition === "left" ? Icon : null);
  const RIcon = RightIcon || (iconPosition === "right" ? Icon : null);

  const baseStyle =
    "flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 outline-none rounded-sm font-medium";

  const sizes = {
    sm: "h-8 text-xs px-3",
    md: "h-9 text-sm px-4",
    lg: "h-10 text-sm px-5",
    xl: "h-12 text-base px-6",
    square: "h-10 w-10 p-0",
  };

  /*
   * Color logic:
   *  - Solid / primary CTA actions  → #F5A623 (Golden Orange for contrast)
   *  - Outline / Tinted → #1F3C88 (Deep Navy)
   */
  const variants = {
    // Solid CTA — using orange for contrast
    primary:
      "text-primary bg-white border border-primary/20 hover:bg-primary hover:text-white hover:border-primary",
    solid:
      "bg-three text-white border border-three hover:opacity-90",

    // Tinted / background — using secondary and primary
    third:
      "bg-secondary text-primary border border-primary/20 hover:bg-primary/10 hover:text-primary",
    ghost:
      "border-transparent text-primary hover:text-primary hover:bg-secondary",

    // Neutral
    secondary:
      "border border-gray-300 text-gray-600 bg-white hover:bg-gray-100",
    outline:
      "border border-gray-300 text-gray-700 bg-white hover:bg-gray-100",

    // Semantic
    success:
      "bg-green-50 text-green-700 border border-green-200 hover:bg-green-600 hover:text-white",
    danger:
      "bg-red-50 text-red-700 border border-red-200 hover:bg-red-600 hover:text-white",
    info:
      "bg-secondary text-primary border border-primary/20 hover:bg-primary hover:text-white",
  };

  const iconSize =
    size === "sm" || size === "square" ? 14 : size === "lg" ? 20 : 18;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        baseStyle,
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {LIcon && <LIcon size={iconSize} className="flex-shrink-0" />}
      {(children || text) && (
        <span className="leading-none whitespace-nowrap">
          {children || text}
        </span>
      )}
      {RIcon && <RIcon size={iconSize} className="flex-shrink-0" />}
    </button>
  );
};

export default Button;