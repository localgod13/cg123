// Level 19: Leaving Town scene (no enemies)
export function runLevel19(game) {
    // Validate game state
    if (!game) {
        console.error('[Level 19] Game instance is not initialized');
        return;
    }

    if (!game.playerCharacter) {
        console.error('[Level 19] Player character is not initialized');
        return;
    }

    if (!game.soundManager) {
        console.error('[Level 19] Sound manager is not initialized');
        return;
    }

    if (!game.playerClass) {
        console.error('[Level 19] Player class is not set');
        return;
    }

    // Remove any existing Back to Town button
    const existingBackBtn = document.querySelector('button[textContent="Back to Town"]');
    if (existingBackBtn) existingBackBtn.remove();

    // Get or create player element using the game's playerCharacter instance
    let playerElement = document.querySelector('.player-character');
    if (!playerElement && game.playerCharacter) {
        try {
            playerElement = game.playerCharacter.createPlayerElement();
            if (!playerElement) {
                throw new Error('Failed to create player element');
            }
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
            const playerSide = document.querySelector('.player-side');
            if (playerSide) {
                playerSide.appendChild(playerElement);
                playerSide.appendChild(statsContainer);
            } else {
                const newPlayerSide = document.createElement('div');
                newPlayerSide.className = 'player-side';
                newPlayerSide.appendChild(playerElement);
                newPlayerSide.appendChild(statsContainer);
                document.body.appendChild(newPlayerSide);
            }
        } catch (error) {
            console.error('[Level 19] Error setting up player:', error);
            return;
        }
    }

    // Set background to leavingtown.png
    const playfield = document.querySelector('.playfield');
    if (!playfield) {
        console.error('[Level 19] Playfield element not found');
        return;
    }

    try {
        playfield.style.backgroundImage = "url('./assets/Images/leavingtown.png')";
        playfield.style.backgroundSize = 'cover';
        playfield.style.backgroundPosition = 'center';
        playfield.style.backgroundRepeat = 'no-repeat';
    } catch (error) {
        console.error('[Level 19] Error setting background:', error);
        return;
    }

    // Reset player position and state
    if (playerElement) {
        try {
            // Force reset player position and state
            playerElement.style.transition = 'none';
            playerElement.style.transform = 'translateX(-600px)';
            playerElement.style.opacity = '0';
            playerElement.style.visibility = 'hidden';
            
            // Small delay to ensure reset is applied
            setTimeout(() => {
                try {
                    // Start the run animation
                    if (game.playerCharacter) {
                        game.playerCharacter.playRunAnimation();
                    }
                    
                    // Play running sound
                    const runningSound = game.soundManager.sounds.get('running');
                    if (runningSound) {
                        runningSound.currentTime = 1;
                        runningSound.play().catch(error => {
                            console.warn('[Level 19] Error playing running sound:', error);
                        });
                    }
                    
                    requestAnimationFrame(() => {
                        playerElement.style.visibility = 'visible';
                        playerElement.style.transition = 'transform 2s ease-out, opacity 0.1s ease-out';
                        playerElement.style.opacity = '1';
                        playerElement.style.transform = 'translateX(0)';
                    });
                    
                    // Stop animation after movement completes
                    setTimeout(() => {
                        if (game.playerCharacter) {
                            game.playerCharacter.stopRunAnimation();
                        }
                        if (runningSound) {
                            runningSound.pause();
                            runningSound.currentTime = 0;
                        }
                    }, 2000);
                } catch (error) {
                    console.error('[Level 19] Error during player animation:', error);
                }
            }, 50);
        } catch (error) {
            console.error('[Level 19] Error resetting player state:', error);
        }
    }

    // Remove enemy side
    const enemySide = document.querySelector('.enemy-side');
    if (enemySide) enemySide.innerHTML = '';
    
    // Remove any existing door boxes and interactable rectangles
    document.querySelectorAll('.inn-door-box').forEach(el => el.remove());
    document.querySelectorAll('.interactable-rect').forEach(el => el.remove());
    document.querySelectorAll('.innkeeper-dialogue-box').forEach(el => el.remove());
    
    console.log('[Level 19] Creating Back to Town button...');
    
    // Create a simple button
    const backButton = document.createElement('button');
    backButton.textContent = 'Back to Town';
    backButton.style.position = 'absolute';
    backButton.style.left = '50px';
    backButton.style.top = '50px';
    backButton.style.padding = '10px 20px';
    backButton.style.backgroundColor = '#39ff14';
    backButton.style.color = 'black';
    backButton.style.border = 'none';
    backButton.style.borderRadius = '5px';
    backButton.style.cursor = 'pointer';
    backButton.style.zIndex = '9999';
    
    backButton.onclick = () => {
        console.log('[Level 19] Back to Town button clicked');
        try {
            // Remove the button before transitioning
            backButton.remove();
            game.previousLevel = 19;
            game.currentLevel = 15;
            game.startNextLevel();
        } catch (error) {
            console.error('[Level 19] Error during level transition:', error);
        }
    };
    
    // Try multiple ways to add the button
    try {
        console.log('[Level 19] Attempting to add button to playfield...');
        if (playfield) {
            playfield.appendChild(backButton);
            console.log('[Level 19] Button added to playfield');
        } else {
            console.log('[Level 19] Playfield not found, trying document.body...');
            document.body.appendChild(backButton);
            console.log('[Level 19] Button added to document.body');
        }
    } catch (error) {
        console.error('[Level 19] Error adding button:', error);
    }
    
    console.log('[Level 19] Background set to leavingtown.png, currentLevel:', game.currentLevel);
} 