"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface JoinRoomProps {
  onBack: () => void;
}

export default function JoinRoom({ onBack }: JoinRoomProps) {
  const router = useRouter();
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/rooms/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playerName,
          roomCode,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to join room");
      }

      const data = await response.json();

      // Save player name to localStorage
      localStorage.setItem("playerName", playerName);

      // Navigate to room
      router.push(`/room/${data.roomId}`);
    } catch (error) {
      console.error("Failed to join room:", error);
      alert(error instanceof Error ? error.message : "Failed to join room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
      <h2 className="text-2xl font-bold text-center mb-6">Join Room</h2>
      <form onSubmit={handleJoinRoom} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Player Name
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full p-2 border rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Room Code
          </label>
          <input
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            className="w-full p-2 border rounded-lg"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition disabled:bg-green-300"
        >
          {loading ? "Joining..." : "Join Room"}
        </button>
        <button
          type="button"
          onClick={onBack}
          className="w-full bg-gray-200 text-gray-800 p-3 rounded-lg hover:bg-gray-300 transition"
        >
          Back
        </button>
      </form>
    </div>
  );
}
