let context;
export function sound(type, enabled) {
  if (!enabled) return;
  try {
    context ??= new (window.AudioContext || window.webkitAudioContext)();
    if (context.state === "suspended") context.resume();
    const notes = {
      tap: [420],
      star: [880, 1175],
      spring: [250, 520],
      portal: [440, 660, 880],
      win: [523, 659, 784, 1047],
      lose: [220, 165],
    }[type] || [420];
    notes.forEach((f, i) => {
      const o = context.createOscillator(),
        g = context.createGain(),
        start = context.currentTime + i * 0.095;
      o.type = type === "spring" ? "sine" : "triangle";
      o.frequency.setValueAtTime(f, start);
      g.gain.setValueAtTime(0, start);
      g.gain.linearRampToValueAtTime(0.055, start + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, start + 0.25);
      o.connect(g);
      g.connect(context.destination);
      o.start(start);
      o.stop(start + 0.26);
    });
  } catch {}
}
