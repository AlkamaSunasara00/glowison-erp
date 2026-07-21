import React, { createContext, useContext, useEffect, useState } from 'react';

export const ThemeContext = createContext();

export const themes = {
  Glowison: {
    primary: "#1F3C88",
    secondary: "#ffedd5",
    secondaryLight: "#fff7ed",
    one: "#162a60",
    two: "#1F3C88",
    three: "#F5A623"
  },
  "Modern SaaS": {
    primary: "#4F46E5",
    secondary: "#EEF2FF",
    secondaryLight: "#FFFFFF",
    one: "#1E1B4B",
    two: "#3730A3",
    three: "#F59E0B"
  },
  "Midnight Teal": {
    primary: "#0D9488",
    secondary: "#F0FDFA",
    secondaryLight: "#FFFFFF",
    one: "#042F2E",
    two: "#115E59",
    three: "#F59E0B"
  },
  "Nordic Sky": {
    primary: "#0284C7",
    secondary: "#F0F9FF",
    secondaryLight: "#FFFFFF",
    one: "#082F49",
    two: "#0369A1",
    three: "#EA580C"
  },
  "Royal Violet": {
    primary: "#9333EA",
    secondary: "#FAF5FF",
    secondaryLight: "#FFFFFF",
    one: "#3B0764",
    two: "#7E22CE",
    three: "#10B981"
  },
  "Charcoal Gold": {
    primary: "#D97706",
    secondary: "#FFFBEB",
    secondaryLight: "#FFFFFF",
    one: "#18181B",
    two: "#3F3F46",
    three: "#EF4444"
  },
  Aubergine: {
    primary: "#4A154B",
    secondary: "#F4EDE4",
    secondaryLight: "#F9F6F1",
    one: "#350D36",
    two: "#4A154B",
    three: "#1164A3"
  },
  Clementine: {
    primary: "#D9420E",
    secondary: "#F8F1EB",
    secondaryLight: "#FCFAF8",
    one: "#9A2F08",
    two: "#D9420E",
    three: "#136067"
  },
  Banana: {
    primary: "#E9B000",
    secondary: "#FDF9EB",
    secondaryLight: "#FEFDF5",
    one: "#B28400",
    two: "#E9B000",
    three: "#2F503C"
  },
  Jade: {
    primary: "#005544",
    secondary: "#EAF5F2",
    secondaryLight: "#F2F9F7",
    one: "#003328",
    two: "#005544",
    three: "#D9420E"
  },
  Lagoon: {
    primary: "#005A7A",
    secondary: "#E6F4F9",
    secondaryLight: "#F1F9FC",
    one: "#003D54",
    two: "#005A7A",
    three: "#A1254A"
  },
  Barbra: {
    primary: "#600021",
    secondary: "#FBE6ED",
    secondaryLight: "#FDF0F4",
    one: "#400014",
    two: "#600021",
    three: "#005A7A"
  },
  Gray: {
    primary: "#1E1E1E",
    secondary: "#F2F2F2",
    secondaryLight: "#F9F9F9",
    one: "#0F0F0F",
    two: "#1E1E1E",
    three: "#005A7A"
  },
  "Mood Indigo": {
    primary: "#0A1B51",
    secondary: "#E8ECF5",
    secondaryLight: "#F2F4F9",
    one: "#050C26",
    two: "#0A1B51",
    three: "#872F48"
  },
  "Ocean Breeze": {
    primary: "#006064",
    secondary: "#e0f7fa",
    secondaryLight: "#f0fbfb",
    one: "#00363a",
    two: "#006064",
    three: "#ff6f00"
  },
  "Midnight Rose": {
    primary: "#18181b",
    secondary: "#fce7f3",
    secondaryLight: "#fdf2f8",
    one: "#09090b",
    two: "#18181b",
    three: "#be185d"
  },
  "Royal Amethyst": {
    primary: "#4c1d95",
    secondary: "#f3e8ff",
    secondaryLight: "#faf5ff",
    one: "#2e1065",
    two: "#4c1d95",
    three: "#f59e0b"
  },
  "Emerald Forest": {
    primary: "#064e3b",
    secondary: "#d1fae5",
    secondaryLight: "#ecfdf5",
    one: "#022c22",
    two: "#064e3b",
    three: "#d97706"
  },
  "Crimson Dawn": {
    primary: "#7f1d1d",
    secondary: "#fee2e2",
    secondaryLight: "#fef2f2",
    one: "#450a0a",
    two: "#7f1d1d",
    three: "#b45309"
  },
  "Slate Graphite": {
    primary: "#334155",
    secondary: "#f1f5f9",
    secondaryLight: "#f8fafc",
    one: "#0f172a",
    two: "#334155",
    three: "#0284c7"
  }
};

export const ThemeProvider = ({ children }) => {
  const [activeTheme, setActiveTheme] = useState("Glowison");

  useEffect(() => {
    const savedTheme = localStorage.getItem("glowison-theme");
    if (savedTheme && themes[savedTheme]) {
      setActiveTheme(savedTheme);
      applyTheme(themes[savedTheme]);
    } else {
      applyTheme(themes.Glowison);
    }
  }, []);

  const changeTheme = (themeName) => {
    if (themes[themeName]) {
      setActiveTheme(themeName);
      localStorage.setItem("glowison-theme", themeName);
      applyTheme(themes[themeName]);
    }
  };

  const applyTheme = (theme) => {
    const root = document.documentElement;
    root.style.setProperty("--color-primary", theme.primary);
    root.style.setProperty("--color-secondary", theme.secondary);
    root.style.setProperty("--color-secondary-light", theme.secondaryLight);
    root.style.setProperty("--color-one", theme.one);
    root.style.setProperty("--color-two", theme.two);
    root.style.setProperty("--color-three", theme.three);

    // Update browser/PWA theme color
    let metaThemeColor = document.querySelector("meta[name=theme-color]");
    if (metaThemeColor) {
      metaThemeColor.content = theme.primary;
    } else {
      metaThemeColor = document.createElement("meta");
      metaThemeColor.name = "theme-color";
      metaThemeColor.content = theme.primary;
      document.head.appendChild(metaThemeColor);
    }
  };

  return (
    <ThemeContext.Provider value={{ activeTheme, themes, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
