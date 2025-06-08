import { Goblin } from '../goblin.js';
import { FlyingDemon } from '../FlyingDemon.js';

export function runLevel24(game) {
    // Create player-side element if it doesn't exist
    let playerSide = document.querySelector('.player-side');
    if (!playerSide) {
        playerSide = document.createElement('div');
        playerSide.className = 'player-side';
        playerSide.style.position = 'absolute';
        playerSide.style.right = '0';
        playerSide.style.top = '0';
        playerSide.style.width = '50%';
        playerSide.style.height = '100%';
        playerSide.style.pointerEvents = 'none';
        playerSide.style.zIndex = '1000';
        // Add to game scene instead of document body
        const gameScene = document.querySelector('.game-scene');
        if (gameScene) {
            gameScene.appendChild(playerSide);
        } else {
            console.error('Game scene not found!');
            return;
        }
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
            console.error('Game scene not found!');
            return;
        }
    } else {
        // Clear existing enemies
        while (enemySide.firstChild) {
            enemySide.removeChild(enemySide.firstChild);
        }
    }

    // Set the background for level 24
    const playfield = document.querySelector('.playfield');
    if (playfield) {
        playfield.style.backgroundImage = "url('./assets/Images/level24.png')";
        playfield.style.backgroundSize = 'cover';
        playfield.style.backgroundPosition = 'center';
        playfield.style.backgroundRepeat = 'no-repeat';
    }

    // Create player character with run-in animation
    if (game.playerCharacter) {
        playerSide.innerHTML = ''; // Clear existing content
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

        // Run-in animation
        if (game.playerClass === 'mage' || game.playerClass === 'warrior') {
            playerElement.style.transition = 'none';
            playerElement.style.transform = 'translateX(-200px)';
            void playerElement.offsetWidth; // Force reflow

            // Start the run animation
            game.playerCharacter.playRunAnimation();

            // Play running sound
            const runningSound = game.soundManager.sounds.get('running');
            if (runningSound) {
                runningSound.currentTime = 0;
                runningSound.volume = 0.5;
                runningSound.loop = true;
                runningSound.play().catch(() => {});
            }

            // Animate player moving right
            playerElement.style.transition = 'transform 1s ease-out';
            playerElement.style.transform = 'translateX(0)';

            // Stop animation and sound after movement
            setTimeout(() => {
                game.playerCharacter.stopRunAnimation();
                if (runningSound) {
                    runningSound.pause();
                    runningSound.currentTime = 0;
                }
            }, 1000);
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

    // Create first goblin enemy with fade-in effect
    setTimeout(() => {
        const goblin1 = new Goblin(1, 100, game);
        const goblinElement1 = goblin1.createEnemyElement();
        goblinElement1.classList.add('enemy-character');
        goblinElement1.style.position = 'absolute';
        goblinElement1.style.left = '25%';
        goblinElement1.style.bottom = '10%';
        enemySide.appendChild(goblinElement1);
        game.enemies.push(goblin1);
        
        // Trigger fade-in animation
        requestAnimationFrame(() => {
            goblinElement1.classList.add('fade-in');
        });
    }, 1000); // Delay until after player entrance

    // Create second goblin enemy with fade-in effect
    setTimeout(() => {
        const goblin2 = new Goblin(2, 100, game);
        const goblinElement2 = goblin2.createEnemyElement();
        goblinElement2.classList.add('enemy-character');
        goblinElement2.style.position = 'absolute';
        goblinElement2.style.left = '45%';
        goblinElement2.style.bottom = '10%';
        enemySide.appendChild(goblinElement2);
        game.enemies.push(goblin2);
        
        // Trigger fade-in animation
        requestAnimationFrame(() => {
            goblinElement2.classList.add('fade-in');
        });
    }, 1500); // Delay after first goblin

    // Add first Flying Demon with delay
    setTimeout(() => {
        const flyingDemon1 = new FlyingDemon(3, 120, game);
        const flyingDemonElement1 = flyingDemon1.createEnemyElement();
        flyingDemonElement1.classList.add('enemy-character');
        flyingDemonElement1.style.position = 'absolute';
        flyingDemonElement1.style.left = '60%';
        flyingDemonElement1.style.bottom = '40%';
        enemySide.appendChild(flyingDemonElement1);
        game.enemies.push(flyingDemon1);
        
        // Trigger fade-in animation
        requestAnimationFrame(() => {
            flyingDemonElement1.classList.add('fade-in');
        });
    }, 2000); // Delay after goblins

    // Add second Flying Demon with delay
    setTimeout(() => {
        const flyingDemon2 = new FlyingDemon(4, 120, game);
        const flyingDemonElement2 = flyingDemon2.createEnemyElement();
        flyingDemonElement2.classList.add('enemy-character');
        flyingDemonElement2.style.position = 'absolute';
        flyingDemonElement2.style.left = '80%';
        flyingDemonElement2.style.bottom = '40%';
        enemySide.appendChild(flyingDemonElement2);
        game.enemies.push(flyingDemon2);
        
        // Trigger fade-in animation
        requestAnimationFrame(() => {
            flyingDemonElement2.classList.add('fade-in');
        });
    }, 3000); // Delay after first flying demon
} 