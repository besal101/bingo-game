import { Suspense } from 'react'
import BingoCard from '@/components/BingoCard'
import WinnerAnnouncement from '@/components/WinnerAnnouncement'
import { generateBingoNumbers } from '@/lib/utils'
import ShareableLink from '@/components/ShareableLink'

export default function GamePage({ searchParams }: { searchParams: { userId: string; roomCode: string } }) {
  const { userId, roomCode } = searchParams
  const bingoNumbers = generateBingoNumbers()

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 p-4">
      <h1 className="text-4xl font-bold mb-8 text-white">Bingo Game</h1>
      <p className="text-xl mb-4 text-white">Room: {roomCode}</p>
      <p className="text-xl mb-8 text-white">Player: {userId}</p>
      <ShareableLink roomCode={roomCode} />
      <Suspense fallback={<div>Loading...</div>}>
        <BingoCard numbers={bingoNumbers} userId={userId} roomCode={roomCode} />
      </Suspense>
      <WinnerAnnouncement />
    </main>
  )
}

