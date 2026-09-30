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

type Team = {
  id: number;
  name: string;
  logo: string;
};

type Match = {
  id: number;
  date: string;
  status: string;

  score: {
    home: number | null;
    away: number | null;
  };

  homeTeam: Team;
  awayTeam: Team;
};

export default function Index() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 8, 19));
  const [leagueMenuOpen, setLeagueMenuOpen] = useState(false);
  const { selectedLeague, setSelectedLeague} = useLeague();

  useEffect(() => {
  loadMatches();
}, [selectedDate, selectedLeague.id]);



  async function loadMatches() {
  try {
    setLoading(true);

    const response = await fetch(
      `${API_URL}/api/matches?date=${formatApiDate(
        selectedDate
      )}&league=${selectedLeague.id}`
    );

    const data = await response.json();

    setMatches(data);
  } catch (error) {
    console.error("Failed to load matches:", error);
  } finally {
    setLoading(false);
  }
}

  function getTime(date: string) {
    return date.substring(11, 16);
  }

  function formatApiDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function formatDisplayDate(date: Date) {
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
    });
  }

  function changeDate(days: number) {
    setSelectedDate((current) => {
      const newDate = new Date(current);
      newDate.setDate(newDate.getDate() + days);
      return newDate;
    });
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>Scorely</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.dateSelector}>
          <Text style={styles.arrow} onPress={() => changeDate(-1)}>
            ‹
          </Text>

          <Text style={styles.date}>{formatDisplayDate(selectedDate)}</Text>

          <Text style={styles.arrow} onPress={() => changeDate(1)}>
            ›
          </Text>
        </View>

        <View style={styles.leagueSelectorContainer}>
  <Pressable
    style={styles.leagueSelector}
    onPress={() =>
      setLeagueMenuOpen((current) => !current)
    }
  >
    <View style={styles.leagueSelectorLeft}>
      <Text style={styles.leagueFlag}>
        {selectedLeague.flag}
      </Text>

      <Text style={styles.leagueSelectorName}>
        {selectedLeague.name}
      </Text>
    </View>

    <Text style={styles.leagueArrow}>
      {leagueMenuOpen ? "▲" : "▼"}
    </Text>
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
          <Text style={styles.leagueFlag}>
            {league.flag}
          </Text>

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

        {loading ? (
          <ActivityIndicator size="small" style={styles.loader} />
        ) : matches.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No matches</Text>
            <Text style={styles.emptyText}>
  No {selectedLeague.name} matches on this day.
</Text>
          </View>
        ) : (
          matches.map((match) => (
            <Pressable
              key={match.id}
              style={styles.match}
              onPress={() =>
                router.push({
                  pathname: "/match/[id]",
                  params: { id: match.id.toString() },
                })
              }
            >
              <Text style={styles.time}>
                {match.status === "FT" ? "FT" : getTime(match.date)}
              </Text>

              <View style={styles.teams}>
                <View style={styles.team}>
                  <Image
                    source={{ uri: match.homeTeam.logo }}
                    style={styles.teamLogo}
                  />

                  <Text style={styles.teamName}>{match.homeTeam.name}</Text>
                  <Text style={styles.score}>{match.score.home ?? "-"}</Text>
                </View>

                <View style={styles.team}>
                  <Image
                    source={{ uri: match.awayTeam.logo }}
                    style={styles.teamLogo}
                  />

                  <Text style={styles.teamName}>{match.awayTeam.name}</Text>
                  <Text style={styles.score}>{match.score.away ?? "-"}</Text>
                </View>
              </View>
            </Pressable>
          ))
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

  header: {
    paddingTop: 65,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  logo: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111111",
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  match: {
    flexDirection: "row",
    paddingVertical: 17,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },

  time: {
    width: 55,
    fontSize: 13,
    color: "#777777",
    paddingTop: 5,
  },

  teams: {
    flex: 1,
    gap: 12,
  },

  team: {
    flexDirection: "row",
    alignItems: "center",
  },

  teamLogo: {
    width: 24,
    height: 24,
    resizeMode: "contain",
    marginRight: 10,
  },

  teamName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111111",
  },

  loader: {
    marginTop: 50,
  },
  score: {
    marginLeft: "auto",
    fontSize: 15,
    fontWeight: "700",
    color: "#111111",
  },
  dateSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },

  date: {
    fontSize: 14,
    color: "#111111",
    fontWeight: "600",
  },

  arrow: {
    fontSize: 28,
    color: "#777777",
    paddingHorizontal: 10,
  },
  empty: {
    alignItems: "center",
    paddingTop: 60,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111111",
  },

  emptyText: {
    fontSize: 13,
    color: "#999999",
    marginTop: 5,
  },
  leagueSelectorContainer: {
  marginBottom: 16,
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
});
