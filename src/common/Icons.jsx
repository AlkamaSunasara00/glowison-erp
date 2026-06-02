import React from "react";
import * as LucideIcons from "lucide-react";

const Icons = ({ name, size = 24, color = "currentColor", ...props }) => {
  const IconComponent = LucideIcons[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" does not exist in Lucide.`);
    return null;
  }

  return <IconComponent size={size} color={color} {...props} />;
};

export default Icons;
