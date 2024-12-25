import { Server as SocketIOServer, Socket } from "socket.io";

interface GameRoom {
  id: string;
  host: string | null;
  players: { id: string; name: string; isHost: boolean }[];
  gameStarted: boolean;
  calledNumbers: number[];
  winner: string | null;
}

declare global {
  var rooms: Map<string, GameRoom>;
}

if (!global.rooms) {
  global.rooms = new Map();
}

export function initSocket(io: SocketIOServer) {
  io.on("connection", (socket: Socket) => {
    socket.on("join_room", ({ roomId, playerName, isHost }) => {
      let currentRoom = global.rooms.get(roomId);

      if (!currentRoom) {
        socket.emit("room_error", { message: "Room not found" });
        return;
      }

      // Check if player name is already taken by someone else
      const existingPlayer = currentRoom.players.find(
        (p) => p.name === playerName && p.id !== socket.id
      );

      if (existingPlayer) {
        socket.emit("room_error", { message: "Name already taken" });
        return;
      }

      // Remove any existing entries for this socket
      currentRoom.players = currentRoom.players.filter(
        (p) => p.id !== socket.id
      );

      // Add the new player
      const newPlayer = {
        id: socket.id,
        name: playerName,
        isHost: isHost || currentRoom.players.length === 0,
      };

      currentRoom.players.push(newPlayer);

      // Update host if needed
      if (newPlayer.isHost) {
        currentRoom.host = socket.id;
      }

      // Join the room
      socket.join(roomId);

      // Send room state to everyone
      io.to(roomId).emit("room_state", {
        players: currentRoom.players,
        gameStarted: currentRoom.gameStarted,
        calledNumbers: currentRoom.calledNumbers,
        winner: currentRoom.winner,
      });
    });

    socket.on("claim_bingo", ({ roomId, playerId, playerName, card }) => {
      const room = global.rooms.get(roomId);
      if (!room || !room.gameStarted || room.winner) return;

      // Verify the winning card
      const isValid = verifyWinningCard(card, room.calledNumbers);

      if (isValid) {
        room.winner = playerName;
        room.gameStarted = false;

        // Broadcast game over to all players
        io.to(roomId).emit("room_state", {
          players: room.players,
          gameStarted: false,
          calledNumbers: room.calledNumbers,
          winner: playerName,
        });

        // Also emit game_over for animation purposes
        io.to(roomId).emit("game_over", { winnerName: playerName, card });
      } else {
        // Optionally notify the player that their claim was invalid
        socket.emit("bingo_invalid");
      }
    });

    socket.on("start_game", (roomId) => {
      const room = global.rooms.get(roomId);
      if (room && room.host === socket.id) {
        room.gameStarted = true;
        room.calledNumbers = [];
        room.winner = null;

        io.to(roomId).emit("room_state", {
          players: room.players,
          gameStarted: room.gameStarted,
          calledNumbers: room.calledNumbers,
          winner: room.winner,
        });
      }
    });

    socket.on("call_number", ({ roomId, number }) => {
      const room = global.rooms.get(roomId);
      if (room && room.host === socket.id) {
        // Check if number was already called
        if (!room.calledNumbers.includes(number)) {
          room.calledNumbers.push(number);

          // Broadcast full room state to all players
          io.to(roomId).emit("room_state", {
            players: room.players,
            gameStarted: room.gameStarted,
            calledNumbers: room.calledNumbers,
            winner: room.winner,
          });
        } else {
          // Optionally notify host that number was already called
          socket.emit("number_already_called", { number });
        }
      }
    });

    socket.on("disconnect", () => {
      global.rooms.forEach((room, roomId) => {
        const playerIndex = room.players.findIndex((p) => p.id === socket.id);
        if (playerIndex !== -1) {
          const player = room.players[playerIndex];
          room.players.splice(playerIndex, 1);
          io.to(roomId).emit("player_left", socket.id);

          // If host left, assign new host
          if (player.isHost && room.players.length > 0) {
            const newHost = room.players[0];
            newHost.isHost = true;
            room.host = newHost.id;
            io.to(roomId).emit("room_state", {
              players: room.players,
              gameStarted: room.gameStarted,
              calledNumbers: room.calledNumbers,
            });
          }

          // Remove room if empty
          if (room.players.length === 0) {
            global.rooms.delete(roomId);
          }
        }
      });
    });
  });
}

// Helper function to verify winning card
function verifyWinningCard(card: number[][], calledNums: number[]): boolean {
  const calledSet = new Set(calledNums);

  // Helper function to check if a line is complete
  const isLineComplete = (numbers: number[]) => {
    return numbers.every((num) => calledSet.has(num));
  };

  // Helper function to get a row's numbers
  const getRow = (rowIndex: number): number[] => {
    return card.map((col) => col[rowIndex]);
  };

  // Check rows and columns
  for (let i = 0; i < 5; i++) {
    if (isLineComplete(getRow(i)) || isLineComplete(card[i])) return true;
  }

  // Check diagonals
  const diagonal1 = Array(5)
    .fill(0)
    .map((_, i) => card[i][i]);
  const diagonal2 = Array(5)
    .fill(0)
    .map((_, i) => card[i][4 - i]);

  return isLineComplete(diagonal1) || isLineComplete(diagonal2);
}
