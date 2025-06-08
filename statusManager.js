export class StatusManager {
    constructor(game) {
        this.game = game;
        this.activeEffects = new Map();
        this.effectIndicators = new Map();
    }

    addEffect(effectId, effect) {
        this.activeEffects.set(effectId, effect);
        this.createEffectIndicator(effectId, effect);
    }

    removeEffect(effectId) {
        this.activeEffects.delete(effectId);
        this.removeEffectIndicator(effectId);
    }

    hasEffect(effectId) {
        return this.activeEffects.has(effectId);
    }

    createEffectIndicator(effectId, effect) {
        // Create indicator container
        const indicator = document.createElement('div');
        indicator.className = 'status-indicator';
        indicator.dataset.effectId = effectId;
        
        // Style the indicator
        indicator.style.position = 'fixed';
        indicator.style.top = '40px';
        indicator.style.right = '800px';
        indicator.style.width = '40px';
        indicator.style.height = '40px';
        indicator.style.borderRadius = '50%';
        indicator.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        indicator.style.display = 'flex';
        indicator.style.alignItems = 'center';
        indicator.style.justifyContent = 'center';
        indicator.style.color = '#fff';
        indicator.style.fontWeight = 'bold';
        indicator.style.zIndex = '1000';
        indicator.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
        indicator.style.border = '2px solid rgba(255, 255, 255, 0.3)';

        // Add effect icon or letter
        if (effect.icon) {
            const icon = document.createElement('img');
            icon.src = effect.icon;
            icon.style.width = '30px';
            icon.style.height = '30px';
            icon.style.objectFit = 'contain';
            indicator.appendChild(icon);
        } else {
            const icon = document.createElement('span');
            icon.textContent = effectId.charAt(0).toUpperCase();
            icon.style.fontSize = '20px';
            indicator.appendChild(icon);
        }

        // Add tooltip container
        const tooltip = document.createElement('div');
        tooltip.className = 'scroll-tooltip';
        tooltip.dataset.effectId = effectId;
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
        name.textContent = effect.name || effectId;
        
        const description = document.createElement('div');
        description.style.fontSize = '12px';
        description.style.color = '#cccccc';
        description.style.marginBottom = '8px';
        description.textContent = effect.description || '';

        const effectText = document.createElement('div');
        effectText.style.fontSize = '12px';
        effectText.style.color = '#ff6b6b';
        effectText.style.borderTop = '1px solid rgba(255, 255, 255, 0.2)';
        effectText.style.paddingTop = '8px';
        effectText.style.marginTop = '4px';
        effectText.innerHTML = `<span style="color: #ffd700;">Effect:</span> ${effect.name || 'No effect'}`;

        tooltip.appendChild(name);
        tooltip.appendChild(description);
        tooltip.appendChild(effectText);

        // Add hover events
        indicator.addEventListener('mouseenter', (e) => {
            tooltip.style.display = 'block';
            const rect = indicator.getBoundingClientRect();
            tooltip.style.left = `${rect.left + (rect.width / 2)}px`;
            tooltip.style.top = `${rect.bottom + 10}px`;  // Position below the indicator
            tooltip.style.transform = 'translateX(-50%)';
        });

        indicator.addEventListener('mouseleave', () => {
            tooltip.style.display = 'none';
        });

        // Add tooltip to document body
        document.body.appendChild(tooltip);

        // Add to game scene
        const gameScene = document.querySelector('.game-scene');
        if (gameScene) {
            gameScene.appendChild(indicator);
            this.effectIndicators.set(effectId, indicator);
            this.updateEffectIndicators();
        }
    }

    removeEffectIndicator(effectId) {
        const indicator = this.effectIndicators.get(effectId);
        if (indicator) {
            // Remove the tooltip
            const tooltip = document.querySelector(`.scroll-tooltip[data-effect-id="${effectId}"]`);
            if (tooltip) {
                tooltip.remove();
            }
            // Remove the indicator
            indicator.remove();
            this.effectIndicators.delete(effectId);
            this.updateEffectIndicators();
        }
    }

    updateEffectIndicators() {
        // Update positions of all indicators
        let offset = 40;  // Keep the same top position
        this.effectIndicators.forEach((indicator) => {
            indicator.style.top = `${offset}px`;
            indicator.style.right = `${800 - (this.effectIndicators.size - 1 - Array.from(this.effectIndicators.keys()).indexOf(indicator.dataset.effectId)) * 50}px`; // Position horizontally
        });
    }
} 