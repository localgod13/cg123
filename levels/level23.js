import { Goblin } from '../goblin.js';
import { FlyingDemon } from '../FlyingDemon.js';

export function runLevel23(game) {
    // Level 23: New level with level23.png background
    // Remove any existing player character
    const existingPlayer = document.querySelector('.player-character');
    if (existingPlayer) {
        existingPlayer.remove();
    }

    // Remove any existing Back to Town button - try multiple selectors
    document.querySelectorAll('button').forEach(btn => {
        if (btn.textContent === 'Back to Town') {
            btn.remove();
        }
    });

    // Also try removing by class
    document.querySelectorAll('.merchant-back-btn').forEach(btn => btn.remove());

    // Remove all existing title texts
    document.querySelectorAll('.mountain-pass-title, .embervault-title').forEach(el => el.remove());

    // Create and add the title text
    const titleText = document.createElement('div');
    titleText.className = 'level23-title';
    titleText.style.position = 'fixed';
    titleText.style.top = '40px';
    titleText.style.left = '50%';
    titleText.style.transform = 'translateX(-50%)';
    titleText.style.color = '#fff';
    titleText.style.fontSize = '1.5em';
    titleText.style.fontFamily = 'Cinzel, Times New Roman, serif';
    titleText.style.textAlign = 'center';
    titleText.style.zIndex = '2000';
    titleText.textContent = 'Level 23';
    document.body.appendChild(titleText);

    // Set up the background
    const playfield = document.querySelector('.playfield');
    if (playfield) {
        playfield.style.backgroundImage = 'url("./assets/Images/level23.png")';
        playfield.style.backgroundSize = 'cover';
        playfield.style.backgroundPosition = 'center';
    }

    // Create player character with entrance animation
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
        // Add to playfield
        const playfield = document.querySelector('.playfield');
        if (playfield) {
            playfield.style.position = 'relative'; // Ensure playfield has relative positioning
            playfield.appendChild(enemySide);
        } else {
            console.error('Playfield not found');
            return;
        }
    } else {
        // Clear existing enemies
        while (enemySide.firstChild) {
            enemySide.removeChild(enemySide.firstChild);
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

    // Create goblin enemy with fade-in effect
    setTimeout(() => {
        const goblin = new Goblin(1, 100, game);
        const goblinElement = goblin.createEnemyElement();
        goblinElement.classList.add('enemy-character');
        enemySide.appendChild(goblinElement);
        game.enemies.push(goblin);
        
        // Trigger fade-in animation
        requestAnimationFrame(() => {
            goblinElement.classList.add('fade-in');
        });
    }, 0);

    // Add second goblin with delay
    setTimeout(() => {
        const goblin2 = new Goblin(2, 100, game);
        const goblinElement2 = goblin2.createEnemyElement();
        goblinElement2.classList.add('enemy-character');
        enemySide.appendChild(goblinElement2);
        game.enemies.push(goblin2);
        
        // Trigger fade-in animation
        requestAnimationFrame(() => {
            goblinElement2.classList.add('fade-in');
        });
    }, 800);

    // Add Flying Demon with delay
    setTimeout(() => {
        const flyingDemon = new FlyingDemon(3, 120, game); // Higher health than goblins
        const flyingDemonElement = flyingDemon.createEnemyElement();
        flyingDemonElement.classList.add('enemy-character');
        enemySide.appendChild(flyingDemonElement);
        game.enemies.push(flyingDemon);
        
        // Trigger fade-in animation
        requestAnimationFrame(() => {
            flyingDemonElement.classList.add('fade-in');
        });
    }, 1600); // Longer delay to space out enemy appearances
} 