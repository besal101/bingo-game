"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface BingoCardProps {
  calledNumbers: number[];
  onBingoClaim: (card: number[][]) => void;
  disabled?: boolean;
}

export default function BingoCard({
  calledNumbers,
  onBingoClaim,
  disabled = false,
}: BingoCardProps) {
  const [card, setCard] = useState<number[][]>([]);
  const [selectedCells, setSelectedCells] = useState<boolean[][]>([]);

  // Initialize card and selected cells on mount
  useEffect(() => {
    const newCard = generateBingoCard();
    setCard(newCard);
    // Initialize selectedCells with same dimensions as card
    setSelectedCells(
      Array(5)
        .fill(0)
        .map(() => Array(5).fill(false))
    );
  }, []);

  // Update selected cells when called numbers change
  useEffect(() => {
    if (!card.length) return;

    const newSelectedCells = card.map((col, colIndex) =>
      col.map((num, rowIndex) => num === 0 || calledNumbers.includes(num))
    );
    setSelectedCells(newSelectedCells);
  }, [calledNumbers, card]);

  const handleCellClick = (colIndex: number, rowIndex: number) => {
    if (disabled || !selectedCells.length) return;

    const number = card[colIndex][rowIndex];
    if (number === 0 || !calledNumbers.includes(number)) return;

    const newSelectedCells = selectedCells.map((col, i) =>
      col.map((cell, j) => (i === colIndex && j === rowIndex ? !cell : cell))
    );
    setSelectedCells(newSelectedCells);
  };

  const handleBingoClaim = () => {
    if (disabled || !card.length) return;

    // Check if there's a winning pattern
    const hasWinningPattern = checkWinningPattern();
    if (!hasWinningPattern) {
      alert("No valid bingo pattern found!");
      return;
    }

    onBingoClaim(card);
  };

  // Add this function to check winning patterns
  const checkWinningPattern = (): boolean => {
    // Check rows
    for (let row = 0; row < 5; row++) {
      const isRowComplete = Array(5)
        .fill(0)
        .every((_, col) => selectedCells[col][row]);
      if (isRowComplete) return true;
    }

    // Check columns
    for (let col = 0; col < 5; col++) {
      const isColComplete = selectedCells[col].every((cell) => cell);
      if (isColComplete) return true;
    }

    // Check main diagonal (top-left to bottom-right)
    const isMainDiagonalComplete = Array(5)
      .fill(0)
      .every((_, i) => selectedCells[i][i]);
    if (isMainDiagonalComplete) return true;

    // Check other diagonal (top-right to bottom-left)
    const isOtherDiagonalComplete = Array(5)
      .fill(0)
      .every((_, i) => selectedCells[i][4 - i]);
    if (isOtherDiagonalComplete) return true;

    return false;
  };

  if (!card.length || !selectedCells.length) return null;

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      <div className="grid grid-cols-5 gap-2 mb-6">
        {["B", "I", "N", "G", "O"].map((letter) => (
          <div
            key={letter}
            className="text-2xl font-bold text-center text-purple-600"
          >
            {letter}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-5 gap-2 mb-6">
        {card.map((col, colIndex) =>
          col.map((number, rowIndex) => (
            <button
              key={`${colIndex}-${rowIndex}`}
              onClick={() => handleCellClick(colIndex, rowIndex)}
              disabled={disabled}
              className={cn(
                "aspect-square flex items-center justify-center",
                "text-xl font-semibold rounded-lg transition-colors",
                "disabled:cursor-not-allowed",
                selectedCells[colIndex][rowIndex]
                  ? "bg-green-500 text-white"
                  : "bg-white hover:bg-gray-100"
              )}
            >
              {number}
            </button>
          ))
        )}
      </div>
      <button
        onClick={handleBingoClaim}
        disabled={disabled}
        className={cn(
          "w-full bg-purple-600 text-white py-3 rounded-lg font-semibold",
          "hover:bg-purple-700 transition-colors",
          "disabled:bg-gray-300 disabled:cursor-not-allowed"
        )}
      >
        Claim Bingo!
      </button>
    </div>
  );
}

function generateBingoCard() {
  const card: number[][] = Array(5)
    .fill(0)
    .map(() => Array(5).fill(0));
  const usedNumbers = new Set<number>();

  // Generate numbers for each column
  for (let col = 0; col < 5; col++) {
    const min = col * 15 + 1;
    const max = min + 14;

    for (let row = 0; row < 5; row++) {
      let number;
      do {
        number = Math.floor(Math.random() * (max - min + 1)) + min;
      } while (usedNumbers.has(number));

      usedNumbers.add(number);
      card[col][row] = number;
    }
  }

  return card;
}
