import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { playerName, roomCode } = body;

    if (!playerName || !roomCode) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // In a real application, you would validate the room code against a database
    // For now, we'll just use the room code as the room ID
    return NextResponse.json({
      roomId: roomCode,
      message: "Joined room successfully",
    });
  } catch (error) {
    console.error("Failed to join room:", error);
    return NextResponse.json(
      { message: "Failed to join room" },
      { status: 500 }
    );
  }
}
