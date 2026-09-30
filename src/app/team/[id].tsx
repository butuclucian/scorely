import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
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

type SquadPlayer = {
  id: number;
  jerseyNumber: number | null;
  captain: boolean;

  position: {
    id: number;
    name: string;
    code: string;
  };

  player: {
    id: number;
    name: string;
    image: string;
  };

  contract: {
    start: string | null;
    end: string | null;
  };
};

type TransferPlayer = {
  id: number;
  name: string;
  image: string;
};

type TransferTeam = {
  id: number;
  name: string;
  logo: string;
  code: string | null;
};

type TeamTransfer = {
  id: number;
  direction: "IN" | "OUT";
  date: string;
  player: TransferPlayer | null;
  otherTeam: TransferTeam | null;
  amount: number | null;
  type: string;
  completed: boolean;
};

type TransfersResponse = {
  teamId: number;
  transfers: TeamTransfer[];
};

type Tab =
  | "matches"
  | "squad"
  | "transfers"
  | "info";

type TeamInfo = {
  id: number;
  name: string;
  shortCode: string | null;
  logo: string;
  founded: number | null;
  gender: string | null;

  country: {
    id: number;
    name: string;
    fifaCode: string | null;
    flag: string;
  } | null;

  venue: {
    id: number;
    name: string;
    image: string;
    city: string | null;
    address: string | null;
    capacity: number | null;
    surface: string | null;
  } | null;
};

export default function TeamDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [squad, setSquad] = useState<SquadPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [squadLoading, setSquadLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("matches");
  const [transfers, setTransfers] = useState<TeamTransfer[]>([]);
  const [transfersLoading, setTransfersLoading] = useState(false);
  const [transfersLoaded, setTransfersLoaded] = useState(false);
  const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null);
  const [infoLoading, setInfoLoading] = useState(false);
  const [infoLoaded, setInfoLoaded] = useState(false);

  useEffect(() => {
    const loadMatches = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/teams/${id}/fixtures`,
        );

        const data = await response.json();

        setMatches(data);
      } catch (error) {
        console.error("Failed to load team matches:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMatches();
  }, [id]);

  const loadSquad = async () => {
    // Nu mai facem request dacă am încărcat deja lotul
    if (squad.length > 0) return;

    try {
      setSquadLoading(true);

      const response = await fetch(
        `${API_URL}/api/teams/${id}/squad`,
      );

      const data = await response.json();

      setSquad(data);
    } catch (error) {
      console.error("Failed to load squad:", error);
    } finally {
      setSquadLoading(false);
    }
  };

  const openSquad = async () => {
    setActiveTab("squad");
    await loadSquad();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const teamId = Number(id);

  const team =
    matches
      .flatMap((match) => [match.homeTeam, match.awayTeam])
      .find((team) => team.id === teamId) ?? null;

  const upcomingMatches = matches.filter((match) => match.status === "NS");

  const finishedMatches = matches
    .filter((match) => match.status === "FT")
    .reverse();

  const goalkeepers = squad.filter(
    (item) => item.position?.code === "goalkeeper",
  );

  const defenders = squad.filter((item) => item.position?.code === "defender");

  const midfielders = squad.filter(
    (item) => item.position?.code === "midfielder",
  );

  const attackers = squad.filter((item) => item.position?.code === "attacker");

  const renderMatch = (match: Match, finished = false) => (
    <Pressable
      key={match.id}
      style={styles.match}
      onPress={() =>
        router.push({
          pathname: "/match/[id]",
          params: {
            id: match.id.toString(),
          },
        })
      }
    >
      <View style={styles.matchDate}>
        <Text style={styles.date}>
          {new Date(match.date.replace(" ", "T"))
            .toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
            })
            .toUpperCase()}
        </Text>

        <Text style={finished ? styles.finished : styles.time}>
          {finished ? "FT" : match.date.substring(11, 16)}
        </Text>
      </View>

      <View style={styles.teams}>
        <View style={styles.matchTeam}>
          <Image
            source={{
              uri: match.homeTeam.logo,
            }}
            style={styles.smallLogo}
          />

          <Text style={styles.matchTeamName}>{match.homeTeam.name}</Text>

          {finished && (
            <Text style={styles.resultScore}>{match.score.home ?? "-"}</Text>
          )}
        </View>

        <View style={styles.matchTeam}>
          <Image
            source={{
              uri: match.awayTeam.logo,
            }}
            style={styles.smallLogo}
          />

          <Text style={styles.matchTeamName}>{match.awayTeam.name}</Text>

          {finished && (
            <Text style={styles.resultScore}>{match.score.away ?? "-"}</Text>
          )}
        </View>
      </View>

      <Text style={styles.arrow}>›</Text>
    </Pressable>
  );

  const renderSquadSection = (title: string, players: SquadPlayer[]) => {
    if (players.length === 0) return null;

    return (
      <View style={styles.squadSection}>
        <Text style={styles.sectionTitle}>{title}</Text>

        {players
          .sort((a, b) => (a.jerseyNumber ?? 999) - (b.jerseyNumber ?? 999))
          .map((item) => (
            <Pressable
              key={item.id}
              style={styles.playerRow}
              onPress={() =>
                router.push({
                  pathname: "/player/[id]",
                  params: {
                    id: item.player.id.toString(),
                  },
                })
              }
            >
              <Image
                source={{
                  uri: item.player.image,
                }}
                style={styles.playerImage}
              />

              <View style={styles.playerNumber}>
                <Text style={styles.playerNumberText}>
                  {item.jerseyNumber ?? "-"}
                </Text>
              </View>

              <View style={styles.playerInfo}>
                <View style={styles.playerNameRow}>
                  <Text style={styles.playerName}>{item.player.name}</Text>

                  {item.captain && (
                    <View style={styles.captainBadge}>
                      <Text style={styles.captainText}>C</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.playerPosition}>{item.position.name}</Text>
              </View>

              <Text style={styles.playerArrow}>›</Text>
            </Pressable>
          ))}
      </View>
    );
  };

  async function loadTransfers() {
    if (transfersLoaded || transfersLoading) return;

    try {
      setTransfersLoading(true);

      const response = await fetch(
        `${API_URL}/api/teams/${id}/transfers`,
      );

      if (!response.ok) {
        throw new Error("Failed to load transfers");
      }

      const data: TransfersResponse = await response.json();

      setTransfers(data.transfers || []);
      setTransfersLoaded(true);
    } catch (error) {
      console.error("Failed to load team transfers:", error);
    } finally {
      setTransfersLoading(false);
    }
  }

  const completedTransfers = transfers.filter((transfer) => transfer.completed);

  const incomingTransfers = completedTransfers.filter(
    (transfer) => transfer.direction === "IN",
  );

  const outgoingTransfers = completedTransfers.filter(
    (transfer) => transfer.direction === "OUT",
  );

  const pendingTransfers = transfers.filter((transfer) => !transfer.completed);

  function formatTransferDate(date: string) {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function TransferCard({
    transfer,
    router,
  }: {
    transfer: TeamTransfer;
    router: any;
  }) {
    return (
      <View style={styles.transferCard}>
        <Pressable
          style={styles.transferPlayer}
          disabled={!transfer.player}
          onPress={() => {
            if (!transfer.player) return;

            router.push({
              pathname: "/player/[id]",
              params: {
                id: transfer.player.id.toString(),
              },
            });
          }}
        >
          {transfer.player?.image ? (
            <Image
              source={{ uri: transfer.player.image }}
              style={styles.transferPlayerImage}
            />
          ) : (
            <View style={styles.transferPlayerImage} />
          )}

          <View style={styles.transferPlayerInfo}>
            <Text style={styles.transferPlayerName}>
              {transfer.player?.name ?? "Unknown player"}
            </Text>

            <Text style={styles.transferMeta}>
              {formatTransferDate(transfer.date)}
              {"  •  "}
              {transfer.type}
            </Text>
          </View>

          <Text
            style={
              transfer.direction === "IN"
                ? styles.transferIn
                : styles.transferOut
            }
          >
            {transfer.direction === "IN" ? "↓" : "↑"}
          </Text>
        </Pressable>

        {transfer.otherTeam && (
          <Pressable
            style={styles.transferClub}
            onPress={() =>
              router.push({
                pathname: "/team/[id]",
                params: {
                  id: transfer.otherTeam!.id.toString(),
                },
              })
            }
          >
            <Image
              source={{
                uri: transfer.otherTeam.logo,
              }}
              style={styles.transferClubLogo}
            />

            <Text style={styles.transferClubName}>
              {transfer.direction === "IN"
                ? `From ${transfer.otherTeam.name}`
                : `To ${transfer.otherTeam.name}`}
            </Text>
          </Pressable>
        )}
      </View>
    );
  }

  async function loadTeamInfo() {
  if (infoLoaded || infoLoading) return;

  try {
    setInfoLoading(true);

    const response = await fetch(
      `${API_URL}/api/teams/${id}/info`
    );

    if (!response.ok) {
      throw new Error("Failed to load team info");
    }

    const data: TeamInfo = await response.json();

    setTeamInfo(data);
    setInfoLoaded(true);
  } catch (error) {
    console.error(
      "Failed to load team info:",
      error
    );
  } finally {
    setInfoLoading(false);
  }
}

const recentForm = matches
  .filter(
    (match) =>
      match.status === "FT" &&
      match.score.home !== null &&
      match.score.away !== null
  )
  .filter(
    (match) =>
      match.homeTeam.id === Number(id) ||
      match.awayTeam.id === Number(id)
  )
  .sort(
    (a, b) =>
      new Date(b.date).getTime() -
      new Date(a.date).getTime()
  )
  .slice(0, 5)
  .map((match) => {
    const isHome =
      match.homeTeam.id === Number(id);

    const teamScore = isHome
      ? match.score.home!
      : match.score.away!;

    const opponentScore = isHome
      ? match.score.away!
      : match.score.home!;

    if (teamScore > opponentScore) {
      return "W";
    }

    if (teamScore < opponentScore) {
      return "L";
    }

    return "D";
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.back}>‹</Text>
      </Pressable>

      {team && (
        <View style={styles.teamHeader}>
          <Image source={{ uri: team.logo }} style={styles.teamLogo} />

          <Text style={styles.teamName}>{team.name}</Text>

          <Text style={styles.country}>SCOTLAND</Text>
        </View>
      )}

      {/* TABS */}
      <View style={styles.tabs}>
  <Pressable
    style={[
      styles.tabButton,
      activeTab === "matches" && styles.activeTabButton,
    ]}
    onPress={() => setActiveTab("matches")}
  >
    <Text
      style={[
        styles.tabText,
        activeTab === "matches" && styles.activeTabText,
      ]}
    >
      MATCHES
    </Text>
  </Pressable>

  <Pressable
    style={[
      styles.tabButton,
      activeTab === "squad" && styles.activeTabButton,
    ]}
    onPress={() => {
      setActiveTab("squad");
      loadSquad();
    }}
  >
    <Text
      style={[
        styles.tabText,
        activeTab === "squad" && styles.activeTabText,
      ]}
    >
      SQUAD
    </Text>
  </Pressable>

  <Pressable
    style={[
      styles.tabButton,
      activeTab === "transfers" && styles.activeTabButton,
    ]}
    onPress={() => {
      setActiveTab("transfers");
      loadTransfers();
    }}
  >
    <Text
      style={[
        styles.tabText,
        activeTab === "transfers" && styles.activeTabText,
      ]}
    >
      TRANSFERS
    </Text>
  </Pressable>

  <Pressable
    style={[
      styles.tabButton,
      activeTab === "info" && styles.activeTabButton,
    ]}
    onPress={() => {
      setActiveTab("info");
      loadTeamInfo();
    }}
  >
    <Text
      style={[
        styles.tabText,
        activeTab === "info" && styles.activeTabText,
      ]}
    >
      INFO
    </Text>
  </Pressable>
</View>

      {/* MATCHES */}
      {activeTab === "matches" && (
        <>
        {recentForm.length > 0 && (
  <View style={styles.formSection}>
    <Text style={styles.sectionTitle}>
      FORM
    </Text>

    <View style={styles.formRow}>
      {recentForm.map((result, index) => (
        <View
          key={index}
          style={[
            styles.formBadge,

            result === "W" &&
              styles.formWin,

            result === "D" &&
              styles.formDraw,

            result === "L" &&
              styles.formLoss,
          ]}
        >
          <Text style={styles.formText}>
            {result}
          </Text>
        </View>
      ))}
    </View>
  </View>
)}
          <Text style={styles.sectionTitle}>UPCOMING</Text>

          {upcomingMatches.length === 0 ? (
            <Text style={styles.empty}>No upcoming matches.</Text>
          ) : (
            upcomingMatches.map((match) => renderMatch(match))
          )}

          <Text style={[styles.sectionTitle, { marginTop: 35 }]}>RESULTS</Text>

          {finishedMatches.length === 0 ? (
            <Text style={styles.empty}>No recent results.</Text>
          ) : (
            finishedMatches.map((match) => renderMatch(match, true))
          )}
        </>
      )}

      {/* SQUAD */}
      {activeTab === "squad" && (
        <>
          {squadLoading ? (
            <View style={styles.squadLoader}>
              <ActivityIndicator size="large" />
            </View>
          ) : squad.length === 0 ? (
            <Text style={styles.empty}>No squad information available.</Text>
          ) : (
            <>
              {renderSquadSection("GOALKEEPERS", goalkeepers)}

              {renderSquadSection("DEFENDERS", defenders)}

              {renderSquadSection("MIDFIELDERS", midfielders)}

              {renderSquadSection("ATTACKERS", attackers)}
            </>
          )}
        </>
      )}

      {/* TRANSFERS */}
      {activeTab === "transfers" && (
        <View style={styles.transfersContainer}>
          {transfersLoading ? (
            <ActivityIndicator
              size="small"
              color="#22C55E"
              style={{ marginTop: 30 }}
            />
          ) : transfers.length === 0 ? (
            <Text style={styles.emptyTransfers}>No transfers available</Text>
          ) : (
            <>
              {incomingTransfers.length > 0 && (
                <View style={styles.transferSection}>
                  <Text style={styles.transferSectionTitle}>IN</Text>

                  {incomingTransfers.map((transfer) => (
                    <TransferCard
                      key={transfer.id}
                      transfer={transfer}
                      router={router}
                    />
                  ))}
                </View>
              )}

              {outgoingTransfers.length > 0 && (
                <View style={styles.transferSection}>
                  <Text style={styles.transferSectionTitle}>OUT</Text>

                  {outgoingTransfers.map((transfer) => (
                    <TransferCard
                      key={transfer.id}
                      transfer={transfer}
                      router={router}
                    />
                  ))}
                </View>
              )}

              {pendingTransfers.length > 0 && (
                <View style={styles.transferSection}>
                  <Text style={styles.transferSectionTitle}>PENDING</Text>

                  {pendingTransfers.map((transfer) => (
                    <TransferCard
                      key={transfer.id}
                      transfer={transfer}
                      router={router}
                    />
                  ))}
                </View>
              )}
            </>
          )}
        </View>
      )}

      {activeTab === "info" && (
  <View style={styles.infoContainer}>
    {infoLoading ? (
      <ActivityIndicator
        size="small"
        color="#22C55E"
        style={{ marginTop: 30 }}
      />
    ) : teamInfo ? (
      <>
        <Text style={styles.infoSectionTitle}>
          CLUB INFORMATION
        </Text>

        <View style={styles.clubInfoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Founded
            </Text>

            <Text style={styles.infoValue}>
              {teamInfo.founded ?? "—"}
            </Text>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Country
            </Text>

            <View style={styles.countryValue}>
              {teamInfo.country?.flag && (
                <Image
                  source={{
                    uri: teamInfo.country.flag,
                  }}
                  style={styles.countryFlag}
                />
              )}

              <Text style={styles.infoValue}>
                {teamInfo.country?.name ?? "—"}
              </Text>
            </View>
          </View>
        </View>

        {teamInfo.venue && (
          <>
            <Text style={styles.infoSectionTitle}>
              STADIUM
            </Text>

            <View style={styles.stadiumCard}>
              {teamInfo.venue.image && (
                <Image
                  source={{
                    uri: teamInfo.venue.image,
                  }}
                  style={styles.stadiumImage}
                />
              )}

              <View style={styles.stadiumContent}>
                <Text style={styles.stadiumName}>
                  {teamInfo.venue.name}
                </Text>

                {teamInfo.venue.city && (
                  <Text style={styles.stadiumCity}>
                    {teamInfo.venue.city}
                  </Text>
                )}

                <View style={styles.stadiumDetails}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>
                      Capacity
                    </Text>

                    <Text style={styles.infoValue}>
                      {teamInfo.venue.capacity
                        ? teamInfo.venue.capacity.toLocaleString(
                            "en-GB"
                          )
                        : "—"}
                    </Text>
                  </View>

                  <View style={styles.infoDivider} />

                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>
                      Surface
                    </Text>

                    <Text
                      style={styles.infoValue}
                    >
                      {teamInfo.venue.surface
                        ? teamInfo.venue.surface
                            .charAt(0)
                            .toUpperCase() +
                          teamInfo.venue.surface.slice(1)
                        : "—"}
                    </Text>
                  </View>

                  <View style={styles.infoDivider} />

                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>
                      Address
                    </Text>

                    <Text style={styles.infoValue}>
                      {teamInfo.venue.address ?? "—"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </>
        )}
      </>
    ) : (
      <Text style={styles.emptyInfo}>
        Team information unavailable
      </Text>
    )}
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

  formSection: {
  marginBottom: 24,
},

formRow: {
  flexDirection: "row",
  gap: 8,
},

formBadge: {
  width: 34,
  height: 34,
  borderRadius: 17,
  alignItems: "center",
  justifyContent: "center",
},

formWin: {
  backgroundColor: "#22C55E",
},

formDraw: {
  backgroundColor: "#999999",
},

formLoss: {
  backgroundColor: "#EF4444",
},

formText: {
  fontSize: 12,
  fontWeight: "800",
  color: "#FFFFFF",
},

  content: {
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 100,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },

  back: {
    fontSize: 38,
    color: "#111111",
    lineHeight: 38,
  },

  teamHeader: {
    alignItems: "center",
    paddingTop: 15,
    paddingBottom: 30,
  },

  teamLogo: {
    width: 85,
    height: 85,
    resizeMode: "contain",
  },

  teamName: {
    marginTop: 14,
    fontSize: 24,
    fontWeight: "700",
    color: "#111111",
  },

  country: {
    marginTop: 5,
    fontSize: 11,
    fontWeight: "700",
    color: "#999999",
    letterSpacing: 1,
  },

  tabs: {
  flexDirection: "row",
  borderBottomWidth: 1,
  borderBottomColor: "#EEEEEE",
  marginBottom: 16,
},

  tab: {
    flex: 1,
    alignItems: "center",
    paddingBottom: 13,
  },

  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#22C55E",
  },

  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#999999",
    letterSpacing: 1,
    marginBottom: 10,
  },

  match: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    paddingVertical: 12,
  },

  matchDate: {
    width: 65,
  },

  date: {
    fontSize: 11,
    fontWeight: "700",
    color: "#777777",
  },

  time: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "700",
    color: "#111111",
  },

  finished: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: "700",
    color: "#999999",
  },

  teams: {
    flex: 1,
  },

  matchTeam: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 27,
  },

  smallLogo: {
    width: 21,
    height: 21,
    resizeMode: "contain",
    marginRight: 9,
  },

  matchTeamName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#222222",
  },

  resultScore: {
    marginLeft: "auto",
    fontSize: 15,
    fontWeight: "700",
    color: "#111111",
  },

  arrow: {
    fontSize: 24,
    color: "#BBBBBB",
    marginLeft: 8,
  },

  empty: {
    color: "#888888",
    fontSize: 14,
    paddingVertical: 15,
  },

  // SQUAD

  squadLoader: {
    paddingVertical: 60,
  },

  squadSection: {
    marginBottom: 30,
  },

  playerRow: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },

  playerImage: {
    width: 46,
    height: 46,
    borderRadius: 23,
    resizeMode: "cover",
    backgroundColor: "#F3F3F3",
  },

  playerNumber: {
    width: 42,
    alignItems: "center",
  },

  playerNumberText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#888888",
  },

  playerInfo: {
    flex: 1,
  },

  playerNameRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  playerName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111111",
  },

  playerPosition: {
    marginTop: 3,
    fontSize: 12,
    color: "#999999",
  },

  captainBadge: {
    marginLeft: 7,
    width: 19,
    height: 19,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#22C55E",
  },

  captainText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  playerArrow: {
    fontSize: 22,
    color: "#BBBBBB",
  },

  comingSoon: {
    alignItems: "center",
    paddingVertical: 60,
  },

  comingSoonTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111111",
  },

  comingSoonText: {
    marginTop: 6,
    fontSize: 14,
    color: "#999999",
  },
  transfersContainer: {
    marginTop: 10,
  },

  transferSection: {
    marginBottom: 24,
  },

  transferSectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#888",
    marginBottom: 10,
    letterSpacing: 1,
  },

  transferCard: {
    backgroundColor: "#F7F7F7",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },

  transferPlayer: {
    flexDirection: "row",
    alignItems: "center",
  },

  transferPlayerImage: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#EAEAEA",
  },

  transferPlayerInfo: {
    flex: 1,
    marginLeft: 12,
  },

  transferPlayerName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
  },

  transferMeta: {
    fontSize: 11,
    color: "#888",
    marginTop: 4,
  },

  transferIn: {
    fontSize: 23,
    fontWeight: "800",
    color: "#22C55E",
  },

  transferOut: {
    fontSize: 23,
    fontWeight: "800",
    color: "#EF4444",
  },

  transferClub: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#EAEAEA",
  },

  transferClubLogo: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },

  transferClubName: {
    fontSize: 12,
    color: "#666",
    marginLeft: 8,
    fontWeight: "600",
  },

  emptyTransfers: {
    textAlign: "center",
    color: "#888",
    marginTop: 35,
    marginBottom: 35,
  },
  infoContainer: {
  marginTop: 10,
},

infoSectionTitle: {
  fontSize: 12,
  fontWeight: "800",
  color: "#888",
  letterSpacing: 1,
  marginBottom: 10,
  marginTop: 12,
},

clubInfoCard: {
  backgroundColor: "#F7F7F7",
  borderRadius: 14,
  paddingHorizontal: 16,
  paddingVertical: 4,
  marginBottom: 16,
},

infoRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  minHeight: 50,
},

infoLabel: {
  fontSize: 13,
  color: "#888",
},

infoValue: {
  fontSize: 13,
  fontWeight: "700",
  color: "#111",
},

infoDivider: {
  height: 1,
  backgroundColor: "#EAEAEA",
},

countryValue: {
  flexDirection: "row",
  alignItems: "center",
},

countryFlag: {
  width: 24,
  height: 16,
  resizeMode: "contain",
  marginRight: 8,
},

stadiumCard: {
  backgroundColor: "#F7F7F7",
  borderRadius: 16,
  overflow: "hidden",
  marginBottom: 30,
},

stadiumImage: {
  width: "100%",
  height: 180,
  resizeMode: "cover",
},

stadiumContent: {
  padding: 16,
},

stadiumName: {
  fontSize: 20,
  fontWeight: "800",
  color: "#111",
},

stadiumCity: {
  fontSize: 13,
  color: "#888",
  marginTop: 3,
  marginBottom: 12,
},

stadiumDetails: {
  marginTop: 4,
},

emptyInfo: {
  textAlign: "center",
  color: "#888",
  marginTop: 35,
  marginBottom: 35,
},
tabButton: {
  flex: 1,
  height: 46,
  alignItems: "center",
  justifyContent: "center",
  borderBottomWidth: 2,
  borderBottomColor: "transparent",
},

activeTabButton: {
  borderBottomColor: "#22C55E",
},

tabText: {
  fontSize: 11,
  lineHeight: 14,
  fontWeight: "700",
  color: "#888",
  textAlign: "center",
  includeFontPadding: false,
},

activeTabText: {
  color: "#22C55E",
},
});
