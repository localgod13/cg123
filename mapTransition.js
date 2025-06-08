export class MapTransition {
    constructor(game) {
        this.game = game;
    }

    showMapScreen(fromLocation, toLocation, onComplete) {
        // Stop the current music with a fade out
        if (this.game.soundManager) {
            this.game.soundManager.fadeOutMusic(1000);
        }

        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'map-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.background = 'rgba(0,0,0,0.85)';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.zIndex = '2000';

        // Map container
        const mapContainer = document.createElement('div');
        mapContainer.style.position = 'relative';
        mapContainer.style.width = '900px';
        mapContainer.style.height = '400px';
        mapContainer.style.display = 'flex';
        mapContainer.style.alignItems = 'center';
        mapContainer.style.justifyContent = 'space-between';

        // From location image (left)
        const fromImg = document.createElement('img');
        fromImg.src = `./assets/Images/${fromLocation.image}`;
        fromImg.style.width = '250px';
        fromImg.style.height = '250px';
        fromImg.style.borderRadius = '16px';
        fromImg.style.boxShadow = '0 0 24px #000';
        fromImg.style.position = 'absolute';
        fromImg.style.left = '0';
        fromImg.style.top = '50%';
        fromImg.style.transform = 'translateY(-50%)';

        // To location image (right)
        const toImg = document.createElement('img');
        toImg.src = `./assets/Images/${toLocation.image}`;
        toImg.style.width = '250px';
        toImg.style.height = '250px';
        toImg.style.borderRadius = '16px';
        toImg.style.boxShadow = '0 0 24px #000';
        toImg.style.position = 'absolute';
        toImg.style.right = '0';
        toImg.style.top = '50%';
        toImg.style.transform = 'translateY(-50%)';
        toImg.style.cursor = 'pointer';
        toImg.style.zIndex = '3';
        toImg.style.pointerEvents = 'auto';

        // Create SVG for animated path
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.style.position = 'absolute';
        svg.style.left = '0';
        svg.style.top = '0';
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.style.zIndex = '1';

        // Create path element
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('class', 'path');
        path.setAttribute('d', 'M 125,200 L 775,200');
        path.setAttribute('stroke', '#fff');
        path.setAttribute('stroke-width', '4');
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke-dasharray', '10,10');
        path.style.strokeDashoffset = '0';
        path.style.strokeOpacity = '1';

        svg.appendChild(path);
        mapContainer.appendChild(svg);

        // Player sprite (idle)
        const playerSprite = this.game.playerCharacter.createPlayerElement();
        playerSprite.style.position = 'absolute';
        playerSprite.style.left = '60px';
        playerSprite.style.top = '50%';
        playerSprite.style.transform = 'translateY(-50%)';
        playerSprite.style.zIndex = '2';

        // Remove shield aura and stats for map
        const aura = playerSprite.querySelector('.shield-aura');
        if (aura) aura.remove();
        const stats = playerSprite.querySelector('.character-stats');
        if (stats) stats.remove();

        // Add elements to map container
        mapContainer.appendChild(fromImg);
        mapContainer.appendChild(toImg);
        mapContainer.appendChild(playerSprite);
        overlay.appendChild(mapContainer);
        document.body.appendChild(overlay);

        // Animate player to destination on click
        toImg.addEventListener('click', () => {
            toImg.style.filter = 'brightness(1.2) drop-shadow(0 0 16px #39ff14)';
            // Run animation
            this.game.playerCharacter.playRunAnimation();
            const runningSound = this.game.soundManager.sounds.get('running');
            if (runningSound) {
                runningSound.currentTime = 1;
                runningSound.play().catch(() => {});
            }

            // Animate the dotted path
            const pathLength = path.getTotalLength();
            const dashLength = 10;
            const animationDuration = 2000;
            const numberOfSteps = Math.round(pathLength / (dashLength * 2) + 1);
            const stepDuration = animationDuration / numberOfSteps;
            const doublePath = path.getTotalLength() * 2;

            // Build the dash array
            const dashArray = [];
            for (let i = numberOfSteps; i > 0; i--) {
                dashArray.push(dashLength);
                dashArray.push(dashLength);
            }
            dashArray.push(pathLength);

            // Set initial conditions
            path.setAttribute('stroke-dasharray', dashArray.join(' '));
            path.setAttribute('stroke-dashoffset', -pathLength);
            path.style.strokeOpacity = '1';

            // Animate the path
            let currentLength = pathLength;
            const dashAnimate = () => {
                currentLength += dashLength * 2;
                path.setAttribute('stroke-dashoffset', -currentLength);
                if (currentLength > doublePath) {
                    clearInterval(dashDrawInterval);
                }
            };

            const dashDrawInterval = setInterval(dashAnimate, stepDuration);

            // Animate player left to right
            playerSprite.style.transition = 'left 2s linear';
            playerSprite.style.left = '590px'; // Move to destination

            // After run duration, stop run animation and show Enter button
            setTimeout(() => {
                this.game.playerCharacter.stopRunAnimation();
                if (runningSound) {
                    runningSound.pause();
                    runningSound.currentTime = 0;
                }
                clearInterval(dashDrawInterval);

                // Show Enter button
                const enterBtn = document.createElement('button');
                enterBtn.textContent = 'Enter';
                enterBtn.style.position = 'absolute';
                enterBtn.style.left = '690px';
                enterBtn.style.top = '30%';
                enterBtn.style.transform = 'translateY(-50%)';
                enterBtn.style.padding = '16px 40px';
                enterBtn.style.fontSize = '1.5em';
                enterBtn.style.background = 'linear-gradient(135deg, #1a2a1a 60%, #2e4d2e 100%)';
                enterBtn.style.color = '#b6ffb6';
                enterBtn.style.border = '2px solid #39ff14';
                enterBtn.style.borderRadius = '16px';
                enterBtn.style.cursor = 'pointer';
                enterBtn.style.zIndex = '10';
                enterBtn.style.boxShadow = '0 0 24px 4px #39ff1466, 0 4px 24px rgba(0,0,0,0.7)';
                enterBtn.style.fontFamily = '"Cinzel", "Times New Roman", serif';
                enterBtn.style.letterSpacing = '1px';
                enterBtn.style.textShadow = '0 0 8px #39ff14, 0 2px 2px #000';
                enterBtn.style.transition = 'box-shadow 0.2s, background 0.2s, color 0.2s';
                
                enterBtn.addEventListener('mouseenter', () => {
                    enterBtn.style.boxShadow = '0 0 32px 8px #39ff14cc, 0 4px 32px rgba(0,0,0,0.8)';
                    enterBtn.style.background = 'linear-gradient(135deg, #223322 60%, #3e6d3e 100%)';
                    enterBtn.style.color = '#eaffea';
                });
                
                enterBtn.addEventListener('mouseleave', () => {
                    enterBtn.style.boxShadow = '0 0 24px 4px #39ff1466, 0 4px 24px rgba(0,0,0,0.7)';
                    enterBtn.style.background = 'linear-gradient(135deg, #1a2a1a 60%, #2e4d2e 100%)';
                    enterBtn.style.color = '#b6ffb6';
                });
                
                enterBtn.addEventListener('click', () => {
                    overlay.remove();
                    if (onComplete) onComplete();
                });
                
                mapContainer.appendChild(enterBtn);
            }, 2000);
        });
    }
} 