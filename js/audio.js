class AudioManager {
  constructor() {
    this.SFX_ON = new URLSearchParams(location.search).get('sfx') !== '0';
    this.AC = null;
    this.master = null;
    this.footGain = null;
    this.rustleGain = null;
    this.ready = false;
    this.init();
  }

  init() {
    if (!this.SFX_ON || this.ready) return;
    
    this.AC = new (window.AudioContext || window.webkitAudioContext)();
    this.master = this.AC.createGain();
    this.master.gain.value = 0.35;
    this.master.connect(this.AC.destination);

    this.footGain = this.AC.createGain();
    this.footGain.gain.value = 0;
    this.footGain.connect(this.master);

    this.rustleGain = this.AC.createGain();
    this.rustleGain.gain.value = 0;
    this.rustleGain.connect(this.master);

    // 풀 스치는 소음 생성
    const noiseBuf = this.AC.createBuffer(1, this.AC.sampleRate * 2, this.AC.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.35;
    }
    
    const noise = this.AC.createBufferSource();
    noise.buffer = noiseBuf;
    noise.loop = true;
    
    const bp = this.AC.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 2200;
    bp.Q.value = 1.3;
    
    noise.connect(bp).connect(this.rustleGain);
    noise.start();
    this.ready = true;
  }

  async unlock() {
    try {
      this.init();
      if (this.AC && this.AC.state === 'suspended') {
        await this.AC.resume();
      }
    } catch (e) {}
  }

  footstep() {
    if (!this.ready) return;
    
    const t = this.AC.currentTime;
    const osc = this.AC.createOscillator();
    osc.type = 'triangle';
    
    const gain = this.AC.createGain();
    gain.gain.value = 0;
    
    osc.frequency.setValueAtTime(120 + Math.random() * 25, t);
    gain.gain.linearRampToValueAtTime(0.35, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.10);
    
    osc.connect(gain).connect(this.footGain);
    osc.start(t);
    osc.stop(t + 0.12);

    // 잎사귀 소리
    this.rustleGain.gain.cancelScheduledValues(t);
    this.rustleGain.gain.linearRampToValueAtTime(0.22, t + 0.01);
    this.rustleGain.gain.exponentialRampToValueAtTime(0.02, t + 0.25);
  }
}

// 오디오 해제 이벤트
const audioManager = new AudioManager();
['pointerdown', 'touchstart', 'keydown'].forEach(ev => {
  addEventListener(ev, () => audioManager.unlock(), { passive: true });
});
