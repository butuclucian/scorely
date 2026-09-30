import AsyncStorage from "@react-native-async-storage/async-storage";

const THEME_KEY = "@scorely_theme";

export type ThemeMode = "light" | "dark";

export async function getTheme(): Promise<ThemeMode> {
  try {
    const theme = await AsyncStorage.getItem(THEME_KEY);

    if (theme === "dark") {
      return "dark";
    }

    return "light";
  } catch (error) {
    console.error("Failed to load theme:", error);
    return "light";
  }
}

export async function saveTheme(
  theme: ThemeMode
): Promise<void> {
  try {
    await AsyncStorage.setItem(THEME_KEY, theme);
  } catch (error) {
    console.error("Failed to save theme:", error);
  }
}