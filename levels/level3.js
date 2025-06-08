import { Executioner } from '../executioner.js';
import { Skeleton } from '../skeleton.js';
// =========================
// SECTION: Level 3 Logic (moved from game.js)
// =========================

export function runLevel3(game) {
    // Initialize player character and UI
    const playerSide = document.querySelector('.player-side');
    if (playerSide) {
        playerSide.innerHTML = '';
        const playerElement = game.playerCharacter.createPlayerElement();
        playerElement.setAttribute('data-class', game.playerClass);
        const shieldAura = document.createElement('div');
        shieldAura.className = 'shield-aura';
        playerElement.appendChild(shieldAura);
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
        if (game.playerClass === 'mage' || game.playerClass === 'warrior') {
            playerElement.style.transition = 'none';
            playerElement.style.transform = 'translateX(-600px)';
            playerElement.style.opacity = '0';
            setTimeout(() => {
                playerElement.style.transition = 'transform 2s ease-out, opacity 0.1s ease-out';
                playerElement.style.opacity = '1';
                game.playerCharacter.playRunAnimation();
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
    // Level 3: 1 Executioner and 2 Skeletons
    setTimeout(() => {
        const executioner = new Executioner(1, 100, game);
        executioner.createEnemyElement();
        game.enemies.push(executioner);
        const executionerElement = executioner.element;
        enemySide.appendChild(executionerElement);
        requestAnimationFrame(() => {
            executionerElement.classList.add('fade-in');
        });
    }, 0);
    setTimeout(() => {
        const skeleton1 = new Skeleton(2, 80, game);
        skeleton1.createEnemyElement();
        game.enemies.push(skeleton1);
        const skeletonElement1 = skeleton1.element;
        enemySide.appendChild(skeletonElement1);
        requestAnimationFrame(() => {
            skeletonElement1.classList.add('fade-in');
        });
    }, 800);
    setTimeout(() => {
        const skeleton2 = new Skeleton(3, 80, game);
        skeleton2.createEnemyElement();
        game.enemies.push(skeleton2);
        const skeletonElement2 = skeleton2.element;
        enemySide.appendChild(skeletonElement2);
        requestAnimationFrame(() => {
            skeletonElement2.classList.add('fade-in');
        });
    }, 1600);
} 