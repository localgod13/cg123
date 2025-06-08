import { Scroll } from './scroll.js';

export class ScrollOfEchoingFury extends Scroll {
    constructor() {
        super('echoingFury', {
            name: 'Double all damage you deal this round.',
            description: 'Inscribed with runes that reverberate with violence, it turns whispers of power into roars of destruction.',
            icon: './assets/Images/ef.png',
            execute: (game) => {
                console.log('[DEBUG] Echoing Fury scroll used!');
                if (!game.playerBuffs) {
                    game.playerBuffs = new Set();
                }
                game.playerBuffs.add('echoingFury');
                
                // Store the original executeQueuedAttacks method
                const originalExecuteQueuedAttacks = game.executeQueuedAttacks;
                game.executeQueuedAttacks = async function() {
                    // Call the original method
                    await originalExecuteQueuedAttacks.call(this);
                    
                    // Remove the buff after all attacks are executed
                    this.playerBuffs.delete('echoingFury');
                    
                    // Remove effect from status manager
                    if (this.statusManager) {
                        this.statusManager.removeEffect('echoingFury');
                    }
                    
                    // Restore the original method
                    this.executeQueuedAttacks = originalExecuteQueuedAttacks;
                };
            }
        }, './assets/Images/bpackscroll.png');
    }
    getDisplayName() { return 'Scroll of Echoing Fury'; }

    use(game) {
        if (this.effect && typeof this.effect.execute === 'function') {
            // Add effect to status manager
            if (game.statusManager) {
                game.statusManager.addEffect(this.type, this.effect);
            }
            // Play sound effect
            if (game.soundManager) {
                game.soundManager.playSound('efury', 0.7);
            }
            this.effect.execute(game);
        }
    }

    // Override the render method to add the red "F" overlay
    render(element) {
        // Create container for the scroll image and overlay
        const container = document.createElement('div');
        container.style.position = 'relative';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.cursor = 'pointer';
        container.style.pointerEvents = 'auto';

        // Add the scroll image
        const img = document.createElement('img');
        img.src = this.imagePath;
        img.alt = this.getDisplayName();
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.draggable = true;
        img.dataset.slot = element.dataset.slot;
        img.style.pointerEvents = 'auto';
        container.appendChild(img);

        // Add the red "F" overlay
        const fOverlay = document.createElement('div');
        fOverlay.textContent = 'F';
        fOverlay.style.position = 'absolute';
        fOverlay.style.top = '45%';
        fOverlay.style.left = '50%';
        fOverlay.style.transform = 'translate(-50%, -50%)';
        fOverlay.style.color = '#000000';
        fOverlay.style.fontSize = '1.2em';
        fOverlay.style.fontWeight = 'bold';
        fOverlay.style.textShadow = '0 0 2px rgba(0, 0, 0, 0.3)';
        fOverlay.style.zIndex = '2';
        fOverlay.style.pointerEvents = 'none';
        fOverlay.style.fontFamily = 'MedievalSharp, "Old English Text MT", fantasy';
        container.appendChild(fOverlay);

        // Add tooltip container
        const tooltip = document.createElement('div');
        tooltip.className = 'scroll-tooltip';
        tooltip.style.position = 'absolute';
        tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        tooltip.style.color = 'white';
        tooltip.style.padding = '8px 12px';
        tooltip.style.borderRadius = '4px';
        tooltip.style.fontSize = '14px';
        tooltip.style.maxWidth = '200px';
        tooltip.style.zIndex = '1000';
        tooltip.style.display = 'none';
        tooltip.style.pointerEvents = 'none';
        tooltip.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
        tooltip.style.border = '1px solid rgba(255, 255, 255, 0.2)';

        // Add tooltip content
        const name = document.createElement('div');
        name.style.fontWeight = 'bold';
        name.style.marginBottom = '4px';
        name.style.color = '#ffd700';
        name.textContent = this.getDisplayName();
        
        const description = document.createElement('div');
        description.style.fontSize = '12px';
        description.style.color = '#cccccc';
        description.style.marginBottom = '8px';
        description.textContent = this.getDescription();

        const effect = document.createElement('div');
        effect.style.fontSize = '12px';
        effect.style.color = '#ff6b6b';
        effect.style.borderTop = '1px solid rgba(255, 255, 255, 0.2)';
        effect.style.paddingTop = '8px';
        effect.style.marginTop = '4px';
        effect.innerHTML = `<span style="color: #ffd700;">Effect:</span> ${this.effect?.name || 'No effect'}`;

        tooltip.appendChild(name);
        tooltip.appendChild(description);
        tooltip.appendChild(effect);

        // Add hover events
        container.addEventListener('mouseenter', (e) => {
            tooltip.style.display = 'block';
            const rect = container.getBoundingClientRect();
            tooltip.style.left = `${rect.left + (rect.width / 2)}px`;
            tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
            tooltip.style.transform = 'translateX(-50%)';
        });

        container.addEventListener('mouseleave', () => {
            tooltip.style.display = 'none';
        });

        // Add tooltip to document body
        document.body.appendChild(tooltip);

        // Drag events
        img.ondragstart = (e) => {
            e.dataTransfer.setData('text/plain', element.dataset.slot);
            container.classList.add('dragging');
            tooltip.style.display = 'none';
        };
        img.ondragend = (e) => {
            container.classList.remove('dragging');
        };

        // Add click handler to use scroll
        container.addEventListener('click', (event) => {
            if (event.detail === 0) return;
            this.use(element.closest('.backpack-container').__game);
            const backpack = element.closest('.backpack-container').__game.backpack;
            if (backpack) {
                backpack.removeItem(parseInt(element.dataset.slot));
            }
            tooltip.remove();
        });

        // Add the container to the element
        element.appendChild(container);
    }
}

export class ScrollOfUnbrokenWard extends Scroll {
    constructor() {
        super('unbrokenWard', {
            name: 'You take no damage until the start of your next turn.',
            description: 'Woven from forgotten spells of the old guardians, this scroll shields its bearer in absolute silence.',
            icon: './assets/Images/uw.png',
            execute: (game) => {
                const originalApplyEnemyDamage = game.applyEnemyDamage;
                game.applyEnemyDamage = (enemy, damage) => {
                    return;
                };
                const originalStartPlayerTurn = game.startPlayerTurn;
                game.startPlayerTurn = function() {
                    // Restore original methods
                    game.applyEnemyDamage = originalApplyEnemyDamage;
                    game.startPlayerTurn = originalStartPlayerTurn;
                    
                    // Remove effect from status manager
                    if (game.statusManager) {
                        game.statusManager.removeEffect('unbrokenWard');
                    }
                    
                    // Call original startPlayerTurn after cleanup
                    return originalStartPlayerTurn.call(game);
                };
            }
        }, './assets/Images/bpackscroll.png');
    }
    getDisplayName() { return 'Scroll of Unbroken Ward'; }

    use(game) {
        if (this.effect && typeof this.effect.execute === 'function') {
            // Add effect to status manager
            if (game.statusManager) {
                game.statusManager.addEffect(this.type, this.effect);
            }
            // Play sound effect
            if (game.soundManager) {
                game.soundManager.playSound('uward', 0.7);
            }
            this.effect.execute(game);
        }
    }

    // Override the render method to add the red "W" overlay
    render(element) {
        // Create container for the scroll image and overlay
        const container = document.createElement('div');
        container.style.position = 'relative';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.cursor = 'pointer';
        container.style.pointerEvents = 'auto';

        // Add the scroll image
        const img = document.createElement('img');
        img.src = this.imagePath;
        img.alt = this.getDisplayName();
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.draggable = true;
        img.dataset.slot = element.dataset.slot;
        img.style.pointerEvents = 'auto';
        container.appendChild(img);

        // Add the red "W" overlay
        const wOverlay = document.createElement('div');
        wOverlay.textContent = 'W';
        wOverlay.style.position = 'absolute';
        wOverlay.style.top = '45%';
        wOverlay.style.left = '50%';
        wOverlay.style.transform = 'translate(-50%, -50%)';
        wOverlay.style.color = '#000000';
        wOverlay.style.fontSize = '1.2em';
        wOverlay.style.fontWeight = 'bold';
        wOverlay.style.textShadow = '0 0 2px rgba(0, 0, 0, 0.3)';
        wOverlay.style.zIndex = '2';
        wOverlay.style.pointerEvents = 'none';
        wOverlay.style.fontFamily = 'MedievalSharp, "Old English Text MT", fantasy';
        container.appendChild(wOverlay);

        // Add tooltip container
        const tooltip = document.createElement('div');
        tooltip.className = 'scroll-tooltip';
        tooltip.style.position = 'absolute';
        tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        tooltip.style.color = 'white';
        tooltip.style.padding = '8px 12px';
        tooltip.style.borderRadius = '4px';
        tooltip.style.fontSize = '14px';
        tooltip.style.maxWidth = '200px';
        tooltip.style.zIndex = '1000';
        tooltip.style.display = 'none';
        tooltip.style.pointerEvents = 'none';
        tooltip.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
        tooltip.style.border = '1px solid rgba(255, 255, 255, 0.2)';

        // Add tooltip content
        const name = document.createElement('div');
        name.style.fontWeight = 'bold';
        name.style.marginBottom = '4px';
        name.style.color = '#ffd700';
        name.textContent = this.getDisplayName();
        
        const description = document.createElement('div');
        description.style.fontSize = '12px';
        description.style.color = '#cccccc';
        description.style.marginBottom = '8px';
        description.textContent = this.getDescription();

        const effect = document.createElement('div');
        effect.style.fontSize = '12px';
        effect.style.color = '#ff6b6b';
        effect.style.borderTop = '1px solid rgba(255, 255, 255, 0.2)';
        effect.style.paddingTop = '8px';
        effect.style.marginTop = '4px';
        effect.innerHTML = `<span style="color: #ffd700;">Effect:</span> ${this.effect?.name || 'No effect'}`;

        tooltip.appendChild(name);
        tooltip.appendChild(description);
        tooltip.appendChild(effect);

        // Add hover events
        container.addEventListener('mouseenter', (e) => {
            tooltip.style.display = 'block';
            const rect = container.getBoundingClientRect();
            tooltip.style.left = `${rect.left + (rect.width / 2)}px`;
            tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
            tooltip.style.transform = 'translateX(-50%)';
        });

        container.addEventListener('mouseleave', () => {
            tooltip.style.display = 'none';
        });

        // Add tooltip to document body
        document.body.appendChild(tooltip);

        // Drag events
        img.ondragstart = (e) => {
            e.dataTransfer.setData('text/plain', element.dataset.slot);
            container.classList.add('dragging');
            tooltip.style.display = 'none';
        };
        img.ondragend = (e) => {
            container.classList.remove('dragging');
        };

        // Add click handler to use scroll
        container.addEventListener('click', (event) => {
            if (event.detail === 0) return;
            this.use(element.closest('.backpack-container').__game);
            const backpack = element.closest('.backpack-container').__game.backpack;
            if (backpack) {
                backpack.removeItem(parseInt(element.dataset.slot));
            }
            tooltip.remove();
        });

        // Add the container to the element
        element.appendChild(container);
    }
}

export class ScrollOfTemporalGrace extends Scroll {
    constructor() {
        super('temporalGrace', {
            name: 'End your turn and immediately take another.',
            description: 'The ink bends time itself—one turn flows into the next like water down a mountain.',
            icon: './assets/Images/tg.png',
            execute: (game) => {
                // Mark that the next enemy turn should be skipped
                game.skipNextEnemyTurn = true;
                
                // Override the endTurn method to handle the turn skip
                const originalEndTurn = game.endTurn;
                game.endTurn = () => {
                    if (!game.isPlayerTurn) return;
                    
                    game.isPlayerTurn = false;
                    const endTurnBtn = document.querySelector('.end-turn-btn');
                    if (endTurnBtn) {
                        endTurnBtn.disabled = true;
                    }

                    // Execute queued attacks
                    game.executeQueuedAttacks().then(() => {
                        // If we should skip the enemy turn
                        if (game.skipNextEnemyTurn) {
                            game.skipNextEnemyTurn = false; // Reset the flag
                            // Remove effect from status manager
                            if (game.statusManager) {
                                game.statusManager.removeEffect('temporalGrace');
                            }
                            // Start the next player turn immediately
                            setTimeout(() => {
                                game.startPlayerTurn();
                            }, 1000);
                        } else {
                            // Normal enemy turn
                            setTimeout(() => {
                                game.enemyTurn();
                            }, 1000);
                        }
                    });
                };
            }
        }, './assets/Images/bpackscroll.png');
    }
    getDisplayName() { return 'Scroll of Temporal Grace'; }

    use(game) {
        if (this.cooldown > 0) return false;
        
        // Play the temporal grace sound effect
        game.soundManager.playSound('tgrace', 0.7);
        
        // Add Temporal Grace effect to player
        game.statusManager.addEffect('temporalGrace', {
            name: 'Temporal Grace',
            description: 'End your turn and immediately take another.',
            icon: this.effect.icon,
            onAttack: (damage) => {
                return Math.floor(damage * 1.5);
            },
            execute: (game) => {
                // Mark that the next enemy turn should be skipped
                game.skipNextEnemyTurn = true;
                
                // Override the endTurn method to handle the turn skip
                const originalEndTurn = game.endTurn;
                game.endTurn = () => {
                    if (!game.isPlayerTurn) return;
                    
                    game.isPlayerTurn = false;
                    const endTurnBtn = document.querySelector('.end-turn-btn');
                    if (endTurnBtn) {
                        endTurnBtn.disabled = true;
                    }

                    // Execute queued attacks
                    game.executeQueuedAttacks().then(() => {
                        // If we should skip the enemy turn
                        if (game.skipNextEnemyTurn) {
                            game.skipNextEnemyTurn = false; // Reset the flag
                            // Remove effect from status manager
                            if (game.statusManager) {
                                game.statusManager.removeEffect('temporalGrace');
                            }
                            // Start the next player turn immediately
                            setTimeout(() => {
                                game.startPlayerTurn();
                            }, 1000);
                        } else {
                            // Normal enemy turn
                            setTimeout(() => {
                                game.enemyTurn();
                            }, 1000);
                        }
                    });
                };
            }
        });
        
        // Execute the effect
        if (this.effect && typeof this.effect.execute === 'function') {
            this.effect.execute(game);
        }
        
        this.cooldown = 3;
        return true;
    }

    // Override the render method to add the red "G" overlay
    render(element) {
        // Create container for the scroll image and overlay
        const container = document.createElement('div');
        container.style.position = 'relative';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.cursor = 'pointer';
        container.style.pointerEvents = 'auto';

        // Add the scroll image
        const img = document.createElement('img');
        img.src = this.imagePath;
        img.alt = this.getDisplayName();
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.draggable = true;
        img.dataset.slot = element.dataset.slot;
        img.style.pointerEvents = 'auto';
        container.appendChild(img);

        // Add the red "G" overlay
        const gOverlay = document.createElement('div');
        gOverlay.textContent = 'G';
        gOverlay.style.position = 'absolute';
        gOverlay.style.top = '45%';
        gOverlay.style.left = '50%';
        gOverlay.style.transform = 'translate(-50%, -50%)';
        gOverlay.style.color = '#000000';
        gOverlay.style.fontSize = '1.2em';
        gOverlay.style.fontWeight = 'bold';
        gOverlay.style.textShadow = '0 0 2px rgba(0, 0, 0, 0.3)';
        gOverlay.style.zIndex = '2';
        gOverlay.style.pointerEvents = 'none';
        gOverlay.style.fontFamily = 'MedievalSharp, "Old English Text MT", fantasy';
        container.appendChild(gOverlay);

        // Add tooltip container
        const tooltip = document.createElement('div');
        tooltip.className = 'scroll-tooltip';
        tooltip.style.position = 'absolute';
        tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        tooltip.style.color = 'white';
        tooltip.style.padding = '8px 12px';
        tooltip.style.borderRadius = '4px';
        tooltip.style.fontSize = '14px';
        tooltip.style.maxWidth = '200px';
        tooltip.style.zIndex = '1000';
        tooltip.style.display = 'none';
        tooltip.style.pointerEvents = 'none';
        tooltip.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
        tooltip.style.border = '1px solid rgba(255, 255, 255, 0.2)';

        // Add tooltip content
        const name = document.createElement('div');
        name.style.fontWeight = 'bold';
        name.style.marginBottom = '4px';
        name.style.color = '#ffd700';
        name.textContent = this.getDisplayName();
        
        const description = document.createElement('div');
        description.style.fontSize = '12px';
        description.style.color = '#cccccc';
        description.style.marginBottom = '8px';
        description.textContent = this.getDescription();

        const effect = document.createElement('div');
        effect.style.fontSize = '12px';
        effect.style.color = '#ff6b6b';
        effect.style.borderTop = '1px solid rgba(255, 255, 255, 0.2)';
        effect.style.paddingTop = '8px';
        effect.style.marginTop = '4px';
        effect.innerHTML = `<span style="color: #ffd700;">Effect:</span> ${this.effect?.name || 'No effect'}`;

        tooltip.appendChild(name);
        tooltip.appendChild(description);
        tooltip.appendChild(effect);

        // Add hover events
        container.addEventListener('mouseenter', (e) => {
            tooltip.style.display = 'block';
            const rect = container.getBoundingClientRect();
            tooltip.style.left = `${rect.left + (rect.width / 2)}px`;
            tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
            tooltip.style.transform = 'translateX(-50%)';
        });

        container.addEventListener('mouseleave', () => {
            tooltip.style.display = 'none';
        });

        // Add tooltip to document body
        document.body.appendChild(tooltip);

        // Drag events
        img.ondragstart = (e) => {
            e.dataTransfer.setData('text/plain', element.dataset.slot);
            container.classList.add('dragging');
            tooltip.style.display = 'none';
        };
        img.ondragend = (e) => {
            container.classList.remove('dragging');
        };

        // Add click handler to use scroll
        container.addEventListener('click', (event) => {
            if (event.detail === 0) return;
            this.use(element.closest('.backpack-container').__game);
            const backpack = element.closest('.backpack-container').__game.backpack;
            if (backpack) {
                backpack.removeItem(parseInt(element.dataset.slot));
            }
            tooltip.remove();
        });

        // Add the container to the element
        element.appendChild(container);
    }
}

export class ScrollOfArcaneDebt extends Scroll {
    constructor() {
        super('arcaneDebt', {
            name: 'Your next 3 cards cost 0. Each 0-cost card played deals 10 damage to you.',
            description: 'The scroll gives freely—but magic never forgets what it\'s owed.',
            icon: './assets/Images/ad.png',
            execute: (game) => {
                const maxFreeCards = 3;
                const originalGetCardCost = game.getCardCost;
                const originalCards = new Map(); // Store original card costs
                let isEffectActive = true; // Track if the effect is still active
                
                // Add glow effect to cost numbers
                const addGlowEffect = () => {
                    const costElements = document.querySelectorAll('.card [data-label="COST"]');
                    costElements.forEach(element => {
                        element.style.textShadow = '0 0 10px #00ff00, 0 0 20px #00ff00';
                        element.style.color = '#00ff00';
                    });
                };

                // Remove glow effect from cost numbers
                const removeGlowEffect = () => {
                    const costElements = document.querySelectorAll('.card [data-label="COST"]');
                    costElements.forEach(element => {
                        element.style.textShadow = '';
                        element.style.color = '';
                    });
                };
                
                // Function to update all card costs
                const updateCardCosts = () => {
                    if (!isEffectActive) return; // Don't update if effect is not active
                    
                    const cardElements = document.querySelectorAll('.card');
                    cardElements.forEach(cardElement => {
                        const cardId = cardElement.dataset.cardId;
                        const cardData = game.cardManager.getCard(cardId);
                        if (cardData) {
                            // Store original cost if not already stored
                            if (!originalCards.has(cardId)) {
                                originalCards.set(cardId, cardData.cost);
                            }
                            // Update cost in cardData
                            cardData.cost = game.attackQueue.length <= maxFreeCards ? 0 : originalCards.get(cardId);
                        }
                    });
                };

                // Function to update all card displays
                const updateCardDisplays = () => {
                    if (!isEffectActive) return; // Don't update if effect is not active
                    
                    const cardElements = document.querySelectorAll('.card');
                    cardElements.forEach(cardElement => {
                        const cardId = cardElement.dataset.cardId;
                        const cardData = game.cardManager.getCard(cardId);
                        if (cardData) {
                            const costElement = cardElement.querySelector('[data-label="COST"]');
                            if (costElement) {
                                // Show original cost in display after 3rd card, but keep actual cost at 0 for 3rd card
                                if (game.attackQueue.length === 3) {
                                    costElement.textContent = originalCards.get(cardId);
                                    removeGlowEffect(); // Remove glow when costs return to default
                                } else {
                                    costElement.textContent = cardData.cost;
                                }
                            }
                        }
                    });
                };

                // Override getCardCost to return 0 for first 3 cards
                const arcaneDebtGetCardCost = function(card) {
                    if (!isEffectActive) return originalGetCardCost.call(game, card);
                    if (game.attackQueue.length <= maxFreeCards) {
                        return 0;
                    }
                    return originalGetCardCost.call(game, card);
                };
                game.getCardCost = arcaneDebtGetCardCost;

                // Override the attackQueue.push method
                const originalPush = Array.prototype.push;
                Array.prototype.push = function(...items) {
                    const result = originalPush.apply(this, items);
                    if (this === game.attackQueue && isEffectActive) {
                        // Deal damage when a 0-cost card is played
                        if (game.attackQueue.length <= maxFreeCards) {
                            game.playerHealth = Math.max(0, game.playerHealth - 10);
                            game.updateHealthBars();
                            // Play hurt sound
                            if (game.soundManager) {
                                game.soundManager.playSound('hurt1');
                            }
                        }
                        updateCardCosts();
                        updateCardDisplays();
                        
                        // Remove effect from status manager after 3 cards
                        if (game.attackQueue.length >= maxFreeCards && game.statusManager) {
                            game.statusManager.removeEffect('arcaneDebt');
                        }
                    }
                    return result;
                };

                // Override the attackQueue.splice method
                const originalSplice = Array.prototype.splice;
                Array.prototype.splice = function(...args) {
                    const result = originalSplice.apply(this, args);
                    if (this === game.attackQueue && isEffectActive) {
                        updateCardCosts();
                        updateCardDisplays();
                    }
                    return result;
                };

                // Store original endTurn method
                const originalEndTurn = game.endTurn;
                game.endTurn = function() {
                    if (!game.isPlayerTurn) return;

                    // Restore original methods immediately
                    game.getCardCost = originalGetCardCost;
                    Array.prototype.push = originalPush;
                    Array.prototype.splice = originalSplice;
                    isEffectActive = false; // Mark effect as inactive

                    // Remove effect from status manager
                    if (game.statusManager) {
                        game.statusManager.removeEffect('arcaneDebt');
                    }

                    game.isPlayerTurn = false;
                    const endTurnBtn = document.querySelector('.end-turn-btn');
                    if (endTurnBtn) {
                        endTurnBtn.disabled = true;
                    }

                    // Execute queued attacks
                    game.executeQueuedAttacks().then(() => {
                        // Restore original costs and update displays
                        originalCards.forEach((originalCost, cardId) => {
                            const cardData = game.cardManager.getCard(cardId);
                            if (cardData) {
                                cardData.cost = originalCost;
                                const cardElement = document.querySelector(`.card[data-card-id="${cardId}"]`);
                                if (cardElement) {
                                    const costElement = cardElement.querySelector('[data-label="COST"]');
                                    if (costElement) {
                                        costElement.textContent = originalCost;
                                        costElement.style.textShadow = '';
                                        costElement.style.color = '';
                                    }
                                }
                            }
                        });

                        // Enemy's turn
                        setTimeout(() => {
                            game.enemyTurn();
                        }, 1000);
                    });
                };

                const originalOnRoundEnd = game.onRoundEnd;
                game.onRoundEnd = () => {
                    if (game.player && game.attackQueue.length > 0) {
                        game.player.takeDamage(game.attackQueue.length);
                    }
                    if (originalOnRoundEnd) originalOnRoundEnd();
                };

                // Override the card movement handler
                const originalMoveCard = game.moveCard;
                game.moveCard = function(card, targetSlot) {
                    const result = originalMoveCard.call(this, card, targetSlot);
                    if (!isEffectActive) {
                        // If effect is not active, ensure the card has its original cost
                        const cardId = card.id;
                        if (originalCards.has(cardId)) {
                            const cardData = game.cardManager.getCard(cardId);
                            if (cardData) {
                                cardData.cost = originalCards.get(cardId);
                                const cardElement = document.querySelector(`.card[data-card-id="${cardId}"]`);
                                if (cardElement) {
                                    const costElement = cardElement.querySelector('[data-label="COST"]');
                                    if (costElement) {
                                        costElement.textContent = originalCards.get(cardId);
                                    }
                                }
                            }
                        }
                    }
                    return result;
                };

                // Initial update of card costs and add glow effect
                updateCardCosts();
                updateCardDisplays();
                addGlowEffect();
            }
        }, './assets/Images/bpackscroll.png');
    }
    getDisplayName() { return 'Scroll of Arcane Debt'; }

    use(game) {
        if (this.effect && typeof this.effect.execute === 'function') {
            // Add effect to status manager
            if (game.statusManager) {
                game.statusManager.addEffect(this.type, this.effect);
            }
            // Play sound effect
            if (game.soundManager) {
                game.soundManager.playSound('adebt');
            }
            this.effect.execute(game);
        }
    }

    // Override the render method to add the red "D" overlay
    render(element) {
        // Create container for the scroll image and overlay
        const container = document.createElement('div');
        container.style.position = 'relative';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.cursor = 'pointer';
        container.style.pointerEvents = 'auto';

        // Add the scroll image
        const img = document.createElement('img');
        img.src = this.imagePath;
        img.alt = this.getDisplayName();
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.draggable = true;
        img.dataset.slot = element.dataset.slot;
        img.style.pointerEvents = 'auto';
        container.appendChild(img);

        // Add the red "D" overlay
        const dOverlay = document.createElement('div');
        dOverlay.textContent = 'D';
        dOverlay.style.position = 'absolute';
        dOverlay.style.top = '45%';
        dOverlay.style.left = '50%';
        dOverlay.style.transform = 'translate(-50%, -50%)';
        dOverlay.style.color = '#000000';
        dOverlay.style.fontSize = '1.2em';
        dOverlay.style.fontWeight = 'bold';
        dOverlay.style.textShadow = '0 0 2px rgba(0, 0, 0, 0.3)';
        dOverlay.style.zIndex = '2';
        dOverlay.style.pointerEvents = 'none';
        dOverlay.style.fontFamily = 'MedievalSharp, "Old English Text MT", fantasy';
        container.appendChild(dOverlay);

        // Add tooltip container
        const tooltip = document.createElement('div');
        tooltip.className = 'scroll-tooltip';
        tooltip.style.position = 'absolute';
        tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        tooltip.style.color = 'white';
        tooltip.style.padding = '8px 12px';
        tooltip.style.borderRadius = '4px';
        tooltip.style.fontSize = '14px';
        tooltip.style.maxWidth = '200px';
        tooltip.style.zIndex = '1000';
        tooltip.style.display = 'none';
        tooltip.style.pointerEvents = 'none';
        tooltip.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
        tooltip.style.border = '1px solid rgba(255, 255, 255, 0.2)';

        // Add tooltip content
        const name = document.createElement('div');
        name.style.fontWeight = 'bold';
        name.style.marginBottom = '4px';
        name.style.color = '#ffd700';
        name.textContent = this.getDisplayName();
        
        const description = document.createElement('div');
        description.style.fontSize = '12px';
        description.style.color = '#cccccc';
        description.style.marginBottom = '8px';
        description.textContent = this.getDescription();

        const effect = document.createElement('div');
        effect.style.fontSize = '12px';
        effect.style.color = '#ff6b6b';
        effect.style.borderTop = '1px solid rgba(255, 255, 255, 0.2)';
        effect.style.paddingTop = '8px';
        effect.style.marginTop = '4px';
        effect.innerHTML = `<span style="color: #ffd700;">Effect:</span> ${this.effect?.name || 'No effect'}`;

        tooltip.appendChild(name);
        tooltip.appendChild(description);
        tooltip.appendChild(effect);

        // Add hover events
        container.addEventListener('mouseenter', (e) => {
            tooltip.style.display = 'block';
            const rect = container.getBoundingClientRect();
            tooltip.style.left = `${rect.left + (rect.width / 2)}px`;
            tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
            tooltip.style.transform = 'translateX(-50%)';
        });

        container.addEventListener('mouseleave', () => {
            tooltip.style.display = 'none';
        });

        // Add tooltip to document body
        document.body.appendChild(tooltip);

        // Drag events
        img.ondragstart = (e) => {
            e.dataTransfer.setData('text/plain', element.dataset.slot);
            container.classList.add('dragging');
            tooltip.style.display = 'none';
        };
        img.ondragend = (e) => {
            container.classList.remove('dragging');
        };

        // Add click handler to use scroll
        container.addEventListener('click', (event) => {
            if (event.detail === 0) return;
            this.use(element.closest('.backpack-container').__game);
            const backpack = element.closest('.backpack-container').__game.backpack;
            if (backpack) {
                backpack.removeItem(parseInt(element.dataset.slot));
            }
            tooltip.remove();
        });

        // Add the container to the element
        element.appendChild(container);
    }
} 