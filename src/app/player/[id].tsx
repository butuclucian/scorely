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

type Player = {
  id: number;
  name: string;
  fullName: string;
  image: string;

  position: {
    id: number;
    name: string;
    code: string;
  };

  nationality: {
    id: number;
    name: string;
    flag: string;
    fifaCode: string;
  };

  dateOfBirth: string | null;
  height: number | null;
  weight: number | null;
};

type CareerTeam = {
  id: number;
  name: string;
  logo: string;
  code: string | null;
};

type CurrentClub = {
  teamId: number;
  teamName: string;
  teamLogo: string;
  teamCode: string | null;
  start: string | null;
  end: string | null;
  jerseyNumber: number | null;
  captain: boolean;
  current: boolean;
};

type Transfer = {
  id: number;
  date: string;
  fromTeam: CareerTeam | null;
  toTeam: CareerTeam;
  amount: string | null;
  type: string;
};

type Career = {
  currentClubs: CurrentClub[];
  transfers: Transfer[];
};

type PlayerSeasonStats = {
  seasonId: number;
  seasonName: string;
  isCurrent: boolean;
  teamId: number;
  jerseyNumber: number | null;

  statistics: {
    appearances: number;
    starts: number;
    minutes: number;
    goals: number;
    assists: number;
    yellowCards: number;
    redCards: number;
  };
};

type PlayerStatisticsResponse = {
  playerId: number;
  playerName: string;
  seasons: PlayerSeasonStats[];
};

export default function PlayerDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [career, setCareer] = useState<Career | null>(null);
  const [playerStatistics, setPlayerStatistics] =
    useState<PlayerStatisticsResponse | null>(null);

  const [selectedSeasonIndex, setSelectedSeasonIndex] = useState(0);

  useEffect(() => {
    if (!id) return;

    const loadPlayer = async () => {
      try {
        const [playerResponse, careerResponse, statisticsResponse] =
          await Promise.all([
            fetch(`${API_URL}/api/players/${id}`),

            fetch(`${API_URL}/api/players/${id}/career`),

            fetch(`${API_URL}/api/players/${id}/statistics`),
          ]);

        const playerData = await playerResponse.json();
        const careerData = await careerResponse.json();
        const statisticsData = await statisticsResponse.json();

        setPlayer(playerData);
        setCareer(careerData);
        setPlayerStatistics(statisticsData);

        setSelectedSeasonIndex(0);
      } catch (error) {
        console.error("Failed to load player:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPlayer();
  }, [id]);

  useEffect(() => {
    const loadPlayer = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/players/${id}`,
        );

        const data = await response.json();

        setPlayer(data);
      } catch (error) {
        console.error("Failed to load player:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPlayer();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!player) {
    return (
      <View style={styles.center}>
        <Text>Player not found.</Text>
      </View>
    );
  }

  const calculateAge = (dateOfBirth: string | null) => {
    if (!dateOfBirth) return null;

    const birth = new Date(dateOfBirth);
    const today = new Date();

    let age = today.getFullYear() - birth.getFullYear();

    const monthDifference = today.getMonth() - birth.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  };

  const formatDate = (date: string | null) => {
    if (!date) return "-";

    return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const age = calculateAge(player.dateOfBirth);

  function formatCareerDate(date: string | null) {
    if (!date) return "";

    return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  const seasons = playerStatistics?.seasons ?? [];

  const selectedSeason = seasons[selectedSeasonIndex] ?? null;

  function previousSeason() {
    if (selectedSeasonIndex < seasons.length - 1) {
      setSelectedSeasonIndex((current) => current + 1);
    }
  }

  function nextSeason() {
    if (selectedSeasonIndex > 0) {
      setSelectedSeasonIndex((current) => current - 1);
    }
  }
  ``;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.back}>‹</Text>
      </Pressable>

      {/* PLAYER HEADER */}
      <View style={styles.header}>
        <Image source={{ uri: player.image }} style={styles.playerImage} />

        <Text style={styles.playerName}>{player.name}</Text>

        <Text style={styles.position}>{player.position?.name || "-"}</Text>

        <View style={styles.nationality}>
          {player.nationality?.flag && (
            <Image
              source={{
                uri: player.nationality.flag,
              }}
              style={styles.flag}
            />
          )}

          <Text style={styles.nationalityName}>
            {player.nationality?.name || "-"}
          </Text>
        </View>
      </View>

      {/* INFO */}
      <Text style={styles.sectionTitle}>PERSONAL INFORMATION</Text>

      <View style={styles.infoCard}>
        <InfoRow label="Full name" value={player.fullName || "-"} />

        <InfoRow label="Date of birth" value={formatDate(player.dateOfBirth)} />

        <InfoRow label="Age" value={age !== null ? `${age} years` : "-"} />

        <InfoRow
          label="Height"
          value={player.height ? `${player.height} cm` : "-"}
        />

        <InfoRow
          label="Weight"
          value={player.weight ? `${player.weight} kg` : "-"}
        />

        <InfoRow label="Position" value={player.position?.name || "-"} last />
      </View>

      {selectedSeason && (
        <View style={styles.statisticsSection}>
          <Text style={styles.sectionTitle}>STATISTICS</Text>

          <View style={styles.seasonSelector}>
            <Pressable
              style={[
                styles.seasonArrowButton,
                selectedSeasonIndex === seasons.length - 1 &&
                  styles.disabledSeasonArrow,
              ]}
              onPress={previousSeason}
              disabled={selectedSeasonIndex === seasons.length - 1}
            >
              <Text style={styles.seasonArrow}>‹</Text>
            </Pressable>

            <View style={styles.seasonNameContainer}>
              <Text style={styles.seasonName}>{selectedSeason.seasonName}</Text>

              {selectedSeason.isCurrent && (
                <Text style={styles.currentSeasonText}>CURRENT SEASON</Text>
              )}
            </View>

            <Pressable
              style={[
                styles.seasonArrowButton,
                selectedSeasonIndex === 0 && styles.disabledSeasonArrow,
              ]}
              onPress={nextSeason}
              disabled={selectedSeasonIndex === 0}
            >
              <Text style={styles.seasonArrow}>›</Text>
            </Pressable>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.playerStatCard}>
              <Text style={styles.playerStatValue}>
                {selectedSeason.statistics.appearances}
              </Text>
              <Text style={styles.playerStatLabel}>Appearances</Text>
            </View>

            <View style={styles.playerStatCard}>
              <Text style={styles.playerStatValue}>
                {selectedSeason.statistics.starts}
              </Text>
              <Text style={styles.playerStatLabel}>Starts</Text>
            </View>

            <View style={styles.playerStatCard}>
              <Text style={styles.playerStatValue}>
                {selectedSeason.statistics.minutes}
              </Text>
              <Text style={styles.playerStatLabel}>Minutes</Text>
            </View>

            <View style={styles.playerStatCard}>
              <Text style={styles.playerStatValue}>
                {selectedSeason.statistics.goals}
              </Text>
              <Text style={styles.playerStatLabel}>Goals</Text>
            </View>

            <View style={styles.playerStatCard}>
              <Text style={styles.playerStatValue}>
                {selectedSeason.statistics.assists}
              </Text>
              <Text style={styles.playerStatLabel}>Assists</Text>
            </View>

            <View style={styles.playerStatCard}>
              <Text style={styles.playerStatValue}>
                {selectedSeason.statistics.yellowCards}
              </Text>
              <Text style={styles.playerStatLabel}>Yellow cards</Text>
            </View>

            <View style={styles.playerStatCard}>
              <Text style={styles.playerStatValue}>
                {selectedSeason.statistics.redCards}
              </Text>
              <Text style={styles.playerStatLabel}>Red cards</Text>
            </View>
          </View>
        </View>
      )}

      {career && (
        <View style={styles.careerSection}>
          <Text style={styles.sectionTitle}>CAREER</Text>

          {career.currentClubs.length > 0 && (
            <>
              <Text style={styles.careerSubtitle}>CURRENT CLUB</Text>

              {career.currentClubs.map((club) => (
                <Pressable
                  key={club.teamId}
                  style={styles.currentClubCard}
                  onPress={() =>
                    router.push({
                      pathname: "/team/[id]",
                      params: {
                        id: club.teamId.toString(),
                      },
                    })
                  }
                >
                  <Image
                    source={{ uri: club.teamLogo }}
                    style={styles.careerLogo}
                  />

                  <View style={styles.clubInfo}>
                    <Text style={styles.clubName}>{club.teamName}</Text>

                    <Text style={styles.clubDetails}>
                      {club.jerseyNumber ? `#${club.jerseyNumber} • ` : ""}
                      Since {formatCareerDate(club.start)}
                    </Text>

                    {club.end && (
                      <Text style={styles.contractText}>
                        Contract until {formatCareerDate(club.end)}
                      </Text>
                    )}
                  </View>

                  <Text style={styles.chevron}>›</Text>
                </Pressable>
              ))}
            </>
          )}

          {career.transfers.length > 0 && (
            <>
              <Text style={styles.careerSubtitle}>TRANSFER HISTORY</Text>

              {career.transfers.map((transfer) => (
                <View key={transfer.id} style={styles.transferCard}>
                  <Text style={styles.transferDate}>
                    {formatCareerDate(transfer.date)}
                  </Text>

                  {transfer.fromTeam ? (
                    <Pressable
                      style={styles.transferTeam}
                      onPress={() =>
                        router.push({
                          pathname: "/team/[id]",
                          params: {
                            id: transfer.fromTeam!.id.toString(),
                          },
                        })
                      }
                    >
                      <Image
                        source={{ uri: transfer.fromTeam.logo }}
                        style={styles.transferLogo}
                      />

                      <Text style={styles.transferTeamName}>
                        {transfer.fromTeam.name}
                      </Text>

                      <Text style={styles.chevron}>›</Text>
                    </Pressable>
                  ) : (
                    <View style={styles.transferTeam}>
                      <View style={styles.emptyLogo} />

                      <Text style={styles.unknownTeam}>
                        Previous club unavailable
                      </Text>
                    </View>
                  )}

                  <View style={styles.transferArrowContainer}>
                    <Text style={styles.transferArrow}>↓</Text>
                    <Text style={styles.transferType}>{transfer.type}</Text>
                  </View>

                  <Pressable
                    style={styles.transferTeam}
                    onPress={() =>
                      router.push({
                        pathname: "/team/[id]",
                        params: {
                          id: transfer.toTeam.id.toString(),
                        },
                      })
                    }
                  >
                    <Image
                      source={{ uri: transfer.toTeam.logo }}
                      style={styles.transferLogo}
                    />

                    <Text style={styles.transferTeamName}>
                      {transfer.toTeam.name}
                    </Text>

                    <Text style={styles.chevron}>›</Text>
                  </Pressable>
                </View>
              ))}
            </>
          )}
        </View>
      )}
    </ScrollView>
  );
}

function InfoRow({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.infoRow, last && styles.lastInfoRow]}>
      <Text style={styles.infoLabel}>{label}</Text>

      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 100,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },

  back: {
    fontSize: 38,
    lineHeight: 38,
    color: "#111111",
  },

  header: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 40,
  },

  playerImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    resizeMode: "cover",
    backgroundColor: "#F3F3F3",
  },

  playerName: {
    marginTop: 18,
    fontSize: 26,
    fontWeight: "700",
    color: "#111111",
    textAlign: "center",
  },

  position: {
    marginTop: 5,
    fontSize: 14,
    color: "#888888",
  },

  nationality: {
    marginTop: 15,
    flexDirection: "row",
    alignItems: "center",
  },

  flag: {
    width: 25,
    height: 17,
    resizeMode: "cover",
    marginRight: 8,
  },

  nationalityName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
  },

  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#999999",
    letterSpacing: 1,
    marginBottom: 10,
  },

  infoCard: {
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },

  infoRow: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },

  lastInfoRow: {
    borderBottomWidth: 0,
  },

  infoLabel: {
    fontSize: 14,
    color: "#888888",
  },

  infoValue: {
    flex: 1,
    marginLeft: 25,
    fontSize: 14,
    fontWeight: "600",
    color: "#111111",
    textAlign: "right",
  },
  careerSection: {
    marginTop: 28,
  },

  careerSubtitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#888",
    marginTop: 18,
    marginBottom: 10,
  },

  currentClubCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F7F7",
    borderRadius: 14,
    padding: 14,
  },

  careerLogo: {
    width: 48,
    height: 48,
    resizeMode: "contain",
    marginRight: 14,
  },

  clubInfo: {
    flex: 1,
  },

  clubName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
  },

  clubDetails: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
  },

  contractText: {
    fontSize: 12,
    color: "#999",
    marginTop: 3,
  },

  chevron: {
    fontSize: 26,
    color: "#AAA",
  },

  transferCard: {
    backgroundColor: "#F7F7F7",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },

  transferDate: {
    fontSize: 12,
    fontWeight: "700",
    color: "#888",
    marginBottom: 12,
    textTransform: "uppercase",
  },

  transferTeam: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 42,
  },

  transferLogo: {
    width: 34,
    height: 34,
    resizeMode: "contain",
    marginRight: 12,
  },

  emptyLogo: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#E5E5E5",
    marginRight: 12,
  },

  transferTeamName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
  },

  unknownTeam: {
    flex: 1,
    fontSize: 14,
    color: "#999",
  },

  transferArrowContainer: {
    marginLeft: 16,
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
  },

  transferArrow: {
    fontSize: 18,
    color: "#22C55E",
    marginRight: 8,
  },

  transferType: {
    fontSize: 11,
    fontWeight: "600",
    color: "#999",
  },
  statisticsSection: {
    marginTop: 28,
  },

  seasonSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F7F7F7",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginTop: 12,
    marginBottom: 14,
  },

  seasonArrowButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },

  disabledSeasonArrow: {
    opacity: 0.2,
  },

  seasonArrow: {
    fontSize: 30,
    color: "#111",
    fontWeight: "400",
  },

  seasonNameContainer: {
    alignItems: "center",
  },

  seasonName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111",
  },

  currentSeasonText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#22C55E",
    marginTop: 3,
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  playerStatCard: {
    width: "48.5%",
    backgroundColor: "#F7F7F7",
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
    marginBottom: 10,
  },

  playerStatValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111",
  },

  playerStatLabel: {
    fontSize: 12,
    color: "#888",
    marginTop: 5,
  },
});
