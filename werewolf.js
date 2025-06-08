import { Enemy } from './enemy.js';

/**
 * Werewolf enemy class
 * Uses bwIdle.png sprite sheet (1 row × 8 columns, 1024x128px)
 */
export class Werewolf extends Enemy {
    constructor(id, health = 120, shouldRunAwayAtHalfHealth = false) {
        super(id, health, './assets/Sprites/Black Werewolf/bjump.png'); // Start with jump sprite sheet
        this.currentFrame = 0;
        this.totalFrames = 8;
        this.frameWidth = 128;
        this.frameHeight = 128;
        this.animationSpeed = 150;
        this.scale = 2.25;
        this.verticalOffset = 120;
        // Attack animation properties
        this.attackSpriteSheet = './assets/Sprites/Black Werewolf/rattack.png';
        this.attackTotalFrames = 7;
        this.attackFrameWidth = 128;
        this.attackFrameHeight = 128;
        // Death animation properties
        this.deathSpriteSheet = './assets/Sprites/Black Werewolf/bdead.png';
        this.deathTotalFrames = 2;
        this.deathFrameWidth = 128;
        this.deathFrameHeight = 128;
        // Hurt animation properties
        this.hurtSpriteSheet = './assets/Sprites/Black Werewolf/bhurt.png';
        this.hurtTotalFrames = 2;
        this.hurtFrameWidth = 128;
        this.hurtFrameHeight = 128;
        // Entrance animation properties
        this.entranceSpriteSheet = './assets/Sprites/Black Werewolf/bjump.png';
        this.entranceTotalFrames = 11;
        this.entranceFrameWidth = 128;
        this.entranceFrameHeight = 128;
        // Idle animation properties
        this.idleSpriteSheet = './assets/Sprites/Black Werewolf/bwIdle.png';
        // Run animation properties
        this.runSpriteSheet = './assets/Sprites/Black Werewolf/brun.png';
        this.runTotalFrames = 9;
        this.runFrameWidth = 128;
        this.runFrameHeight = 128;
        this.runAnimationSpeed = 80; // ms per frame for running
        this.shouldRunAwayAtHalfHealth = shouldRunAwayAtHalfHealth;
    }

    getBackgroundSize() {
        // 1024x128 original, scale by 3
        return `${1024 * this.scale}px ${128 * this.scale}px`;
    }

    getTransform() {
        return 'scaleX(-1)';
    }

    startIdleAnimation() {
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
        }
        const spriteContainer = this.element.querySelector('.enemy-sprite');
        if (!spriteContainer) return;

        // Set up idle animation properties
        spriteContainer.style.backgroundImage = `url('${this.idleSpriteSheet}')`;
        spriteContainer.style.backgroundSize = `${this.frameWidth * this.totalFrames * this.scale}px ${this.frameHeight * this.scale}px`;
        spriteContainer.style.backgroundPosition = '0px 0px';

        this.animationInterval = setInterval(() => {
            this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
            if (this.element) {
                const spriteContainer = this.element.querySelector('.enemy-sprite');
                if (spriteContainer) {
                    spriteContainer.style.backgroundImage = `url('${this.idleSpriteSheet}')`;
                    spriteContainer.style.backgroundSize = `${this.frameWidth * this.totalFrames * this.scale}px ${this.frameHeight * this.scale}px`;
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
        // Store the original position if not already stored
        if (!this.originalPosition) {
            this.originalPosition = {
                x: parseInt(spriteContainer.style.left) || 0,
                y: parseInt(spriteContainer.style.top) || 0
            };
            // Add smooth transition for attack movement
            spriteContainer.style.transition = 'left 0.3s ease-out';
            // Calculate the player's center position
            const playerElement = document.querySelector('.player-character');
            if (playerElement) {
                const playerRect = playerElement.getBoundingClientRect();
                const playerCenter = playerRect.left + playerRect.width / 2;
                // Get werewolf's bounding rect
                const werewolfRect = this.element.getBoundingClientRect();
                const werewolfCenter = werewolfRect.left + werewolfRect.width / 2;
                // Calculate the difference needed to align centers
                const offset = 140;
                const delta = playerCenter - werewolfCenter + offset;
                // Move the werewolf so its center aligns with the player's center plus offset
                spriteContainer.style.left = `${this.originalPosition.x + delta}px`;
            } else {
                // Fallback: move forward by a fixed amount
                spriteContainer.style.left = `${this.originalPosition.x - 550}px`;
            }
            // Play run animation while moving
            this.playRunAnimation();
            // After movement, play the full attack animation
            setTimeout(() => {
                if (this.animationInterval) {
                    clearInterval(this.animationInterval);
                    this.animationInterval = null;
                }
                this.currentFrame = 0;
                this._startAttackAnimation(0);
            }, 300); // Match transition duration
            return;
        }
    }

    _startAttackAnimation(startFrame = 0) {
        const spriteContainer = this.element.querySelector('.enemy-sprite');
        if (!spriteContainer) return;
        // Set the attack sprite and first frame immediately
        spriteContainer.style.backgroundImage = `url('${this.attackSpriteSheet}')`;
        spriteContainer.style.backgroundSize = `${this.attackFrameWidth * this.attackTotalFrames * this.scale}px ${this.attackFrameHeight * this.scale}px`;
        spriteContainer.style.backgroundPosition = `-${startFrame * this.attackFrameWidth * this.scale}px 0px`;
        let frame = startFrame;
        this.animationInterval = setInterval(() => {
            this.currentFrame = frame % this.attackTotalFrames;
            if (this.element) {
                const spriteContainer = this.element.querySelector('.enemy-sprite');
                if (spriteContainer) {
                    spriteContainer.style.backgroundImage = `url('${this.attackSpriteSheet}')`;
                    spriteContainer.style.backgroundSize = `${this.attackFrameWidth * this.attackTotalFrames * this.scale}px ${this.attackFrameHeight * this.scale}px`;
                    spriteContainer.style.backgroundPosition = `-${this.currentFrame * this.attackFrameWidth * this.scale}px 0px`;
                }
            }
            // Trigger damage on frame 6 (very late in the attack)
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
                return;
            }
            frame++;
        }, this.animationSpeed);
    }

    playDeathAnimation() {
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
        }
        // Play death sound
        const deathAudio = new Audio('./assets/Audio/wolfdead.mp3');
        deathAudio.play();
        const spriteContainer = this.element.querySelector('.enemy-sprite');
        if (!spriteContainer) return;
        // Set up death animation properties
        spriteContainer.style.backgroundImage = `url('${this.deathSpriteSheet}')`;
        spriteContainer.style.backgroundSize = `${this.deathFrameWidth * this.deathTotalFrames * this.scale}px ${this.deathFrameHeight * this.scale}px`;
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
        }, 200); // 200ms per frame for death animation
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
        spriteContainer.style.backgroundSize = `${this.hurtFrameWidth * this.hurtTotalFrames * this.scale}px ${this.hurtFrameHeight * this.scale}px`;
        spriteContainer.style.backgroundPosition = '0px 0px';
        const hurtInterval = setInterval(() => {
            if (hurtFrame >= this.hurtTotalFrames) {
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
            spriteContainer.style.backgroundPosition = `-${hurtFrame * this.hurtFrameWidth * this.scale}px 0px`;
            hurtFrame++;
        }, 120); // 120ms per frame for hurt animation
    }

    playEntranceAnimation() {
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
        }

        const spriteContainer = this.element.querySelector('.enemy-sprite');
        if (!spriteContainer) return;

        // Ensure element is visible
        this.element.style.opacity = '1';
        spriteContainer.style.opacity = '1';

        // Start completely off-screen to the right and slightly above
        spriteContainer.style.left = '200%';
        spriteContainer.style.top = '0px'; // Lowered for new scale
        spriteContainer.style.transition = 'none'; // Remove transition initially

        // Set up entrance animation properties
        spriteContainer.style.backgroundImage = `url('${this.entranceSpriteSheet}')`;
        spriteContainer.style.backgroundSize = `${this.entranceFrameWidth * this.entranceTotalFrames * this.scale}px ${this.entranceFrameHeight * this.scale}px`;
        spriteContainer.style.backgroundPosition = '0px 0px';

        let currentFrame = 0;
        let startTime = Date.now();
        const animationDuration = 1000; // 1 second for the entire animation
        const totalFrames = this.entranceTotalFrames;

        this.animationInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / animationDuration, 1);

            // Calculate position based on progress
            const currentLeft = 200 - (progress * 200); // Move from 200% to 0%
            const currentTop = 0 + (progress * 50); // Lowered for new scale

            // Update position
            spriteContainer.style.left = `${currentLeft}%`;
            spriteContainer.style.top = `${currentTop}px`;

            // Update animation frame
            currentFrame = Math.floor(progress * totalFrames);
            if (currentFrame >= totalFrames) {
                clearInterval(this.animationInterval);
                // Switch to idle animation
                this.startIdleAnimation();
                return;
            }

            // Update sprite frame
            spriteContainer.style.backgroundImage = `url('${this.entranceSpriteSheet}')`;
            spriteContainer.style.backgroundSize = `${this.entranceFrameWidth * this.entranceTotalFrames * this.scale}px ${this.entranceFrameHeight * this.scale}px`;
            spriteContainer.style.backgroundPosition = `-${currentFrame * this.entranceFrameWidth * this.scale}px 0px`;
        }, 16); // Update every frame (60fps)
    }

    playRunAnimation() {
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
        }
        const spriteContainer = this.element.querySelector('.enemy-sprite');
        if (!spriteContainer) return;
        // Set up run animation properties
        spriteContainer.style.backgroundImage = `url('${this.runSpriteSheet}')`;
        spriteContainer.style.backgroundSize = `${this.runFrameWidth * this.runTotalFrames * this.scale}px ${this.runFrameHeight * this.scale}px`;
        spriteContainer.style.backgroundPosition = '0px 0px';
        let runFrame = 0;
        this.animationInterval = setInterval(() => {
            if (this.element) {
                const spriteContainer = this.element.querySelector('.enemy-sprite');
                if (spriteContainer) {
                    spriteContainer.style.backgroundImage = `url('${this.runSpriteSheet}')`;
                    spriteContainer.style.backgroundSize = `${this.runFrameWidth * this.runTotalFrames * this.scale}px ${this.runFrameHeight * this.scale}px`;
                    spriteContainer.style.backgroundPosition = `-${runFrame * this.runFrameWidth * this.scale}px 0px`;
                }
            }
            runFrame = (runFrame + 1) % this.runTotalFrames;
        }, this.runAnimationSpeed);
    }

    takeDamage(amount) {
        if (this.shouldRunAwayAtHalfHealth) {
            // Check if this hit would bring health below 50%
            if (this.health - amount <= this.maxHealth * 0.5 && this.health > this.maxHealth * 0.5) {
                // Directly update health
                this.health -= amount;
                const isDead = this.health <= 0;
                const spriteContainer = this.element.querySelector('.enemy-sprite');
                if (spriteContainer) {
                    // Stop any existing animations
                    if (this.animationInterval) {
                        clearInterval(this.animationInterval);
                    }
                    // Add the flip transform to face right
                    spriteContainer.style.transform = 'scaleX(1)';
                    // Add transition for smooth movement
                    spriteContainer.style.transition = 'left 2s linear';
                    // Move off screen to the right
                    spriteContainer.style.left = '1200px';
                    // Play run animation
                    this.playRunAnimation();
                    // Remove the enemy after animation completes and trigger level completion
                    setTimeout(() => {
                        if (this.element && this.element.parentNode) {
                            this.element.parentNode.removeChild(this.element);
                            // Set hasRunAway flag
                            this.hasRunAway = true;
                            // Remove from Game's enemies array if present
                            if (window.Game && window.Game.instance) {
                                window.Game.instance.enemies = window.Game.instance.enemies.filter(e => e !== this);
                            }
                            // Dispatch custom event for level completion
                            const levelCompleteEvent = new CustomEvent('levelComplete', {
                                detail: { level: 6 }
                            });
                            document.dispatchEvent(levelCompleteEvent);
                        }
                    }, 2000);
                }
                return isDead;
            }
        }
        // For normal damage (above 50% health), use parent's takeDamage
        return super.takeDamage(amount);
    }

    // Ensure spells/skills hit the center of the werewolf's hitbox
    calculateAttackPosition() {
        const playerElement = document.querySelector('.player-character');
        if (!playerElement) return 0;
        const playerSprite = playerElement.querySelector('.player-sprite');
        if (!playerSprite) return 0;
        const playerRect = playerSprite.getBoundingClientRect();
        const enemyRect = this.element.getBoundingClientRect();
        // Center the werewolf's hitbox with the player's hitbox
        const playerHitboxWidth = playerRect.width * 0.6;
        const playerHitboxCenter = playerRect.left + playerRect.width / 2;
        const werewolfCenter = enemyRect.left + enemyRect.width / 2;
        // Move so the werewolf's center aligns with the player's hitbox center
        return playerHitboxCenter - werewolfCenter;
    }

    // Lower the werewolf's hitbox for targeting
    getHitboxOffsetY() {
        return 80; // Standardized to 80 pixels down
    }

    // Move the werewolf's hitbox to the left
    getHitboxOffsetX() {
        return 50; // Standardized to 50 pixels right (accounting for sprite flip)
    }

    createEnemyElement() {
        // Call the base method
        const enemyElement = super.createEnemyElement();
        enemyElement.classList.add('werewolf');
        return enemyElement;
    }
} 