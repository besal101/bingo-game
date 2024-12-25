"use client";
import { useState } from "react";
import { Copy } from "lucide-react";

interface ShareLinkProps {
  roomId: string;
}

export default function ShareLink({ roomId }: ShareLinkProps) {
  const [copied, setCopied] = useState(false);

  const shareLink = `${window.location.origin}/room/${roomId}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Share Game</h2>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={shareLink}
          readOnly
          className="flex-1 p-2 border rounded bg-gray-50"
        />
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
        >
          <Copy size={18} />
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <p className="mt-2 text-sm text-gray-600">
        Share this link with other players to join the game
      </p>
    </div>
  );
}
