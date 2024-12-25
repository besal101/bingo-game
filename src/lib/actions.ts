'use server'

export async function checkWinner(userId: string, roomCode: string, selectedNumbers: number[]): Promise<boolean> {
  // In a real app, you'd check the selected numbers against the winning condition
  // and update the game state in a database
  console.log(`Checking winner for user ${userId} in room ${roomCode}`)
  console.log(`Selected numbers: ${selectedNumbers.join(', ')}`)

  // For this example, we'll consider a win if the user has selected 5 numbers
  return selectedNumbers.length >= 5
}

