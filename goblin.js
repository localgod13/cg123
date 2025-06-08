import { Enemy } from './enemy.js';

/**
 * Goblin enemy class
 * Uses gidle.png sprite sheet (1 row × 4 columns, 600x150px)
 * Uses gattack.png sprite sheet (1 row × 8 columns, 1200x150px)
 * Uses ghit.png sprite sheet (1 row × 4 columns, 600x150px)
 * Uses gdeath.png sprite sheet (1 row × 4 columns, 600x150px)
 * Uses grun.png sprite sheet (1 row × 8 columns, 1200x150px)
 */
export class Goblin extends Enemy {
    constructor(id, health, game) {
        super(id, health, '/assets/Sprites/Goblin/gidle.png', game);
        this.attackSpriteSheet = '/assets/Sprites/Goblin/gattack.png';
        this.hurtSpriteSheet = '/assets/Sprites/Goblin/ghit.png';
        this.deathSpriteSheet = '/assets/Sprites/Goblin/gdeath.png';
        this.currentFrame = Math.floor(Math.random() * 4);
        this.totalFrames = 4;
        this.frameWidth = 150;
        this.frameHeight = 150;
        this.animationSpeed = 200;
        this.attackAnimationSpeed = 100; // Faster attack animation speed
        this.scale = 3;
        this.verticalOffset = 100; // Decreased vertical offset to position goblin higher
        this.attackFrames = 8;
        this.attackFrameWidth = 150; // Each frame is 150px wide
        this.attackFrameHeight = 150;
        this.attackTotalWidth = 1200; // Total width of sprite sheet
        this.hurtFrames = 4;
        this.deathFrames = 4;
        this.runSpriteSheet = '/assets/Sprites/Goblin/grun.png';
        this.runFrames = 8;
        this.attackCount = 0; // Track number of attacks in current sequence
    }

    getBackgroundSize() {
        return `${this.frameWidth * this.scale * this.totalFrames}px ${this.frameHeight * this.scale}px`;
    }

    getAttackBackgroundSize() {
        return `${this.attackTotalWidth * this.scale}px ${this.attackFrameHeight * this.scale}px`;
    }

    getHurtBackgroundSize() {
        return `${this.frameWidth * this.scale * this.hurtFrames}px ${this.frameHeight * this.scale}px`;
    }

    getDeathBackgroundSize() {
        return `${this.frameWidth * this.scale * this.deathFrames}px ${this.frameHeight * this.scale}px`;
    }

    getRunBackgroundSize() {
        return `${this.attackTotalWidth * this.scale}px ${this.attackFrameHeight * this.scale}px`;
    }

    getTransform() {
        return 'scaleX(-1)';
    }

    calculateAttackPosition() {
        // Different distances based on goblin ID
        if (this.id === 3) {
            return -600; // Move furthest for third goblin
        } else if (this.id === 2) {
            return -450; // Move further for second goblin
        }
        return -300; // Normal distance for first goblin
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

    playRunAnimation() {
        return new Promise((resolve) => {
            if (!this.element) {
                resolve();
                return;
            }

            const spriteContainer = this.element.querySelector('.enemy-sprite');
            if (!spriteContainer) {
                resolve();
                return;
            }

            // Store original sprite sheet and background size
            const originalSpriteSheet = this.spriteSheet;
            const originalBackgroundSize = this.getBackgroundSize();
            const originalFrame = this.currentFrame;

            // Stop idle animation
            if (this.animationInterval) {
                clearInterval(this.animationInterval);
            }

            // Set run sprite sheet
            spriteContainer.style.backgroundImage = `url('${this.runSpriteSheet}')`;
            spriteContainer.style.backgroundSize = this.getRunBackgroundSize();
            spriteContainer.style.width = `${this.frameWidth * this.scale}px`;
            spriteContainer.style.height = `${this.frameHeight * this.scale}px`;

            let currentFrame = 0;
            const frameDuration = 100; // 100ms per frame for run animation

            const runInterval = setInterval(() => {
                if (currentFrame >= this.runFrames) {
                    clearInterval(runInterval);
                    
                    // Restore original sprite sheet and animation
                    spriteContainer.style.backgroundImage = `url('${originalSpriteSheet}')`;
                    spriteContainer.style.backgroundSize = originalBackgroundSize;
                    spriteContainer.style.width = `${this.frameWidth * this.scale}px`;
                    spriteContainer.style.height = `${this.frameHeight * this.scale}px`;
                    spriteContainer.style.backgroundPosition = `-${originalFrame * this.frameWidth * this.scale}px 0px`;
                    this.currentFrame = originalFrame;
                    this.startIdleAnimation();
                    
                    resolve();
                    return;
                }

                // Calculate the correct position for each frame
                const framePosition = (currentFrame * this.frameWidth * this.scale);
                spriteContainer.style.backgroundPosition = `-${framePosition}px 0px`;
                currentFrame++;
            }, frameDuration);

            // Set initial frame position
            spriteContainer.style.backgroundPosition = '0px 0px';
        });
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
            // Calculate and move to attack position based on player's hitbox
            const attackDistance = this.calculateAttackPosition();
            spriteContainer.style.left = `${currentLeft + attackDistance}px`;
            // Set the attack sprite and first frame immediately to prevent flashing
            spriteContainer.style.backgroundImage = `url(${this.attackSpriteSheet})`;
            spriteContainer.style.backgroundSize = this.getAttackBackgroundSize();
            spriteContainer.style.backgroundPosition = '0px 0px';
            // Wait for movement to complete before starting attack animation
            setTimeout(() => {
                this.currentFrame = 0;
                this.startAttackAnimation();
            }, 300); // Match transition duration
            return;
        }
    }

    startAttackAnimation() {
        const spriteContainer = this.element.querySelector('.enemy-sprite');
        if (!spriteContainer) return;

        let currentFrame = 0;
        this.animationInterval = setInterval(() => {
            if (currentFrame >= this.attackFrames) {
                clearInterval(this.animationInterval);
                
                // Check if we should do a second attack (50% chance)
                if (this.attackCount === 0 && Math.random() < 0.5) {
                    this.attackCount = 1;
                    // Start second attack immediately
                    this.currentFrame = 0;
                    this.startAttackAnimation();
                    return;
                }
                
                // Return to original position
                if (this.originalPosition) {
                    spriteContainer.style.left = `${this.originalPosition.x}px`;
                    setTimeout(() => {
                        // Restore original sprite sheet and animation
                        spriteContainer.style.backgroundImage = `url('${this.spriteSheet}')`;
                        spriteContainer.style.backgroundSize = this.getBackgroundSize();
                        spriteContainer.style.backgroundPosition = '0px 0px';
                        this.currentFrame = 0;
                        this.startIdleAnimation();
                        this.originalPosition = null;
                        this.isAttacking = false;
                        this.attackCount = 0;
                    }, 200); // Reduced return animation time
                }
                return;
            }

            // Update sprite position
            spriteContainer.style.backgroundPosition = `-${currentFrame * this.attackFrameWidth * this.scale}px 0px`;
            
            // Trigger damage on frame 4 (middle of the attack)
            if (currentFrame === 4) {
                const damageEvent = new CustomEvent('enemyAttackFrame', {
                    detail: { enemyId: this.id }
                });
                document.dispatchEvent(damageEvent);
            }
            
            currentFrame++;
        }, this.attackAnimationSpeed); // Use faster attack animation speed
    }

    playHurtAnimation() {
        return new Promise((resolve) => {
            if (!this.element) {
                resolve();
                return;
            }

            const spriteContainer = this.element.querySelector('.enemy-sprite');
            if (!spriteContainer) {
                resolve();
                return;
            }

            // Play hurt sound
            this.game.soundManager.playSound('ghit');

            // Store original sprite sheet and background size
            const originalSpriteSheet = this.spriteSheet;
            const originalBackgroundSize = this.getBackgroundSize();
            const originalFrame = this.currentFrame;

            // Stop idle animation
            if (this.animationInterval) {
                clearInterval(this.animationInterval);
            }

            // Set hurt sprite sheet
            spriteContainer.style.backgroundImage = `url('${this.hurtSpriteSheet}')`;
            spriteContainer.style.backgroundSize = this.getHurtBackgroundSize();
            spriteContainer.style.width = `${this.frameWidth * this.scale}px`;
            spriteContainer.style.height = `${this.frameHeight * this.scale}px`;

            let currentFrame = 0;
            const frameDuration = 100; // 100ms per frame for hurt animation

            const hurtInterval = setInterval(() => {
                if (currentFrame >= this.hurtFrames) {
                    clearInterval(hurtInterval);
                    
                    // Restore original sprite sheet and animation
                    spriteContainer.style.backgroundImage = `url('${originalSpriteSheet}')`;
                    spriteContainer.style.backgroundSize = originalBackgroundSize;
                    spriteContainer.style.width = `${this.frameWidth * this.scale}px`;
                    spriteContainer.style.height = `${this.frameHeight * this.scale}px`;
                    spriteContainer.style.backgroundPosition = `-${originalFrame * this.frameWidth * this.scale}px 0px`;
                    this.currentFrame = originalFrame;
                    this.startIdleAnimation();
                    
                    resolve();
                    return;
                }

                // Calculate the correct position for each frame
                const framePosition = (currentFrame * this.frameWidth * this.scale);
                spriteContainer.style.backgroundPosition = `-${framePosition}px 0px`;
                currentFrame++;
            }, frameDuration);

            // Set initial frame position
            spriteContainer.style.backgroundPosition = '0px 0px';
        });
    }

    playDeathAnimation() {
        return new Promise((resolve) => {
            if (!this.element) {
                resolve();
                return;
            }

            const spriteContainer = this.element.querySelector('.enemy-sprite');
            if (!spriteContainer) {
                resolve();
                return;
            }

            // Play death sound
            this.game.soundManager.playSound('goblindeath');

            // Stop any existing animations
            if (this.animationInterval) {
                clearInterval(this.animationInterval);
            }

            // Set death sprite sheet
            spriteContainer.style.backgroundImage = `url('${this.deathSpriteSheet}')`;
            spriteContainer.style.backgroundSize = this.getDeathBackgroundSize();
            spriteContainer.style.width = `${this.frameWidth * this.scale}px`;
            spriteContainer.style.height = `${this.frameHeight * this.scale}px`;

            let currentFrame = 0;
            const frameDuration = 150; // Slightly slower for death animation

            const deathInterval = setInterval(() => {
                if (currentFrame >= this.deathFrames) {
                    clearInterval(deathInterval);
                    
                    // Fade out the element
                    this.element.style.transition = 'opacity 0.5s ease-out';
                    this.element.style.opacity = '0';
                    
                    // Remove the element after fade out
                    setTimeout(() => {
                        if (this.element && this.element.parentNode) {
                            this.element.parentNode.removeChild(this.element);
                        }
                        resolve();
                    }, 500);
                    return;
                }

                // Calculate the correct position for each frame
                const framePosition = (currentFrame * this.frameWidth * this.scale);
                spriteContainer.style.backgroundPosition = `-${framePosition}px 0px`;
                currentFrame++;
            }, frameDuration);

            // Set initial frame position
            spriteContainer.style.backgroundPosition = '0px 0px';
        });
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
        spriteContainer.style.top = `${this.verticalOffset}px`;
        spriteContainer.style.transition = 'left 0.3s ease-out';
        
        // Create stats container
        const statsContainer = document.createElement('div');
        statsContainer.className = 'character-stats';
        statsContainer.style.position = 'absolute';
        statsContainer.style.left = '0';
        statsContainer.style.top = '120px';
        statsContainer.style.width = '100%';
        statsContainer.style.pointerEvents = 'none';
        statsContainer.innerHTML = `
            <div class=\"health-text\" style=\"position: absolute; top: 0px; left: 45%; font-size: 16px; color: white; font-weight: bold; text-shadow: 1px 1px 2px #000;\">${this.health}/${this.maxHealth}</div>
        `;

        spriteContainer.appendChild(statsContainer);
        enemyElement.appendChild(spriteContainer);
        this.element = enemyElement;
        
        // Only play laugh sound if this is the first goblin
        const otherGoblins = this.game.enemies.filter(enemy => enemy instanceof Goblin && enemy !== this);
        if (otherGoblins.length === 0) {
            this.game.soundManager.playSound('glaugh');
        }
        
        // Start animation
        this.startIdleAnimation();
        
        return enemyElement;
    }

    destroy() {
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
        }
        if (this.element) {
            this.playDeathAnimation().then(() => {
                if (this.element && this.element.parentNode) {
                    this.element.parentNode.removeChild(this.element);
                }
            });
        }
    }
} 