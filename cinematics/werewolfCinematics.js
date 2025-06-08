// =========================
// Werewolf Cinematics Module
// =========================
import { Werewolf } from '../werewolf.js';

// Level 6: Werewolf intro cinematic (narrator, howl, entrance)
export async function playWerewolfIntroCinematic(game, onComplete) {
    const narratorBox = document.createElement('div');
    narratorBox.className = 'narrator-box';
    narratorBox.style.position = 'fixed';
    narratorBox.style.top = '40px';
    narratorBox.style.left = '50%';
    narratorBox.style.transform = 'translateX(-50%, 0)';
    narratorBox.style.background = 'rgba(0,0,0,0.85)';
    narratorBox.style.color = '#fff';
    narratorBox.style.padding = '32px 48px 20px 48px';
    narratorBox.style.borderRadius = '16px';
    narratorBox.style.fontSize = '1.5em';
    narratorBox.style.fontFamily = 'Cinzel, Times New Roman, serif';
    narratorBox.style.textAlign = 'center';
    narratorBox.style.zIndex = '2000';
    narratorBox.style.boxShadow = '0 0 32px 8px #000a';
    narratorBox.style.cursor = 'pointer';
    // Find the playfield and position narratorBox at the top center of it
    const playfield = document.querySelector('.playfield');
    if (playfield) {
        playfield.style.position = 'relative';
        narratorBox.style.position = 'absolute';
        narratorBox.style.top = '24px';
        narratorBox.style.left = '50%';
        narratorBox.style.transform = 'translateX(-50%)';
        narratorBox.style.zIndex = '2000';
        playfield.appendChild(narratorBox);
    } else {
        narratorBox.style.position = 'fixed';
        narratorBox.style.top = '40px';
        narratorBox.style.left = '50%';
        narratorBox.style.transform = 'translateX(-50%, 0)';
        narratorBox.style.zIndex = '2000';
        document.body.appendChild(narratorBox);
    }

    // Ensure the narration sound is loaded before playing
    const narrationSound = game.soundManager.sounds.get('level6nar');
    if (narrationSound) {
        try {
            // Wait for the sound to be loaded
            if (narrationSound.readyState < 3) {
                await new Promise((resolve, reject) => {
                    narrationSound.addEventListener('canplaythrough', resolve, { once: true });
                    narrationSound.addEventListener('error', reject, { once: true });
                });
            }
            // Play narration using SoundManager
            await game.soundManager.playNarration('level6nar', 0.75);
        } catch (error) {
            console.log('Error playing level 6 narration:', error);
        }
    }

    const mainMessage = 'You sense a presence lurking in the darkness beyond the trees… silent, unseen, but unmistakably there.';
    const promptHTML = `<br><span style="display:block; margin-top:16px; font-size:0.8em; color:#ccc; font-family:Arial,sans-serif;">Click this box to continue…</span>`;
    narratorBox.innerHTML = '<span class="narrator-typewriter"></span>' + promptHTML;
    const typewriterSpan = narratorBox.querySelector('.narrator-typewriter');
    let i = 0;
    let typewriterStarted = false;
    function startTypewriter(interval) {
        typewriterStarted = true;
        function typeWriter() {
            if (i <= mainMessage.length) {
                typewriterSpan.textContent = mainMessage.slice(0, i);
                let delay = 55;
                const prevChar = mainMessage[i - 1];
                if (prevChar === '.' || prevChar === '!' || prevChar === '?') {
                    delay = 400;
                }
                i++;
                setTimeout(typeWriter, delay);
            }
        }
        typeWriter();
    }
    // Start typewriter with fixed interval
    startTypewriter(60);
    narratorBox.addEventListener('click', () => {
        // Fade out narration when clicking
        game.soundManager.fadeOutNarration();
        narratorBox.remove();
        const howl = new Audio('./assets/Audio/howl.mp3');
        howl.volume = 1;
        howl.play().then(() => {
            setTimeout(() => {
                const enemySide = document.querySelector('.enemy-side');
                if (!enemySide) return;
                const werewolf = new Werewolf(1, 120, true);
                game.enemies.unshift(werewolf);
                const werewolfElement = werewolf.createEnemyElement();
                if (enemySide.firstChild) {
                    enemySide.insertBefore(werewolfElement, enemySide.firstChild);
                } else {
                    enemySide.appendChild(werewolfElement);
                }
                requestAnimationFrame(() => {
                    werewolf.playEntranceAnimation();
                    if (typeof onComplete === 'function') onComplete();
                });
            }, 1000);
        }).catch(() => {
            if (typeof onComplete === 'function') onComplete();
        });
    });
}

// Level 7: Werewolf pack cinematic (run across, then spawn 3 werewolves)
export function playWerewolfPackCinematic(game, onComplete) {
    // Hide player at start
    const playerElement = document.querySelector('.player-character');
    if (playerElement) {
        playerElement.style.visibility = 'hidden';
        playerElement.style.opacity = '0';
        playerElement.style.transform = 'translateX(-600px)';
        playerElement.style.transition = 'none';
    }

    // Cinematic: werewolf runs across the screen
    const enemySide = document.querySelector('.enemy-side');
    const werewolf = new Werewolf(1, 120);
    const werewolfElement = werewolf.createEnemyElement();
    werewolfElement.style.position = 'absolute';
    werewolfElement.style.transition = 'transform 4s linear';
    werewolfElement.style.zIndex = '1001';
    werewolfElement.style.top = '50%';
    werewolfElement.style.left = '0';
    werewolfElement.style.transform = 'translate(-600px, -50%)';
    werewolfElement.style.opacity = '1';
    const spriteContainer = werewolfElement.querySelector('.enemy-sprite');
    if (spriteContainer) {
        spriteContainer.style.transform = 'scaleX(1)';
        spriteContainer.style.transformOrigin = 'center center';
        spriteContainer.style.width = '280px';
        spriteContainer.style.height = '300px';
        spriteContainer.style.overflow = 'hidden';
        spriteContainer.style.backgroundSize = '280px 300px';
    }
    if (enemySide) enemySide.appendChild(werewolfElement);
    setTimeout(() => {
        werewolf.playRunAnimation();
        werewolfElement.style.transform = 'translate(1200px, -50%)';
        // Make player run in when werewolf is halfway
        setTimeout(() => {
            const playerElement = document.querySelector('.player-character');
            if (playerElement) {
                playerElement.style.visibility = 'visible';
                playerElement.style.transition = 'transform 2s ease-out, opacity 0.1s ease-out';
                playerElement.style.opacity = '1';
                game.playerCharacter.playRunAnimation();
                // Play running sound
                const runningSound = game.soundManager.sounds.get('running');
                if (runningSound) {
                    runningSound.currentTime = 1;
                    runningSound.play().catch(() => {});
                }
                requestAnimationFrame(() => {
                    playerElement.style.transform = 'translateX(0)';
                });
                setTimeout(() => {
                    game.playerCharacter.stopRunAnimation();
                    if (runningSound) {
                        runningSound.pause();
                        runningSound.currentTime = 0;
                    }
                }, 2000);
            }
        }, 2000); // Halfway point of the werewolf's run
        setTimeout(() => {
            // Stop run animation (clear interval)
            if (werewolf.animationInterval) {
                clearInterval(werewolf.animationInterval);
                werewolf.animationInterval = null;
            }
            werewolfElement.remove();
            // After cinematic, spawn 3 werewolves as enemies
            if (enemySide) {
                const finalLefts = ["20%", "50%", "80%"]; // Final positions for 3 werewolves
                for (let i = 0; i < 3; i++) {
                    setTimeout(() => {
                        const packWerewolf = new Werewolf(i + 1, 120);
                        game.enemies.push(packWerewolf);
                        const packElement = packWerewolf.createEnemyElement();
                        packElement.style.position = 'absolute';
                        packElement.style.left = '120%'; // Start offscreen right
                        packElement.style.top = '20%';
                        packElement.style.zIndex = '1000';
                        packElement.style.pointerEvents = 'auto';
                        packElement.style.transition = 'left 0.8s cubic-bezier(0.22, 1, 0.36, 1)';
                        const sprite = packElement.querySelector('.enemy-sprite');
                        if (sprite) {
                            sprite.style.position = 'absolute';
                            sprite.style.transform = 'scaleX(-1)';
                            sprite.style.transformOrigin = 'center center';
                            sprite.style.width = '280px';
                            sprite.style.height = '300px';
                            sprite.style.overflow = 'hidden';
                            sprite.style.backgroundSize = '280px 300px';
                            sprite.style.left = '0'; // No offset, let parent move
                            sprite.style.top = '0px';
                        }
                        enemySide.appendChild(packElement);
                        // Animate into place on next frame
                        requestAnimationFrame(() => {
                            packElement.style.left = finalLefts[i];
                            packWerewolf.playEntranceAnimation();
                        });
                    }, i * 800);
                }
            }
            if (typeof onComplete === 'function') onComplete();
        }, 4000);
    }, 1000);
} 