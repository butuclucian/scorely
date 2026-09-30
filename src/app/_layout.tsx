import { Stack } from "expo-router";
import { ThemeProvider } from "../context/ThemeContext";
import { LeagueProvider } from "../context/LeagueContext";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <LeagueProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
      </LeagueProvider>
    </ThemeProvider>
  );
}