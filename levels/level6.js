import { Werewolf } from '../werewolf.js';
import { playWerewolfIntroCinematic } from '../cinematics/werewolfCinematics.js';
// =========================
// SECTION: Level 6 Logic (moved from game.js)
// =========================

export function runLevel6(game) {
    // Add player run-in animation immediately
    const playerElement = document.querySelector('.player-character');
    if (playerElement && (game.playerClass === 'mage' || game.playerClass === 'warrior')) {
        // Start with player off screen
        playerElement.style.transition = 'none';
        playerElement.style.transform = 'translateX(-600px)';
        playerElement.style.opacity = '0';
        playerElement.style.visibility = 'hidden';
        
        // Small delay before starting animation
        setTimeout(() => {
            // Start the run animation before movement
            game.playerCharacter.playRunAnimation();
            
            // Play running sound
            const runningSound = game.soundManager.sounds.get('running');
            if (runningSound) {
                runningSound.currentTime = 1;
                runningSound.play().catch(() => {});
            }
            
            requestAnimationFrame(() => {
                playerElement.style.visibility = 'visible';
                playerElement.style.transition = 'transform 2s ease-out, opacity 0.1s ease-out';
                playerElement.style.opacity = '1';
                playerElement.style.transform = 'translateX(0)';
            });
            
            // Stop animation after movement completes
            setTimeout(() => {
                game.playerCharacter.stopRunAnimation();
                if (runningSound) {
                    runningSound.pause();
                    runningSound.currentTime = 0;
                }
                
                // Play the werewolf cinematic after player enters
                playWerewolfIntroCinematic(game);
            }, 2000);
        }, 50);
    }
} 