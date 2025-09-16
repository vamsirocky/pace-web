import { useEffect, useRef, useState } from "react";
import "./styles/AssistantFab.css";
import emojiFace from "../assets/assistant-emoji.png"; //  image in src/assets


export default function AssistantFab({
  name,
  announceText,             
  size = 72,
  imageFit = "contain",
  offsetY = -2,
  welcomeDurationMs = 2400,
  announceDurationMs = 2800 
}) {
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleText, setBubbleText] = useState("");
  const timerRef = useRef(null);

  // helper to show any message for N ms
  const showFor = (text, ms) => {
    if (timerRef.current) { clearTimeout(timerRef.current); }
    setBubbleText(text);
    setShowBubble(true);
    timerRef.current = setTimeout(() => setShowBubble(false), ms);
  };

  // 1) greet on mount (every visit to this page)
  useEffect(() => {
    const who = name ? `Welcome, ${name}! 👋` : "Welcome! 👋";
    // tiny delay so it feels like it "arrived"
    const t = setTimeout(() => showFor(who, welcomeDurationMs), 450);
    return () => { clearTimeout(t); if (timerRef.current) clearTimeout(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) announce new recommendation whenever the prop changes
  useEffect(() => {
    if (!announceText) return;
    // small stagger so it doesn't overlap the welcome
    const t = setTimeout(() => showFor(announceText, announceDurationMs), 300);
    return () => clearTimeout(t);
  }, [announceText]);

  const styleVars = { "--fab-size": `${size}px`, "--img-offset-y": `${offsetY}px` };

  return (
    <div className="assistant-fab" style={styleVars} aria-hidden>
      {showBubble && (
        <div className="assistant-bubble" role="status" aria-live="polite">
          <div className="assistant-bubble-inner">{bubbleText}</div>
          <div className="assistant-bubble-tail" />
        </div>
      )}

      {/* NOT a button anymore; just a decorative container */}
      <div className="assistant-button passive">
        <img
          src={emojiFace}
          alt=""
          className="assistant-face"
          style={{ objectFit: imageFit, transform: `translateY(var(--img-offset-y))` }}
        />
      </div>
    </div>
  );
}
