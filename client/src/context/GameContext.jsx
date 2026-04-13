import { createContext, useContext, useState, useCallback, useRef } from "react";
import MOCK_GAMES, { CURRENT_USER } from "../data/mockFeed";

const GameContext = createContext(null);

let nextId = MOCK_GAMES.reduce((max, g) => Math.max(max, g.id), 0) + 1;

export function GameProvider({ children }) {
  const [games, setGames] = useState(() =>
    [...MOCK_GAMES].sort(
      (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt),
    ),
  );

  const gamesRef = useRef(games);
  gamesRef.current = games;

  const addGame = useCallback((game) => {
    const newGame = { ...game, id: nextId++ };
    setGames((prev) => [newGame, ...prev]);
    return newGame;
  }, []);

  const updateGame = useCallback((id, changes) => {
    setGames((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...changes } : g)),
    );
  }, []);

  const getGame = useCallback((id) => {
    const numId = Number(id);
    return gamesRef.current.find((g) => g.id === numId || g.id === id);
  }, []);

  return (
    <GameContext.Provider value={{ games, addGame, updateGame, getGame }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGames() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGames must be used within GameProvider");
  return ctx;
}

export { CURRENT_USER };
