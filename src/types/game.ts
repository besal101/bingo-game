export interface GameRoom {
  id: string;
  host: string | null;
  players: { id: string; name: string; isHost: boolean }[];
  gameStarted: boolean;
  calledNumbers: number[];
  winner: string | null;
}
