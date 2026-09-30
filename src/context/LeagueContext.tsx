import {
  createContext,
  ReactNode,
  useContext,
  useState,
} from "react";

export type League = {
  id: number;
  name: string;
  flag: string;
};

export const LEAGUES: League[] = [
  {
    id: 501,
    name: "Scottish Premiership",
    flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  },
  {
    id: 271,
    name: "Danish Superliga",
    flag: "🇩🇰",
  },
];

type LeagueContextType = {
  selectedLeague: League;
  setSelectedLeague: (league: League) => void;
};

const LeagueContext =
  createContext<LeagueContextType | undefined>(
    undefined
  );

export function LeagueProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [selectedLeague, setSelectedLeague] =
    useState<League>(LEAGUES[0]);

  return (
    <LeagueContext.Provider
      value={{
        selectedLeague,
        setSelectedLeague,
      }}
    >
      {children}
    </LeagueContext.Provider>
  );
}

export function useLeague() {
  const context = useContext(LeagueContext);

  if (!context) {
    throw new Error(
      "useLeague must be used inside LeagueProvider"
    );
  }

  return context;
}