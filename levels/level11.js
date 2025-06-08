// Level 11: Innkeeper scene (town, no enemies, no player)
export function runLevel11(game) {
    localStorage.setItem('level11_hmr_log', 'START: ' + new Date().toISOString());
    
    // Remove player and enemy sides
    const playerSide = document.querySelector('.player-side');
    if (playerSide) playerSide.innerHTML = '';
    const enemySide = document.querySelector('.enemy-side');
    if (enemySide) enemySide.innerHTML = '';
    // Remove any existing inn/town door boxes and interactable rectangles
    document.querySelectorAll('.inn-door-box').forEach(el => el.remove());
    document.querySelectorAll('.interactable-rect').forEach(el => el.remove());
    document.querySelectorAll('.innkeeper-dialogue-box').forEach(el => el.remove());
    // Add innkeeper dialogue box
    const playfield = document.querySelector('.playfield') || document.body;
    const innkeeperBox = document.createElement('div');
    innkeeperBox.className = 'innkeeper-dialogue-box';
    innkeeperBox.style.position = 'absolute';
    innkeeperBox.style.bottom = '8%';
    innkeeperBox.style.left = '50%';
    innkeeperBox.style.transform = 'translateX(-50%)';
    innkeeperBox.style.background = 'rgba(30, 20, 10, 0.95)';
    innkeeperBox.style.color = '#fffbe6';
    innkeeperBox.style.padding = '18px 28px 14px 28px';
    innkeeperBox.style.borderRadius = '18px';
    innkeeperBox.style.fontSize = '1.1em';
    innkeeperBox.style.fontFamily = 'Cinzel, Times New Roman, serif';
    innkeeperBox.style.textAlign = 'center';
    innkeeperBox.style.zIndex = '4000';
    innkeeperBox.style.boxShadow = '0 0 32px 8px #000a';
    innkeeperBox.style.border = '3px solid #e6c27a';
    game.trackElement(innkeeperBox);
    // Typewriter effect using a class method
    const dialogue = "Ah, traveler! You look weary from the road. There's a room in the back—clean sheets and a warm bed, all yours for the night, no coin needed.";
    const typewriterSpan = document.createElement('span');
    innkeeperBox.appendChild(typewriterSpan);
    playfield.appendChild(innkeeperBox);
    game.runTypewriterEffect(typewriterSpan, dialogue, () => {
        innkeeperBox.style.cursor = 'pointer';
        innkeeperBox.title = 'Click to close';
    });
    game.addEventListener(innkeeperBox, 'click', () => {
        if (typewriterSpan.textContent === dialogue) {
            innkeeperBox.remove();
        }
    });
    // Ensure Room box is hidden by default
    game.interactableRectsVisible = false;
    // Add Room box (like inn/town door boxes)
    const roomBox = document.createElement('div');
    roomBox.className = 'inn-door-box interactable-rect';
    roomBox.style.position = 'absolute';
    roomBox.style.left = '66%';
    roomBox.style.top = '20%';
    roomBox.style.width = '220px';
    roomBox.style.height = '380px';
    roomBox.style.background = 'rgba(80, 200, 255, 0.25)';
    roomBox.style.border = '2px solid #39ff14';
    roomBox.style.borderRadius = '12px';
    roomBox.style.cursor = 'pointer';
    roomBox.style.zIndex = '3000';
    roomBox.title = 'Room';
    roomBox.style.display = 'flex';
    roomBox.style.alignItems = 'center';
    roomBox.style.justifyContent = 'center';
    roomBox.style.fontSize = '2em';
    roomBox.style.color = '#fff';
    roomBox.style.fontWeight = 'bold';
    roomBox.style.textShadow = '0 0 8px #39ff14, 0 2px 2px #000';
    // Set initial visibility and interactivity based on interactableRectsVisible
    roomBox.style.opacity = game.interactableRectsVisible ? '1' : '0';
    roomBox.style.pointerEvents = 'auto'; // Always allow hover, but only allow click if visible
    roomBox.style.transition = 'opacity 0.3s';
    game.trackElement(roomBox);
    game.addEventListener(roomBox, 'mouseenter', () => {
        roomBox.style.background = roomBox.style.opacity === '1'
            ? 'rgba(80, 255, 180, 0.35)'
            : 'rgba(80, 200, 255, 0.25)';
        roomBox.style.borderColor = roomBox.style.opacity === '1' ? '#fff' : '#39ff14';
        // Always use the door cursor for hover, just like level 9
        roomBox.style.cursor = 'url("/assets/Images/doorcursor.png") 24 24, pointer';
    });
    game.addEventListener(roomBox, 'mouseleave', () => {
        roomBox.style.background = 'rgba(80, 200, 255, 0.25)';
        roomBox.style.borderColor = '#39ff14';
        roomBox.style.cursor = 'pointer';
    });
    // Always allow click to transition to level 12
    game.addEventListener(roomBox, 'click', (e) => {
        game.previousLevel = 11;
        game.currentLevel = 12;
        game.startNextLevel();
    });
    playfield.appendChild(roomBox);
    localStorage.setItem('level11_hmr_log', 'END: ' + new Date().toISOString());
} 