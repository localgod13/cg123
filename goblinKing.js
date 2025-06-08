import { Enemy } from './enemy.js';

export class GoblinKing extends Enemy {
    constructor(id, health, game) {
        super(id, health, './assets/Sprites/Goblin King/gkidle.png', game);
        this.type = 'goblinKing';
        this.attackDamage = 15;
        this.defense = 5;
        this.frameWidth = 200;  // 600/3 columns
        this.frameHeight = 200; // 600/3 rows
        this.totalFrames = 9;    // 3x3 grid for idle
        this.currentFrame = 0;
        this.animationSpeed = 200;   // milliseconds between frames
        this.isAttacking = false;
        this.attackAnimationSpeed = 100; // Faster attack animation
        this.scale = 3;
        this.verticalOffset = 100;

        // Attack animation properties
        this.attackSpriteSheet = './assets/Sprites/Goblin King/gkattack.png';
        this.attack2SpriteSheet = './assets/Sprites/Goblin King/gkattack2.png';
        this.attackFrameWidth = 200;  // 800/4 columns
        this.attackFrameHeight = 200; // 600/3 rows
        this.attackFrames = 10;       // First attack uses 10 frames
        this.attack2Frames = 10;      // Second attack uses 10 frames
        this.attackTotalWidth = 800;  // Total width of attack sprite sheets
        this.attack2TotalWidth = 800; // Total width of second attack sprite sheet
        this.attackRows = 3;          // Number of rows in attack sprite sheets
        this.attackCols = 4;          // Number of columns in attack sprite sheets

        // Hurt animation properties
        this.hurtSpriteSheet = './assets/Sprites/Goblin King/gkhurt.png';
        this.hurtFrameWidth = 200;    // 400/2 columns
        this.hurtFrameHeight = 200;   // 400/2 rows
        this.hurtFrames = 4;          // 2x2 grid
        this.hurtTotalWidth = 400;    // Total width of hurt sprite sheet

        // Death animation properties
        this.deathSpriteSheet = './assets/Sprites/Goblin King/gkdeath.png';
        this.deathFrameWidth = 200;   // 800/4 columns
        this.deathFrameHeight = 200;  // 600/3 rows
        this.deathFrames = 11;        // Using first 11 frames
        this.deathTotalWidth = 800;   // Total width of death sprite sheet

        // Preload sprite sheets
        this.preloadSpriteSheets();

        // Play entrance sound
        this.game.soundManager.playSound('gkentrance');
    }

    createEnemyElement() {
        const enemyElement = document.createElement('div');
        enemyElement.className = 'enemy-character';
        enemyElement.dataset.enemyId = this.id;
        
        // Create sprite container
        const spriteContainer = document.createElement('div');
        spriteContainer.className = 'enemy-sprite';
        spriteContainer.style.width = `${this.frameWidth * this.scale}px`;
        spriteContainer.style.height = `${this.frameHeight * this.scale}px`;
        spriteContainer.style.backgroundImage = `url('${this.spriteSheet}')`;
        spriteContainer.style.backgroundSize = this.getBackgroundSize();
        spriteContainer.style.backgroundPosition = '0px 0px';
        spriteContainer.style.backgroundRepeat = 'no-repeat';
        spriteContainer.style.transform = this.getTransform();
        
        // Add positioning and transition styles
        spriteContainer.style.position = 'relative';
        spriteContainer.style.left = '0px';
        spriteContainer.style.transition = 'left 0.3s ease-out';
        
        // Create stats container with corrected health text orientation
        const statsContainer = document.createElement('div');
        statsContainer.className = 'character-stats';
        statsContainer.style.position = 'absolute';
        statsContainer.style.left = '0';
        statsContainer.style.top = '120px';
        statsContainer.style.width = '100%';
        statsContainer.style.pointerEvents = 'none';
        statsContainer.style.transform = 'scaleX(-1)'; // Counter the sprite's transform
        statsContainer.innerHTML = `
            <div class=\"health-text\" style=\"position: absolute; top: 0px; left: 50%; transform: translateX(-50%); font-size: 16px; color: white; font-weight: bold; text-shadow: 1px 1px 2px #000;\">${this.health}/${this.maxHealth}</div>
        `;

        spriteContainer.appendChild(statsContainer);
        enemyElement.appendChild(spriteContainer);
        this.element = enemyElement;
        
        // Start animation
        this.startIdleAnimation();
        
        return enemyElement;
    }

    preloadSpriteSheets() {
        const spriteSheets = [
            this.spriteSheet,
            this.attackSpriteSheet,
            this.attack2SpriteSheet,
            this.hurtSpriteSheet,
            this.deathSpriteSheet
        ];

        spriteSheets.forEach(sheet => {
            const img = new Image();
            img.src = sheet;
        });
    }

    calculateAttackPosition() {
        const playerElement = document.querySelector('.player-character');
        if (!playerElement) return 0;

        const playerSprite = playerElement.querySelector('.player-sprite');
        if (!playerSprite) return 0;

        const playerRect = playerSprite.getBoundingClientRect();
        const enemyRect = this.element.getBoundingClientRect();

        // Calculate the distance to move to reach the right edge of player's hitbox
        // Player hitbox is 60% of sprite size, centered
        const playerHitboxWidth = playerRect.width * 0.6;
        const playerHitboxRight = playerRect.left + (playerRect.width + playerHitboxWidth) / 2;

        // Move GoblinKing even closer to player's hitbox
        const distanceToMove = playerHitboxRight - enemyRect.right + 250; // Increased to 250px for perfect distance

        return distanceToMove;
    }

    getBackgroundSize() {
        return `${this.frameWidth * this.scale * 3}px ${this.frameHeight * this.scale * 3}px`;
    }

    getAttackBackgroundSize() {
        return `${this.attackTotalWidth * this.scale}px ${this.attackFrameHeight * this.scale * this.attackRows}px`;
    }

    getHurtBackgroundSize() {
        return `${this.hurtTotalWidth * this.scale}px ${this.hurtFrameHeight * this.scale * 2}px`;
    }

    getDeathBackgroundSize() {
        return `${this.deathTotalWidth * this.scale}px ${this.deathFrameHeight * this.scale * 3}px`;
    }

    getTransform() {
        return 'scaleX(-1)';
    }

    startIdleAnimation() {
        // Don't start idle animation if dead
        if (this.isDead) return;

        if (this.animationInterval) {
            clearInterval(this.animationInterval);
        }

        const spriteContainer = this.element.querySelector('.enemy-sprite');
        if (!spriteContainer) return;

        // Ensure proper dimensions and background position
        spriteContainer.style.width = `${this.frameWidth * this.scale}px`;
        spriteContainer.style.height = `${this.frameHeight * this.scale}px`;
        spriteContainer.style.backgroundImage = `url('${this.spriteSheet}')`;
        spriteContainer.style.backgroundSize = this.getBackgroundSize();
        spriteContainer.style.backgroundPosition = '0px 0px';

        this.currentFrame = 0;
        this.animationInterval = setInterval(() => {
            if (this.isDead) {
                clearInterval(this.animationInterval);
                return;
            }

            this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
            
            if (this.element) {
                const spriteContainer = this.element.querySelector('.enemy-sprite');
                if (spriteContainer) {
                    const row = Math.floor(this.currentFrame / 3);
                    const col = this.currentFrame % 3;
                    const x = -col * this.frameWidth * this.scale;
                    const y = -row * this.frameHeight * this.scale;
                    spriteContainer.style.backgroundPosition = `${x}px ${y}px`;
                }
            }
        }, this.animationSpeed);
    }

    playAttackAnimation() {
        this.isAttacking = true;
        this.currentFrame = 0;

        const spriteContainer = this.element.querySelector('.enemy-sprite');
        if (!spriteContainer) return;

        // Stop the idle animation before starting attack
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = null;
        }

        // If we haven't stored the original position yet, store it
        if (!this.originalPosition) {
            const currentLeft = parseInt(spriteContainer.style.left) || 0;
            this.originalPosition = {
                x: currentLeft,
                y: parseInt(spriteContainer.style.top) || 0
            };
        }

        // Calculate and move to attack position
        const attackDistance = this.calculateAttackPosition();
        spriteContainer.style.left = `${this.originalPosition.x + attackDistance}px`;

        // Randomly choose between the two attacks
        const useSecondAttack = Math.random() < 0.5;
        this.currentAttackFrames = useSecondAttack ? this.attack2Frames : this.attackFrames;
        
        // Set dimensions and reset position before changing sprite sheet
        spriteContainer.style.width = `${this.attackFrameWidth * this.scale}px`;
        spriteContainer.style.height = `${this.attackFrameHeight * this.scale}px`;
        spriteContainer.style.backgroundImage = `url('${useSecondAttack ? this.attack2SpriteSheet : this.attackSpriteSheet}')`;
        spriteContainer.style.backgroundSize = this.getAttackBackgroundSize();
        spriteContainer.style.backgroundPosition = '0px 0px';

        // Play the appropriate attack sound
        this.game.soundManager.playSound(useSecondAttack ? 'gkattack2' : 'gkattack');

        // Start attack animation
        this.currentFrame = 0;
        this.startAttackAnimation();
    }

    startAttackAnimation() {
        const spriteContainer = this.element.querySelector('.enemy-sprite');
        if (!spriteContainer) return;

        let currentFrame = 0;
        this.animationInterval = setInterval(() => {
            if (currentFrame >= this.currentAttackFrames) {
                clearInterval(this.animationInterval);
                
                // Return to original position
                spriteContainer.style.left = `${this.originalPosition.x}px`;
                
                // Keep the attack sprite sheet visible while preparing idle
                const idleImage = new Image();
                idleImage.onload = () => {
                    // Create a temporary container for the idle animation
                    const tempContainer = document.createElement('div');
                    tempContainer.style.width = `${this.frameWidth * this.scale}px`;
                    tempContainer.style.height = `${this.frameHeight * this.scale}px`;
                    tempContainer.style.backgroundImage = `url('${this.spriteSheet}')`;
                    tempContainer.style.backgroundSize = this.getBackgroundSize();
                    tempContainer.style.backgroundPosition = '0px 0px';
                    tempContainer.style.position = 'absolute';
                    tempContainer.style.opacity = '0';
                    spriteContainer.parentElement.appendChild(tempContainer);

                    // Once the temporary container is ready, swap them
                    requestAnimationFrame(() => {
                        // Update the main container
                        spriteContainer.style.width = `${this.frameWidth * this.scale}px`;
                        spriteContainer.style.height = `${this.frameHeight * this.scale}px`;
                        spriteContainer.style.backgroundImage = `url('${this.spriteSheet}')`;
                        spriteContainer.style.backgroundSize = this.getBackgroundSize();
                        spriteContainer.style.backgroundPosition = '0px 0px';
                        
                        // Remove the temporary container
                        tempContainer.remove();
                        
                        // Reset attack state and start idle animation
                        this.isAttacking = false;
                        this.startIdleAnimation();
                    });
                };
                idleImage.src = this.spriteSheet;
                return;
            }

            const row = Math.floor(currentFrame / this.attackCols);
            const col = currentFrame % this.attackCols;
            const x = -col * this.attackFrameWidth * this.scale;
            const y = -row * this.attackFrameHeight * this.scale;
            spriteContainer.style.backgroundPosition = `${x}px ${y}px`;

            // Trigger damage on frame 5 (middle of the attack)
            if (currentFrame === 5) {
                const damageEvent = new CustomEvent('enemyAttackFrame', {
                    detail: { enemyId: this.id }
                });
                document.dispatchEvent(damageEvent);
            }
            
            currentFrame++;
        }, this.attackAnimationSpeed);
    }

    playHurtAnimation() {
        if (!this.element) return;
        
        const spriteContainer = this.element.querySelector('.enemy-sprite');
        if (!spriteContainer) return;

        // Play random hurt sound
        const useSecondSound = Math.random() < 0.5;
        this.game.soundManager.playSound(useSecondSound ? 'gkhurt2' : 'gkhurt');

        // Stop current animation
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = null;
        }

        // Store current position
        const currentLeft = spriteContainer.style.left;
        const currentTop = spriteContainer.style.top;

        // Set dimensions before changing sprite sheet
        spriteContainer.style.width = `${this.hurtFrameWidth * this.scale}px`;
        spriteContainer.style.height = `${this.hurtFrameHeight * this.scale}px`;
        spriteContainer.style.backgroundImage = `url('${this.hurtSpriteSheet}')`;
        spriteContainer.style.backgroundSize = this.getHurtBackgroundSize();
        spriteContainer.style.backgroundPosition = '0px 0px';

        // Play hurt animation
        let currentFrame = 0;
        this.animationInterval = setInterval(() => {
            if (currentFrame >= this.hurtFrames) {
                clearInterval(this.animationInterval);
                
                // Set dimensions before switching back to idle
                spriteContainer.style.width = `${this.frameWidth * this.scale}px`;
                spriteContainer.style.height = `${this.frameHeight * this.scale}px`;
                spriteContainer.style.backgroundImage = `url('${this.spriteSheet}')`;
                spriteContainer.style.backgroundSize = this.getBackgroundSize();
                spriteContainer.style.backgroundPosition = '0px 0px';
                
                // Resume idle animation
                this.startIdleAnimation();
                return;
            }

            const row = Math.floor(currentFrame / 2);
            const col = currentFrame % 2;
            const x = -col * this.hurtFrameWidth * this.scale;
            const y = -row * this.hurtFrameHeight * this.scale;
            spriteContainer.style.backgroundPosition = `${x}px ${y}px`;
            currentFrame++;
        }, 100); // Faster hurt animation
    }

    playDeathAnimation() {
        if (!this.element) return;
        
        const spriteContainer = this.element.querySelector('.enemy-sprite');
        if (!spriteContainer) return;

        // Play death sound
        this.game.soundManager.playSound('gkdeath');

        // Stop all animations and prevent new ones
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = null;
        }
        this.isAttacking = true;
        this.isDead = true; // New flag to prevent any animations

        // Switch to death sprite sheet
        spriteContainer.style.backgroundImage = `url('${this.deathSpriteSheet}')`;
        spriteContainer.style.backgroundSize = this.getDeathBackgroundSize();

        // Play death animation
        let currentFrame = 0;
        const playFrame = () => {
            if (currentFrame >= this.deathFrames) {
                // Fade out after death animation completes
                this.element.style.transition = 'opacity 1s ease-out';
                this.element.style.opacity = '0';

                // Remove after fade out
                setTimeout(() => {
                    if (this.element && this.element.parentNode) {
                        this.element.parentNode.removeChild(this.element);
                    }
                }, 1000);
                return;
            }

            const row = Math.floor(currentFrame / 4);
            const col = currentFrame % 4;
            const x = -col * this.deathFrameWidth * this.scale;
            const y = -row * this.deathFrameHeight * this.scale;
            spriteContainer.style.backgroundPosition = `${x}px ${y}px`;
            currentFrame++;
            setTimeout(playFrame, 150);
        };

        // Start the death animation
        playFrame();
    }
} 