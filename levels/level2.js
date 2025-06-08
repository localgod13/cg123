import { Executioner } from '../executioner.js';

// =========================
// SECTION: Level 2 Logic (moved from game.js)
// =========================

export function runLevel2(game) {
    // Level 2: 2 Executioners
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
        document.body.appendChild(enemySide);
    } else {
        while (enemySide.firstChild) {
            enemySide.removeChild(enemySide.firstChild);
        }
    }
    // Level 2: 2 Executioners
    setTimeout(() => {
        const executioner1 = new Executioner(1, 100, game);
        executioner1.createEnemyElement();
        game.enemies.push(executioner1);
        const executionerElement1 = executioner1.element;
        enemySide.appendChild(executionerElement1);
        requestAnimationFrame(() => {
            executionerElement1.classList.add('fade-in');
        });
    }, 0);
    setTimeout(() => {
        const executioner2 = new Executioner(2, 100, game);
        executioner2.createEnemyElement();
        game.enemies.push(executioner2);
        const executionerElement2 = executioner2.element;
        enemySide.appendChild(executionerElement2);
        requestAnimationFrame(() => {
            executionerElement2.classList.add('fade-in');
        });
    }, 800);
} 