// Level 12: Inn room scene (no player, no enemies)
export function runLevel12(game) {
    localStorage.setItem('level12_hmr_log', 'START: ' + new Date().toISOString());
    // Remove player and enemy sides
    const playerSide = document.querySelector('.player-side');
    if (playerSide) playerSide.innerHTML = '';
    const enemySide = document.querySelector('.enemy-side');
    if (enemySide) enemySide.innerHTML = '';
    // Remove any existing inn/town door boxes and interactable rectangles
    document.querySelectorAll('.inn-door-box').forEach(el => el.remove());
    document.querySelectorAll('.interactable-rect').forEach(el => el.remove());
    document.querySelectorAll('.innkeeper-dialogue-box').forEach(el => el.remove());
    // Add Bed box
    const playfield = document.querySelector('.playfield') || document.body;
    const bedBox = document.createElement('div');
    bedBox.className = 'inn-door-box interactable-rect';
    bedBox.style.position = 'absolute';
    bedBox.style.left = '20%';
    bedBox.style.top = '60%';
    bedBox.style.width = '450px';
    bedBox.style.height = '120px';
    bedBox.style.background = 'rgba(80, 200, 255, 0.25)';
    bedBox.style.border = '2px solid #39ff14';
    bedBox.style.borderRadius = '12px';
    bedBox.style.cursor = 'pointer';
    bedBox.style.zIndex = '3000';
    bedBox.title = 'Bed';
    bedBox.style.display = 'flex';
    bedBox.style.alignItems = 'center';
    bedBox.style.justifyContent = 'center';
    bedBox.style.fontSize = '2em';
    bedBox.style.color = '#fff';
    bedBox.style.fontWeight = 'bold';
    bedBox.style.textShadow = '0 0 8px #39ff14, 0 2px 2px #000';
    bedBox.textContent = 'Bed';
    bedBox.style.opacity = '0';
    bedBox.style.pointerEvents = 'auto';
    bedBox.style.transition = 'opacity 0.3s';
    bedBox.addEventListener('mouseenter', () => {
        bedBox.style.background = 'rgba(80, 255, 180, 0.35)';
        bedBox.style.borderColor = '#fff';
        bedBox.style.cursor = 'url("/assets/Images/zzz.png") 24 24, pointer';
    });
    bedBox.addEventListener('mouseleave', () => {
        bedBox.style.background = 'rgba(80, 200, 255, 0.25)';
        bedBox.style.borderColor = '#39ff14';
        bedBox.style.cursor = 'pointer';
    });
    bedBox.addEventListener('click', function () {
        // Start fade out immediately when bed is clicked
        if (game.soundManager) {
            game.soundManager.stopMusic(true); // true for fade out
        }

        // Multi-step eyes getting droopy effect
        const playfield = document.querySelector('.playfield');
        const self = this;
        if (playfield) {
            let sleepOverlay = document.createElement('div');
            sleepOverlay.style.position = 'absolute';
            sleepOverlay.style.left = '0';
            sleepOverlay.style.top = '0';
            sleepOverlay.style.width = '100%';
            sleepOverlay.style.height = '100%';
            sleepOverlay.style.background = 'black';
            sleepOverlay.style.opacity = '0';
            sleepOverlay.style.transition = 'opacity 1s ease-in';
            sleepOverlay.style.zIndex = '9999';
            sleepOverlay.className = 'sleep-overlay';
            playfield.appendChild(sleepOverlay);
            // Sequence: darken, lighten, darken more, lighten, then full black
            const opacities = [0.4, 0.2, 0.7, 0.5, 1];
            let step = 0;

            // Play cricket.mp3 for the duration of the visual fade out
            let cricketAudio = new Audio('./assets/Audio/cricket.mp3');
            cricketAudio.volume = 0.7;
            cricketAudio.loop = false;
            cricketAudio.play().catch(() => {});
            game.cricketAudio = cricketAudio;

            function nextStep() {
                if (step < opacities.length) {
                    void sleepOverlay.offsetWidth;
                    sleepOverlay.style.opacity = opacities[step];
                    step++;
                    setTimeout(nextStep, 600);
                } else {
                    // Do NOT stop cricket.mp3 here; let it play until level 13 starts
                    setTimeout(() => {
                        sleepOverlay.remove();
                        bedBox.style.pointerEvents = 'none';
                        bedBox.style.opacity = '0.5';
                        game.previousLevel = 12;
                        game.currentLevel = 13;
                        game.startNextLevel();
                    }, 3000);
                }
            }
            nextStep();
        } else {
            // Fallback: just transition
            game.previousLevel = 12;
            game.currentLevel = 13;
            game.startNextLevel();
        }
    });
    playfield.appendChild(bedBox);
    // Only set the background, no message box
    // (Background is set above in the playfield logic)
    localStorage.setItem('level12_hmr_log', 'END: ' + new Date().toISOString());
} 