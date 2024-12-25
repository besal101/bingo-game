interface PlayerListProps {
  players: Array<{
    id: string;
    name: string;
    isHost: boolean;
  }>;
}

export default function PlayerList({ players }: PlayerListProps) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Players</h2>
      <div className="space-y-2">
        {players.map((player) => (
          <div
            key={player.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded"
          >
            <span className="font-medium">{player.name}</span>
            {player.isHost && (
              <span className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded">
                Host
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
