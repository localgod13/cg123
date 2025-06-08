// Level 17: Merchant Shop (no player, no enemies)
export function runLevel17(game) {
    // Remove player and enemy sides
    const playerSide = document.querySelector('.player-side');
    if (playerSide) playerSide.innerHTML = '';
    const enemySide = document.querySelector('.enemy-side');
    if (enemySide) enemySide.innerHTML = '';
    // Remove any existing inn/town door boxes and interactable rectangles
    document.querySelectorAll('.inn-door-box').forEach(el => el.remove());
    document.querySelectorAll('.interactable-rect').forEach(el => el.remove());
    document.querySelectorAll('.innkeeper-dialogue-box').forEach(el => el.remove());
    // Set up merchant shop UI (background is set in main game logic)
    const playfield = document.querySelector('.playfield');
    if (playfield) {
        // Remove any existing back button to prevent duplicates
        const oldBackBtn = playfield.querySelector('.merchant-back-btn');
        if (oldBackBtn) oldBackBtn.remove();
        // Add 'Back to Town' button in the bottom left corner
        const backBtn = document.createElement('button');
        backBtn.className = 'merchant-back-btn';
        backBtn.textContent = 'Back to Town';
        backBtn.style.position = 'absolute';
        backBtn.style.left = '32px';
        backBtn.style.bottom = '32px';
        backBtn.style.padding = '18px 36px';
        backBtn.style.fontSize = '1.3em';
        backBtn.style.background = 'linear-gradient(135deg, #2a1a1a 60%, #4d2e2e 100%)';
        backBtn.style.color = '#ffe6b6';
        backBtn.style.border = '2px solid #ffb639';
        backBtn.style.borderRadius = '16px';
        backBtn.style.cursor = 'pointer';
        backBtn.style.zIndex = '4000';
        backBtn.style.boxShadow = '0 0 24px 4px #ffb63966, 0 4px 24px rgba(0,0,0,0.7)';
        backBtn.style.fontFamily = 'Cinzel, Times New Roman, serif';
        backBtn.style.letterSpacing = '1px';
        backBtn.style.textShadow = '0 0 8px #ffb639, 0 2px 2px #000';
        backBtn.addEventListener('mouseenter', () => {
            backBtn.style.boxShadow = '0 0 32px 8px #ffb639cc, 0 4px 32px rgba(0,0,0,0.8)';
            backBtn.style.background = 'linear-gradient(135deg, #332222 60%, #6d3e3e 100%)';
            backBtn.style.color = '#fff6ea';
        });
        backBtn.addEventListener('mouseleave', () => {
            backBtn.style.boxShadow = '0 0 24px 4px #ffb63966, 0 4px 24px rgba(0,0,0,0.7)';
            backBtn.style.background = 'linear-gradient(135deg, #2a1a1a 60%, #4d2e2e 100%)';
            backBtn.style.color = '#ffe6b6';
        });
        backBtn.addEventListener('click', () => {
            // Remove the button before transitioning
            backBtn.remove();
            // Remove the buy button if it exists
            const buyBtn = document.querySelector('.merchant-buy-btn');
            if (buyBtn) buyBtn.remove();
            game.previousLevel = 17;
            game.currentLevel = 16;
            game.startNextLevel();
        });
        playfield.appendChild(backBtn);
    }
    // No player, no enemies, just merchant shop UI
    console.log('[Level 17] Merchant shop scene loaded, currentLevel:', game.currentLevel);

    // Patch: re-show the button after store closes
    const origClose = this.store.close.bind(this.store);
    this.store.close = () => {
        origClose();
        // Show back button when store is closed
        const backBtn = document.querySelector('.merchant-back-btn');
        if (backBtn) backBtn.style.display = 'block';
        
        setTimeout(() => this.showLevel17BuyButton(), 100);
    };
} 