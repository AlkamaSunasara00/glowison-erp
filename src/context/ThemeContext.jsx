import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

// ─── Preset Palettes ────────────────────────────────────────────────
export const PRESETS = [
    { name: "Aubergine", primary: "#682C74", one: "#3B0A45", two: "#682C74", three: "#8E3A9E", secondary: "#FCECFF", secondaryLight: "#FEF8FF" },
    { name: "Clementine", primary: "#D84315", one: "#BF360C", two: "#D84315", three: "#F4511E", secondary: "#FFF3E0", secondaryLight: "#FFFAF5" },
    { name: "Banana", primary: "#E6A700", one: "#C68A00", two: "#E6A700", three: "#F5C400", secondary: "#FFFDE7", secondaryLight: "#FFFEF5" },
    { name: "Jade", primary: "#2E7D32", one: "#1B5E20", two: "#2E7D32", three: "#43A047", secondary: "#E8F5E9", secondaryLight: "#F5FBF5" },
    { name: "Lagoon", primary: "#0277BD", one: "#01579B", two: "#0277BD", three: "#039BE5", secondary: "#E1F5FE", secondaryLight: "#F5FBFF" },
    { name: "Barbra", primary: "#E91E90", one: "#AD1457", two: "#E91E90", three: "#F06292", secondary: "#FCE4EC", secondaryLight: "#FFF5F8" },
    { name: "Gray", primary: "#546E7A", one: "#37474F", two: "#546E7A", three: "#78909C", secondary: "#ECEFF1", secondaryLight: "#F8F9FA" },
    { name: "Mood Indigo", primary: "#283593", one: "#1A237E", two: "#283593", three: "#3949AB", secondary: "#E8EAF6", secondaryLight: "#F5F5FF" },
    { name: "Tritanopia", primary: "#1B1B2F", one: "#0F0F1A", two: "#1B1B2F", three: "#2C2C4A", secondary: "#E8E8F0", secondaryLight: "#F5F5FA" },
    { name: "Ocean Breeze", primary: "#00838F", one: "#006064", two: "#00838F", three: "#00ACC1", secondary: "#E0F7FA", secondaryLight: "#F5FDFE" },
];

// ─── Color Utilities ────────────────────────────────────────────────
function hexToHSL(hex) {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex(h, s, l) {
    s /= 100; l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = (n) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

/** Generate a full palette from a single hex color */
export function generatePalette(hex) {
    const { h, s, l } = hexToHSL(hex);
    return {
        primary: hex,
        one: hslToHex(h, Math.min(s + 10, 100), Math.max(l - 18, 5)),
        two: hex,
        three: hslToHex(h, Math.min(s + 5, 100), Math.min(l + 12, 90)),
        secondary: hslToHex(h, Math.min(s, 40), 93),
        secondaryLight: hslToHex(h, Math.min(s, 30), 97),
    };
}

// ─── Context ────────────────────────────────────────────────────────
const ThemeContext = createContext(undefined);

export function ThemeProvider({ children }) {
    const [mode, setMode] = useState("system");          // light | dark | system
    const [accentPreset, setAccentPreset] = useState("Aubergine");  // preset name or "custom"
    const [customColor, setCustomColor] = useState("#682C74");
    const [resolvedMode, setResolvedMode] = useState("light");       // actual light/dark after system resolve
    const [hydrated, setHydrated] = useState(false);

    // ── Hydrate from localStorage ──
    useEffect(() => {
        try {
            const savedMode = localStorage.getItem("theme-mode");
            const savedAccent = localStorage.getItem("theme-accent");
            const savedCustom = localStorage.getItem("theme-custom-color");
            if (savedMode) setMode(savedMode);
            if (savedAccent) setAccentPreset(savedAccent);
            if (savedCustom) setCustomColor(savedCustom);
        } catch (e) { /* SSR guard */ }
        setHydrated(true);
    }, []);

    // ── Persist to localStorage ──
    useEffect(() => {
        if (!hydrated) return;
        try {
            localStorage.setItem("theme-mode", mode);
            localStorage.setItem("theme-accent", accentPreset);
            localStorage.setItem("theme-custom-color", customColor);
        } catch (e) { /* SSR guard */ }
    }, [mode, accentPreset, customColor, hydrated]);

    // ── Resolve system mode ──
    useEffect(() => {
        if (mode !== "system") {
            setResolvedMode(mode);
            return;
        }
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        setResolvedMode(mq.matches ? "dark" : "light");
        const handler = (e) => setResolvedMode(e.matches ? "dark" : "light");
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, [mode]);

    // ── Apply dark class ──
    useEffect(() => {
        if (!hydrated) return;
        document.documentElement.classList.toggle("dark", resolvedMode === "dark");
    }, [resolvedMode, hydrated]);

    // ── Get active palette ──
    const getActivePalette = useCallback(() => {
        if (accentPreset === "custom") {
            return generatePalette(customColor);
        }
        return PRESETS.find((p) => p.name === accentPreset) || PRESETS[0];
    }, [accentPreset, customColor]);

    // ── Inject CSS variables ──
    useEffect(() => {
        if (!hydrated) return;
        const palette = getActivePalette();
        const root = document.documentElement;
        root.style.setProperty("--color-primary", palette.primary);
        root.style.setProperty("--color-one", palette.one);
        root.style.setProperty("--color-two", palette.two);
        root.style.setProperty("--color-three", palette.three);
        root.style.setProperty("--color-secondary", palette.secondary);
        root.style.setProperty("--color-secondary-light", palette.secondaryLight);
    }, [getActivePalette, hydrated]);

    // ── Actions ──
    const setAccent = (presetName) => {
        setAccentPreset(presetName);
    };

    const applyCustomColor = (hex) => {
        setCustomColor(hex);
        setAccentPreset("custom");
    };

    return (
        <ThemeContext.Provider
            value={{
                mode,
                setMode,
                accentPreset,
                setAccent,
                customColor,
                setCustomColor,
                applyCustomColor,
                resolvedMode,
                activePalette: getActivePalette(),
                presets: PRESETS,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
    return ctx;
}

export default ThemeContext;
