import { Werewolf } from '../werewolf.js';
import { playWerewolfPackCinematic } from '../cinematics/werewolfCinematics.js';
// =========================
// SECTION: Level 7 Logic (moved from game.js)
// =========================

export function runLevel7(game) {
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
        playerSide.appendChild(playerElement);
        playerSide.appendChild(statsContainer);
    }

    // Start the werewolf pack cinematic
    playWerewolfPackCinematic(game, () => {
        // Cinematic complete callback
    });
}