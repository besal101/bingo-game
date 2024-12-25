import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { GameRoom } from "@/types/game";

// Declare global rooms if not exists
declare global {
  var rooms: Map<string, GameRoom>;
}

if (!global.rooms) {
  global.rooms = new Map();
}

export async function POST(request: Request) {
  try {
    const { hostName } = await request.json();
    const roomId = uuidv4();

    // Initialize room in global rooms Map
    const newRoom = {
      id: roomId,
      host: null,
      players: [],
      gameStarted: false,
      calledNumbers: [],
      winner: null,
    };

    global.rooms.set(roomId, newRoom);
    return NextResponse.json({ roomId });
  } catch (error) {
    console.error("Failed to create room:", error);
    return NextResponse.json(
      { error: "Failed to create room" },
      { status: 500 }
    );
  }
}
