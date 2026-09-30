import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import {
  LEAGUES,
  useLeague,
} from "../../context/LeagueContext";
import { API_URL } from "../../config/api";

type StandingDetail = {
  id: number;
  value: number;
  type: {
    id: number;
    name: string;
    code: string;
  };
};

type Standing = {
  id: number;
  position: number;
  points: number;

  participant: {
    id: number;
    name: string;
    short_code: string;
    image_path: string;
  };

  details: StandingDetail[];
};
export default function StandingsScreen() {
  const [standings, setStandings] = useState<Standing[]>([]);
  const [loading, setLoading] = useState(true);
  const [leagueMenuOpen, setLeagueMenuOpen] = useState(false);
  const { selectedLeague, setSelectedLeague } = useLeague();

  useEffect(() => {
    loadStandings();
  }, [selectedLeague.id]);

  async function loadStandings() {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/standings?league=${selectedLeague.id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch standings");
      }

      const data = await response.json();

      const sorted = [...data].sort(
        (a, b) => a.position - b.position
      );

      setStandings(sorted);
    } catch (error) {
      console.error("Standings error:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="small" color="#111111" />
      </View>
    );
  }

  function getDetail(team: Standing, code: string): number {
  return (
    team.details?.find(
      (detail) => detail.type?.code === code
    )?.value ?? 0
  );
}

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Standings</Text>

      <View style={styles.leagueSelectorContainer}>
        <Pressable
          style={styles.leagueSelector}
          onPress={() => setLeagueMenuOpen((current) => !current)}
        >
          <View style={styles.leagueSelectorLeft}>
            <Text style={styles.leagueFlag}>{selectedLeague.flag}</Text>

            <Text style={styles.leagueSelectorName}>{selectedLeague.name}</Text>
          </View>

          <Text style={styles.leagueArrow}>{leagueMenuOpen ? "▲" : "▼"}</Text>
        </Pressable>

        {leagueMenuOpen && (
          <View style={styles.leagueMenu}>
            {LEAGUES.map((league) => (
              <Pressable
                key={league.id}
                style={[
                  styles.leagueOption,
                  selectedLeague.id === league.id &&
                    styles.selectedLeagueOption,
                ]}
                onPress={() => {
                  setSelectedLeague(league);
                  setLeagueMenuOpen(false);
                }}
              >
                <Text style={styles.leagueFlag}>{league.flag}</Text>

                <Text
                  style={[
                    styles.leagueOptionText,
                    selectedLeague.id === league.id &&
                      styles.selectedLeagueText,
                  ]}
                >
                  {league.name}
                </Text>

                {selectedLeague.id === league.id && (
                  <Text style={styles.leagueCheck}>✓</Text>
                )}
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <View style={styles.tableHeader}>
        <Text style={styles.positionHeader}>#</Text>
        <Text style={styles.teamHeader}>TEAM</Text>

        <Text style={styles.statHeader}>P</Text>
        <Text style={styles.statHeader}>W</Text>
        <Text style={styles.statHeader}>D</Text>
        <Text style={styles.statHeader}>L</Text>
        <Text style={styles.gdHeader}>GD</Text>

        <Text style={styles.pointsHeader}>PTS</Text>
      </View>

      {standings.map((team) => {
  const played = getDetail(
    team,
    "overall-matches-played"
  );

  const won = getDetail(
    team,
    "overall-won"
  );

  const draw = getDetail(
    team,
    "overall-draw"
  );

  const lost = getDetail(
    team,
    "overall-lost"
  );

  const goalDifference = getDetail(
    team,
    "goal-difference"
  );

  return (
    <Pressable
      key={team.id}
      style={({ pressed }) => [
        styles.row,
        pressed && styles.rowPressed,
      ]}
      onPress={() =>
        router.push({
          pathname: "/team/[id]",
          params: {
            id: team.participant.id.toString(),
          },
        })
      }
    >
      <Text style={styles.position}>
        {team.position}
      </Text>

      <View style={styles.team}>
        <Image
          source={{
            uri: team.participant.image_path,
          }}
          style={styles.logo}
        />

        <Text
          style={styles.teamName}
          numberOfLines={1}
        >
          {team.participant.name}
        </Text>
      </View>

      <Text style={styles.stat}>{played}</Text>
      <Text style={styles.stat}>{won}</Text>
      <Text style={styles.stat}>{draw}</Text>
      <Text style={styles.stat}>{lost}</Text>

      <Text style={styles.gd}>
        {goalDifference > 0
          ? `+${goalDifference}`
          : goalDifference}
      </Text>

      <Text style={styles.points}>
        {team.points}
      </Text>
    </Pressable>
  );
})}
    </ScrollView>
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
  rowPressed: {
  opacity: 0.5,
},

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111111",
    marginBottom: 35,
  },

  leagueSelectorContainer: {
  marginBottom: 18,
},

leagueSelector: {
  height: 52,
  backgroundColor: "#F7F7F7",
  borderRadius: 14,
  paddingHorizontal: 14,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
},

leagueSelectorLeft: {
  flexDirection: "row",
  alignItems: "center",
},

leagueFlag: {
  fontSize: 19,
  marginRight: 10,
},

leagueSelectorName: {
  fontSize: 15,
  fontWeight: "700",
  color: "#111111",
},

leagueArrow: {
  fontSize: 10,
  color: "#888888",
},

leagueMenu: {
  marginTop: 6,
  backgroundColor: "#FFFFFF",
  borderWidth: 1,
  borderColor: "#EEEEEE",
  borderRadius: 14,
  overflow: "hidden",
},

leagueOption: {
  height: 52,
  paddingHorizontal: 14,
  flexDirection: "row",
  alignItems: "center",
},

selectedLeagueOption: {
  backgroundColor: "#F7F7F7",
},

leagueOptionText: {
  flex: 1,
  fontSize: 14,
  fontWeight: "600",
  color: "#111111",
},

selectedLeagueText: {
  color: "#22C55E",
},

leagueCheck: {
  fontSize: 16,
  fontWeight: "800",
  color: "#22C55E",
},

  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    height: 35,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },

  positionHeader: {
  width: 24,
  fontSize: 9,
  fontWeight: "700",
  color: "#999999",
},

teamHeader: {
  flex: 1,
  fontSize: 9,
  fontWeight: "700",
  color: "#999999",
},

statHeader: {
  width: 24,
  textAlign: "center",
  fontSize: 9,
  fontWeight: "700",
  color: "#999999",
},

gdHeader: {
  width: 32,
  textAlign: "center",
  fontSize: 9,
  fontWeight: "700",
  color: "#999999",
},

pointsHeader: {
  width: 34,
  textAlign: "right",
  fontSize: 9,
  fontWeight: "700",
  color: "#999999",
},

  row: {
  flexDirection: "row",
  alignItems: "center",
  minHeight: 58,
  borderBottomWidth: 1,
  borderBottomColor: "#EEEEEE",
},

  position: {
  width: 24,
  fontSize: 12,
  fontWeight: "600",
  color: "#777777",
},

team: {
  flex: 1,
  flexDirection: "row",
  alignItems: "center",
  paddingRight: 5,
},

logo: {
  width: 24,
  height: 24,
  resizeMode: "contain",
  marginRight: 7,
},

teamName: {
  flex: 1,
  fontSize: 12,
  fontWeight: "600",
  color: "#111111",
},

stat: {
  width: 24,
  textAlign: "center",
  fontSize: 11,
  color: "#666666",
},

gd: {
  width: 32,
  textAlign: "center",
  fontSize: 11,
  fontWeight: "500",
  color: "#444444",
},

points: {
  width: 34,
  textAlign: "right",
  fontSize: 13,
  fontWeight: "700",
  color: "#111111",
},
});