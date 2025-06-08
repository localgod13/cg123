/**
 * SoundManager class for handling all game audio
 * 
 * IMPORTANT NOTE ABOUT AUDIO FADE BEHAVIOR:
 * When transitioning between levels, especially with fade effects:
 * 1. Always use stopMusic(true) for fade out instead of manually manipulating volume
 * 2. Never directly access or modify game.levelMusic - use the sound manager methods instead
 * 3. The sound manager handles proper cleanup and state management
 * 4. If you need to stop music abruptly, use stopMusic(false)
 * 5. For level transitions, ensure the previous level's music is properly stopped before starting new music
 * 
 * Example usage:
 * - To fade out: game.soundManager.stopMusic(true)
 * - To stop immediately: game.soundManager.stopMusic(false)
 * - To play new music: game.soundManager.playMusic(path, volume, loop)
 */

// =========================
// SECTION: SoundManager Class (moved from game.js)
// =========================

export class SoundManager {
    static instance = null;

    constructor() {
        if (SoundManager.instance) {
            return SoundManager.instance;
        }
        SoundManager.instance = this;

        this.sounds = new Map();
        this.currentMusic = null;
        this.musicVolume = 0.5;
        this.sfxVolume = 0.5;
        this.currentIntroSound = null; // Store current intro sound instance
        this.currentNarration = null; // Store current narration sound instance
        
        // Load all sound effects
        const soundEffects = {
            'shieldHit': './assets/Audio/shieldhit.mp3',
            'hurt1': './assets/Audio/hurt1.mp3',
            'hurt2': './assets/Audio/hurt2.mp3',
            'hurt3': './assets/Audio/hurt3.mp3',
            'nextRound1': './assets/Audio/nextround.mp3',
            'nextRound2': './assets/Audio/nextround2.mp3',
            'running': './assets/Audio/running.mp3',
            'skelshield': './assets/Audio/skelshield.mp3',
            'skeledead': './assets/Audio/skeledead.mp3',
            'forestnar': './assets/Audio/forestnar.mp3',
            'forestmusic': './assets/Audio/forestmusic.mp3',
            'warforest': './assets/Audio/warforest.mp3',
            'fire1': './assets/Audio/fire1.mp3',
            'fire2': './assets/Audio/fire2.mp3',
            'explosion': './assets/Audio/explosion.mp3',
            'molten': './assets/Audio/molten.mp3',
            'inferno': './assets/Audio/inferno.mp3',
            'pyo': './assets/Audio/pyo.mp3',
            'heatwave': './assets/Audio/heatwave.mp3',
            'click': './assets/Audio/click.mp3',
            'wolfdead': './assets/Audio/wolfdead.mp3',
            'howl': './assets/Audio/howl.mp3',
            'exdeath': './assets/Audio/exdeath.mp3',
            'forestexit': './assets/Audio/forestexit.mp3',
            'townnar': './assets/Audio/townnar.mp3',
            'closed1': './assets/Audio/closed1.mp3',
            'closed2': './assets/Audio/closed2.mp3',
            'closed3': './assets/Audio/closed3.mp3',
            'goblintown': './assets/Audio/goblintown.mp3',
            'mageintro': './assets/Audio/mageintro.wav',
            'warriorintro': './assets/Audio/warriorintro.mp3',
            'level6nar': './assets/Audio/level6nar.mp3',
            'innmusic': './assets/Audio/inn.mp3',
            'level1': './assets/Audio/level1.mp3',
            'nighttown': './assets/Audio/nighttown.mp3',
            'townday': './assets/Audio/townday.mp3',
            'mountain': './assets/Audio/mountain.mp3',
            'mountainnar': './assets/Audio/mountainnar.mp3',
            'level20': './assets/Audio/level20.mp3',
            'scrollv1': './assets/Audio/scrollv1.mp3',
            'scrollv2': './assets/Audio/scrollv2.mp3',
            'adebt': './assets/Audio/adebt.mp3',
            'tgrace': './assets/Audio/tgrace.mp3',
            'uward': './assets/Audio/uward.mp3',
            'efury': './assets/Audio/efury.mp3',
            'glaugh': './assets/Audio/glaugh.wav',
            'ghit': './assets/Audio/ghit.mp3',
            'goblindeath': './assets/Audio/goblindeath.mp3',
            'gkhurt': './assets/Audio/gkhurt.wav',
            'gkhurt2': './assets/Audio/gkhurt2.wav',
            'gkdeath': './assets/Audio/gkdeath.wav',
            'gkattack': './assets/Audio/gkattack.wav',
            'gkattack2': './assets/Audio/gkattack2.wav',
            'gkentrance': './assets/Audio/gkentrance.mp3',
            'garrickrescue': './assets/Audio/garrickrescue.mp3'
        };

        // Load all sound effects
        for (const [key, path] of Object.entries(soundEffects)) {
            const audio = new Audio(path);
            this.sounds.set(key, audio);
        }
    }

    loadSound(id, path) {
        const audio = new Audio(path);
        audio.preload = 'auto';
        audio.load(); // Force load the audio
        this.sounds.set(id, audio);
        
        // Return a promise that resolves when the sound is loaded
        return new Promise((resolve, reject) => {
            audio.addEventListener('canplaythrough', () => {
                resolve(audio);
            }, { once: true });
            audio.addEventListener('error', (e) => {
                reject(e);
            }, { once: true });
        });
    }

    async playSound(id, volume = 1.0) {
        const sound = this.sounds.get(id);
        if (sound) {
            try {
                // Ensure the sound is loaded before playing
                if (sound.readyState < 3) { // HAVE_FUTURE_DATA
                    await new Promise((resolve, reject) => {
                        sound.addEventListener('canplaythrough', resolve, { once: true });
                        sound.addEventListener('error', reject, { once: true });
                    });
                }
                
                // Create a new instance for each play to allow overlapping sounds
                const soundInstance = sound.cloneNode();
                soundInstance.volume = volume * this.sfxVolume;
                await soundInstance.play();
            } catch (error) {
                console.log('Error playing sound:', error);
            }
        }
    }

    getSound(id) {
        return this.sounds.get(id);
    }

    getSoundVolume(id) {
        const sound = this.sounds.get(id);
        return sound ? sound.volume : 0;
    }

    setSoundVolume(id, volume) {
        const sound = this.sounds.get(id);
        if (sound) {
            sound.volume = volume;
        }
    }

    stopSound(id) {
        const sound = this.sounds.get(id);
        if (sound) {
            sound.pause();
            sound.currentTime = 0;
        }
    }

    playMusic(path, volume = 0.5, fadeIn = true) {
        // First, ensure any existing music is completely stopped
        if (this.currentMusic) {
            this.currentMusic.pause();
            this.currentMusic.currentTime = 0;
            this.currentMusic = null;
        }

        // Create and start new music
        this.currentMusic = new Audio(path);
        this.currentMusic.loop = true;
        this.currentMusic.volume = fadeIn ? 0 : volume * this.musicVolume;

        // Try to play the music
        this.currentMusic.play().catch(error => {
            console.log('Autoplay prevented:', error);
            // Add click event listener to start music
            const startMusic = () => {
                if (this.currentMusic) {
                    this.currentMusic.play().then(() => {
                        document.removeEventListener('click', startMusic);
                    }).catch(() => {
                        console.log('Music still failed to play on click');
                    });
                }
            };
            document.addEventListener('click', startMusic);
        });

        if (fadeIn) {
            const fadeInInterval = setInterval(() => {
                if (this.currentMusic && this.currentMusic.volume < volume * this.musicVolume - 0.05) {
                    this.currentMusic.volume += 0.05;
                } else if (this.currentMusic) {
                    this.currentMusic.volume = volume * this.musicVolume;
                    clearInterval(fadeInInterval);
                }
            }, 100);
        }
    }

    stopMusic(fadeOut = true) {
        if (this.currentMusic) {
            if (fadeOut) {
                const fadeOutInterval = setInterval(() => {
                    if (this.currentMusic && this.currentMusic.volume > 0.05) {
                        this.currentMusic.volume -= 0.05;
                    } else if (this.currentMusic) {
                        this.currentMusic.pause();
                        this.currentMusic.currentTime = 0;
                        this.currentMusic = null;
                        clearInterval(fadeOutInterval);
                    }
                }, 100);
            } else {
                this.currentMusic.pause();
                this.currentMusic.currentTime = 0;
                this.currentMusic = null;
            }
        }
    }

    getMusic() {
        return this.currentMusic;
    }

    setMusicVolume(volume) {
        this.musicVolume = volume;
        if (this.currentMusic) {
            this.currentMusic.volume = volume;
        }
    }

    setSFXVolume(volume) {
        this.sfxVolume = volume;
    }

    pauseMusic() {
        if (this.currentMusic) {
            this.currentMusic.pause();
        }
    }

    resumeMusic() {
        if (this.currentMusic) {
            this.currentMusic.play().catch(error => {
                console.log('Error resuming music:', error);
            });
        }
    }

    playClassIntroSound(className) {
        // Stop any existing intro sound
        if (this.currentIntroSound) {
            this.currentIntroSound.pause();
            this.currentIntroSound.currentTime = 0;
        }

        if (className === 'mage') {
            this.currentIntroSound = this.sounds.get('mageintro').cloneNode();
            this.currentIntroSound.volume = 0.7 * this.sfxVolume;
            this.currentIntroSound.play().catch(error => {
                console.log('Error playing mage intro sound:', error);
            });
        } else if (className === 'warrior') {
            this.currentIntroSound = this.sounds.get('warriorintro').cloneNode();
            this.currentIntroSound.volume = 0.7 * this.sfxVolume;
            this.currentIntroSound.play().catch(error => {
                console.log('Error playing warrior intro sound:', error);
            });
        }
    }

    fadeOutIntroSound() {
        if (this.currentIntroSound) {
            const fadeOutInterval = setInterval(() => {
                if (this.currentIntroSound.volume > 0.05) {
                    this.currentIntroSound.volume -= 0.05;
                } else {
                    this.currentIntroSound.volume = 0;
                    this.currentIntroSound.pause();
                    this.currentIntroSound.currentTime = 0;
                    this.currentIntroSound = null;
                    clearInterval(fadeOutInterval);
                }
            }, 50);
        }
    }

    async playNarration(id, volume = 1.0) {
        // Stop any existing narration
        this.fadeOutNarration();
        
        const sound = this.sounds.get(id);
        if (sound) {
            try {
                // Ensure the sound is loaded before playing
                if (sound.readyState < 3) { // HAVE_FUTURE_DATA
                    await new Promise((resolve, reject) => {
                        sound.addEventListener('canplaythrough', resolve, { once: true });
                        sound.addEventListener('error', reject, { once: true });
                    });
                }
                
                // Create a new instance for narration
                this.currentNarration = sound.cloneNode();
                this.currentNarration.volume = volume * this.sfxVolume;
                await this.currentNarration.play();
            } catch (error) {
                console.log('Error playing narration:', error);
            }
        }
    }

    fadeOutNarration() {
        if (this.currentNarration) {
            const fadeOutInterval = setInterval(() => {
                if (this.currentNarration.volume > 0.01) {
                    this.currentNarration.volume -= 0.01; // Smaller decrement for smoother fade
                } else {
                    this.currentNarration.volume = 0;
                    this.currentNarration.pause();
                    this.currentNarration.currentTime = 0;
                    
                    // Trigger the ended event manually since we're stopping the sound
                    const endedEvent = new Event('ended');
                    this.currentNarration.dispatchEvent(endedEvent);
                    
                    this.currentNarration = null;
                    clearInterval(fadeOutInterval);
                }
            }, 30); // Faster interval for smoother fade
        }
    }

    fadeOutMusic(duration = 3000) {
        if (this.currentMusic) {
            const steps = 30;
            const stepTime = duration / steps;
            const volumeStep = this.currentMusic.volume / steps;
            let currentStep = 0;
            const fadeOutInterval = setInterval(() => {
                if (currentStep < steps && this.currentMusic) {
                    this.currentMusic.volume = Math.max(0, this.currentMusic.volume - volumeStep);
                    currentStep++;
                } else if (this.currentMusic) {
                    this.currentMusic.volume = 0;
                    this.currentMusic.pause();
                    this.currentMusic.currentTime = 0;
                    this.currentMusic = null;
                    clearInterval(fadeOutInterval);
                }
            }, stepTime);
        }
    }
} 