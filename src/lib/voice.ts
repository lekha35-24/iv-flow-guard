// Lightweight voice alerts via the browser's built-in SpeechSynthesis API.
// No external API keys required.

let lastSpoken = 0;

export function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  // Throttle to once every 4s to avoid spam
  const now = Date.now();
  if (now - lastSpoken < 4000) return;
  lastSpoken = now;

  try {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1;
    utter.pitch = 1;
    utter.volume = 1;
    window.speechSynthesis.speak(utter);
  } catch {
    // ignore
  }
}
