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
  // Determine which icons to use
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

  const variants = {
    primary: "text-primary bg-white hover:bg-primary hover:text-white",
    secondary:
      "border-gray-300 text-gray-600 bg-white hover:bg-gray-100 border border-gray-300",
    third:
      "border-primary text-primary bg-secondary hover:bg-primary/20 hover:text-primary border border-primary/20",
    solid:
      "bg-primary text-white border-primary hover:bg-primary/90 hover:text-white",
    outline: "border border-gray-300 text-gray-700 bg-white hover:bg-gray-100",
    success:
      "bg-green-50 text-green-700 border-green-200 hover:bg-green-600 hover:text-white",
    danger:
      "bg-red-200 text-red-700 border-red-200 hover:bg-red-600 hover:text-white",
    info: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-600 hover:text-white",
    ghost:
      "border-transparent text-gray-500 hover:text-primary hover:bg-primary/5",
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
        className,
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
