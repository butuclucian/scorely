import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getTheme,
  saveTheme,
  ThemeMode,
} from "../utils/theme";

import {
  lightColors,
  darkColors,
} from "../theme/colors";

type ThemeContextType = {
  theme: ThemeMode;
  isDark: boolean;
  colors: typeof lightColors;
  toggleTheme: () => Promise<void>;
};

const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);

export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [theme, setTheme] = useState<ThemeMode>("light");

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await getTheme();
      setTheme(savedTheme);
    };

    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme: ThemeMode =
      theme === "light" ? "dark" : "light";

    setTheme(newTheme);
    await saveTheme(newTheme);
  };

  const isDark = theme === "dark";

  const colors = isDark
    ? darkColors
    : lightColors;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark,
        colors,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used inside ThemeProvider"
    );
  }

  return context;
}