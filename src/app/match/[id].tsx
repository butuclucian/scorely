import { useLocalSearchParams, router } from "expo-router";
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
import {
  addFavoriteTeam,
  getFavoriteTeams,
  removeFavoriteTeam,
} from "../../utils/favorites";
import { API_URL } from "../../config/api";

type Team = {
  id: number;
  name: string;
  logo: string;
};

type MatchEvent = {
  id: number;
  minute: number;
  extraMinute: number | null;
  type: string;
  participantId: number;
  playerName: string | null;
  relatedPlayerName: string | null;
  result: string | null;
  info: string | null;
};

type LineupPlayer = {
  id: number;
  player_id: number;
  team_id: number;
  position_id: number;
  formation_field: string | null;
  type_id: number;
  formation_position: number | null;
  player_name: string;
  jersey_number: number | null;
};

type MatchStatistic = {
  id: number;
  participantId: number;
  location: "home" | "away";
  name: string;
  code: string;
  value: number;
};

type Match = {
  id: number;
  date: string;
  status: string;
  resultInfo: string | null;

  score: {
    home: number | null;
    away: number | null;
  };

  homeTeam: Team;
  awayTeam: Team;
  events: MatchEvent[];
  lineups: LineupPlayer[];
  statistics: MatchStatistic[];
};

export default function MatchDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "lineups" | "stats">(
    "overview",
  );
  const [homeFavorite, setHomeFavorite] = useState(false);
  const [awayFavorite, setAwayFavorite] = useState(false);

  useEffect(() => {
    loadMatch();
  }, [id]);

  useEffect(() => {
    if (!match) return;

    async function loadFavorites() {
      const favorites = await getFavoriteTeams();

      setHomeFavorite(favorites.some((team) => team.id === match!.homeTeam.id));

      setAwayFavorite(favorites.some((team) => team.id === match!.awayTeam.id));
    }

    loadFavorites();
  }, [match]);

  async function loadMatch() {
    try {
      const response = await fetch(`${API_URL}/api/matches/${id}`);

      const data = await response.json();

      setMatch(data);
    } catch (error) {
      console.error("Failed to load match:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }



  if (!match) {
    return (
      <View style={styles.center}>
        <Text>Match not found</Text>
      </View>
    );
  }

  function getEventIcon(type: string) {
    switch (type) {
      case "Goal":
      case "Own Goal":
        return "⚽";

      case "Yellowcard":
      case "Yellow Card":
        return "🟨";

      case "Redcard":
      case "Red Card":
        return "🟥";

      case "Substitution":
        return "↕";

      default:
        return "•";
    }
  }

  const sortedEvents = [...(match.events || [])].sort((a, b) => {
    if (a.minute !== b.minute) {
      return a.minute - b.minute;
    }

    return (a.extraMinute || 0) - (b.extraMinute || 0);
  });

  const homeStarters = (match.lineups || [])
    .filter(
      (player) => player.team_id === match.homeTeam.id && player.type_id === 11,
    )
    .sort(
      (a, b) => (a.formation_position ?? 99) - (b.formation_position ?? 99),
    );

  const awayStarters = (match.lineups || [])
    .filter(
      (player) => player.team_id === match.awayTeam.id && player.type_id === 11,
    )
    .sort(
      (a, b) => (a.formation_position ?? 99) - (b.formation_position ?? 99),
    );

  const homeSubstitutes = (match.lineups || []).filter(
    (player) => player.team_id === match.homeTeam.id && player.type_id !== 11,
  );

  const awaySubstitutes = (match.lineups || []).filter(
    (player) => player.team_id === match.awayTeam.id && player.type_id !== 11,
  );

  function groupFormation(players: LineupPlayer[]) {
    const lines: Record<number, LineupPlayer[]> = {};

    players.forEach((player) => {
      if (!player.formation_field) return;

      const [line] = player.formation_field.split(":").map(Number);

      if (!lines[line]) {
        lines[line] = [];
      }

      lines[line].push(player);
    });

    Object.values(lines).forEach((line) => {
      line.sort((a, b) => {
        const aPosition = Number(a.formation_field?.split(":")[1] || 0);

        const bPosition = Number(b.formation_field?.split(":")[1] || 0);

        return aPosition - bPosition;
      });
    });

    return Object.entries(lines)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([, players]) => players);
  }

  const homeFormation = groupFormation(homeStarters);
  const awayFormation = groupFormation(awayStarters);

  function getStat(
  statistics: MatchStatistic[],
  code: string,
  location: "home" | "away"
): number {
  const statistic = statistics.find(
    (stat) =>
      stat.code === code &&
      stat.location === location
  );

  return Number(statistic?.value ?? 0);
}

  const preferredStats = [
    {
      code: "ball-possession",
      label: "Possession",
      percentage: true,
    },
    {
      code: "corners",
      label: "Corners",
      percentage: false,
    },
    {
      code: "assists",
      label: "Assists",
      percentage: false,
    },
    {
      code: "yellowcards",
      label: "Yellow cards",
      percentage: false,
    },
    {
      code: "successful-dribbles-percentage",
      label: "Successful dribbles",
      percentage: true,
    },
  ];

  const availableStatCodes = new Set(
    (match.statistics || []).map((stat) => stat.code),
  );

  const statsToShow = preferredStats.filter((stat) =>
    availableStatCodes.has(stat.code),
  );

  async function toggleFavorite(
    team: Team,
    isFavorite: boolean,
    setFavorite: (value: boolean) => void,
  ) {
    if (isFavorite) {
      await removeFavoriteTeam(team.id);
      setFavorite(false);
    } else {
      await addFavoriteTeam({
        id: team.id,
        name: team.name,
        logo: team.logo,
      });

      setFavorite(true);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.back}>‹</Text>
      </Pressable>

      <Text style={styles.competition}>PREMIERSHIP</Text>

      <View style={styles.scoreSection}>
        {/* HOME TEAM */}
        <View style={styles.team}>
          <Pressable
            style={styles.teamLink}
            onPress={() =>
              router.push({
                pathname: "/team/[id]",
                params: {
                  id: match.homeTeam.id.toString(),
                },
              })
            }
          >
            <Image
              source={{ uri: match.homeTeam.logo }}
              style={styles.logo}
            />

            <Text style={styles.teamName}>
              {match.homeTeam.name}
            </Text>
          </Pressable>

          <Pressable
            onPress={() =>
              toggleFavorite(
                match.homeTeam,
                homeFavorite,
                setHomeFavorite
              )
            }
            hitSlop={10}
          >
            <Text style={styles.favoriteStar}>
              {homeFavorite ? "★" : "☆"}
            </Text>
          </Pressable>
        </View>

        {/* SCORE */}
        <View style={styles.scoreCenter}>
          <View style={styles.scoreRow}>
            <Text style={styles.score}>{match.score.home ?? "-"}</Text>

            <Text style={styles.separator}>:</Text>

            <Text style={styles.score}>{match.score.away ?? "-"}</Text>
          </View>

          <Text style={styles.status}>{match.status}</Text>
        </View>

        {/* AWAY TEAM */}
        <View style={styles.team}>
          <Pressable
            style={styles.teamLink}
            onPress={() =>
              router.push({
                pathname: "/team/[id]",
                params: {
                  id: match.awayTeam.id.toString(),
                },
              })
            }
          >
            <Image
              source={{ uri: match.awayTeam.logo }}
              style={styles.logo}
            />

            <Text style={styles.teamName}>
              {match.awayTeam.name}
            </Text>
          </Pressable>

          <Pressable
            onPress={() =>
              toggleFavorite(
                match.awayTeam,
                awayFavorite,
                setAwayFavorite
              )
            }
            hitSlop={10}
          >
            <Text style={styles.favoriteStar}>
              {awayFavorite ? "★" : "☆"}
            </Text>
          </Pressable>
        </View>
      </View>

      {match.resultInfo && (
        <Text style={styles.result}>{match.resultInfo}</Text>
      )}

      {/* TABS */}
      <View style={styles.tabs}>
        <Pressable
          style={styles.tabButton}
          onPress={() => setActiveTab("overview")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "overview" && styles.activeTabText,
            ]}
          >
            Overview
          </Text>

          {activeTab === "overview" && <View style={styles.activeTabLine} />}
        </Pressable>

        <Pressable
          style={styles.tabButton}
          onPress={() => setActiveTab("lineups")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "lineups" && styles.activeTabText,
            ]}
          >
            Lineups
          </Text>

          {activeTab === "lineups" && <View style={styles.activeTabLine} />}
        </Pressable>

        <Pressable
          style={styles.tabButton}
          onPress={() => setActiveTab("stats")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "stats" && styles.activeTabText,
            ]}
          >
            Stats
          </Text>

          {activeTab === "stats" && <View style={styles.activeTabLine} />}
        </Pressable>
      </View>

      {/* OVERVIEW */}
      {activeTab === "overview" && (
        <View style={styles.eventsSection}>
          <Text style={styles.sectionTitle}>MATCH EVENTS</Text>

          {sortedEvents.map((event) => {
            const isHome = event.participantId === match.homeTeam.id;

            const minute =
              event.extraMinute != null
                ? `${event.minute}+${event.extraMinute}'`
                : `${event.minute}'`;

            return (
              <View
                key={event.id}
                style={[
                  styles.eventRow,
                  isHome ? styles.homeEvent : styles.awayEvent,
                ]}
              >
                <View
                  style={[
                    styles.eventContent,
                    !isHome && styles.awayEventContent,
                  ]}
                >
                  <Text style={styles.eventMinute}>{minute}</Text>

                  <View
                    style={[
                      styles.eventDetails,
                      !isHome && styles.awayEventDetails,
                    ]}
                  >
                    <Text style={styles.eventPlayer}>
                      {getEventIcon(event.type)}{" "}
                      {event.playerName || event.type}
                    </Text>

                    {event.relatedPlayerName && (
                      <Text style={styles.eventSecondary}>
                        {event.relatedPlayerName}
                      </Text>
                    )}

                    {event.info && event.info !== event.type && (
                      <Text style={styles.eventSecondary}>{event.info}</Text>
                    )}

                    {event.result && (
                      <Text style={styles.eventResult}>{event.result}</Text>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* LINEUPS */}
      {activeTab === "lineups" && (
        <View style={styles.lineupsSection}>
          <Text style={styles.sectionTitle}>STARTING LINEUPS</Text>

          <View style={styles.formationHeader}>
            <Image
              source={{ uri: match.homeTeam.logo }}
              style={styles.formationLogo}
            />

            <Text style={styles.formationTeamName}>{match.homeTeam.name}</Text>
          </View>

          <View style={styles.pitch}>
            <View style={styles.centerLine} />
            <View style={styles.centerCircle} />
            <View style={styles.topPenaltyArea} />
            <View style={styles.bottomPenaltyArea} />

            {homeFormation.map((line, index) => (
              <View key={`home-${index}`} style={styles.formationLine}>
                {line.map((player) => (
                  <View key={player.id} style={styles.pitchPlayer}>
                    <View style={styles.playerCircle}>
                      <Text style={styles.playerNumber}>
                        {player.jersey_number ?? "-"}
                      </Text>
                    </View>

                    <Text style={styles.pitchPlayerName} numberOfLines={2}>
                      {player.player_name}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </View>

          <View style={styles.formationHeader}>
            <Image
              source={{ uri: match.awayTeam.logo }}
              style={styles.formationLogo}
            />

            <Text style={styles.formationTeamName}>{match.awayTeam.name}</Text>
          </View>

          <View style={styles.pitch}>
            <View style={styles.centerLine} />
            <View style={styles.centerCircle} />
            <View style={styles.topPenaltyArea} />
            <View style={styles.bottomPenaltyArea} />

            {awayFormation.map((line, index) => (
              <View key={`away-${index}`} style={styles.formationLine}>
                {line.map((player) => (
                  <View key={player.id} style={styles.pitchPlayer}>
                    <View style={styles.playerCircle}>
                      <Text style={styles.playerNumber}>
                        {player.jersey_number ?? "-"}
                      </Text>
                    </View>

                    <Text style={styles.pitchPlayerName} numberOfLines={2}>
                      {player.player_name}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </View>

          <Text style={styles.substitutesTitle}>SUBSTITUTES</Text>

          <View style={styles.substitutesTeams}>
            <View style={styles.substituteColumn}>
              <Text style={styles.substituteTeam}>{match.homeTeam.name}</Text>

              {homeSubstitutes.map((player) => (
                <View key={player.id} style={styles.substituteRow}>
                  <Text style={styles.substituteNumber}>
                    {player.jersey_number ?? "-"}
                  </Text>

                  <Text style={styles.substituteName} numberOfLines={2}>
                    {player.player_name}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.substituteColumn}>
              <Text style={styles.substituteTeam}>{match.awayTeam.name}</Text>

              {awaySubstitutes.map((player) => (
                <View key={player.id} style={styles.substituteRow}>
                  <Text style={styles.substituteNumber}>
                    {player.jersey_number ?? "-"}
                  </Text>

                  <Text style={styles.substituteName} numberOfLines={2}>
                    {player.player_name}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}

      {activeTab === "stats" && (
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>MATCH STATISTICS</Text>

          {statsToShow.map((stat) => {
            const homeValue = getStat(
              match.statistics || [],
              stat.code,
              "home",
            );

            const awayValue = getStat(
              match.statistics || [],
              stat.code,
              "away",
            );

            const total = homeValue + awayValue;

            const homeWidth = total > 0 ? (homeValue / total) * 100 : 50;

            const awayWidth = total > 0 ? (awayValue / total) * 100 : 50;

            return (
              <View key={stat.code} style={styles.statBlock}>
                <Text style={styles.statLabel}>{stat.label}</Text>

                <View style={styles.statValues}>
                  <Text style={styles.statValue}>
                    {homeValue}
                    {stat.percentage ? "%" : ""}
                  </Text>

                  <Text style={styles.statValue}>
                    {awayValue}
                    {stat.percentage ? "%" : ""}
                  </Text>
                </View>

                <View style={styles.bars}>
                  <View style={styles.barSide}>
                    <View
                      style={[styles.homeBar, { width: `${homeWidth}%` }]}
                    />
                  </View>

                  <View style={styles.barSide}>
                    <View
                      style={[styles.awayBar, { width: `${awayWidth}%` }]}
                    />
                  </View>
                </View>
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

  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 50,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },

  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 5,
    paddingRight: 20,
  },

  back: {
    fontSize: 32,
    color: "#111111",
  },

  competition: {
    textAlign: "center",
    fontSize: 11,
    color: "#999999",
    fontWeight: "600",
    marginTop: 5,
  },
  favoriteStar: {
    fontSize: 22,
    color: "#111111",
    marginTop: 8,
  },
  teamLink: {
  alignItems: "center",
},

  scoreSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 40,
  },

  team: {
    width: 100,
    alignItems: "center",
  },

  logo: {
    width: 55,
    height: 55,
    resizeMode: "contain",
  },

  teamName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111111",
    textAlign: "center",
    marginTop: 12,
  },

  scoreCenter: {
    alignItems: "center",
  },

  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  score: {
    fontSize: 30,
    fontWeight: "700",
    color: "#111111",
  },

  separator: {
    fontSize: 25,
    color: "#BBBBBB",
    marginHorizontal: 8,
  },

  status: {
    fontSize: 11,
    color: "#888888",
    marginTop: 5,
    fontWeight: "600",
  },

  result: {
    textAlign: "center",
    color: "#888888",
    fontSize: 12,
    marginTop: 30,
  },

  tabs: {
    flexDirection: "row",
    width: "100%",
    marginTop: 45,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },

  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    position: "relative",
  },

  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#999999",
  },

  activeTabText: {
    fontWeight: "700",
    color: "#111111",
  },

  activeTabLine: {
    position: "absolute",
    bottom: -1,
    width: 55,
    height: 2,
    backgroundColor: "#111111",
    borderRadius: 2,
  },

  eventsSection: {
    marginTop: 30,
    paddingBottom: 40,
  },

  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#999999",
    marginBottom: 22,
  },

  eventRow: {
    width: "100%",
    marginBottom: 22,
  },

  homeEvent: {
    alignItems: "flex-start",
  },

  awayEvent: {
    alignItems: "flex-end",
  },

  eventContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    maxWidth: "85%",
  },

  awayEventContent: {
    flexDirection: "row-reverse",
  },

  eventMinute: {
    fontSize: 12,
    fontWeight: "700",
    color: "#888888",
    minWidth: 35,
  },

  eventDetails: {
    marginLeft: 8,
    alignItems: "flex-start",
  },

  awayEventDetails: {
    marginLeft: 0,
    marginRight: 8,
    alignItems: "flex-end",
  },

  eventPlayer: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111111",
  },

  eventSecondary: {
    fontSize: 11,
    color: "#999999",
    marginTop: 3,
  },

  eventResult: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111111",
    marginTop: 4,
  },

  lineupHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 25,
  },

  lineupTeam: {
    flex: 1,
    alignItems: "center",
  },

  awayTeamHeader: {
    alignItems: "center",
  },

  smallLogo: {
    width: 32,
    height: 32,
    resizeMode: "contain",
    marginBottom: 7,
  },

  lineupTeamName: {
    fontSize: 11,
    fontWeight: "600",
    color: "#111111",
    textAlign: "center",
  },

  startingTitle: {
    fontSize: 9,
    fontWeight: "700",
    color: "#999999",
    marginHorizontal: 10,
  },

  lineupColumns: {
    flexDirection: "row",
  },

  lineupColumn: {
    flex: 1,
  },

  lineupDivider: {
    width: 1,
    backgroundColor: "#EEEEEE",
    marginHorizontal: 5,
  },

  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 48,
    width: "100%",
  },

  awayPlayerRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },

  playerName: {
    fontSize: 11,
    fontWeight: "600",
    color: "#222222",
    marginLeft: 7,
    flexShrink: 1,
  },

  awayPlayerName: {
    textAlign: "right",
    marginLeft: 0,
    marginRight: 7,
    flexShrink: 1,
  },

  lineupsList: {
    marginTop: 25,
  },

  teamLineupHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  lineupLogo: {
    width: 34,
    height: 34,
    resizeMode: "contain",
    marginRight: 12,
  },

  teamLineupName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111111",
  },

  lineupLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#999999",
    marginBottom: 8,
  },

  fullPlayerRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 52,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F1F1",
  },

  fullPlayerName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111111",
    marginLeft: 12,
    flex: 1,
  },

  numberCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#F3F3F3",
    alignItems: "center",
    justifyContent: "center",
  },

  number: {
    fontSize: 11,
    fontWeight: "700",
    color: "#555555",
  },

  teamSeparator: {
    height: 1,
    backgroundColor: "#EAEAEA",
    marginVertical: 32,
  },
  lineupsSection: {
    marginTop: 30,
    paddingBottom: 50,
  },

  formationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 14,
  },

  formationLogo: {
    width: 30,
    height: 30,
    resizeMode: "contain",
    marginRight: 10,
  },

  formationTeamName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111111",
  },

  pitch: {
    height: 480,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#DADADA",
    backgroundColor: "#F7F7F7",
    overflow: "hidden",
    paddingVertical: 25,
    marginBottom: 35,
    justifyContent: "space-between",
  },

  formationLine: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    zIndex: 2,
  },

  pitchPlayer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 2,
  },

  playerCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },

  playerNumber: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  pitchPlayerName: {
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "600",
    color: "#111111",
    textAlign: "center",
    marginTop: 5,
    paddingHorizontal: 2,
  },

  centerLine: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "50%",
    height: 1,
    backgroundColor: "#DDDDDD",
  },

  centerCircle: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: "#DDDDDD",
    top: "50%",
    left: "50%",
    marginTop: -40,
    marginLeft: -40,
  },

  topPenaltyArea: {
    position: "absolute",
    width: 150,
    height: 55,
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderTopWidth: 0,
    top: 0,
    alignSelf: "center",
  },

  bottomPenaltyArea: {
    position: "absolute",
    width: 150,
    height: 55,
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderBottomWidth: 0,
    bottom: 0,
    alignSelf: "center",
  },
  substitutesTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#999999",
    marginTop: 10,
    marginBottom: 20,
  },

  substitutesTeams: {
    flexDirection: "row",
    gap: 20,
  },

  substituteColumn: {
    flex: 1,
  },

  substituteTeam: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111111",
    marginBottom: 12,
  },

  substituteRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 45,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },

  substituteNumber: {
    width: 25,
    fontSize: 11,
    fontWeight: "700",
    color: "#888888",
  },

  substituteName: {
    flex: 1,
    fontSize: 11,
    fontWeight: "500",
    color: "#222222",
  },
  statsSection: {
    marginTop: 30,
    paddingBottom: 50,
  },

  statBlock: {
    marginBottom: 28,
  },

  statLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#777777",
    textAlign: "center",
    marginBottom: 9,
  },

  statValues: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  statValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111111",
  },

  bars: {
    flexDirection: "row",
    gap: 6,
  },

  barSide: {
    flex: 1,
    height: 5,
    backgroundColor: "#EEEEEE",
    borderRadius: 3,
    overflow: "hidden",
  },

  homeBar: {
    height: "100%",
    backgroundColor: "#111111",
    marginLeft: "auto",
    borderRadius: 3,
  },

  awayBar: {
    height: "100%",
    backgroundColor: "#111111",
    borderRadius: 3,
  },
});
