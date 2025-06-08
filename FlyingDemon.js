import { Enemy } from './enemy.js';

/**
 * Flying Demon enemy class
 * A flying enemy, using the didle.png sprite sheet
 * Sprite sheet details: 324x71px, 1 row × 4 columns (4 frames total)
 * Attack sprite sheet details: 648x71px, 1 row × 8 columns (8 frames total)
 */
export class FlyingDemon extends Enemy {
    constructor(id, health, game) {
        super(id, health, './assets/Sprites/Flying Demon/didle.png', game);
        this.attackSpriteSheet = './assets/Sprites/Flying Demon/dattack.png'; // Using attack sprite
        this.hurtSpriteSheet = './assets/Sprites/Flying Demon/dhit.png'; // Using hurt sprite
        this.deathSpriteSheet = './assets/Sprites/Flying Demon/ddeath.png'; // Using death sprite
        this.currentFrame = Math.floor(Math.random() * 4);
        this.totalFrames = 4;
        this.frameWidth = 81; // 324px / 4 frames
        this.frameHeight = 71;
        this.animationSpeed = 150;
        this.scale = 1.5;
        this.verticalOffset = 50; // Position it higher than ground enemies
        this.attackTotalFrames = 8; // 8 frames for attack animation
        this.attackFrameWidth = 81; // 648px / 8 frames
        this.deathTotalFrames = 7; // 7 frames for death animation
        this.deathFrameWidth = 81; // 567px / 7 frames
    }

    getBackgroundSize() {
        return '486px 106px'; // 1.5x larger (324*1.5 x 71*1.5)
    }

    getAttackBackgroundSize() {
        return '972px 106px'; // 1.5x larger (648*1.5 x 71*1.5)
    }

    getDeathBackgroundSize() {
        return '850px 106px'; // 1.5x larger (567*1.5 x 71*1.5)
    }

    getTransform() {
        return 'none';
    }

    startIdleAnimation() {
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
        }

        this.animationInterval = setInterval(() => {
            this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
            
            if (this.element) {
                const spriteContainer = this.element.querySelector('.enemy-sprite');
                if (spriteContainer) {
                    spriteContainer.style.backgroundImage = `url('${this.spriteSheet}')`;
                    spriteContainer.style.backgroundSize = this.getBackgroundSize();
                    spriteContainer.style.backgroundPosition = `-${this.currentFrame * this.frameWidth * this.scale}px 0px`;
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
            if (this.currentFrame < this.attackTotalFrames) {
                const spriteContainer = this.element.querySelector('.enemy-sprite');
                if (spriteContainer) {
                    spriteContainer.style.backgroundImage = `url('${this.attackSpriteSheet}')`;
                    spriteContainer.style.backgroundSize = '972px 106px'; // 1.5x larger (648*1.5 x 71*1.5)
                    spriteContainer.style.backgroundPosition = `-${this.currentFrame * this.attackFrameWidth * this.scale}px 0px`;
                    
                    // Trigger damage on frame 4 (middle of the attack)
                    if (this.currentFrame === 4) {
                        const damageEvent = new CustomEvent('enemyAttackFrame', {
                            detail: { enemyId: this.id }
                        });
                        document.dispatchEvent(damageEvent);
                    }
                    
                    this.currentFrame++;
                }
            } else {
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
        
        this.isHurt = true;
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

        // Set up hurt animation properties
        spriteContainer.style.backgroundImage = `url('${this.hurtSpriteSheet}')`;
        spriteContainer.style.backgroundSize = this.getBackgroundSize();
        spriteContainer.style.backgroundPosition = '0px 0px';

        const hurtInterval = setInterval(() => {
            if (hurtFrame >= this.totalFrames) {
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

            spriteContainer.style.backgroundPosition = `-${hurtFrame * this.frameWidth * this.scale}px 0px`;
            hurtFrame++;
        }, this.animationSpeed);
    }

    playDeathAnimation() {
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
        }

        const spriteContainer = this.element.querySelector('.enemy-sprite');
        if (!spriteContainer) return;

        // Store original properties
        const originalSpriteSheet = spriteContainer.style.backgroundImage;
        const originalPosition = spriteContainer.style.backgroundPosition;
        const originalSize = spriteContainer.style.backgroundSize;

        // Set up death animation properties
        spriteContainer.style.backgroundImage = `url('${this.deathSpriteSheet}')`;
        spriteContainer.style.backgroundSize = this.getDeathBackgroundSize();
        spriteContainer.style.backgroundPosition = '0px 0px';

        let deathFrame = 0;

        const deathInterval = setInterval(() => {
            if (deathFrame >= this.deathTotalFrames) {
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

            spriteContainer.style.backgroundPosition = `-${deathFrame * this.deathFrameWidth * this.scale}px 0px`;
            deathFrame++;
        }, this.animationSpeed);
    }
} 