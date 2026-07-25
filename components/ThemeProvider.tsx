"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Tema = "dark" | "light";

const ThemeContext = createContext<{
  tema: Tema;
  toggleTema: () => void;
}>({ tema: "dark", toggleTema: () => {} });

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [tema, setTema] = useState<Tema>("dark");

  useEffect(() => {
    const salvo = (localStorage.getItem("tema") as Tema) ?? "dark";
    setTema(salvo);
    if (salvo === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  function toggleTema() {
    const novo: Tema = tema === "dark" ? "light" : "dark";
    setTema(novo);
    localStorage.setItem("tema", novo);
    if (novo === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }

  return (
    <ThemeContext.Provider value={{ tema, toggleTema }}>
      {children}
    </ThemeContext.Provider>
  );
}
