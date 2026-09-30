import { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import {
  FavoriteTeam,
  getFavoriteTeams,
  removeFavoriteTeam,
} from "../../utils/favorites";
import { API_URL } from "../../config/api";

type Match = {
  id: number;
  date: string;
  status: string;

  score: {
    home: number | null;
    away: number | null;
  };

  homeTeam: {
    id: number;
    name: string;
    logo: string;
  };

  awayTeam: {
    id: number;
    name: string;
    logo: string;
  };
};

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<FavoriteTeam[]>([]);
  const [nextMatches, setNextMatches] = useState<Record<number, Match | null>>(
    {},
  );

  const router = useRouter();

  const loadFavorites = async () => {
    const teams = await getFavoriteTeams();

    setFavorites(teams);

    await loadNextMatches(teams);
  };

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, []),
  );

  const removeFavorite = async (teamId: number) => {
    await removeFavoriteTeam(teamId);
    await loadFavorites();
  };

  const loadNextMatches = async (
  teams: FavoriteTeam[]
) => {
  const matches: Record<number, Match | null> = {};

  await Promise.all(
    teams.map(async (team) => {
      try {
        const response = await fetch(
          `${API_URL}/api/teams/${team.id}/fixtures`
        );

        const fixtures: Match[] =
          await response.json();

        const now = Date.now();

        const nextFixture = fixtures.find(
          (fixture) =>
            fixture.status === "NS" &&
            new Date(fixture.date).getTime() >= now
        );

        matches[team.id] =
          nextFixture ?? null;
      } catch (error) {
        console.error(
          `Failed to load matches for ${team.name}:`,
          error
        );

        matches[team.id] = null;
      }
    })
  );

  setNextMatches(matches);
};

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Favorites</Text>
      <Text style={styles.subtitle}>YOUR TEAMS</Text>

      {favorites.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyStar}>☆</Text>

          <Text style={styles.emptyTitle}>No favorite teams yet</Text>

          <Text style={styles.emptyText}>
            Add teams to your favorites to see them here.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {favorites.map((team) => {
            const nextMatch = nextMatches[team.id];

            return (
              <View key={team.id} style={styles.favoriteCard}>
                <View style={styles.teamRow}>
                  <View style={styles.teamInfo}>
                    <Image source={{ uri: team.logo }} style={styles.logo} />

                    <Text style={styles.teamName}>{team.name}</Text>
                  </View>

                  <Pressable
                    onPress={() => removeFavorite(team.id)}
                    hitSlop={10}
                  >
                    <Text style={styles.star}>★</Text>
                  </Pressable>
                </View>

                {nextMatch && (
                  <Pressable
                    style={styles.nextMatch}
                    onPress={() =>
                      router.push({
                        pathname: "/match/[id]",
                        params: { id: nextMatch.id.toString() },
                      })
                    }
                  >
                    <Text style={styles.nextLabel}>NEXT MATCH</Text>

                    <View style={styles.matchRow}>
                      <View style={styles.matchTeam}>
                        <Image
                          source={{ uri: nextMatch.homeTeam.logo }}
                          style={styles.matchLogo}
                        />

                        <Text style={styles.matchTeamName}>
                          {nextMatch.homeTeam.name}
                        </Text>
                      </View>

                      <View style={styles.matchCenter}>
                        <Text style={styles.matchDate}>
                          {new Date(
                            nextMatch.date.replace(" ", "T"),
                          ).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                          })}
                        </Text>

                        <Text style={styles.matchTime}>
                          {nextMatch.date.substring(11, 16)}
                        </Text>
                      </View>

                      <View style={styles.matchTeam}>
                        <Image
                          source={{ uri: nextMatch.awayTeam.logo }}
                          style={styles.matchLogo}
                        />

                        <Text style={styles.matchTeamName}>
                          {nextMatch.awayTeam.name}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                )}
              </View>
            );
          })}
        </View>
      )}
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

  subtitle: {
    marginTop: 30,
    marginBottom: 12,
    fontSize: 12,
    fontWeight: "700",
    color: "#888888",
    letterSpacing: 1,
  },

  list: {
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },

  teamRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },

  teamInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  logo: {
    width: 42,
    height: 42,
    resizeMode: "contain",
    marginRight: 14,
  },

  teamName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111111",
  },

  star: {
    fontSize: 24,
    color: "#111111",
  },

  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
  },

  emptyStar: {
    fontSize: 48,
    color: "#CCCCCC",
    marginBottom: 15,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#222222",
  },

  emptyText: {
    fontSize: 14,
    color: "#888888",
    marginTop: 8,
    textAlign: "center",
  },
  favoriteCard: {
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    paddingBottom: 18,
    marginBottom: 18,
  },

  nextMatch: {
    marginTop: 10,
    backgroundColor: "#F7F7F7",
    borderRadius: 12,
    padding: 14,
  },

  nextLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#888888",
    letterSpacing: 1,
    marginBottom: 14,
  },

  matchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  matchTeam: {
    flex: 1,
    alignItems: "center",
  },

  matchLogo: {
    width: 32,
    height: 32,
    resizeMode: "contain",
    marginBottom: 6,
  },

  matchTeamName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#222222",
    textAlign: "center",
  },

  matchCenter: {
    width: 70,
    alignItems: "center",
  },

  matchDate: {
    fontSize: 11,
    fontWeight: "600",
    color: "#777777",
    textTransform: "uppercase",
  },

  matchTime: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111111",
    marginTop: 3,
  },
});
