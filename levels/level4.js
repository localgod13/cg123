// =========================
// SECTION: Level 4 Logic (moved from game.js)
// =========================

export function runLevel4(game) {
    // Add player run-in animation
    const playerElement = document.querySelector('.player-character');
    if (playerElement && (game.playerClass === 'mage' || game.playerClass === 'warrior')) {
        playerElement.style.transition = 'none';
        playerElement.style.left = '0';
        playerElement.style.transform = 'translateY(-50%)';
        requestAnimationFrame(() => {
            playerElement.style.transition = 'left 1s ease-out';
            playerElement.style.left = '50%';
        });
    }

    // Add continue button
    const continueBtn = document.createElement('button');
    continueBtn.textContent = 'Continue';
    continueBtn.style.position = 'absolute';
    continueBtn.style.left = '75%';
    continueBtn.style.top = '30%';
    continueBtn.style.transform = 'translate(-50%, -50%)';
    continueBtn.style.padding = '16px 40px';
    continueBtn.style.fontSize = '1.5em';
    continueBtn.style.background = 'linear-gradient(135deg, #1a2a1a 60%, #2e4d2e 100%)';
    continueBtn.style.color = '#b6ffb6';
    continueBtn.style.border = '2px solid #39ff14';
    continueBtn.style.borderRadius = '16px';
    continueBtn.style.cursor = 'pointer';
    continueBtn.style.zIndex = '10';
    continueBtn.style.boxShadow = '0 0 24px 4px #39ff1466, 0 4px 24px rgba(0,0,0,0.7)';
    continueBtn.style.fontFamily = '"Cinzel", "Times New Roman", serif';
    continueBtn.style.letterSpacing = '1px';
    continueBtn.style.textShadow = '0 0 8px #39ff14, 0 2px 2px #000';
    continueBtn.style.transition = 'box-shadow 0.2s, background 0.2s, color 0.2s';

    continueBtn.addEventListener('mouseenter', () => {
        continueBtn.style.boxShadow = '0 0 32px 8px #39ff14cc, 0 4px 32px rgba(0,0,0,0.8)';
        continueBtn.style.background = 'linear-gradient(135deg, #223322 60%, #3e6d3e 100%)';
        continueBtn.style.color = '#eaffea';
    });

    continueBtn.addEventListener('mouseleave', () => {
        continueBtn.style.boxShadow = '0 0 24px 4px #39ff1466, 0 4px 24px rgba(0,0,0,0.7)';
        continueBtn.style.background = 'linear-gradient(135deg, #1a2a1a 60%, #2e4d2e 100%)';
        continueBtn.style.color = '#b6ffb6';
    });

    continueBtn.addEventListener('click', () => {
        continueBtn.remove();
        // Show map transition from graveyard to forest
        game.showMapScreen(
            { image: 'gy.png' },
            { image: 'forest2.png' },
            () => {
                game.currentLevel = 5;
                game.startNextLevel();
            }
        );
    });

    document.body.appendChild(continueBtn);
} 