import { useEffect, useState } from "react";

const THEMES = ["blue", "red", "dark"];

function getInitialTheme() {
  const savedTheme = window.localStorage.getItem("theme");
  return THEMES.includes(savedTheme) ? savedTheme : "blue";
}

export function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  return { theme, setTheme, themes: THEMES };
}
