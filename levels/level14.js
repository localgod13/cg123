// Level 14: Innkeeper 2 scene (town, no player, no enemies)
export function runLevel14(game) {
    // Remove player and enemy sides
    const playerSide = document.querySelector('.player-side');
    if (playerSide) playerSide.innerHTML = '';
    const enemySide = document.querySelector('.enemy-side');
    if (enemySide) enemySide.innerHTML = '';
    // Remove any existing inn/town door boxes and interactable rectangles
    document.querySelectorAll('.inn-door-box').forEach(el => el.remove());
    document.querySelectorAll('.interactable-rect').forEach(el => el.remove());
    document.querySelectorAll('.innkeeper-dialogue-box').forEach(el => el.remove());
    // Remove any existing Leave the Inn button
    const existingLeaveBtn = document.querySelector('button[textContent="Leave the Inn"]');
    if (existingLeaveBtn) existingLeaveBtn.remove();
    // Set background to innkeeper2.png
    const playfield = document.querySelector('.playfield');
    if (playfield) {
        playfield.style.backgroundImage = "url('./assets/Images/innkeeper2.png')";
        playfield.style.backgroundSize = 'cover';
        playfield.style.backgroundPosition = 'center';
        playfield.style.backgroundRepeat = 'no-repeat';
    }
    // Add 'Leave the Inn' button in the bottom left corner
    const leaveBtn = document.createElement('button');
    leaveBtn.textContent = 'Leave the Inn';
    leaveBtn.style.position = 'absolute';
    leaveBtn.style.left = '32px';
    leaveBtn.style.bottom = '32px';
    leaveBtn.style.padding = '18px 36px';
    leaveBtn.style.fontSize = '1.3em';
    leaveBtn.style.background = 'linear-gradient(135deg, #1a2a1a 60%, #2e4d2e 100%)';
    leaveBtn.style.color = '#b6ffb6';
    leaveBtn.style.border = '2px solid #39ff14';
    leaveBtn.style.borderRadius = '16px';
    leaveBtn.style.cursor = 'pointer';
    leaveBtn.style.zIndex = '4000';
    leaveBtn.style.boxShadow = '0 0 24px 4px #39ff1466, 0 4px 24px rgba(0,0,0,0.7)';
    leaveBtn.style.fontFamily = 'Cinzel, Times New Roman, serif';
    leaveBtn.style.letterSpacing = '1px';
    leaveBtn.style.textShadow = '0 0 8px #39ff14, 0 2px 2px #000';
    leaveBtn.addEventListener('mouseenter', () => {
        leaveBtn.style.boxShadow = '0 0 32px 8px #39ff14cc, 0 4px 32px rgba(0,0,0,0.8)';
        leaveBtn.style.background = 'linear-gradient(135deg, #223322 60%, #3e6d3e 100%)';
        leaveBtn.style.color = '#eaffea';
    });
    leaveBtn.addEventListener('mouseleave', () => {
        leaveBtn.style.boxShadow = '0 0 24px 4px #39ff1466, 0 4px 24px rgba(0,0,0,0.7)';
        leaveBtn.style.background = 'linear-gradient(135deg, #1a2a1a 60%, #2e4d2e 100%)';
        leaveBtn.style.color = '#b6ffb6';
    });
    leaveBtn.addEventListener('click', () => {
        // Remove the button before transitioning
        leaveBtn.remove();
        game.previousLevel = 14;
        game.currentLevel = 15;
        game.startNextLevel();
    });
    if (playfield) playfield.appendChild(leaveBtn);
} 