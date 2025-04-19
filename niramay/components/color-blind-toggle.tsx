"use client"

import { useState, useEffect } from "react"
import { Eye } from "lucide-react"

export default function ColorBlindToggle() {
  const [isColorBlind, setIsColorBlind] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Check if user has previously set color blind mode
    const savedPreference = localStorage.getItem("colorBlindMode")
    if (savedPreference === "true") {
      setIsColorBlind(true)
      document.documentElement.classList.add("color-blind")
    }
    setMounted(true)
  }, [])

  const toggleColorBlind = () => {
    setIsColorBlind(!isColorBlind)
    if (!isColorBlind) {
      document.documentElement.classList.add("color-blind")
      localStorage.setItem("colorBlindMode", "true")
    } else {
      document.documentElement.classList.remove("color-blind")
      localStorage.setItem("colorBlindMode", "false")
    }
  }

  if (!mounted) {
    return null // Prevent hydration mismatch
  }

  return (
    <button
      onClick={toggleColorBlind}
      className={`rounded-full p-3 shadow-lg ${isColorBlind ? "bg-blue-500" : "bg-green-500"} text-white`}
      aria-pressed={isColorBlind}
      aria-label="Toggle color blind mode"
    >
      <Eye size={20} />
    </button>
  )
}
