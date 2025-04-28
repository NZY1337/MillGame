import clickSound from "../assets/sounds/click.wav"
import removeSound from "../assets/sounds/remove.wav";
import millSound from "../assets/sounds/mill.wav";

export class AudioManager {
    private sounds: Record<string, HTMLAudioElement>;
    volume: number;

    constructor() {
        this.sounds = {
            click: new Audio(clickSound),
            remove: new Audio(removeSound),
            mill: new Audio(millSound),
        };
        this.volume = 100;
    }

    play(sound: keyof typeof this.sounds, isMuted: boolean ) {
        if (!isMuted) {
            const audio = this.sounds[sound];
            if (audio) {
                audio.currentTime = 0; // Reset to the start
                audio.volume = this.volume / 100
                audio.play().catch((err) => console.error(`Failed to play ${sound}:`, err));
            }
        }
    }

    setVolume(volume: number) {
        this.volume = Math.min(100, Math.max(0, volume));
    }

    getVolume() {
        return this.volume;
    }
}

export const audioManager = new AudioManager();