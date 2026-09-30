import { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { FavoriteTeam, getFavoriteTeams } from "../../utils/favorites";
import { useTheme } from "../../context/ThemeContext";


export default function ProfileScreen() {
  const { isDark, toggleTheme, colors } = useTheme();
  const [favorites, setFavorites] = useState<FavoriteTeam[]>([]);

  useFocusEffect(
    useCallback(() => {
      const loadFavorites = async () => {
        const teams = await getFavoriteTeams();
        setFavorites(teams);
      };

      loadFavorites();
    }, []),
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text
  style={[
    styles.title,
    { color: colors.text },
  ]}
>
  Profile
</Text>

      <View style={styles.brand}>
        <View style={[styles.logoCircle, { backgroundColor: colors.card }]}>
          <Text style={styles.logo}>⚽</Text>
        </View>

        <Text style={[styles.appName, { color: colors.text }]}>Scorely</Text>

        <Text style={[styles.description, { color: colors.secondaryText }]}>
          Your football. Your teams.
        </Text>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.secondaryText }]}>
        PREFERENCES
      </Text>

      <View style={styles.section}>
        <View style={styles.row}>
          <Text
  style={[
    styles.rowIcon,
    { color: colors.text },
  ]}
>
  ☆
</Text>

          <Text style={[styles.rowText, { color: colors.text }]}>
            Favorite teams
          </Text>

          <Text style={styles.rowValue}>{favorites.length}</Text>
        </View>

        <View style={[styles.separator, { backgroundColor: colors.border }]} />

        <Pressable style={styles.row}>
          <Text
  style={[
    styles.rowIcon,
    { color: colors.text },
  ]}
>
  ♢
</Text>

          <Text style={[styles.rowText, { color: colors.text }]}>
            Notifications
          </Text>

          <Text style={styles.arrow}>›</Text>
        </Pressable>

        <View style={[styles.separator, { backgroundColor: colors.border }]} />

        <View style={styles.row}>
          <Text  style={[
    styles.rowIcon,
    { color: colors.text },
  ]}>☾</Text>

          <Text style={[styles.rowText, { color: colors.text }]}>
            Dark mode
          </Text>

          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{
              false: "#D1D1D1",
              true: "#22C55E",
            }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.secondaryText }]}>
        ABOUT
      </Text>

      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={[styles.rowText, { color: colors.text }]}>
            App version
          </Text>

          <Text style={styles.rowValue}>1.0.0</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111111",
  },

  brand: {
    alignItems: "center",
    paddingVertical: 40,
  },

  logoCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#F2F2F2",
    alignItems: "center",
    justifyContent: "center",
  },

  logo: {
    fontSize: 38,
  },

  appName: {
    marginTop: 14,
    fontSize: 24,
    fontWeight: "700",
    color: "#111111",
  },

  description: {
    marginTop: 5,
    fontSize: 14,
    color: "#888888",
  },

  sectionTitle: {
    marginTop: 20,
    marginBottom: 10,
    fontSize: 11,
    fontWeight: "700",
    color: "#999999",
    letterSpacing: 1,
  },

  section: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#EEEEEE",
  },

  row: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
  },

  rowIcon: {
    width: 35,
    fontSize: 21,
    color: "#333333",
  },

  rowText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: "#222222",
  },

  rowValue: {
    fontSize: 14,
    color: "#888888",
  },

  arrow: {
    fontSize: 25,
    color: "#AAAAAA",
  },

  separator: {
    height: 1,
    backgroundColor: "#EEEEEE",
    marginLeft: 35,
  },
});
