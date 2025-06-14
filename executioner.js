import { Enemy } from './enemy.js';

/**
 * Executioner enemy class
 * A melee enemy with an axe, using the idle2.png sprite sheet
 * Sprite sheet details: 400x200px, 2 rows × 4 columns (8 frames total)
 */
export class Executioner extends Enemy {
    constructor(id, health, game) {
        super(id, health, './assets/Sprites/Executioner/idle2.png', game);
        this.attackSpriteSheet = './assets/Sprites/Executioner/attacking.png';
        this.hurtSpriteSheet = './assets/Sprites/Executioner/skill1.png';
        this.deathSpriteSheet = './assets/Sprites/Executioner/death.png';
        this.currentFrame = Math.floor(Math.random() * 8);
        this.totalFrames = 8;
        this.frameWidth = 100;
        this.frameHeight = 100;
        this.animationSpeed = 200;
        this.scale = 3;
    }

    getBackgroundSize() {
        return '1200px 600px'; // 3x larger (400*3 x 200*3)
    }

    getTransform() {
        return 'scaleX(-1)';
    }

    startIdleAnimation() {
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
        }

        this.animationInterval = setInterval(() => {
            this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
            const row = Math.floor(this.currentFrame / 4);
            const col = this.currentFrame % 4;
            
            if (this.element) {
                const spriteContainer = this.element.querySelector('.enemy-sprite');
                if (spriteContainer) {
                    spriteContainer.style.backgroundImage = `url('${this.spriteSheet}')`;
                    spriteContainer.style.backgroundSize = this.getBackgroundSize();
                    spriteContainer.style.backgroundPosition = `-${col * this.frameWidth * this.scale}px -${row * this.frameHeight * this.scale}px`;
                }
            }
        }, this.animationSpeed);
    }

    playAttackAnimation() {
        this.isAttacking = true;
        this.currentFrame = 0;

        const spriteContainer = this.element.querySelector('.enemy-sprite');
        if (!spriteContainer) return;

        // If we haven't stored the original position yet, store it
        if (!this.originalPosition) {
            this.originalPosition = {
                x: parseInt(spriteContainer.style.left) || 0,
                y: parseInt(spriteContainer.style.top) || 0
            };
            // Calculate and move to attack position based on player's hitbox
            const attackDistance = this.calculateAttackPosition();
            spriteContainer.style.left = `${attackDistance}px`;
            // Wait for movement to complete before starting attack animation
            setTimeout(() => {
                this.currentFrame = 0;
                this.startAttackAnimation();
            }, 300); // Match transition duration
            return;
        }
    }

    startAttackAnimation() {
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
        }

        this.animationInterval = setInterval(() => {
            this.currentFrame = (this.currentFrame + 1) % 13;
            const row = Math.floor(this.currentFrame / 6);
            const col = this.currentFrame % 6;
            
            if (this.element) {
                const spriteContainer = this.element.querySelector('.enemy-sprite');
                if (spriteContainer) {
                    spriteContainer.style.backgroundImage = `url(${this.attackSpriteSheet})`;
                    spriteContainer.style.backgroundSize = '1800px 900px';
                    spriteContainer.style.backgroundPosition = `-${col * this.frameWidth * this.scale}px -${row * this.frameHeight * this.scale}px`;
                }
            }

            // Trigger damage on frames 3 and 10
            if (this.currentFrame === 3 || this.currentFrame === 10) {
                // Dispatch a custom event to notify the game that damage should be applied
                const damageEvent = new CustomEvent('enemyAttackFrame', {
                    detail: { enemyId: this.id }
                });
                document.dispatchEvent(damageEvent);
            }

            if (this.currentFrame === 12) {
                // Return to original position
                const spriteContainer = this.element.querySelector('.enemy-sprite');
                if (spriteContainer && this.originalPosition) {
                    spriteContainer.style.left = `${this.originalPosition.x}px`;
                    // Wait for return movement to complete
                    setTimeout(() => {
                        this.isAttacking = false;
                        this.currentFrame = 0;
                        this.originalPosition = null;
                        this.startIdleAnimation();
                    }, 300); // Match transition duration
                }
            }
        }, this.animationSpeed);
    }

    playHurtAnimation() {
        if (this.isHurt) return;
        if (!this.element) return;
        let hurtFrame = 0;
        
        const spriteContainer = this.element.querySelector('.enemy-sprite');
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

        spriteContainer.style.backgroundImage = `url(${this.hurtSpriteSheet})`;
        spriteContainer.style.backgroundSize = '1800px 600px'; // 3x larger (600*3 x 200*3)
        spriteContainer.style.backgroundPosition = '0px 0px';

        const hurtInterval = setInterval(() => {
            if (hurtFrame >= 12) { // 12 frames total (2 rows × 6 columns)
                clearInterval(hurtInterval);
                this.isHurt = false;
                
                // Restore original properties
                spriteContainer.style.backgroundImage = originalSpriteSheet;
                spriteContainer.style.backgroundSize = originalSize;
                spriteContainer.style.backgroundPosition = originalPosition;
                
                // Restart idle animation
                this.startIdleAnimation();
                return;
            }

            const row = Math.floor(hurtFrame / 6); // 6 columns
            const col = hurtFrame % 6;
            spriteContainer.style.backgroundPosition = `-${col * this.frameWidth * this.scale}px -${row * this.frameHeight * this.scale}px`;
            hurtFrame++;
        }, 100); // 100ms per frame for hurt animation
    }

    playDeathAnimation() {
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
        }

        const spriteContainer = this.element.querySelector('.enemy-sprite');
        if (!spriteContainer) return;

        // Play death sound
        const deathSound = new Audio('./assets/Audio/exdeath.mp3');
        deathSound.volume = 0.5; // Adjust volume as needed
        deathSound.play().catch(error => console.log('Error playing executioner death sound:', error));

        // Store original properties
        const originalSpriteSheet = spriteContainer.style.backgroundImage;
        const originalPosition = spriteContainer.style.backgroundPosition;
        const originalSize = spriteContainer.style.backgroundSize;

        // Set up death animation properties
        spriteContainer.style.backgroundImage = `url(${this.deathSpriteSheet})`;
        spriteContainer.style.backgroundSize = '3000px 600px'; // 3x larger (1000*3 x 200*3)
        spriteContainer.style.backgroundPosition = '0px 0px';

        let deathFrame = 0;
        const totalDeathFrames = 20; // 2 rows × 10 columns
        const framesPerRow = 10;

        const deathInterval = setInterval(() => {
            if (deathFrame >= totalDeathFrames) {
                clearInterval(deathInterval);
                // Add fade-out transition
                this.element.style.transition = 'opacity 0.5s ease-out';
                this.element.style.opacity = '0';
                // Remove element after fade-out completes
                setTimeout(() => {
                    if (this.element && this.element.parentNode) {
                        this.element.parentNode.removeChild(this.element);
                    }
                }, 500);
                return;
            }

            const row = Math.floor(deathFrame / framesPerRow);
            const col = deathFrame % framesPerRow;
            spriteContainer.style.backgroundPosition = `-${col * this.frameWidth * this.scale}px -${row * this.frameHeight * this.scale}px`;
            deathFrame++;
        }, 100); // 100ms per frame for death animation
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
        spriteContainer.style.position = 'relative';
        spriteContainer.style.left = '0px';
        spriteContainer.style.top = '0px';
        spriteContainer.style.transition = 'left 0.3s ease-out';

        // Create stats container (health text only, moved further down)
        const statsContainer = document.createElement('div');
        statsContainer.className = 'character-stats';
        statsContainer.style.position = 'absolute';
        statsContainer.style.left = '0';
        statsContainer.style.top = '40px';
        statsContainer.style.width = '100%';
        statsContainer.style.pointerEvents = 'none';
        statsContainer.style.transform = 'scaleX(-1)'; // Counter the sprite's transform
        statsContainer.innerHTML = `
            <div class=\"health-text\" style=\"position: absolute; top: 0px; left: 50%; transform: translateX(-50%); font-size: 16px; color: white; font-weight: bold; text-shadow: 1px 1px 2px #000;\">${this.health}/${this.maxHealth}</div>
        `;

        spriteContainer.appendChild(statsContainer);
        enemyElement.appendChild(spriteContainer);
        this.element = enemyElement;
        this.startIdleAnimation();
        return enemyElement;
    }
} 