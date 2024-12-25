"use client";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";
import BingoCard from "@/components/BingoCard";
import GameController from "@/components/GameController";
import PlayerList from "@/components/PlayerList";
import ShareLink from "@/components/ShareLink";
import JoinDirectly from "@/components/JoinDirectly";
import { AnimatePresence, motion } from "framer-motion";

interface Player {
  id: string;
  name: string;
  isHost: boolean;
}

export default function RoomPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const isHost = searchParams.get("host") === "true";
  const roomId = params.roomId as string;

  const [playerName, setPlayerName] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const { socket, isConnected } = useSocket(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  );
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [calledNumbers, setCalledNumbers] = useState<number[]>([]);
  const [winner, setWinner] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize playerName from localStorage
  useEffect(() => {
    const storedName = localStorage.getItem("playerName");
    setPlayerName(storedName);
    setIsInitialized(true);
  }, []);

  // Handle socket connection and events
  useEffect(() => {
    if (!socket || !isConnected || !playerName) return;

    // Join room
    socket.emit("join_room", { roomId, playerName, isHost });

    // Handle room errors
    socket.on("room_error", ({ message }) => {
      console.error("Room error:", message);
      // Redirect to home page without alert
      window.location.href = "/";
    });

    // Handle game over
    socket.on("game_over", ({ winnerName, card }) => {
      setWinner(winnerName);
      setGameStarted(false);
    });

    // Handle initial room state
    socket.on(
      "room_state",
      ({
        players: roomPlayers,
        gameStarted: isGameStarted,
        calledNumbers: roomCalledNumbers,
        winner: roomWinner,
      }) => {
        setPlayers(Array.isArray(roomPlayers) ? roomPlayers : []);
        setGameStarted(!!isGameStarted);
        setCalledNumbers(
          Array.isArray(roomCalledNumbers) ? roomCalledNumbers : []
        );
        setWinner(roomWinner || null);
        setIsLoading(false);
      }
    );

    // Socket event listeners
    socket.on("player_joined", (player) => {
      setPlayers((prev) => {
        const exists = prev.some((p) => p.id === player.id);
        if (exists) return prev;
        return [...prev, player];
      });
    });

    socket.on("player_left", (playerId: string) => {
      setPlayers((prev) => prev.filter((p) => p.id !== playerId));
    });

    socket.on("game_started", () => {
      setGameStarted(true);
      setCalledNumbers([]);
      setWinner(null);
    });

    socket.on("number_called", (number: number) => {
      setCalledNumbers((prev) => [...prev, number]);
    });

    socket.on("bingo_claimed", ({ playerId, playerName, card }) => {
      // Verify the winning card
      const isValid = verifyWinningCard(card, calledNumbers);

      if (isValid) {
        setWinner(playerName);
        socket.emit("winner_verified", { roomId, playerId, playerName });
      }
    });

    socket.on("bingo_invalid", () => {
      alert("Invalid bingo claim! Please check your card.");
    });

    // Cleanup on unmount
    return () => {
      socket.emit("leave_room", { roomId });
      socket.off("player_joined");
      socket.off("player_left");
      socket.off("game_started");
      socket.off("number_called");
      socket.off("bingo_claimed");
      socket.off("game_over");
      socket.off("room_state");
      socket.off("room_error");
      socket.off("bingo_invalid");
    };
  }, [socket, isConnected, playerName, roomId, isHost]);

  // Wait for initialization
  if (!isInitialized) {
    return null;
  }

  // Show JoinDirectly if no playerName
  if (!playerName) {
    return <JoinDirectly roomId={roomId} />;
  }

  // Show loading state
  if (!isConnected || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">
            {!isConnected ? "Connecting..." : "Joining room..."}
          </h2>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  const handleBingoClaim = (card: number[][]) => {
    if (!socket || !gameStarted || winner) return;

    const playerName = localStorage.getItem("playerName");
    if (!playerName) return;

    socket.emit("claim_bingo", {
      roomId,
      playerId: socket.id,
      playerName,
      card,
    });
  };

  const verifyWinningCard = (
    card: number[][],
    calledNums: number[]
  ): boolean => {
    const calledSet = new Set(calledNums);

    // Helper function to check if a line is complete
    const isLineComplete = (numbers: number[]) => {
      return numbers.every((num) => num === 0 || calledSet.has(num));
    };

    // Helper function to get a row's numbers
    const getRow = (rowIndex: number) => {
      const rowNumbers = [];
      for (let col = 0; col < 5; col++) {
        rowNumbers.push(card[col][rowIndex]);
      }
      return rowNumbers;
    };

    // Helper function to get a column's numbers
    const getColumn = (colIndex: number) => {
      return card[colIndex];
    };

    // 1. Check standard patterns (rows, columns, diagonals)
    // Check rows
    for (let row = 0; row < 5; row++) {
      if (isLineComplete(getRow(row))) return true;
    }

    // Check columns
    for (let col = 0; col < 5; col++) {
      if (isLineComplete(getColumn(col))) return true;
    }

    // Check diagonals
    const diagonal1 = Array(5)
      .fill(0)
      .map((_, i) => card[i][i]);
    const diagonal2 = Array(5)
      .fill(0)
      .map((_, i) => card[i][4 - i]);
    if (isLineComplete(diagonal1) || isLineComplete(diagonal2)) return true;

    // 2. Check special patterns

    // Four corners
    const corners = [
      card[0][0], // Top-left
      card[4][0], // Top-right
      card[0][4], // Bottom-left
      card[4][4], // Bottom-right
    ];
    if (isLineComplete(corners)) return true;

    // Small diamond (around FREE space)
    const diamond = [
      card[2][1], // Top
      card[1][2], // Left
      card[3][2], // Right
      card[2][3], // Bottom
    ];
    if (isLineComplete(diamond)) return true;

    // Postage stamp (any 2x2 corner)
    const topLeft = [card[0][0], card[1][0], card[0][1], card[1][1]];
    const topRight = [card[3][0], card[4][0], card[3][1], card[4][1]];
    const bottomLeft = [card[0][3], card[1][3], card[0][4], card[1][4]];
    const bottomRight = [card[3][3], card[4][3], card[3][4], card[4][4]];

    if (
      isLineComplete(topLeft) ||
      isLineComplete(topRight) ||
      isLineComplete(bottomLeft) ||
      isLineComplete(bottomRight)
    )
      return true;

    return false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Room Header - Only show when game hasn't started */}
        <AnimatePresence>
          {!gameStarted && (
            <motion.div
              initial={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="bg-white rounded-lg p-6 shadow-lg"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold">Room: {roomId}</h1>
                  {winner && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="mt-4 text-2xl text-green-600 font-bold"
                    >
                      🎉 Winner: {winner}! 🎉
                    </motion.div>
                  )}
                </div>
                {isHost && (
                  <div className="flex-shrink-0 ml-4">
                    <ShareLink roomId={roomId} />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Area */}
        <motion.div layout className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Player List */}
          <div className="lg:col-span-1">
            <PlayerList players={players} />
          </div>

          {/* Game Controls and Card */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GameController
                isHost={isHost}
                roomId={roomId}
                socket={socket}
                gameStarted={gameStarted}
                winner={winner}
                calledNumbers={calledNumbers}
              />
              {gameStarted && (
                <BingoCard
                  calledNumbers={calledNumbers}
                  onBingoClaim={handleBingoClaim}
                  disabled={!!winner}
                />
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
