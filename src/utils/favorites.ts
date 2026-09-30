import AsyncStorage from "@react-native-async-storage/async-storage";

const FAVORITES_KEY = "@scorely_favorite_teams";

export type FavoriteTeam = {
  id: number;
  name: string;
  logo: string;
};

export async function getFavoriteTeams(): Promise<FavoriteTeam[]> {
  try {
    const data = await AsyncStorage.getItem(FAVORITES_KEY);

    if (!data) {
      return [];
    }

    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to load favorites:", error);
    return [];
  }
}

export async function addFavoriteTeam(
  team: FavoriteTeam
): Promise<void> {
  try {
    const favorites = await getFavoriteTeams();

    const alreadyExists = favorites.some(
      (favorite) => favorite.id === team.id
    );

    if (alreadyExists) {
      return;
    }

    const updatedFavorites = [...favorites, team];

    await AsyncStorage.setItem(
      FAVORITES_KEY,
      JSON.stringify(updatedFavorites)
    );
  } catch (error) {
    console.error("Failed to add favorite:", error);
  }
}

export async function removeFavoriteTeam(
  teamId: number
): Promise<void> {
  try {
    const favorites = await getFavoriteTeams();

    const updatedFavorites = favorites.filter(
      (team) => team.id !== teamId
    );

    await AsyncStorage.setItem(
      FAVORITES_KEY,
      JSON.stringify(updatedFavorites)
    );
  } catch (error) {
    console.error("Failed to remove favorite:", error);
  }
}

export async function isFavoriteTeam(
  teamId: number
): Promise<boolean> {
  const favorites = await getFavoriteTeams();

  return favorites.some(
    (team) => team.id === teamId
  );
}