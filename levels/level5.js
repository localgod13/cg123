// =========================
// SECTION: Level 5 Logic (moved from game.js)
// =========================

export function runLevel5(game) {
    // No enemies for level 5, just remove the continue button
    game.removeContinueButton();

    // Add the Lurking Silence quest
    game.questManager.addQuest('lurking_silence', 'Lurking Silence', 'Something hunts in the dark. Make it to town before you\'re caught.');

    // Initialize player character and UI
    const playerSide = document.querySelector('.player-side');
    if (playerSide) {
        playerSide.innerHTML = '';
        // Create player element with the already initialized playerCharacter
        const playerElement = game.playerCharacter.createPlayerElement();
        playerElement.setAttribute('data-class', game.playerClass);
        
        // Add shield aura
        const shieldAura = document.createElement('div');
        shieldAura.className = 'shield-aura';
        playerElement.appendChild(shieldAura);
        
        // Create stats container
        const statsContainer = document.createElement('div');
        statsContainer.className = 'character-stats';
        statsContainer.style.position = 'absolute';
        statsContainer.style.left = '0';
        statsContainer.style.bottom = '0';
        statsContainer.innerHTML = `
            <div class="health-bar">
                <div class="health-bar-fill" style="width: 100%"></div>
            </div>
            <div class="defense-bar">
                <div class="defense-bar-fill" style="width: 0%"></div>
                <div class="defense-text">Defense: 0</div>
            </div>
            <div class="resource-bar">
                <div class="resource-bar-fill" style="width: ${(game.playerResource / game.maxResource) * 100}%"></div>
            </div>
            <div class="resource-label">${game.playerClass === 'mage' ? 'Mana' : 'Rage'}: ${game.playerResource}</div>
        `;
        
        // Add elements to player side
        playerSide.appendChild(playerElement);
        playerSide.appendChild(statsContainer);

        // Add player run-in animation
        if (game.playerClass === 'mage' || game.playerClass === 'warrior') {
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
                    
                    // Function to show continue button
                    const showContinueButton = () => {
                        const continueBtn = document.createElement('button');
                        continueBtn.textContent = 'Continue';
                        continueBtn.className = 'continue-btn';
                        continueBtn.style.position = 'absolute';
                        continueBtn.style.right = '20%';
                        continueBtn.style.top = '50%';
                        continueBtn.style.transform = 'translateY(-50%)';
                        continueBtn.style.padding = '10px 20px';
                        continueBtn.style.fontSize = '1.2em';
                        continueBtn.style.background = 'linear-gradient(135deg, #1a2a1a 60%, #2e4d2e 100%)';
                        continueBtn.style.color = '#b6ffb6';
                        continueBtn.style.border = '2px solid #39ff14';
                        continueBtn.style.borderRadius = '8px';
                        continueBtn.style.cursor = 'pointer';
                        continueBtn.style.zIndex = '1000';
                        continueBtn.style.boxShadow = '0 0 16px 4px #39ff1466, 0 4px 16px rgba(0,0,0,0.7)';
                        continueBtn.style.fontFamily = '"Cinzel", "Times New Roman", serif';
                        continueBtn.style.letterSpacing = '1px';
                        continueBtn.style.textShadow = '0 0 8px #39ff14, 0 2px 2px #000';
                        continueBtn.style.transition = 'box-shadow 0.2s, background 0.2s, color 0.2s';
                        
                        continueBtn.addEventListener('mouseenter', () => {
                            continueBtn.style.boxShadow = '0 0 24px 8px #39ff14cc, 0 4px 24px rgba(0,0,0,0.8)';
                            continueBtn.style.background = 'linear-gradient(135deg, #223322 60%, #3e6d3e 100%)';
                            continueBtn.style.color = '#eaffea';
                        });
                        
                        continueBtn.addEventListener('mouseleave', () => {
                            continueBtn.style.boxShadow = '0 0 16px 4px #39ff1466, 0 4px 16px rgba(0,0,0,0.7)';
                            continueBtn.style.background = 'linear-gradient(135deg, #1a2a1a 60%, #2e4d2e 100%)';
                            continueBtn.style.color = '#b6ffb6';
                        });
                        
                        continueBtn.addEventListener('click', () => {
                            continueBtn.remove();
                            game.completeLevel5();
                        });
                        
                        document.querySelector('.playfield').appendChild(continueBtn);
                    };

                    // Get the current narration sound
                    const narrationSound = game.soundManager.currentNarration;
                    if (narrationSound) {
                        // Add ended event listener to show button when narration ends
                        narrationSound.addEventListener('ended', showContinueButton, { once: true });
                    } else {
                        // If no narration, show button immediately
                        showContinueButton();
                    }
                }, 2000);
            }, 50);
        }
    }
} 