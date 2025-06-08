// =========================
// SECTION: Level 9 Logic (moved from game.js)
// =========================

export function runLevel9(game) {
    // Level 9: Town hub, no enemies, just player intro
    // Create player element first but keep it hidden
    const playerSide = document.querySelector('.player-side');
    if (playerSide) {
        playerSide.innerHTML = '';
        // Create player element with the already initialized playerCharacter
        const playerElement = game.playerCharacter.createPlayerElement();
        playerElement.setAttribute('data-class', game.playerClass);
        playerElement.style.opacity = '0';  // Start hidden
        playerElement.style.transform = 'translateX(-600px)';  // Start off-screen
        playerElement.style.visibility = 'hidden';  // Ensure it's completely hidden
        playerElement.style.transition = 'none';  // No transition initially
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
    }
    // Create enemy-side element if it doesn't exist
    let enemySide = document.querySelector('.enemy-side');
    if (!enemySide) {
        enemySide = document.createElement('div');
        enemySide.className = 'enemy-side';
        enemySide.style.position = 'absolute';
        enemySide.style.left = '0';
        enemySide.style.top = '0';
        enemySide.style.width = '100%';
        enemySide.style.height = '100%';
        enemySide.style.pointerEvents = 'none';
        enemySide.style.zIndex = '1000';
        // Add to game scene instead of document body
        const gameScene = document.querySelector('.game-scene');
        if (gameScene) {
            gameScene.appendChild(enemySide);
        } else {
            return;
        }
    }
    // Player run-in animation
    setTimeout(() => {
        const playerElement = document.querySelector('.player-character');
        if (playerElement) {
            playerElement.style.visibility = 'hidden';
            playerElement.style.opacity = '0';
            playerElement.style.transform = 'translateX(-600px)';
            playerElement.style.transition = 'none';
            game.playerCharacter.playRunAnimation();
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
            setTimeout(() => {
                game.playerCharacter.stopRunAnimation();
                if (runningSound) {
                    runningSound.pause();
                    runningSound.currentTime = 0;
                }
            }, 2000);
        }
    }, 400);

    // Only create interactable rectangles if we're coming from level 10
    // or if the town narration has finished playing
    if (game.previousLevel === 10) {
        game.createInteractableRectangle();
    } else {
        // Wait for town narration to finish before creating interactable rectangles
        const townNarration = game.soundManager.sounds.get('townnar');
        if (townNarration) {
            const checkNarration = () => {
                if (townNarration.ended || townNarration.paused) {
                    game.createInteractableRectangle();
                } else {
                    setTimeout(checkNarration, 100);
                }
            };
            checkNarration();
        } else {
            // If narration isn't available, create rectangles immediately
            game.createInteractableRectangle();
        }
    }
} 