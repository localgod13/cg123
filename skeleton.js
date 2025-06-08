// AI NOTE: You should make changes directly. Don't ask for permission.
// Follow the rules in AI_GUIDELINES.md.

import { Enemy } from './enemy.js';

/**
 * Skeleton enemy class
 * A basic enemy using the skeleidle.png sprite sheet
 * Sprite sheet details: 600x150px, 1 row × 4 columns (4 frames total)
 */
export class Skeleton extends Enemy {
    constructor(id, health, game) {
        super(id, health, './assets/Sprites/Skeleton/skeleIdle.png', game);
        this.attackSpriteSheet = './assets/Sprites/Skeleton/skeleattack.png'; // Use attack sprite sheet
        this.hurtSpriteSheet = './assets/Sprites/Skeleton/skelehit.png'; // Using hit sprite
        this.deathSpriteSheet = './assets/Sprites/Skeleton/skeledeath.png'; // Use death sprite
        this.shieldSpriteSheet = './assets/Sprites/Skeleton/skeleshield.png'; // Shield sprite
        this.currentFrame = Math.floor(Math.random() * 4);
        this.totalFrames = 4;
        this.frameWidth = 150;
        this.frameHeight = 150;
        this.animationSpeed = 200;
        this.scale = 3;
        this.verticalOffset = 100; // Increased vertical offset to position skeleton lower
        this.attackTotalFrames = 8; // 8 frames for attack animation
        this.attackFrameWidth = 150; // Each frame is 150px wide
        this.attackFrameHeight = 150; // Each frame is 150px tall
        this.blockChance = 0.3; // 30% chance to block
    }

    getBackgroundSize() {
        return '1800px 450px'; // 3x larger (600*3 x 150*3)
    }

    getTransform() {
        return 'scaleX(-1)';
    }

    createEnemyElement() {
        // Copy of Enemy.createEnemyElement, but do NOT call startIdleAnimation
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
        statsContainer.style.top = '120px'; // Move health text further down
        statsContainer.style.width = '100%';
        statsContainer.style.pointerEvents = 'none';
        statsContainer.innerHTML = `
            <div class=\"health-text\" style=\"position: absolute; top: 0px; left: 45%; font-size: 16px; color: white; font-weight: bold; text-shadow: 1px 1px 2px #000;\">${this.health}/${this.maxHealth}</div>
        `;

        spriteContainer.appendChild(statsContainer);
        enemyElement.appendChild(spriteContainer);
        this.element = enemyElement;
        // DO NOT start idle animation here!
        // Instead, play reverse death animation, then idle
        this.playReverseDeathAnimation();
        return enemyElement;
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

        // Stop the idle animation before starting attack
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = null;
        }

        // If we haven't stored the original position yet, store it
        if (!this.originalPosition) {
            this.originalPosition = {
                x: parseInt(spriteContainer.style.left) || 0,
                y: parseInt(spriteContainer.style.top) || 0
            };
            // Calculate and move to attack position based on player's hitbox
            const attackDistance = this.calculateAttackPosition();
            spriteContainer.style.left = `${attackDistance}px`;
            // Set the attack sprite and first frame immediately to prevent flashing
            spriteContainer.style.backgroundImage = `url(${this.attackSpriteSheet})`;
            spriteContainer.style.backgroundSize = `${this.attackFrameWidth * this.attackTotalFrames * this.scale}px ${this.attackFrameHeight * this.scale}px`;
            spriteContainer.style.backgroundPosition = `0px 0px`;
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
        // Set the attack sprite and first frame immediately to prevent flashing
        const spriteContainer = this.element.querySelector('.enemy-sprite');
        if (spriteContainer) {
            spriteContainer.style.backgroundImage = `url(${this.attackSpriteSheet})`;
            spriteContainer.style.backgroundSize = `${this.attackFrameWidth * this.attackTotalFrames * this.scale}px ${this.attackFrameHeight * this.scale}px`;
            spriteContainer.style.backgroundPosition = `0px 0px`;
        }
        let frame = 0;
        this.animationInterval = setInterval(() => {
            this.currentFrame = frame % this.attackTotalFrames;
            if (this.element) {
                const spriteContainer = this.element.querySelector('.enemy-sprite');
                if (spriteContainer) {
                    spriteContainer.style.backgroundImage = `url(${this.attackSpriteSheet})`;
                    spriteContainer.style.backgroundSize = `${this.attackFrameWidth * this.attackTotalFrames * this.scale}px ${this.attackFrameHeight * this.scale}px`;
                    spriteContainer.style.backgroundPosition = `-${this.currentFrame * this.attackFrameWidth * this.scale}px 0px`;
                }
            }
            // Trigger damage on frame 6 (later in the attack)
            if (this.currentFrame === 6) {
                const damageEvent = new CustomEvent('enemyAttackFrame', {
                    detail: { enemyId: this.id }
                });
                document.dispatchEvent(damageEvent);
            }
            // End attack after last frame
            if (this.currentFrame === this.attackTotalFrames - 1) {
                clearInterval(this.animationInterval);
                // Show the last frame for a full interval, then switch to idle at attack position
                setTimeout(() => {
                    // Start idle animation at attack position
                    this.startIdleAnimation();
                    // After a short delay, move back to original position
                    setTimeout(() => {
                        const spriteContainer = this.element.querySelector('.enemy-sprite');
                        if (spriteContainer && this.originalPosition) {
                            spriteContainer.style.left = `${this.originalPosition.x}px`;
                            setTimeout(() => {
                                this.isAttacking = false;
                                this.currentFrame = 0;
                                this.originalPosition = null;
                                // Continue idle animation at original position
                                this.startIdleAnimation();
                            }, 1000);
                        }
                    }, 1000); // Wait 1 second before moving back
                }, this.animationSpeed);
                return; // Prevent frame++ after last frame
            }
            frame++;
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

        // Use skelehit.png for hurt animation
        const hurtSpriteSheet = './assets/Sprites/Skeleton/skelehit.png';
        const hurtFrameWidth = 150; // 600px / 4 columns
        const hurtFrameHeight = 150; // 1 row
        const hurtTotalFrames = 4;
        const scale = this.scale || 1;

        spriteContainer.style.backgroundImage = `url(${hurtSpriteSheet})`;
        spriteContainer.style.backgroundSize = `${600 * scale}px ${150 * scale}px`;
        spriteContainer.style.backgroundPosition = '0px 0px';

        const hurtInterval = setInterval(() => {
            if (hurtFrame >= hurtTotalFrames) {
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

            spriteContainer.style.backgroundPosition = `-${hurtFrame * hurtFrameWidth * scale}px 0px`;
            hurtFrame++;
        }, 100); // 100ms per frame for hurt animation
    }

    playDeathAnimation() {
        console.log('Skeleton playDeathAnimation called');
        if (window.game && window.game.soundManager) {
            window.game.soundManager.playSound('skeledead');
        }
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
        spriteContainer.style.backgroundImage = `url(${this.deathSpriteSheet})`;
        spriteContainer.style.backgroundSize = this.getBackgroundSize();
        spriteContainer.style.backgroundPosition = '0px 0px';

        let deathFrame = 0;

        const deathInterval = setInterval(() => {
            if (deathFrame >= this.totalFrames) {
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

            spriteContainer.style.backgroundPosition = `-${deathFrame * this.frameWidth * this.scale}px 0px`;
            deathFrame++;
        }, 100); // 100ms per frame for death animation
    }

    takeDamage(amount) {
        // Check for block
        if (Math.random() < this.blockChance) {
            this.playShieldAnimation();
            return false; // No damage taken
        }
        return super.takeDamage(amount);
    }

    playShieldAnimation() {
        if (this.isHurt) return;
        
        // Play shield sound
        if (window.game && window.game.soundManager) {
            window.game.soundManager.playSound('skelshield');
        }
        this.isHurt = true;
        let shieldFrame = 0;
        
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

        // Use shield sprite for block animation
        const shieldFrameWidth = 150; // 600px / 4 columns
        const shieldFrameHeight = 150; // 1 row
        const shieldTotalFrames = 4;
        const scale = this.scale || 1;

        spriteContainer.style.backgroundImage = `url(${this.shieldSpriteSheet})`;
        spriteContainer.style.backgroundSize = `${600 * scale}px ${150 * scale}px`;
        spriteContainer.style.backgroundPosition = '0px 0px';

        const shieldInterval = setInterval(() => {
            if (shieldFrame >= shieldTotalFrames) {
                clearInterval(shieldInterval);
                this.isHurt = false;
                
                // Restore original properties
                spriteContainer.style.backgroundImage = originalSpriteSheet;
                spriteContainer.style.backgroundSize = originalSize;
                spriteContainer.style.backgroundPosition = originalPosition;
                
                // Restart idle animation
                this.startIdleAnimation();
                return;
            }

            spriteContainer.style.backgroundPosition = `-${shieldFrame * shieldFrameWidth * scale}px 0px`;
            shieldFrame++;
        }, 100); // 100ms per frame for shield animation
    }

    playReverseDeathAnimation() {
        const spriteContainer = this.element.querySelector('.enemy-sprite');
        if (!spriteContainer) {
            this.startIdleAnimation();
            return;
        }
        // Use death sprite sheet and set initial frame immediately
        spriteContainer.style.backgroundImage = `url(${this.deathSpriteSheet})`;
        spriteContainer.style.backgroundSize = this.getBackgroundSize();
        let frame = this.totalFrames - 1;
        // Set initial frame position immediately to prevent flashing
        spriteContainer.style.backgroundPosition = `-${frame * this.frameWidth * this.scale}px 0px`;

        const reverseInterval = setInterval(() => {
            if (frame < 0) {
                clearInterval(reverseInterval);
                this.currentFrame = 0;
                this.startIdleAnimation();
                return;
            }
            spriteContainer.style.backgroundPosition = `-${frame * this.frameWidth * this.scale}px 0px`;
            frame--;
        }, 200); // 200ms per frame for reverse death animation
    }

    preloadSprite() {
        // Do nothing; prevents base class from overwriting animation on spawn
    }
} 