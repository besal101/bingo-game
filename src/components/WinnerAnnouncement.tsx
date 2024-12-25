'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function WinnerAnnouncement() {
  const [winner, setWinner] = useState<string | null>(null)

  useEffect(() => {
    // In a real app, you'd use a WebSocket or polling to check for a winner
    const checkWinner = async () => {
      // Simulating an API call
      const response = await fetch('/api/checkWinner')
      const data = await response.json()
      if (data.winner) {
        setWinner(data.winner)
      }
    }

    const interval = setInterval(checkWinner, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <AnimatePresence>
      {winner && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
        >
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <h2 className="text-3xl font-bold mb-4 text-indigo-600">We Have a Winner!</h2>
            <p className="text-xl text-gray-800">{winner} has won the game!</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

