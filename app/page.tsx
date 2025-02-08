"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { NumberInput } from "@/components/NumberInput"
import { ChevronDown, ChevronUp } from "lucide-react"

// Audio file from a free sound hosting service
const ALARM_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"

export default function GymTimer() {
  const [sets, setSets] = useState(3)
  const [duration, setDuration] = useState(60)
  const [breakTime, setBreakTime] = useState(30)
  const [currentSet, setCurrentSet] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [isDurationMinutes, setIsDurationMinutes] = useState(false)
  const [isBreakMinutes, setIsBreakMinutes] = useState(false)
  const [showInputs, setShowInputs] = useState(true)

  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    audioRef.current = new Audio(ALARM_SOUND_URL)
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1)
      }, 1000)
    } else if (isActive && timeLeft === 0) {
      if (audioRef.current) {
        audioRef.current.play().catch((error) => console.error("Error playing audio:", error))
      }
      if (isBreak) {
        if (currentSet < sets) {
          setIsBreak(false)
          setTimeLeft(isDurationMinutes ? duration * 60 : duration)
          setCurrentSet((set) => set + 1)
        } else {
          setIsActive(false)
          setCurrentSet(0)
        }
      } else {
        setIsBreak(true)
        setTimeLeft(isBreakMinutes ? breakTime * 60 : breakTime)
      }
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, timeLeft, isBreak, currentSet, sets, duration, breakTime, isDurationMinutes, isBreakMinutes])

  const toggleTimer = () => {
    if (!isActive && currentSet === 0) {
      setTimeLeft(isDurationMinutes ? duration * 60 : duration)
      setCurrentSet(1)
      setShowInputs(false)
    }
    setIsActive(!isActive)
  }

  const resetTimer = () => {
    setIsActive(false)
    setCurrentSet(0)
    setTimeLeft(0)
    setIsBreak(false)
    setShowInputs(true)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = time % 60
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  const toggleDurationUnit = () => {
    setIsDurationMinutes(!isDurationMinutes)
    setDuration(isDurationMinutes ? Math.min(duration * 60, 9999) : Math.round(duration / 60))
  }

  const toggleBreakUnit = () => {
    setIsBreakMinutes(!isBreakMinutes)
    setBreakTime(isBreakMinutes ? Math.min(breakTime * 60, 9999) : Math.round(breakTime / 60))
  }

  return (
    <div className="min-h-screen bg-lighthouse-blue flex flex-col items-center justify-center p-4 overflow-hidden">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl sm:text-4xl font-display text-lighthouse-gold text-center mb-6">LIGHTHOUSE</h1>

        {showInputs && (
          <div className="space-y-6 mb-6">
            <div className="text-center">
              <Label htmlFor="sets" className="mb-2 block text-lighthouse-gold font-serif text-lg">
                Number of Sets
              </Label>
              <NumberInput value={sets} onChange={setSets} min={1} max={99} />
            </div>
            <div className="text-center">
              <Label htmlFor="duration" className="mb-2 block text-lighthouse-gold font-serif text-lg">
                Set Duration
              </Label>
              <div className="flex items-center justify-center space-x-2">
                <NumberInput value={duration} onChange={setDuration} min={1} max={isDurationMinutes ? 166 : 9999} />
                <Button
                  onClick={toggleDurationUnit}
                  variant="outline"
                  className="w-24 text-base border-lighthouse-gold text-lighthouse-gold hover:bg-lighthouse-gold/10"
                >
                  {isDurationMinutes ? "Minutes" : "Seconds"}
                </Button>
              </div>
            </div>
            <div className="text-center">
              <Label htmlFor="break" className="mb-2 block text-lighthouse-gold font-serif text-lg">
                Break Time
              </Label>
              <div className="flex items-center justify-center space-x-2">
                <NumberInput value={breakTime} onChange={setBreakTime} min={1} max={isBreakMinutes ? 166 : 9999} />
                <Button
                  onClick={toggleBreakUnit}
                  variant="outline"
                  className="w-24 text-base border-lighthouse-gold text-lighthouse-gold hover:bg-lighthouse-gold/10"
                >
                  {isBreakMinutes ? "Minutes" : "Seconds"}
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className={`text-center mb-6 transition-all duration-300 ease-in-out ${showInputs ? "" : "scale-150"}`}>
          <div className="text-6xl sm:text-7xl font-display text-lighthouse-blue mb-2">{formatTime(timeLeft)}</div>
          <div className="text-xl sm:text-2xl font-serif text-lighthouse-gold">
            {isBreak ? "Break Time" : `Set ${currentSet}/${sets}`}
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          <Button
            onClick={toggleTimer}
            className="w-28 text-lg bg-lighthouse-blue hover:bg-lighthouse-blue/90 text-white font-display"
          >
            {isActive ? "PAUSE" : "START"}
          </Button>
          <Button
            onClick={resetTimer}
            variant="outline"
            className="w-28 text-lg border-lighthouse-blue text-lighthouse-blue hover:bg-lighthouse-blue/10 font-display"
          >
            RESET
          </Button>
        </div>

        {isActive && (
          <div className="mt-4 text-center">
            <Button
              onClick={() => setShowInputs(!showInputs)}
              variant="ghost"
              className="text-lighthouse-gold hover:bg-lighthouse-gold/10"
            >
              {showInputs ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

