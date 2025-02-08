/* eslint-disable  @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const isIos = () => {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
  );
};

const isInStandaloneMode = () => {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && (navigator as any).standalone)
  );
};

export function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (isIos() && !isInStandaloneMode()) {
      const dismissed = localStorage.getItem("iosInstallPromptDismissed");
      if (!dismissed) {
        setShowPrompt(true);
      }
    }
  }, []);

  const handleClose = () => {
    setShowPrompt(false);
    localStorage.setItem("iosInstallPromptDismissed", "true");
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-lighthouse-gold text-lighthouse-blue p-4 rounded-xl shadow-lg flex items-center justify-between z-50 animate-slide-up">
      <div className="flex-1 mr-4">
        <p className="font-bold">Install Lighthouse Timer</p>
        <p className="text-sm">
          Tap the share icon and select `&quot;`Add to Home Screen`&quot;`.
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClose}
        className="text-lighthouse-blue hover:bg-lighthouse-blue/10"
      >
        <X className="w-5 h-5" />
      </Button>
    </div>
  );
}
