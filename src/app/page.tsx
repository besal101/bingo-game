"use client";
import { useState } from "react";
import LoginForm from "@/components/LoginForm";
import CreateRoom from "@/components/CreateRoom";
import JoinRoom from "@/components/JoinRoom";

export default function Home() {
  const [view, setView] = useState<"create" | "join" | "home">("home");

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 p-4">
      {view === "home" && (
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-8">Bingo Game</h1>
          <div className="space-y-4">
            <button
              onClick={() => setView("create")}
              className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition"
            >
              Create Room
            </button>
            <button
              onClick={() => setView("join")}
              className="w-full bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition"
            >
              Join Room
            </button>
          </div>
        </div>
      )}

      {view === "create" && <CreateRoom onBack={() => setView("home")} />}

      {view === "join" && <JoinRoom onBack={() => setView("home")} />}
    </main>
  );
}
