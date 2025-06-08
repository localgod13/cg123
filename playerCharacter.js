// =========================
// SECTION: PlayerCharacter Class (moved from game.js)
// =========================

export class PlayerCharacter {
    constructor(spriteSheet, frameWidth = 135, frameHeight = 135, totalFrames = 10) {
        this.spriteSheet = spriteSheet;
        this.currentFrame = 0;
        this.totalFrames = totalFrames; // Default: 10 frames in the idle sprite sheet
        this.frameWidth = frameWidth; // Default: 135px width
        this.frameHeight = frameHeight; // Default: 135px height
        this.animationSpeed = 100; // milliseconds per frame
        this.element = null;
        this.animationInterval = null;
        this.isAttacking = false;
        this.isHurt = false;
        this.attackSpriteSheets = [
            './assets/Sprites/Warrior/Attack1.png',
            './assets/Sprites/Warrior/Attack2.png',
            './assets/Sprites/Warrior/Attack3.png'
        ];
        this.attackFrames = [4, 4, 5]; // Frames for each attack animation
        this.currentAttackIndex = 0;
        this.hurtSpriteSheets = [
            './assets/Sprites/Warrior/hurt1.png',
            './assets/Sprites/Warrior/hurt2.png',
            './assets/Sprites/Warrior/hurt3.png'
        ];
        // Add warrior run animation properties
        this.warriorRunSpriteSheet = './assets/Sprites/Warrior/warriorrun.png';
        this.warriorRunFrameWidth = 135; // 810/6
        this.warriorRunFrameHeight = 135;
        this.warriorRunTotalFrames = 6;
        this.isRunning = false;
    }

    createPlayerElement() {
        const playerElement = document.createElement('div');
        playerElement.className = 'player-character';
        playerElement.style.position = 'relative';
        
        // Create sprite container
        const spriteContainer = document.createElement('div');
        spriteContainer.className = 'player-sprite';
        spriteContainer.style.width = `${this.frameWidth * 4}px`; // 4x larger
        spriteContainer.style.height = `${this.frameHeight * 4}px`; // 4x larger
        spriteContainer.style.backgroundImage = `url(${this.spriteSheet})`;
        spriteContainer.style.position = 'absolute';
        spriteContainer.style.left = '50%';
        spriteContainer.style.top = '50%';
        spriteContainer.style.transform = 'translate(-50%, -50%)';
        
        // Dynamically set background size based on frame dimensions and total frames
        const bgWidth = this.frameWidth * this.totalFrames * 4;
        const bgHeight = this.frameHeight * 4;
        spriteContainer.style.backgroundSize = `${bgWidth}px ${bgHeight}px`;
        
        playerElement.appendChild(spriteContainer);
        this.element = playerElement;
        
        // Track the element using Game instance
        if (window.Game && window.Game.instance) {
            window.Game.instance.trackElement(playerElement);
        }
        
        // Start animation
        this.startAnimation();
        
        return playerElement;
    }

    startAnimation() {
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
        }

        this.animationInterval = (window.Game && window.Game.instance ? window.Game.instance.trackInterval(
            setInterval(() => {
                if (!this.isAttacking) {
                    this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
                    
                    if (this.element) {
                        const spriteContainer = this.element.querySelector('.player-sprite');
                        if (spriteContainer) {
                            spriteContainer.style.backgroundImage = `url(${this.spriteSheet})`;
                            
                            // Dynamically set background size based on frame dimensions and total frames
                            const bgWidth = this.frameWidth * this.totalFrames * 4;
                            const bgHeight = this.frameHeight * 4;
                            spriteContainer.style.backgroundSize = `${bgWidth}px ${bgHeight}px`;
                            
                            spriteContainer.style.backgroundPosition = `-${this.currentFrame * this.frameWidth * 4}px 0px`;
                        }
                    }
                }
            }, this.animationSpeed)
        ) : setInterval(() => {
            if (!this.isAttacking) {
                this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
                if (this.element) {
                    const spriteContainer = this.element.querySelector('.player-sprite');
                    if (spriteContainer) {
                        spriteContainer.style.backgroundImage = `url(${this.spriteSheet})`;
                        const bgWidth = this.frameWidth * this.totalFrames * 4;
                        const bgHeight = this.frameHeight * 4;
                        spriteContainer.style.backgroundSize = `${bgWidth}px ${bgHeight}px`;
                        spriteContainer.style.backgroundPosition = `-${this.currentFrame * this.frameWidth * 4}px 0px`;
                    }
                }
            }
        }, this.animationSpeed));
    }

    playAttackAnimation() {
        if (this.isAttacking) return;
        
        this.isAttacking = true;
        let attackFrame = 0;
        
        const spriteContainer = this.element.querySelector('.player-sprite');
        if (!spriteContainer) return;

        // Stop the idle animation
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = null;
        }

        // Store original sprite sheet and position
        const originalSpriteSheet = spriteContainer.style.backgroundImage;
        const originalPosition = spriteContainer.style.backgroundPosition;
        const originalSize = spriteContainer.style.backgroundSize;

        // Set up attack animation properties
        spriteContainer.style.backgroundImage = `url(${this.attackSpriteSheets[this.currentAttackIndex]})`;
        
        // Adjust background size based on current attack animation
        const currentFrames = this.attackFrames[this.currentAttackIndex];
        const totalWidth = this.frameWidth * currentFrames * 4; // 4x larger
        spriteContainer.style.backgroundSize = `${totalWidth}px 540px`; // 135px height * 4
        spriteContainer.style.backgroundPosition = '0px 0px';

        const attackInterval = setInterval(() => {
            if (attackFrame >= this.attackFrames[this.currentAttackIndex]) {
                clearInterval(attackInterval);
                this.isAttacking = false;
                
                // Restore original properties
                spriteContainer.style.backgroundImage = originalSpriteSheet;
                spriteContainer.style.backgroundSize = originalSize;
                spriteContainer.style.backgroundPosition = originalPosition;
                
                // Switch to next attack animation for next time
                this.currentAttackIndex = (this.currentAttackIndex + 1) % this.attackSpriteSheets.length;
                
                // Restart idle animation
                this.startAnimation();
                return;
            }

            spriteContainer.style.backgroundPosition = `-${attackFrame * this.frameWidth * 4}px 0px`;
            attackFrame++;
        }, 200); // 200ms per frame for attack animation
    }

    playHurtAnimation() {
        if (this.isHurt) return;
        
        this.isHurt = true;
        let hurtFrame = 0;
        
        const spriteContainer = this.element.querySelector('.player-sprite');
        if (!spriteContainer) return;

        // Stop the idle animation
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = null;
        }

        // Store original sprite properties
        const originalSpriteSheet = spriteContainer.style.backgroundImage;
        const originalPosition = spriteContainer.style.backgroundPosition;
        const originalSize = spriteContainer.style.backgroundSize;

        const hurtInterval = setInterval(() => {
            if (hurtFrame >= this.hurtSpriteSheets.length) {
                clearInterval(hurtInterval);
                this.isHurt = false;
                
                // Restore original properties
                spriteContainer.style.backgroundImage = originalSpriteSheet;
                spriteContainer.style.backgroundSize = originalSize;
                spriteContainer.style.backgroundPosition = originalPosition;
                
                // Restart idle animation
                this.startAnimation();
                return;
            }

            // Set all sprite properties together
            spriteContainer.style.backgroundImage = `url(${this.hurtSpriteSheets[hurtFrame]})`;
            spriteContainer.style.backgroundSize = '540px 540px'; // 135px * 4
            spriteContainer.style.backgroundPosition = '0px 0px';
            hurtFrame++;
        }, 200); // 200ms per frame for hurt animation
    }

    playRunAnimation() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        const spriteContainer = this.element.querySelector('.player-sprite');
        if (!spriteContainer) return;

        // Stop the idle animation
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = null;
        }

        // Store original properties
        const originalSpriteSheet = spriteContainer.style.backgroundImage;
        const originalPosition = spriteContainer.style.backgroundPosition;
        const originalSize = spriteContainer.style.backgroundSize;

        // Set up run animation properties
        spriteContainer.style.backgroundImage = `url(${this.warriorRunSpriteSheet})`;
        
        // Calculate the scaled dimensions
        const scaleX = 4;  // Scale factor for width
        const scaleY = 4;  // Scale factor for height
        
        // Calculate the scaled dimensions for the entire sprite sheet
        const scaledWidth = 810 * scaleX;  // Total width of sprite sheet
        const scaledHeight = 135 * scaleY;  // Height of sprite sheet
        
        // Calculate the container dimensions
        const containerWidth = this.frameWidth * 4;  // Original container width
        const containerHeight = this.frameHeight * 4; // Original container height
        
        // Calculate the offsets to center the sprite
        const horizontalOffset = (containerWidth - (this.warriorRunFrameWidth * scaleX)) / 2;
        const verticalOffset = (containerHeight - (this.warriorRunFrameHeight * scaleY)) / 2;
        
        // Set background size for the run animation
        spriteContainer.style.backgroundSize = `${scaledWidth}px ${scaledHeight}px`;
        
        // Set initial position with offsets to center the sprite
        spriteContainer.style.backgroundPosition = `${horizontalOffset}px ${verticalOffset}px`;

        let currentFrame = 0;
        this.animationInterval = setInterval(() => {
            if (currentFrame >= this.warriorRunTotalFrames) {
                currentFrame = 0;
            }

            // Calculate the background position for the current frame, maintaining both offsets
            const frameOffset = currentFrame * this.warriorRunFrameWidth * scaleX;
            spriteContainer.style.backgroundPosition = `${horizontalOffset - frameOffset}px ${verticalOffset}px`;
            currentFrame++;
        }, 100); // Faster animation for running
    }

    stopRunAnimation() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        const spriteContainer = this.element.querySelector('.player-sprite');
        if (!spriteContainer) return;

        // Stop the run animation
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = null;
        }

        // Restore original properties
        spriteContainer.style.backgroundImage = `url(${this.spriteSheet})`;
        spriteContainer.style.backgroundSize = `${this.frameWidth * this.totalFrames * 4}px ${this.frameHeight * 4}px`;
        spriteContainer.style.backgroundPosition = '0px 0px';

        // Restart idle animation
        this.startAnimation();
    }
} 