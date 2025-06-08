/**
 * Base Enemy class for handling common enemy functionality
 */
export class Enemy {
    constructor(id, health, spriteSheet, game) {
        this.id = id;
        this.health = health;
        this.maxHealth = health;
        this.spriteSheet = spriteSheet;
        this.game = game; // Store game instance
        this.currentFrame = 0;
        this.element = null;
        this.animationInterval = null;
        this.isAttacking = false;
        this.isHurt = false;
        this.originalPosition = null;

        // Preload the sprite sheet
        this.preloadSprite();
    }

    preloadSprite() {
        const img = new Image();
        img.onload = () => {
            console.log('Sprite sheet loaded successfully:', this.spriteSheet);
            if (this.element) {
                const spriteContainer = this.element.querySelector('.enemy-sprite');
                if (spriteContainer) {
                    spriteContainer.style.backgroundImage = `url('${this.spriteSheet}')`;
                }
            }
        };
        img.onerror = () => {
            console.error('Failed to load sprite sheet:', this.spriteSheet);
        };
        img.src = this.spriteSheet;
    }

    createEnemyElement() {
        console.log('Creating enemy element for:', this.spriteSheet);
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
        spriteContainer.style.top = '0px';
        spriteContainer.style.transition = 'left 0.3s ease-out';
        
        // Create stats container
        const statsContainer = document.createElement('div');
        statsContainer.className = 'character-stats';
        statsContainer.style.position = 'absolute';
        statsContainer.style.left = '0';
        statsContainer.style.top = '100px'; // Move health text just a little bit lower below the sprite
        statsContainer.style.width = '100%';
        statsContainer.style.pointerEvents = 'none';
        statsContainer.innerHTML = `
            <div class=\"health-text\" style=\"position: absolute; top: 0; left: 40%; transform: translateX(-50%); font-size: 16px; color: white; font-weight: bold; text-shadow: 1px 1px 2px #000;\">${this.health}/${this.maxHealth}</div>
        `;

        spriteContainer.appendChild(statsContainer);
        enemyElement.appendChild(spriteContainer);
        this.element = enemyElement;
        
        // Start animation
        this.startIdleAnimation();
        
        return enemyElement;
    }

    // Abstract methods to be implemented by subclasses
    getBackgroundSize() {
        throw new Error('getBackgroundSize must be implemented by subclass');
    }

    getTransform() {
        throw new Error('getTransform must be implemented by subclass');
    }

    startIdleAnimation() {
        throw new Error('startIdleAnimation must be implemented by subclass');
    }

    playAttackAnimation() {
        throw new Error('playAttackAnimation must be implemented by subclass');
    }

    playHurtAnimation() {
        throw new Error('playHurtAnimation must be implemented by subclass');
    }

    playDeathAnimation() {
        throw new Error('playDeathAnimation must be implemented by subclass');
    }

    updateHealth(newHealth) {
        this.health = Math.max(0, Math.min(newHealth, this.maxHealth));
        if (this.element) {
            const healthBarFill = this.element.querySelector('.health-bar-fill');
            if (healthBarFill) {
                healthBarFill.style.width = `${(this.health / this.maxHealth) * 100}%`;
            }
            const healthText = this.element.querySelector('.health-text');
            if (healthText) {
                healthText.textContent = `${this.health}/${this.maxHealth}`;
            }
        }
    }

    takeDamage(amount) {
        this.updateHealth(this.health - amount);
        if (this.health <= 0) {
            // If enemy will die, don't play hurt animation
            return true;
        }
        this.playHurtAnimation();
        return false;
    }

    destroy() {
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
        }
        if (this.element) {
            this.playDeathAnimation();
        }
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

        let distanceToMove;
        // Add class-specific offset
        if (this.constructor.name === 'Executioner') {
            // Add 100px offset for Executioner to keep it further away
            distanceToMove = playerHitboxRight - enemyRect.right + 100;
        } else if (this.constructor.name === 'Skeleton') {
            // Move skeleton so its LEFT edge aligns with the player's hitbox, minus an even larger offset
            distanceToMove = playerHitboxRight - enemyRect.left - 150;
        } else if (this.constructor.name === 'Goblin') {
            // Add a 5px offset to keep goblin very close to the player
            distanceToMove = playerHitboxRight - enemyRect.right - 5;
        } else if (this.constructor.name === 'Werewolf') {
            // Use the werewolf's specific hitbox offset
            distanceToMove = playerHitboxRight - enemyRect.right + (this.getHitboxOffsetX ? this.getHitboxOffsetX() : 0);
        } else {
            // Default: move right edge to player's hitbox
            distanceToMove = playerHitboxRight - enemyRect.right;
        }

        return distanceToMove;
    }
} 