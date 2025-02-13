"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/NumberInput";
import { SavedConfigs, TimerConfig } from "@/components/SavedConfigs";
import { ChevronDown, ChevronUp, Share, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const ALARM_SOUND_URL =
  "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";
const BEEP_SOUND_URL =
  "https://assets.mixkit.co/active_storage/sfx/1082/1082-preview.mp3";

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
  const [enableTenSecondBeep, setEnableTenSecondBeep] = useState(true);
  const [enableCountdownBeep, setEnableCountdownBeep] = useState(true);

  const audioContextRef = useRef<AudioContext | null>(null);
  const alarmBufferRef = useRef<AudioBuffer | null>(null);
  const beepBufferRef = useRef<AudioBuffer | null>(null);
  const scheduledSoundsRef = useRef<number[]>([]);

  useEffect(() => {
    // Create and store the AudioContext (including legacy support for iOS)
    audioContextRef.current = new (window.AudioContext ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).webkitAudioContext)();

    const loadSound = async (
      url: string,
      bufferRef: React.MutableRefObject<AudioBuffer | null>
    ) => {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContextRef.current!.decodeAudioData(
        arrayBuffer
      );
      bufferRef.current = audioBuffer;
    };

    loadSound(ALARM_SOUND_URL, alarmBufferRef);
    loadSound(BEEP_SOUND_URL, beepBufferRef);

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
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

  const playSound = useCallback((buffer: AudioBuffer, time: number) => {
    if (audioContextRef.current) {
      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current.destination);
      source.start(time);
      return source;
    }
    return null;
  }, []);

  const scheduleSound = useCallback(
    (buffer: AudioBuffer, delay: number) => {
      if (audioContextRef.current) {
        const playTime = audioContextRef.current.currentTime + delay;
        const source = playSound(buffer, playTime);
        if (source) {
          // Instead of using a non-existent property, store the scheduled play time
          scheduledSoundsRef.current.push(playTime);
        }
      }
    },
    [playSound]
  );

  const clearScheduledSounds = useCallback(() => {
    const audioContext = audioContextRef.current;
    if (!audioContext) return;

    scheduledSoundsRef.current.forEach((time) => {
      if (time > audioContext.currentTime) {
        const source = audioContext.createBufferSource();
        // Use one of the loaded buffers (beep or alarm) arbitrarily to create a dummy source
        source.buffer = beepBufferRef.current || alarmBufferRef.current!;
        source.connect(audioContext.destination);
        source.start(time);
        source.stop(time);
      }
    });
    scheduledSoundsRef.current = [];
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          const newTime = time - 1;

          if (
            audioContextRef.current &&
            beepBufferRef.current &&
            alarmBufferRef.current
          ) {
            // Schedule sounds slightly ahead of time
            const scheduleAheadTime = 0.1; // 100ms ahead

            // 10-second warning
            if (newTime === 10 && enableTenSecondBeep) {
              scheduleSound(beepBufferRef.current, scheduleAheadTime);
            }
            // 3-second countdown
            else if (
              (newTime === 3 || newTime === 2 || newTime === 1) &&
              enableCountdownBeep
            ) {
              scheduleSound(beepBufferRef.current, scheduleAheadTime);
            }
            // Alarm at the end
            else if (newTime === 0) {
              scheduleSound(alarmBufferRef.current, scheduleAheadTime);
            }
          }

          return newTime;
        });
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      clearScheduledSounds();
      if (isBreak) {
        if (currentSet < sets) {
          setIsBreak(false);
          const newDuration = isDurationMinutes ? duration * 60 : duration;
          setTimeLeft(newDuration);
          setCurrentSet((set) => set + 1);
        } else {
          setIsActive(false);
          setCurrentSet(0);
        }
      } else {
        setIsBreak(true);
        const newBreakTime = isBreakMinutes ? breakTime * 60 : breakTime;
        setTimeLeft(newBreakTime);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
      clearScheduledSounds();
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
    enableTenSecondBeep,
    enableCountdownBeep,
    scheduleSound,
    clearScheduledSounds,
  ]);

  // Mark toggleTimer as async so we can unlock the AudioContext first.
  const toggleTimer = async () => {
    // Ensure the AudioContext is unlocked on iOS Safari via a user gesture.
    if (
      audioContextRef.current &&
      audioContextRef.current.state === "suspended"
    ) {
      try {
        await audioContextRef.current.resume();
      } catch (error) {
        console.error("Error resuming AudioContext:", error);
      }
    }

    if (!isActive && currentSet === 0) {
      const newDuration = isDurationMinutes ? duration * 60 : duration;
      setTimeLeft(newDuration);
      setCurrentSet(1);
      setShowInputs(false);
    }
    setIsActive((prev) => !prev);
  };

  const resetTimer = () => {
    setIsActive(false);
    setCurrentSet(0);
    setTimeLeft(0);
    setIsBreak(false);
    setShowInputs(true);
    clearScheduledSounds();
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
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-2">
                  <Checkbox
                    id="tenSecondBeep"
                    checked={enableTenSecondBeep}
                    onCheckedChange={(checked) =>
                      setEnableTenSecondBeep(checked as boolean)
                    }
                    className="data-[state=checked]:bg-lighthouse-gold"
                  />
                  <Label
                    htmlFor="tenSecondBeep"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-lighthouse-gold font-display uppercase"
                  >
                    Play 10s warning
                  </Label>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Checkbox
                    id="countdownBeep"
                    checked={enableCountdownBeep}
                    onCheckedChange={(checked) =>
                      setEnableCountdownBeep(checked as boolean)
                    }
                    className="data-[state=checked]:bg-lighthouse-gold"
                  />
                  <Label
                    htmlFor="countdownBeep"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-lighthouse-gold font-display uppercase"
                  >
                    Play 3s countdown
                  </Label>
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
