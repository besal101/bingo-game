'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface ShareableLinkProps {
  roomCode: string
}

export default function ShareableLink({ roomCode }: ShareableLinkProps) {
  const [shareableUrl, setShareableUrl] = useState('')

  useEffect(() => {
    const gameUrl = `${window.location.origin}/game?roomCode=${roomCode}`
    setShareableUrl(gameUrl)
  }, [roomCode])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareableUrl)
      .then(() => alert('Link copied to clipboard!'))
      .catch((err) => console.error('Failed to copy: ', err))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8 p-4 bg-white rounded-md shadow-md"
    >
      <p className="text-sm font-medium text-gray-700 mb-2">Share this URL with other players:</p>
      <div className="flex">
        <input
          type="text"
          readOnly
          value={shareableUrl}
          className="flex-grow px-3 py-2 bg-gray-100 border border-gray-300 rounded-l-md text-sm"
          onClick={(e) => e.currentTarget.select()}
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-r-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={copyToClipboard}
        >
          Copy
        </motion.button>
      </div>
    </motion.div>
  )
}

