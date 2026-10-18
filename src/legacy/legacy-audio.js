// Legacy chunk "audio" (recovered, mechanically split). Do not hand-edit; swap via shims/audio.js.

class ng {
  context;
  timer;
  note = 0;
  enabled = true;
  unlock() {
    this.context ??= new AudioContext();
    this.context.resume();
  }
  tone(e, t = 0.15, n = 0, r = 0.06) {
    if (!this.enabled || !this.context) {
      return;
    }
    const s = this.context.currentTime + n;
    const a = this.context.createOscillator();
    const o = this.context.createGain();
    a.type = 'sine';
    a.frequency.value = e;
    o.gain.setValueAtTime(0, s);
    o.gain.linearRampToValueAtTime(r, s + 0.02);
    o.gain.exponentialRampToValueAtTime(0.001, s + t);
    a.connect(o);
    o.connect(this.context.destination);
    a.start(s);
    a.stop(s + t + 0.02);
  }
  correct() {
    [523.25, 659.25, 783.99].forEach((e, t) => this.tone(e, 0.3, t * 0.1));
  }
  hint() {
    this.tone(392, 0.18);
    this.tone(440, 0.18, 0.14);
  }
  jump() {
    this.tone(480, 0.1);
  }
  celebrate() {
    [523, 659, 784, 1047].forEach((e, t) => this.tone(e, 0.45, t * 0.13));
  }
  music(e) {
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.timer = undefined;
    if (e) {
      this.timer = window.setInterval(() => {
        const t = [262, 330, 392, 330, 294, 349, 440, 349];
        this.tone(t[this.note++ % t.length], 0.65, 0, 0.018);
      }, 850);
    }
  }
}

export { ng };
