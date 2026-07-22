import { useEffect, useState } from "react";

export const THEME_OPTIONS = Object.freeze([
  { value: "blue", label: "Ocean", hint: "Cool and focused", swatch: "#397496" },
  { value: "red", label: "Ember", hint: "Warm and energetic", swatch: "#c93434" },
  { value: "dark", label: "Midnight", hint: "Easy on the eyes", swatch: "#303134" },
]);

const THEMES = THEME_OPTIONS.map((option) => option.value);

function getInitialTheme() {
  const savedTheme = window.localStorage.getItem("theme");
  return THEMES.includes(savedTheme) ? savedTheme : "blue";
}

export function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  return { theme, setTheme, themeOptions: THEME_OPTIONS };
}
