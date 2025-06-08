import { Executioner } from '../executioner.js';

// =========================
// SECTION: Level 1 Logic (moved from game.js)
// ==========================

export function runLevel1(game) {
    // Add the Graveyard Shift quest
    game.questManager.addQuest(
        'graveyard_shift',
        'The Graveyard Shift',
        'Escape the cursed graveyard before it claims you too'
    );

    // Level 1: 1 Executioner
    // Initialize player character and UI (if not already handled by main game)
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
        playerSide.appendChild(playerElement);
        playerSide.appendChild(statsContainer);
        // Run-in animation for all levels
        if (game.playerClass === 'mage' || game.playerClass === 'warrior') {
            playerElement.style.transition = 'none';
            playerElement.style.transform = 'translateX(-600px)';
            playerElement.style.opacity = '0';
            setTimeout(() => {
                playerElement.style.transition = 'transform 2s ease-out, opacity 0.1s ease-out';
                playerElement.style.opacity = '1';
                game.playerCharacter.playRunAnimation();
                // Play running sound
                const runningSound = game.soundManager.sounds.get('running');
                if (runningSound) {
                    runningSound.currentTime = 1;
                    runningSound.play().catch(() => {});
                }
                playerElement.style.transform = 'translateX(0)';
                setTimeout(() => {
                    game.playerCharacter.stopRunAnimation();
                    if (runningSound) {
                        runningSound.pause();
                        runningSound.currentTime = 0;
                    }
                }, 2000);
            }, 50);
        }
    }
    // Add fade-in animation styles if they don't exist
    if (!document.getElementById('enemy-fade-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'enemy-fade-styles';
        styleSheet.textContent = `
            .enemy-character {
                opacity: 0;
                transition: opacity 1s ease-out;
            }
            .enemy-character.fade-in {
                opacity: 1;
            }
        `;
        document.head.appendChild(styleSheet);
    }
    // Initialize enemy characters
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
        const gameScene = document.querySelector('.game-scene');
        if (gameScene) {
            gameScene.appendChild(enemySide);
        } else {
            console.error('Game scene not found!');
            return;
        }
    } else {
        while (enemySide.firstChild) {
            enemySide.removeChild(enemySide.firstChild);
        }
    }

    // Create Executioner
    setTimeout(() => {
        const executioner = new Executioner(1, 100, game);
        const executionerElement = executioner.createEnemyElement();
        executionerElement.style.position = 'absolute';
        executionerElement.style.left = '30%';
        executionerElement.style.bottom = '10%';
        enemySide.appendChild(executionerElement);
        game.enemies.push(executioner);
        requestAnimationFrame(() => {
            executionerElement.classList.add('fade-in');
        });
    }, 1000);
} 