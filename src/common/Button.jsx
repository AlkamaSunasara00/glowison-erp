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
   *  - Solid / primary CTA actions  → #4C2896 (deep indigo-blue)
   *  - Background / secondary tints → #8038A1 (violet-purple)
   */
  const variants = {
    // Solid CTA — deep indigo #4C2896
    primary:
      "text-[#4C2896] bg-white border border-[#4C2896]/20 hover:bg-[#4C2896] hover:text-white hover:border-[#4C2896]",
    solid:
      "bg-[#4C2896] text-white border border-[#4C2896] hover:bg-[#3a1e70] hover:border-[#3a1e70]",

    // Tinted / background — violet #8038A1
    third:
      "bg-[#f0e6f7] text-[#8038A1] border border-[#8038A1]/20 hover:bg-[#8038A1]/20 hover:text-[#8038A1]",
    ghost:
      "border-transparent text-[#8038A1] hover:text-[#8038A1] hover:bg-[#f0e6f7]",

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
      "bg-[#f0e6f7] text-[#4C2896] border border-[#4C2896]/20 hover:bg-[#4C2896] hover:text-white",
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