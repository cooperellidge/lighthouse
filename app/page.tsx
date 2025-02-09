"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/NumberInput";
import { SavedConfigs, TimerConfig } from "@/components/SavedConfigs";
import { ChevronDown, ChevronUp, Share, X } from "lucide-react";

const ALARM_SOUND_URL =
  "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

export default function GymTimer() {
  const [sets, setSets] = useState(3);
  const [duration, setDuration] = useState(60);
  const [breakTime, setBreakTime] = useState(30);
  const [currentSet, setCurrentSet] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [isDurationMinutes, setIsDurationMinutes] = useState(false);
  const [isBreakMinutes, setIsBreakMinutes] = useState(false);
  const [showInputs, setShowInputs] = useState(true);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUnlockedRef = useRef(false); // To track if audio is "unlocked"

  useEffect(() => {
    audioRef.current = new Audio(ALARM_SOUND_URL);
    audioRef.current.load(); // Preload audio
  }, []);

  useEffect(() => {
    // Check if the device is iOS and not in standalone mode
    const isIos = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      return /iphone|ipad|ipod/.test(userAgent);
    };
    const isInStandaloneMode = () =>
      "standalone" in window.navigator && window.navigator["standalone"];

    if (isIos() && !isInStandaloneMode()) {
      setShowInstallPrompt(true);
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      if (audioRef.current && audioUnlockedRef.current) {
        audioRef.current
          .play()
          .catch((error) => console.error("Error playing audio:", error));
      }
      if (isBreak) {
        if (currentSet < sets) {
          setIsBreak(false);
          setTimeLeft(isDurationMinutes ? duration * 60 : duration);
          setCurrentSet((set) => set + 1);
        } else {
          setIsActive(false);
          setCurrentSet(0);
        }
      } else {
        setIsBreak(true);
        setTimeLeft(isBreakMinutes ? breakTime * 60 : breakTime);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [
    isActive,
    timeLeft,
    isBreak,
    currentSet,
    sets,
    duration,
    breakTime,
    isDurationMinutes,
    isBreakMinutes,
  ]);

  const unlockAudio = () => {
    if (audioRef.current && !audioUnlockedRef.current) {
      audioRef.current
        .play()
        .then(() => {
          // Check if audioRef.current is still not null after the promise resolves
          if (audioRef.current) {
            audioRef.current.pause(); // Pause immediately after playing
            audioRef.current.currentTime = 0; // Reset to the start
            audioUnlockedRef.current = true; // Mark audio as unlocked
          }
        })
        .catch((error) => console.error("Error unlocking audio:", error));
    }
  };

  const toggleTimer = () => {
    unlockAudio(); // Unlock audio on first user interaction

    if (!isActive && currentSet === 0) {
      setTimeLeft(isDurationMinutes ? duration * 60 : duration);
      setCurrentSet(1);
      setShowInputs(false);
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setCurrentSet(0);
    setTimeLeft(0);
    setIsBreak(false);
    setShowInputs(true);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const toggleDurationUnit = () => {
    setIsDurationMinutes(!isDurationMinutes);
    setDuration(
      isDurationMinutes
        ? Math.min(duration * 60, 9999)
        : Math.round(duration / 60)
    );
  };

  const toggleBreakUnit = () => {
    setIsBreakMinutes(!isBreakMinutes);
    setBreakTime(
      isBreakMinutes
        ? Math.min(breakTime * 60, 9999)
        : Math.round(breakTime / 60)
    );
  };

  const loadConfig = (config: TimerConfig) => {
    setSets(config.sets);
    setDuration(config.duration);
    setBreakTime(config.breakTime);
    setIsDurationMinutes(config.isDurationMinutes);
    setIsBreakMinutes(config.isBreakMinutes);
  };

  return (
    <div className="min-h-screen bg-lighthouse-blue flex flex-col items-center justify-between p-4 overflow-hidden">
      <div className="w-full max-w-md">
        <h1 className="text-4xl sm:text-5xl font-display text-white text-center mb-6">
          LIGHTHOUSE
        </h1>
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-8">
          {showInputs && (
            <div className="space-y-6 mb-6">
              <div className="text-center">
                <Label
                  htmlFor="sets"
                  className="mb-2 block text-lighthouse-gold font-display uppercase"
                >
                  SETS
                </Label>
                <NumberInput value={sets} onChange={setSets} min={1} max={99} />
              </div>
              <div className="text-center">
                <Label
                  htmlFor="duration"
                  className="mb-2 block text-lighthouse-gold font-display uppercase"
                >
                  DURATION
                </Label>
                <div className="flex items-center justify-center space-x-2">
                  <NumberInput
                    value={duration}
                    onChange={setDuration}
                    min={1}
                    max={isDurationMinutes ? 166 : 9999}
                  />
                  <Button
                    onClick={toggleDurationUnit}
                    variant="outline"
                    className="w-24 text-base border-lighthouse-gold text-lighthouse-gold hover:bg-lighthouse-gold/10 font-display uppercase"
                  >
                    {isDurationMinutes ? "MIN" : "SEC"}
                  </Button>
                </div>
              </div>
              <div className="text-center">
                <Label
                  htmlFor="break"
                  className="mb-2 block text-lighthouse-gold font-display uppercase"
                >
                  BREAK
                </Label>
                <div className="flex items-center justify-center space-x-2">
                  <NumberInput
                    value={breakTime}
                    onChange={setBreakTime}
                    min={1}
                    max={isBreakMinutes ? 166 : 9999}
                  />
                  <Button
                    onClick={toggleBreakUnit}
                    variant="outline"
                    className="w-24 text-base border-lighthouse-gold text-lighthouse-gold hover:bg-lighthouse-gold/10 font-display uppercase"
                  >
                    {isBreakMinutes ? "MIN" : "SEC"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div
            className={`text-center mb-6 transition-all duration-300 ease-in-out ${
              showInputs ? "mt-4" : "mt-8 scale-125"
            }`}
          >
            <div className="text-7xl sm:text-8xl font-display text-lighthouse-blue mb-2">
              {formatTime(timeLeft)}
            </div>
            <div className="text-2xl sm:text-3xl font-display text-lighthouse-gold uppercase">
              {isBreak ? "BREAK" : `SET ${currentSet}/${sets}`}
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <Button
              onClick={toggleTimer}
              className="w-28 text-lg bg-lighthouse-blue hover:bg-lighthouse-blue/90 text-white font-display uppercase"
            >
              {isActive ? "PAUSE" : "START"}
            </Button>
            <Button
              onClick={resetTimer}
              variant="outline"
              className="w-28 text-lg border-lighthouse-blue text-lighthouse-blue hover:bg-lighthouse-blue/10 font-display uppercase"
            >
              RESET
            </Button>
          </div>

          <div className="mt-4 text-center">
            <Button
              onClick={() => setShowInputs(!showInputs)}
              variant="ghost"
              className="text-lighthouse-gold hover:bg-lighthouse-gold/10"
            >
              {showInputs ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </Button>
          </div>

          <SavedConfigs
            currentConfig={{
              sets,
              duration,
              breakTime,
              isDurationMinutes,
              isBreakMinutes,
            }}
            onLoadConfig={loadConfig}
          />
        </div>
      </div>

      {showInstallPrompt && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-100 p-4 shadow-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              <Share className="w-8 h-8 mr-3 text-blue-500 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold mb-1">
                  Install Lighthouse Timer
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  Install this application on your home screen for quick and
                  easy access when you&apos;re on the go.
                </p>
                <ol className="text-sm text-gray-600 list-decimal list-inside">
                  <li>Tap the share button</li>
                  <li>Scroll down and tap &quot;Add to Home Screen&quot;</li>
                </ol>
              </div>
            </div>
            <Button
              onClick={() => setShowInstallPrompt(false)}
              variant="ghost"
              className="text-gray-500 hover:bg-gray-200 p-1"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
