// src/components/SoundToggle.jsx
import { useEffect, useState } from "react";
import "./styles/SoundToggle.css";
import { audioManager } from "../utils/audioManager";

export default function SoundToggle({ className = "" }) {
  const [muted, setMuted] = useState(audioManager.isMuted());

  useEffect(() => {
    // touching the toggle also "unlocks" audio on mobile
    const handleFirst = () => {};
    window.addEventListener("pointerdown", handleFirst, { once: true });
    return () => window.removeEventListener("pointerdown", handleFirst);
  }, []);

  const onClick = () => {
    audioManager.setMuted(!muted);
    setMuted(!muted);
  };

  return (
    <button className={`sound-toggle ${className}`} type="button" onClick={onClick} aria-pressed={muted ? "true" : "false"}>
      {muted ? "🔇" : "🔊"}
    </button>
  );
}
