"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, X, BookMarked, ChevronUp } from "lucide-react";

export interface TimerConfig {
  id: string;
  name: string;
  sets: number;
  duration: number;
  breakTime: number;
  isDurationMinutes: boolean;
  isBreakMinutes: boolean;
}

interface SavedConfigsProps {
  currentConfig: Omit<TimerConfig, "id" | "name">;
  onLoadConfig: (config: TimerConfig) => void;
}

export function SavedConfigs({
  currentConfig,
  onLoadConfig,
}: SavedConfigsProps) {
  const [configs, setConfigs] = useState<TimerConfig[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [newConfigName, setNewConfigName] = useState("");
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("timerConfigs");
      setConfigs(saved ? JSON.parse(saved) : []);
    }
  }, [setConfigs]);

  const saveConfig = () => {
    const name = newConfigName.trim() || `TIMER ${configs.length + 1}`;
    if (
      configs.some((config) => config.name.toLowerCase() === name.toLowerCase())
    ) {
      setNameError("Timer name already used");
      return;
    }
    setNameError("");
    const newConfig: TimerConfig = {
      id: Date.now().toString(),
      name,
      ...currentConfig,
    };
    const updatedConfigs = [...configs, newConfig];
    setConfigs(updatedConfigs);
    if (typeof window !== "undefined") {
      localStorage.setItem("timerConfigs", JSON.stringify(updatedConfigs));
      setNewConfigName("");
    }
  };

  const deleteConfig = (id: string) => {
    const updatedConfigs = configs.filter((config) => config.id !== id);
    setConfigs(updatedConfigs);
    if (typeof window !== "undefined") {
      localStorage.setItem("timerConfigs", JSON.stringify(updatedConfigs));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewConfigName(e.target.value);
    setNameError("");
  };

  return (
    <div className="mt-6 flex flex-col items-center">
      <Button
        onClick={() => setShowMenu(!showMenu)}
        variant="ghost"
        className="text-lighthouse-gold hover:bg-lighthouse-gold/10"
      >
        {showMenu ? (
          <ChevronUp className="h-5 w-5" />
        ) : (
          <Save className="h-5 w-5" />
        )}
      </Button>

      {showMenu && (
        <div className="w-full mt-4 space-y-4">
          <div className="space-y-2">
            <Input
              value={newConfigName}
              onChange={handleInputChange}
              placeholder="TIMER NAME"
              className={`font-display text-lighthouse-blue placeholder:text-lighthouse-blue/50 ${
                nameError ? "border-red-500" : ""
              }`}
            />
            {nameError && (
              <p className="text-red-500 text-sm font-display">{nameError}</p>
            )}
            <Button
              onClick={saveConfig}
              className="w-full bg-lighthouse-blue hover:bg-lighthouse-blue/90 text-white font-display"
            >
              SAVE
            </Button>
          </div>

          {configs.length > 0 && (
            <div className="space-y-2">
              {configs.map((config) => (
                <div
                  key={config.id}
                  className="flex items-center justify-between p-3 border border-lighthouse-gold/20 rounded"
                >
                  <span className="font-display text-lighthouse-blue uppercase">
                    {config.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => onLoadConfig(config)}
                      variant="ghost"
                      className="text-lighthouse-gold hover:bg-lighthouse-gold/10"
                    >
                      <BookMarked className="h-5 w-5" />
                    </Button>
                    <Button
                      onClick={() => deleteConfig(config.id)}
                      variant="ghost"
                      className="text-red-500 hover:bg-red-500/10"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
