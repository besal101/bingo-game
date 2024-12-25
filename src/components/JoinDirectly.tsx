"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface JoinDirectlyProps {
  roomId: string;
}

export default function JoinDirectly({ roomId }: JoinDirectlyProps) {
  const router = useRouter();
  const [playerName, setPlayerName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;

    setLoading(true);
    localStorage.setItem("playerName", playerName.trim());

    // Force a reload to ensure socket reconnects with new player name
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Join Game</h2>
        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Name
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full p-2 border rounded-lg"
              required
              placeholder="Enter your name"
              disabled={loading}
              minLength={2}
              maxLength={20}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !playerName.trim()}
            className="w-full bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition disabled:bg-green-300"
          >
            {loading ? "Joining..." : "Join Game"}
          </button>
        </form>
      </div>
    </div>
  );
}
