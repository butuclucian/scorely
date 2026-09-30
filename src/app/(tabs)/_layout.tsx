import { Tabs } from "expo-router";
import { useTheme } from "../../context/ThemeContext";

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.secondaryText,

        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
          height: 65,
        },

        sceneStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Tabs.Screen
  name="index"
  options={{ title: "Matches" }}
/>

<Tabs.Screen
  name="standings"
  options={{ title: "Standings" }}
/>

<Tabs.Screen
  name="search"
  options={{ title: "Search" }}
/>

<Tabs.Screen
  name="favorites"
  options={{ title: "Favorites" }}
/>

<Tabs.Screen
  name="profile"
  options={{ title: "Profile" }}
/>
    </Tabs>
  );
}