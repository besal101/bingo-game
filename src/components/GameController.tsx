"use client";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Socket } from "socket.io-client";
import AnimatedNumber from "./AnimatedNumber";
import { motion } from "framer-motion";

interface GameControllerProps {
  isHost: boolean;
  roomId: string;
  socket: Socket | null;
  gameStarted: boolean;
  winner: string | null;
  calledNumbers: number[];
}

export default function GameController({
  isHost,
  roomId,
  socket,
  gameStarted,
  winner,
  calledNumbers,
}: GameControllerProps) {
  const [availableNumbers, setAvailableNumbers] = useState<number[]>([]);
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const [autoPlay, setAutoPlay] = useState(false);
  const [autoPlayInterval, setAutoPlayInterval] =
    useState<NodeJS.Timeout | null>(null);

  // Update available numbers when game starts or numbers are called
  useEffect(() => {
    if (gameStarted) {
      const numbers = Array.from({ length: 75 }, (_, i) => i + 1);
      const remaining = numbers.filter((n) => !calledNumbers.includes(n));
      setAvailableNumbers(remaining);
      setCurrentNumber(calledNumbers[calledNumbers.length - 1] || null);
    }
  }, [gameStarted, calledNumbers]);

  // Reset game state when game starts
  useEffect(() => {
    if (gameStarted) {
      const numbers = Array.from({ length: 75 }, (_, i) => i + 1);
      setAvailableNumbers(numbers);
      setCurrentNumber(null);
      setAutoPlay(false);
      if (autoPlayInterval) clearInterval(autoPlayInterval);
    }
  }, [gameStarted]);

  // Handle auto-play cleanup
  useEffect(() => {
    return () => {
      if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
      }
    };
  }, [autoPlayInterval]);

  // Stop auto-play when there's a winner
  useEffect(() => {
    if (winner && autoPlayInterval) {
      clearInterval(autoPlayInterval);
      setAutoPlay(false);
    }
  }, [winner, autoPlayInterval]);

  const callNumber = () => {
    // Don't call numbers if there's a winner
    if (winner || availableNumbers.length === 0) {
      setAutoPlay(false);
      if (autoPlayInterval) clearInterval(autoPlayInterval);
      return;
    }

    // Pick a random number from available numbers
    const randomIndex = Math.floor(Math.random() * availableNumbers.length);
    const number = availableNumbers[randomIndex];

    // Update current number
    setCurrentNumber(number);

    // Emit the called number to all players
    socket?.emit("call_number", { roomId, number });
  };

  const toggleAutoPlay = () => {
    if (!autoPlay) {
      const interval = setInterval(callNumber, 5000); // Call number every 5 seconds
      setAutoPlayInterval(interval);
      setAutoPlay(true);
    } else {
      if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
      }
      setAutoPlay(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (!isHost) {
    return (
      <motion.div
        className="bg-white rounded-lg p-6 shadow-lg"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">
            {winner
              ? `Game Over - Winner: ${winner}!`
              : gameStarted
              ? "Game in Progress"
              : "Waiting for Host to Start"}
          </h2>
          {gameStarted && <AnimatedNumber number={currentNumber} />}
        </div>
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-3">Called Numbers</h3>
          <div className="max-h-48 overflow-y-auto">
            <motion.div
              className="grid grid-cols-8 gap-2"
              variants={containerVariants}
            >
              {calledNumbers.map((number, index) => (
                <motion.div
                  key={`${number}-${index}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gray-100 p-2 rounded text-center font-medium"
                >
                  {number}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-white rounded-lg p-6 shadow-lg"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-4">
          {winner
            ? `Game Over - Winner: ${winner}!`
            : gameStarted
            ? "Game in Progress"
            : "Host Controls"}
        </h2>
        {!gameStarted ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => socket?.emit("start_game", roomId)}
            className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
          >
            Start Game
          </motion.button>
        ) : (
          <>
            <AnimatedNumber number={currentNumber} />
            <div className="space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={callNumber}
                disabled={autoPlay || availableNumbers.length === 0}
                className={cn(
                  "bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold",
                  "hover:bg-blue-600 transition-colors",
                  "disabled:bg-gray-300 disabled:cursor-not-allowed"
                )}
              >
                Call Number
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleAutoPlay}
                disabled={availableNumbers.length === 0}
                className={cn(
                  "px-6 py-3 rounded-lg font-semibold",
                  autoPlay
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-green-500 text-white hover:bg-green-600",
                  "transition-colors",
                  "disabled:bg-gray-300 disabled:cursor-not-allowed"
                )}
              >
                {autoPlay ? "Stop Auto-Play" : "Start Auto-Play"}
              </motion.button>
            </div>
          </>
        )}
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-3">Called Numbers</h3>
        <div className="max-h-48 overflow-y-auto">
          <div className="grid grid-cols-8 gap-2">
            {calledNumbers.map((number, index) => (
              <div
                key={`${number}-${index}`}
                className="bg-gray-100 p-2 rounded text-center font-medium"
              >
                {number}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-3">Game Stats</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-100 p-4 rounded">
            <div className="text-lg font-medium">Numbers Called</div>
            <div className="text-3xl font-bold text-purple-600">
              {winner ? 0 : calledNumbers.length}
            </div>
          </div>
          <div className="bg-gray-100 p-4 rounded">
            <div className="text-lg font-medium">Numbers Remaining</div>
            <div className="text-3xl font-bold text-purple-600">
              {winner ? 0 : availableNumbers.length}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
