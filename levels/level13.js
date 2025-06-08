// Level 13: Daytime inn room (no player, no enemies)
export function runLevel13(game) {
    localStorage.setItem('level13_hmr_log', 'START: ' + new Date().toISOString());
    // Remove player and enemy sides
    const playerSide = document.querySelector('.player-side');
    if (playerSide) playerSide.innerHTML = '';
    const enemySide = document.querySelector('.enemy-side');
    if (enemySide) enemySide.innerHTML = '';
    // Remove any existing inn/town door boxes and interactable rectangles
    document.querySelectorAll('.inn-door-box').forEach(el => el.remove());
    document.querySelectorAll('.interactable-rect').forEach(el => el.remove());
    document.querySelectorAll('.innkeeper-dialogue-box').forEach(el => el.remove());
    // Wake up overlay effect
    const playfield = document.querySelector('.playfield');
    if (playfield) {
        let wakeOverlay = document.createElement('div');
        wakeOverlay.style.position = 'absolute';
        wakeOverlay.style.left = '0';
        wakeOverlay.style.top = '0';
        wakeOverlay.style.width = '100%';
        wakeOverlay.style.height = '100%';
        wakeOverlay.style.background = 'black';
        wakeOverlay.style.opacity = '1';
        wakeOverlay.style.transition = 'opacity 1s ease-in';
        wakeOverlay.style.zIndex = '9999';
        wakeOverlay.className = 'wake-overlay';
        playfield.appendChild(wakeOverlay);
        // Sequence: fully black to clear, matching the sleep effect but reversed
        const opacities = [1, 0.5, 0.7, 0.2, 0.4, 0];
        let step = 0;
        function nextWakeStep() {
            if (step < opacities.length) {
                void wakeOverlay.offsetWidth;
                wakeOverlay.style.opacity = opacities[step];
                step++;
                setTimeout(nextWakeStep, 600);
            } else {
                wakeOverlay.remove();
                // Play townday.mp3 after fade-in completes
                if (game.levelMusic) {
                    game.levelMusic.pause();
                    game.levelMusic.currentTime = 0;
                }
                game.levelMusic = new Audio('./assets/Audio/townday.mp3');
                game.levelMusic.loop = true;
                game.levelMusic.volume = game.musicVolume || 0.5;
                game.levelMusic.play().catch(() => {});
            }
        }
        nextWakeStep();
    }
    // Only set the background, no message box
    // (Background is set above in the playfield logic)
    // Add a door box (interactable rectangle)
    const doorBox = document.createElement('div');
    doorBox.className = 'inn-door-box interactable-rect';
    doorBox.style.position = 'absolute';
    doorBox.style.left = '75%';
    doorBox.style.top = '10%';
    doorBox.style.width = '200px';
    doorBox.style.height = '400px';
    doorBox.style.background = 'rgba(80, 200, 255, 0.25)';
    doorBox.style.border = '2px solid #39ff14';
    doorBox.style.borderRadius = '12px';
    doorBox.style.cursor = 'pointer';
    doorBox.style.zIndex = '3000';
    doorBox.title = 'Door';
    doorBox.style.display = 'flex';
    doorBox.style.alignItems = 'center';
    doorBox.style.justifyContent = 'center';
    doorBox.style.fontSize = '2em';
    doorBox.style.color = '#fff';
    doorBox.style.fontWeight = 'bold';
    doorBox.style.textShadow = '0 0 8px #39ff14, 0 2px 2px #000';
    doorBox.textContent = 'Door';
    doorBox.style.opacity = '0';
    doorBox.style.pointerEvents = 'auto';
    doorBox.style.transition = 'opacity 0.3s';
    doorBox.addEventListener('mouseenter', () => {
        doorBox.style.background = 'rgba(80, 255, 180, 0.35)';
        doorBox.style.borderColor = '#fff';
        doorBox.style.cursor = 'url("/assets/Images/doorcursor.png") 24 24, pointer';
    });
    doorBox.addEventListener('mouseleave', () => {
        doorBox.style.background = 'rgba(80, 200, 255, 0.25)';
        doorBox.style.borderColor = '#39ff14';
        doorBox.style.cursor = 'pointer';
    });
    doorBox.addEventListener('click', () => {
        game.previousLevel = 13;
        game.currentLevel = 14;
        game.startNextLevel();
    });
    if (playfield) playfield.appendChild(doorBox);
    // Stop running/footstep sound if it is playing from a previous level
    if (game.soundManager && game.soundManager.sounds && game.soundManager.sounds.get('running')) {
        const runningSound = game.soundManager.sounds.get('running');
        runningSound.pause();
        runningSound.currentTime = 0;
    }
    localStorage.setItem('level13_hmr_log', 'END: ' + new Date().toISOString());
} 