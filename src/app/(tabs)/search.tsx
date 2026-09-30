import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { API_URL } from "../../config/api";

type SearchTeam = {
  id: number;
  name: string;
  shortCode: string | null;
  logo: string;
  countryId: number;
};

type SearchPlayer = {
  id: number;
  name: string;
  image: string;
  positionId: number | null;
  nationalityId: number | null;
  dateOfBirth: string | null;
};

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [teams, setTeams] = useState<SearchTeam[]>([]);
  const [players, setPlayers] = useState<SearchPlayer[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function search() {
    const value = query.trim();

    if (value.length < 2) {
      setTeams([]);
      setPlayers([]);
      setSearched(false);
      return;
    }

    try {
      setLoading(true);
      setSearched(true);

      const response = await fetch(
        `${API_URL}/api/search?q=${encodeURIComponent(value)}`
      );

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();

      setTeams(data.teams || []);
      setPlayers(data.players || []);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Search</Text>

        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>⌕</Text>

          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search teams or players..."
            placeholderTextColor="#999999"
            style={styles.input}
            returnKeyType="search"
            onSubmitEditing={search}
          />

          {query.length > 0 && (
            <Pressable
              onPress={() => {
                setQuery("");
                setTeams([]);
                setPlayers([]);
                setSearched(false);
              }}
            >
              <Text style={styles.clear}>×</Text>
            </Pressable>
          )}
        </View>

        <Pressable
          style={styles.searchButton}
          onPress={search}
        >
          <Text style={styles.searchButtonText}>
            Search
          </Text>
        </Pressable>

        {loading ? (
          <ActivityIndicator
            size="small"
            color="#111111"
            style={styles.loader}
          />
        ) : (
          <>
            {teams.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  TEAMS
                </Text>

                {teams.map((team) => (
                  <Pressable
                    key={team.id}
                    style={({ pressed }) => [
                      styles.resultRow,
                      pressed && styles.pressed,
                    ]}
                    onPress={() =>
                      router.push({
                        pathname: "/team/[id]",
                        params: {
                          id: team.id.toString(),
                        },
                      })
                    }
                  >
                    <Image
                      source={{ uri: team.logo }}
                      style={styles.teamLogo}
                    />

                    <View style={styles.resultInfo}>
                      <Text style={styles.resultName}>
                        {team.name}
                      </Text>

                      {team.shortCode && (
                        <Text style={styles.resultSubtext}>
                          {team.shortCode}
                        </Text>
                      )}
                    </View>

                    <Text style={styles.chevron}>›</Text>
                  </Pressable>
                ))}
              </View>
            )}

            {players.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  PLAYERS
                </Text>

                {players.map((player) => (
                  <Pressable
                    key={player.id}
                    style={({ pressed }) => [
                      styles.resultRow,
                      pressed && styles.pressed,
                    ]}
                    onPress={() =>
                      router.push({
                        pathname: "/player/[id]",
                        params: {
                          id: player.id.toString(),
                        },
                      })
                    }
                  >
                    <Image
                      source={{ uri: player.image }}
                      style={styles.playerImage}
                    />

                    <View style={styles.resultInfo}>
                      <Text style={styles.resultName}>
                        {player.name}
                      </Text>

                      {player.dateOfBirth && (
                        <Text style={styles.resultSubtext}>
                          {player.dateOfBirth}
                        </Text>
                      )}
                    </View>

                    <Text style={styles.chevron}>›</Text>
                  </Pressable>
                ))}
              </View>
            )}

            {searched &&
              teams.length === 0 &&
              players.length === 0 && (
                <View style={styles.empty}>
                  <Text style={styles.emptyTitle}>
                    No results
                  </Text>

                  <Text style={styles.emptyText}>
                    No teams or players found.
                  </Text>
                </View>
              )}

            {!searched && (
              <View style={styles.initial}>
                <Text style={styles.initialIcon}>⌕</Text>

                <Text style={styles.initialTitle}>
                  Find teams and players
                </Text>

                <Text style={styles.initialText}>
                  Search by name to open their profile.
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  content: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111111",
    marginBottom: 28,
  },

  searchBar: {
    height: 52,
    backgroundColor: "#F7F7F7",
    borderRadius: 14,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  searchIcon: {
    fontSize: 24,
    color: "#888888",
    marginRight: 10,
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: "#111111",
  },

  clear: {
    fontSize: 25,
    color: "#888888",
    paddingHorizontal: 4,
  },

  searchButton: {
    height: 46,
    backgroundColor: "#22C55E",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },

  searchButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  loader: {
    marginTop: 50,
  },

  section: {
    marginTop: 28,
  },

  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#999999",
    letterSpacing: 1,
    marginBottom: 8,
  },

  resultRow: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },

  pressed: {
    opacity: 0.5,
  },

  teamLogo: {
    width: 34,
    height: 34,
    resizeMode: "contain",
    marginRight: 12,
  },

  playerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    resizeMode: "cover",
    marginRight: 12,
    backgroundColor: "#F1F1F1",
  },

  resultInfo: {
    flex: 1,
  },

  resultName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111111",
  },

  resultSubtext: {
    fontSize: 11,
    color: "#999999",
    marginTop: 3,
  },

  chevron: {
    fontSize: 25,
    color: "#BBBBBB",
  },

  empty: {
    alignItems: "center",
    marginTop: 70,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111111",
  },

  emptyText: {
    fontSize: 13,
    color: "#999999",
    marginTop: 5,
  },

  initial: {
    alignItems: "center",
    marginTop: 75,
  },

  initialIcon: {
    fontSize: 40,
    color: "#CCCCCC",
  },

  initialTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111111",
    marginTop: 12,
  },

  initialText: {
    fontSize: 13,
    color: "#999999",
    marginTop: 5,
  },
});